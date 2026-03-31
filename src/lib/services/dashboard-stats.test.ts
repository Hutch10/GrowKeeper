import { describe, it, expect } from 'vitest';
import { aggregateDashboardStats } from './dashboard-stats';
import { BaseSpecimen } from '@/types/specimen';
import { TaskRow } from '@/app/actions/tasks';

describe('aggregateDashboardStats', () => {
  const mockSpecimens: BaseSpecimen[] = [
    {
      id: 's1',
      nickname: 'Healthy Plant',
      kingdom: 'Plantae',
      health: 90,
      telemetry: { moisture: 0.5, temperature: 22, light: 500 },
      created_at: new Date('2024-01-01').toISOString(),
      species_name: 'Monstera',
      lat: 40.7128, // Safe New York
      lon: -74.0060,
    },
    {
      id: 's2',
      nickname: 'Restricted Entry',
      kingdom: 'Plantae',
      health: 80,
      telemetry: { moisture: 0.4, temperature: 21, light: 400 },
      created_at: new Date('2024-01-02').toISOString(),
      species_name: 'Cactus',
      lat: 36.06, // Ecological Protection Zone (EPZ)
      lon: -115.06,
    }
  ];

  const mockTasks: TaskRow[] = [
    {
      id: 't1',
      specimen_id: 's1',
      task_type: 'watered',
      due_date: new Date(Date.now() - 86400000).toISOString(), // Overdue
      completed: false,
      created_at: new Date().toISOString(),
      user_id: 'u1',
      last_modified: new Date().toISOString(),
      last_action_type: 'CREATE'
    },
    {
      id: 't2',
      specimen_id: 's1',
      task_type: 'fertilized',
      due_date: new Date(Date.now() + 86400000).toISOString(), // Due tomorrow
      completed: false,
      created_at: new Date().toISOString(),
      user_id: 'u1',
      last_modified: new Date().toISOString(),
      last_action_type: 'CREATE'
    }
  ];

  it('correctly aggregates KPIs', () => {
    const stats = aggregateDashboardStats(mockSpecimens, mockTasks);
    expect(stats.kpis.totalSpecimens).toBe(2);
    expect(stats.kpis.overdue).toBe(1);
    expect(stats.kpis.flagged).toBe(1); // s2 is on restricted land
  });

  it('deterministically ranks the priority queue', () => {
    const stats = aggregateDashboardStats(mockSpecimens, mockTasks);
    
    // Overdue task should be first
    expect(stats.priorityQueue[0].type).toBe('OVERDUE');
    expect(stats.priorityQueue[0].severity).toBe('danger');
    
    // Flagged specimen should be next (or same severity ranking)
    const flaggedItem = stats.priorityQueue.find(p => p.type === 'FLAGGED');
    expect(flaggedItem).toBeDefined();
    expect(flaggedItem?.severity).toBe('danger');
  });

  it('identifies incomplete records', () => {
    const incompleteSpecimen: BaseSpecimen = {
      id: 's3',
      nickname: 'Mystery',
      kingdom: 'Plantae',
      health: 50,
      telemetry: { moisture: 0.3, temperature: 20, light: 300 },
      created_at: new Date().toISOString(),
      species_name: null, // Missing species
    };
    
    const stats = aggregateDashboardStats([incompleteSpecimen], []);
    expect(stats.kpis.incomplete).toBe(1);
    expect(stats.priorityQueue[0].type).toBe('INCOMPLETE');
  });
});
