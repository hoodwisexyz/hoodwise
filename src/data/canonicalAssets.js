const CANONICAL_ASSETS = Object.freeze({
  '0x0bd7d308f8e1639fab988df18a8011f41eacad73': { symbol: 'WETH', type: 'Core asset' },
  '0x5fc5360d0400a0fd4f2af552add042d716f1d168': { symbol: 'USDG', type: 'Core asset' },
  '0xaf3d76f1834a1d425780943c99ea8a608f8a93f9': { symbol: 'AAPL', type: 'Stock Token' },
  '0x86923f96303d656e4aa86d9d42d1e57ad2023fdc': { symbol: 'AMD', type: 'Stock Token' },
  '0x12f190a9f9d7d37a250758b26824b97ce941bf54': { symbol: 'AMZN', type: 'Stock Token' },
  '0x2e0847e8910a9732eb3fb1bb4b70a580adad4fe3': { symbol: 'GOOGL', type: 'Stock Token' },
  '0xc0d6457c16cc70d6790dd43521c899c87ce02f35': { symbol: 'META', type: 'Stock Token' },
  '0xe93237c50d904957cf27e7b1133b510c669c2e74': { symbol: 'MSFT', type: 'Stock Token' },
  '0xd0601ce157db5bdc3162bbac2a2c8af5320d9eec': { symbol: 'NVDA', type: 'Stock Token' },
  '0x322f0929c4625ed5bad873c95208d54e1c003b2d': { symbol: 'TSLA', type: 'Stock Token' },
  '0xd5f3879160bc7c32ebb4dc785f8a4f505888de68': { symbol: 'QQQ', type: 'Tokenized ETF' },
  '0x117cc2133c37b721f49de2a7a74833232b3b4c0c': { symbol: 'SPY', type: 'Tokenized ETF' }
});
function getCanonicalAsset(address) { return CANONICAL_ASSETS[address.toLowerCase()] || null; }
module.exports = { getCanonicalAsset };