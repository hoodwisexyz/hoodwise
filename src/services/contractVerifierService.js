const fetch = require('node-fetch');
const { getCanonicalAsset } = require('../data/canonicalAssets');
const { UpstreamServiceError, BadRequestError } = require('../lib/errors');
const RPC_URL = 'https://rpc.mainnet.chain.robinhood.com';
const EXPLORER = 'https://robinhoodchain.blockscout.com/address/';
const ADDRESS = /^0x[a-fA-F0-9]{40}$/;
async function rpc(method, params) {
  const response = await fetch(RPC_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) });
  if (!response.ok) throw new UpstreamServiceError('The Robinhood Chain verifier is temporarily unavailable.');
  const body = await response.json();
  if (body.error) throw new UpstreamServiceError('The Robinhood Chain verifier could not read that address.');
  return body.result;
}
async function verifyContract(address) {
  if (!ADDRESS.test(address || '')) throw new BadRequestError('Enter a valid 0x contract address.');
  const normalized = address.toLowerCase();
  const [chainId, code] = await Promise.all([rpc('eth_chainId', []), rpc('eth_getCode', [address, 'latest'])]);
  const canonical = getCanonicalAsset(normalized);
  return { address, chainId: parseInt(chainId, 16), isContract: Boolean(code && code !== '0x'), canonical: canonical ? { ...canonical, official: true } : null, classification: canonical ? 'canonical' : (code && code !== '0x' ? 'community-or-unverified' : 'not-a-contract'), explorerUrl: EXPLORER + address, verificationNote: canonical ? 'Matches the official Robinhood Chain token-contract directory.' : 'This check cannot establish safety or endorsement. Review code, ownership, liquidity, and the exact pool.' };
}
module.exports = { verifyContract };