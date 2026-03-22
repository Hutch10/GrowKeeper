const { specimensDB } = require('./src/lib/pouchdb');
const { hal } = require('./src/lib/hardware/hal');
const { logger } = require('./src/lib/observability/logger');

async function runStressTest() {
  console.log('--- STARTING STRESS TEST ---');
  
  // 1. Sync Test: Force multi-edit collision
  const id = 'test-specimen-999';
  try {
    await specimensDB.put({ _id: id, name: 'Stress Test Target', updatedAt: new Date().toISOString() });
    console.log('[OK] PouchDB record created.');
    
    // Simulate incoming "Stale" P2P edit
    const staleData = { name: 'Old Name', updatedAt: '2000-01-01T00:00:00.000Z' };
    const { p2p } = require('./src/lib/p2p-sync');
    // We expect this to be rejected by the Tier 1 Authority logic
    await p2p.syncToLocal(id, staleData);
    
    const current = await specimensDB.get(id);
    if (current.name === 'Stress Test Target') {
      console.log('[PASS] Tier 1 Authority protected against stale sync.');
    } else {
      console.log('[FAIL] Data was overwritten by stale update!');
    }
  } catch (err) {
    console.error('[ERR] Sync Test Failed:', err);
  }

  // 2. HAL Test: Simulator oscillation
  console.log('--- TESTING HAL SIMULATOR ---');
  hal.setActiveAdapter('simulator');
  await hal.connect();
  hal.startStreaming((data) => {
    console.log(`[HAL] Stream Received: ${data.type} = ${data.value}`);
  });

  setTimeout(() => {
    hal.disconnect();
    console.log('[OK] HAL Test completed.');
    process.exit(0);
  }, 10000);
}

runStressTest();
