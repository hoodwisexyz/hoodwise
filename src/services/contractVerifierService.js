const fetch = require('node-fetch');
const { getCanonicalAsset } = require('../data/canonicalAssets');
const { UpstreamServiceError, BadRequestError } = require('../lib/errors');
const RPC_URL = 'https://rpc.mainnet.chain.robinhood.com';
const EXPLORER = 'https://robinhoodchain.blockscout.com/address/';
const EXPLORER_API = 'https://robinhoodchain.blockscout.com/api/v2/addresses/';
const ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const SELECTORS = { name: '0x06fdde03', symbol: '0x95d89b41', decimals: '0x313ce567', owner: '0x8da5cb5b' };
async function rpc(method, params) { const response = await fetch(RPC_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) }); if (!response.ok) throw new UpstreamServiceError('The Robinhood Chain verifier is temporarily unavailable.'); const body = await response.json(); if (body.error) throw new UpstreamServiceError('The Robinhood Chain verifier could not read that address.'); return body.result; }
async function getExplorerAddress(address) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(EXPLORER_API + address, { signal: controller.signal });
    if (!response.ok) return null;
    return await response.json();
  } catch { return null; } finally { clearTimeout(timeout); }
}
function decodeString(value) { if (!value || value === '0x') return null; const hex = value.slice(2); try { const offset = parseInt(hex.slice(0, 64), 16) * 2; const length = parseInt(hex.slice(offset, offset + 64), 16) * 2; if (Number.isFinite(length) && length >= 0 && offset + 64 + length <= hex.length) return Buffer.from(hex.slice(offset + 64, offset + 64 + length), 'hex').toString('utf8').replace(/\0/g, '') || null; return Buffer.from(hex.slice(0, 64), 'hex').toString('utf8').replace(/\0/g, '') || null; } catch { return null; } }
function decodeUint(value) { return value && value !== '0x' ? parseInt(value, 16) : null; }
function decodeAddress(value) { return value && /^0x[0-9a-f]{64}$/i.test(value) ? '0x' + value.slice(-40) : null; }
function sourceCodeVerified(explorerAddress) { return explorerAddress?.is_verified === true; }
async function readCall(address, selector) { try { return await rpc('eth_call', [{ to: address, data: selector }, 'latest']); } catch { return null; } }
async function verifyContract(address) {
  if (!ADDRESS.test(address || '')) throw new BadRequestError('Enter a valid 0x contract address.');
  const normalized = address.toLowerCase();
  const [chainId, code, explorerAddress] = await Promise.all([rpc('eth_chainId', []), rpc('eth_getCode', [address, 'latest']), getExplorerAddress(address)]);
  const isContract = Boolean(code && code !== '0x'); const canonical = getCanonicalAsset(normalized);
  const [nameRaw, symbolRaw, decimalsRaw, ownerRaw] = isContract ? await Promise.all([readCall(address, SELECTORS.name), readCall(address, SELECTORS.symbol), readCall(address, SELECTORS.decimals), readCall(address, SELECTORS.owner)]) : [null, null, null, null];
  const isVerified = sourceCodeVerified(explorerAddress);
  return { address, chainId: parseInt(chainId, 16), isContract, canonical: canonical ? { ...canonical, official: true } : null, classification: canonical ? 'canonical' : (isContract ? 'community-or-unverified' : 'not-a-contract'), explorerUrl: EXPLORER + address, bytecodeBytes: isContract ? Math.max(0, (code.length - 2) / 2) : 0, sourceCodeVerified: isVerified, sourceCodeVerificationAvailable: Boolean(explorerAddress), proxyType: explorerAddress?.proxy_type || null, metadata: { name: decodeString(nameRaw), symbol: decodeString(symbolRaw), decimals: decodeUint(decimalsRaw), owner: decodeAddress(ownerRaw) }, verificationNote: canonical ? 'Matches the official Robinhood Chain token-contract directory.' : 'This check cannot establish safety or endorsement. Review verified code, ownership, liquidity, and the exact pool.' };
}
module.exports = { verifyContract, decodeString, decodeUint, decodeAddress, sourceCodeVerified };