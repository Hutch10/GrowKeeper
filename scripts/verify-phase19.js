const { feeManager } = require('./src/lib/services/fee-manager');
const { valuationEngine } = require('./src/lib/services/valuation-engine');

async function testEconomics() {
  console.log('--- STARTING ECONOMIC LAYER TEST ---');

  // 1. Fee Distribution Test
  const price = 5000;
  const dist = feeManager.calculateDistribution(price);
  console.log(`[Test] Price: $${price}`);
  console.log(`- Seller Proceeds: $${dist.sellerProceeds}`);
  console.log(`- Royalty (5%): $${dist.stewardRoyalty}`);
  console.log(`- Commission (2.5%): $${dist.platformCommission}`);

  if (dist.stewardRoyalty === 250 && dist.platformCommission === 125) {
    console.log('[PASS] Fee distribution accurate.');
  } else {
    console.log('[FAIL] Fee distribution mismatch.');
  }

  // 2. Valuation Logic
  const mockSpecimen = { id: 'spec-99', happiness_score: 90, lastVitalSignature: 'GKPV_verified_token' };
  const val = valuationEngine.calculateValuation(mockSpecimen);
  console.log(`[Test] Specimen Valuation: $${val.totalValuation}`);
  console.log(`- Base: $${val.baseValue}`);
  console.log(`- Health Premium (90%): $${val.healthPremium}`);
  console.log(`- Provenance Bonus (20%): $${val.provenanceBonus}`);

  if (val.totalValuation === 2100) { // 1000 + 900 + 200
    console.log('[PASS] Valuation engine logic confirmed.');
  } else {
    console.log('[FAIL] Valuation engine logic error.');
  }

  process.exit(0);
}

testEconomics().catch(err => {
  console.error(err);
  process.exit(1);
});
