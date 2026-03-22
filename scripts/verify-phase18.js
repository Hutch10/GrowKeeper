const { compliance } = require('./src/lib/services/compliance-service');
const { provenance } = require('./src/lib/crypto-provenance');
const { stewardship } = require('./src/lib/services/stewardship-transfer');

async function runComplianceTest() {
  console.log('--- STARTING COMPLIANCE & PROVENANCE TEST ---');

  // 1. CITES Check
  console.log('[Test] Species: Orchidaceae (CITES Appendix II)');
  const status = await compliance.checkSpecies('Phalaenopsis amabilis', 'Orchidaceae');
  if (status.isProtected && status.tier === 'II') {
    console.log('[PASS] CITES Appendix II hit confirmed.');
  } else {
    console.log('[FAIL] CITES check failed to identify protected genus.');
  }

  // 2. Crypto Signature Integrity
  const vitals = { specimenId: 'spec-123', timestamp: new Date().toISOString(), moisture: 45 };
  const signature = await provenance.signVitals(vitals);
  console.log(`[Test] Signed Vitals: ${signature}`);
  
  const isValid = await provenance.verifyVitals(vitals, signature);
  if (isValid) {
    console.log('[PASS] Proof-of-Care signature verified.');
  } else {
    console.log('[FAIL] Signature verification failed.');
  }

  // 3. Stewardship Handover
  console.log('[Test] Asset Handover');
  const mockSpecimen = { id: 'spec-123', lastVitalSignature: signature, updated_at: vitals.timestamp };
  try {
    const record = await stewardship.initiateHandover(mockSpecimen, 'NODE_B', 'NODE_A');
    console.log(`[PASS] Handover initiated. Bill of Sale: ${record.billOfSaleHash}`);
  } catch (err) {
    console.log(`[FAIL] Handover aborted: ${err.message}`);
  }

  process.exit(0);
}

runComplianceTest().catch(err => {
  console.error(err);
  process.exit(1);
});
