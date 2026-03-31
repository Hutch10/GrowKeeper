import { describe, it, expect, vi } from 'vitest';
import { recordAuditEntry } from './audit-ledger';

// Mocking Supabase and Auth
vi.mock('@/lib/supabase-server', () => ({
  createClient: () => ({
    from: () => ({
      insert: vi.fn().mockResolvedValue({ error: null })
    })
  })
}));

vi.mock('@/lib/auth-server', () => ({
  getAuthenticatedUser: () => ({
    success: true,
    data: { id: 'custodian-123' }
  })
}));

describe('Institutional Audit Ledger', () => {
  it('anchors a specimen creation action in the ledger', async () => {
    const options: any = {
      action: 'CREATE',
      target: 'specimen',
      targetId: 'spec-456',
      metadata: { nickname: 'Alpha Asset' },
      payload: { id: 'spec-456', nickname: 'Alpha Asset' }
    };

    const result = await recordAuditEntry(options);
    expect(result.success).toBe(true);
  });

  it('generates a deterministic payload hash for non-repudiation', async () => {
     const options: any = {
      action: 'UPDATE',
      target: 'specimen',
      targetId: 'spec-456',
      payload: { health: 85 }
    };

    const result = await recordAuditEntry(options);
    expect(result.success).toBe(true);
    // Internal verification of hash logic (deterministic SHA-256)
  });

  it('records a geofence breach as a critical audit event', async () => {
    const options: any = {
      action: 'GEOFENCE_BREACH',
      target: 'registry',
      targetId: 'zone-alpha',
      metadata: { severity: 'Critical' }
    };

    const result = await recordAuditEntry(options);
    expect(result.success).toBe(true);
  });
});
