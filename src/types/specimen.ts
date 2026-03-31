import { BiologicalSpecimen, KingdomType } from './biological-intelligence';

export type Kingdom = KingdomType;

export interface SpecimenTelemetry {
  moisture: number;
  temperature: number;
  light: number;
}

export type Specimen = BiologicalSpecimen;

export interface CareEvent {
  id: string;
  specimen_id: string;
  event_type: string;
  timestamp: string;
  notes?: string | null;
}

export interface Reminder {
  id: string;
  specimen_id: string;
  title: string;
  due_date: string;
  completed: boolean;
}
