/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CommandCenter } from '../command-center';
import { useIntegrityMemory } from '@/hooks/use-integrity-memory';
import { useSpecimenData } from '@/hooks/use-specimen-data';
import { useEnvironmentalSentinel } from '@/hooks/use-environmental-sentinel';
import { useTaskData } from '@/hooks/use-task-data';
import React from 'react';

// 0. MOCK SERVER-ONLY TO PREVENT TRANSFORMATION ERROR
vi.mock('server-only', () => ({}));

// 1. MOCK FRAMER MOTION TO SKIP ANIMATIONS
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, onClick, ...props }: any) => (
      <div className={className} onClick={onClick} {...props}>{children}</div>
    ),
    section: ({ children, className, ...props }: any) => (
      <section className={className} {...props}>{children}</section>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// 2. MOCK POUCHDB-RELATED SIDE EFFECTS
vi.mock('@/lib/pouchdb', () => ({
  memoryDB: {},
  operationsDB: { find: vi.fn().mockResolvedValue({ docs: [] }) },
  fromPouch: (x: any) => x,
  toPouch: (x: any) => x,
}));

// 3. MOCK ALL HUD/DATA HOOKS
vi.mock('@/hooks/use-integrity-memory');
vi.mock('@/hooks/use-specimen-data');
vi.mock('@/hooks/use-environmental-sentinel');
vi.mock('@/hooks/use-task-data');
vi.mock('@/components/providers/theme-provider', () => ({
  useTheme: () => ({ theme: 'dark', setTheme: vi.fn() })
}));

// 4. STUB COMPLEX COMPONENTS TO STABILIZE UI PROOF
vi.mock('@/components/dashboard/kpi-strip', () => ({ KPIStrip: () => <div data-testid="kpi-strip">KPI Strip</div> }));
vi.mock('@/components/dashboard/tips-section', () => ({ TipsSection: () => <div data-testid="tips-section">Tips Section</div> }));
vi.mock('@/components/dashboard/system-suggestions', () => ({ SystemSuggestions: () => <div data-testid="system-suggestions">Suggestions</div> }));
vi.mock('@/components/dashboard/mycelial-illustration', () => ({ MycelialIllustration: () => <div data-testid="illustration">Illustration</div> }));
vi.mock('@/components/dashboard/specimen-list-skeleton', () => ({ SpecimenListSkeleton: () => <div data-testid="skeleton">Loading...</div> }));
vi.mock('@/components/dashboard/detail-rail', () => ({ 
  DetailRail: ({ specimen, onClose }: any) => (
    <div data-testid="detail-rail">
      <span>{specimen.name}</span>
      <button onClick={onClose}>Close</button>
    </div>
  ) 
}));

// Also mock the specimen card itself to be reliable
vi.mock('@/components/specimens/specimen-summary-card', () => ({
  SpecimenSummaryCard: ({ specimen, onClick }: any) => (
    <div onClick={onClick} data-testid={`specimen-card-${specimen.id}`}>
      {specimen.name}
    </div>
  )
}));

describe('Deterministic Intelligence Proof: UI Transparency', () => {

  const setupMocks = (syncStatus: string, syncQueueSize = 0) => {
    vi.mocked(useIntegrityMemory).mockReturnValue({
      timeline: [],
      narrative: { summary: 'Test Narrative', confidence_label: 'HIGH', timeline: [] },
      loading: false
    });
    vi.mocked(useEnvironmentalSentinel).mockReturnValue({ signals: [], loading: false, fetchSignals: vi.fn(), triggerSentinel: vi.fn(), getSpecimenSignals: vi.fn() } as any);
    vi.mocked(useTaskData).mockReturnValue({ tasks: [], loading: false, refresh: vi.fn(), markComplete: vi.fn() } as any);
    vi.mocked(useSpecimenData).mockReturnValue({ 
      specimens: [], 
      loading: false, 
      reconcile: vi.fn(), 
      isSyncing: false, 
      syncQueueSize 
    } as any);
  };

  const mockSpecimen = { id: 'spec-1', name: 'Test Specimen', strain: 'Test', status: 'ACTIVE' };

  it('should visibly render UNCERTIFIED badge and resilient mode during outage', async () => {
    setupMocks('BUFFERED_LOCAL', 5);
    vi.mocked(useSpecimenData).mockReturnValue({ 
      specimens: [mockSpecimen] as any, 
      loading: false, 
      reconcile: vi.fn(), 
      isSyncing: false, 
      syncQueueSize: 5 
    } as any);

    render(<CommandCenter initialSpecimens={[mockSpecimen] as any} />);
    
    // PROOF: Resilient mode indicator is present in header
    const resilientIndicator = screen.getByTestId('resilient-mode-indicator');
    expect(resilientIndicator).toBeDefined();
    expect(resilientIndicator.textContent).toContain('5 Registry Events Buffering');

    // 1. Select specimen
    const card = screen.getByText(/Test Specimen/i);
    fireEvent.click(card);

    // 2. PROOF: Uncertified badge is present in Narrative
    const badge = await screen.findByTestId('integrity-badge-uncertified');
    expect(badge).toBeDefined();
    expect(badge.textContent).toContain('UNCERTIFIED');
    
    // PROOF: Certified badge is NOT present (Mutual Exclusivity)
    expect(screen.queryByTestId('integrity-badge-certified')).toBeNull();
  });

  it('should visibly render CERTIFIED badge and clean registry status', async () => {
    setupMocks('SYNCED_CLOUD', 0);
    vi.mocked(useSpecimenData).mockReturnValue({ 
      specimens: [mockSpecimen] as any, 
      loading: false, 
      reconcile: vi.fn(), 
      isSyncing: false, 
      syncQueueSize: 0 
    } as any);

    render(<CommandCenter initialSpecimens={[mockSpecimen] as any} />);
    
    // PROOF: Registry Certified indicator is present in header
    const certifiedIndicator = screen.getByTestId('certified-registry-indicator');
    expect(certifiedIndicator).toBeDefined();
    expect(certifiedIndicator.textContent).toContain('Registry Certified');

    // 1. Select specimen
    const card = screen.getByText(/Test Specimen/i);
    fireEvent.click(card);

    // 2. PROOF: Certified badge is present in Narrative
    const badge = await screen.findByTestId('integrity-badge-certified');
    expect(badge).toBeDefined();
    expect(badge.textContent).toContain('CERTIFIED');
    
    // PROOF: Uncertified badge is NOT present (Mutual Exclusivity)
    expect(screen.queryByTestId('integrity-badge-uncertified')).toBeNull();
  });

  it('should render Integrity Narrative panel deterministically upon selection', async () => {
    setupMocks('SYNCED_CLOUD', 0);
    vi.mocked(useSpecimenData).mockReturnValue({ 
      specimens: [mockSpecimen] as any, 
      loading: false, 
      reconcile: vi.fn(), 
      isSyncing: false, 
      syncQueueSize: 0 
    } as any);

    render(<CommandCenter initialSpecimens={[mockSpecimen] as any} />);
    
    // 1. Select specimen
    const card = screen.getByText(/Test Specimen/i);
    fireEvent.click(card);

    // 2. PROOF: Integrity Narrative heading is visible
    expect(screen.getByText(/Integrity Narrative/i)).toBeDefined();
    expect(screen.getByText(/Test Narrative/i)).toBeDefined();
  });
});
