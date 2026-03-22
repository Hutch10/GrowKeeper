/**
 * GrowKeeper Testnet Genesis Configuration
 * Defines the initial state and parameters for the Silicon Gauntlet.
 */

export const GenesisConfig = {
  chainId: '0x908',
  network: 'Silicon Gauntlet (Testnet)',
  genesisHash: '0x98b50e2ddc9943efb387052637738f61',
  timestamp: Date.now(),
  
  parameters: {
    minValidatorStake: 500, // $GC
    slashingPenalty: 1.0,   // 100% burn
    governanceQuorum: 0.10, // 10% for testnet velocity
    votingPeriod: 3600,     // 1 Hour (Testnet speed)
    disputeJurySize: 5      // Verified validators
  },

  initialAllocations: {
    'REDTEAM_SINK_01': 1000000, // 1M tGC for attacker faucet
    'DAO_TREASURY': 5000000,    // 5M tGC for bounty payouts
    'GENESIS_CREATOR': 1000000  // Stake for initial network stability
  }
};
