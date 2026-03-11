export type CareEventType =
  | "watered"
  | "fertilized"
  | "pruned"
  | "repotted"
  | "noted";

export interface Plant {
  id: string;
  userId: string;
  name: string;
  species?: string;
  location?: string;
  createdAt: string;
  lastWateredAt?: string;
  nextWaterDueAt?: string;
}

export interface CareEvent {
  id: string;
  plantId: string;
  type: CareEventType;
  occurredAt: string;
  notes?: string;
}

export type ReminderChannel = "email" | "push";

export interface Reminder {
  id: string;
  plantId: string;
  dueAt: string;
  channel: ReminderChannel;
  sentAt?: string;
}
