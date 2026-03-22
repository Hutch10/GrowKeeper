export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type CareEventType = "watered" | "fertilized" | "pruned" | "repotted";
export type TaskType = "watered" | "fertilized" | "prune" | "repot" | "inspect";

export interface Database {
  public: {
    Tables: {
      plants: {
        Row: {
          id: string;
          user_id: string | null;
          nickname: string;
          species_name: string | null;
          notes: string | null;
          image_url: string | null;
          location: string | null;
          light: string | null;
          watering: string | null;
          fertilizer: string | null;
          happiness_score: number | null;
          health_status: string | null;
          moisture_level: number | null;
          light_level: number | null;
          temp_c: number | null;
          kingdom: string | null;
          substrate: string | null;
          misting_schedule: string | null;
          heart_rate: number | null;
          activity_level: number | null;
          dietary_notes: string | null;
          hardware_attestation_statement: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          nickname: string;
          species_name?: string | null;
          notes?: string | null;
          image_url?: string | null;
          location?: string | null;
          light?: string | null;
          watering?: string | null;
          fertilizer?: string | null;
          happiness_score?: number | null;
          health_status?: string | null;
          moisture_level?: number | null;
          light_level?: number | null;
          temp_c?: number | null;
          kingdom?: string | null;
          substrate?: string | null;
          misting_schedule?: string | null;
          heart_rate?: number | null;
          activity_level?: number | null;
          dietary_notes?: string | null;
          hardware_attestation_statement?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          nickname?: string;
          species_name?: string | null;
          notes?: string | null;
          image_url?: string | null;
          location?: string | null;
          light?: string | null;
          watering?: string | null;
          fertilizer?: string | null;
          happiness_score?: number | null;
          health_status?: string | null;
          moisture_level?: number | null;
          light_level?: number | null;
          temp_c?: number | null;
          kingdom?: string | null;
          substrate?: string | null;
          misting_schedule?: string | null;
          heart_rate?: number | null;
          activity_level?: number | null;
          dietary_notes?: string | null;
          hardware_attestation_statement?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      plant_events: {
        Row: {
          id: string;
          user_id: string | null;
          plant_id: string;
          event_type: CareEventType;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          plant_id: string;
          event_type: CareEventType;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          plant_id?: string;
          event_type?: CareEventType;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "plant_events_plant_id_fkey";
            columns: ["plant_id"];
            referencedRelation: "plants";
            referencedColumns: ["id"];
          }
        ];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string | null;
          created_at: string;
          plant_id: string;
          task_type: TaskType;
          due_date: string | null;
          completed: boolean;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          created_at?: string;
          plant_id: string;
          task_type: TaskType;
          due_date?: string | null;
          completed?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          created_at?: string;
          plant_id?: string;
          task_type?: TaskType;
          due_date?: string | null;
          completed?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_plant_id_fkey";
            columns: ["plant_id"];
            referencedRelation: "plants";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
