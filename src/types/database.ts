export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type CareEventType = "watered" | "fertilized" | "pruned" | "repotted" | "observation";
export type TaskType = "watered" | "fertilized" | "prune" | "repot" | "inspect";

export interface Database {
  public: {
    Tables: {
      specimens: {
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
          last_vital_signature: string | null;
          compliance_status: string | null;
          created_at: string;
          last_modified: string | null;
          last_action_type: string | null;
          source: string | null;
          acquisition_date: string | null;
          soil_type: string | null;
          environment: "indoor" | "outdoor" | "greenhouse" | null;
          lat: number | null;
          lon: number | null;
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
          last_vital_signature?: string | null;
          compliance_status?: string | null;
          created_at?: string;
          last_modified?: string | null;
          last_action_type?: string | null;
          source?: string | null;
          acquisition_date?: string | null;
          soil_type?: string | null;
          environment?: "indoor" | "outdoor" | "greenhouse" | null;
          lat?: number | null;
          lon?: number | null;
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
          last_vital_signature?: string | null;
          compliance_status?: string | null;
          created_at?: string;
          last_modified?: string | null;
          last_action_type?: string | null;
          source?: string | null;
          acquisition_date?: string | null;
          soil_type?: string | null;
          environment?: "indoor" | "outdoor" | "greenhouse" | null;
          lat?: number | null;
          lon?: number | null;
        };
        Relationships: [];
      };
      specimen_events: {
        Row: {
          id: string;
          user_id: string | null;
          specimen_id: string;
          event_type: CareEventType;
          notes: string | null;
          hardware_attestation: string | null;
          hardware_signature: string | null;
          created_at: string;
          last_modified: string | null;
          last_action_type: string | null;
          source_type: "user" | "sensor" | "agent";
          confidence: number | null;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          specimen_id: string;
          event_type: CareEventType;
          notes?: string | null;
          hardware_attestation?: string | null;
          hardware_signature?: string | null;
          created_at?: string;
          last_modified?: string | null;
          last_action_type?: string | null;
          source_type?: "user" | "sensor" | "agent";
          confidence?: number | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          specimen_id?: string;
          event_type?: CareEventType;
          notes?: string | null;
          hardware_attestation?: string | null;
          hardware_signature?: string | null;
          created_at?: string;
          last_modified?: string | null;
          last_action_type?: string | null;
          source_type?: "user" | "sensor" | "agent";
          confidence?: number | null;
          metadata?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "specimen_events_specimen_id_fkey";
            columns: ["specimen_id"];
            referencedRelation: "specimens";
            referencedColumns: ["id"];
          }
        ];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string | null;
          created_at: string;
          specimen_id: string;
          task_type: TaskType;
          due_date: string | null;
          completed: boolean;
          last_modified: string | null;
          last_action_type: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          created_at?: string;
          specimen_id: string;
          task_type: TaskType;
          due_date?: string | null;
          completed?: boolean;
          last_modified?: string | null;
          last_action_type?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          created_at?: string;
          specimen_id?: string;
          task_type?: TaskType;
          due_date?: string | null;
          completed?: boolean;
          last_modified?: string | null;
          last_action_type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_specimen_id_fkey";
            columns: ["specimen_id"];
            referencedRelation: "specimens";
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
      tester_feedback: {
        Row: {
          id: string;
          user_id: string;
          route: string;
          action_attempted: string | null;
          content: string;
          error_context: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          route: string;
          action_attempted?: string | null;
          content: string;
          error_context?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          route?: string;
          action_attempted?: string | null;
          content?: string;
          error_context?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tester_feedback_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      alpha_events: {
        Row: {
          id: string;
          created_at: string;
          user_id: string | null;
          event_type: string;
          metadata: Json | null;
          route: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id?: string | null;
          event_type: string;
          metadata?: Json | null;
          route?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string | null;
          event_type?: string;
          metadata?: Json | null;
          route?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "alpha_events_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
