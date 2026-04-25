export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      alpha_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          route: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          route?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          route?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          actor_id: string
          approval_status: string | null
          confidence_matrix: Json | null
          created_at: string | null
          decision: string | null
          event_type: string
          id: string
          raw_data: Json | null
          signature: string | null
        }
        Insert: {
          actor_id: string
          approval_status?: string | null
          confidence_matrix?: Json | null
          created_at?: string | null
          decision?: string | null
          event_type: string
          id?: string
          raw_data?: Json | null
          signature?: string | null
        }
        Update: {
          actor_id?: string
          approval_status?: string | null
          confidence_matrix?: Json | null
          created_at?: string | null
          decision?: string | null
          event_type?: string
          id?: string
          raw_data?: Json | null
          signature?: string | null
        }
        Relationships: []
      }
      conflict_history: {
        Row: {
          cloud_state: Json
          conflict_type: string
          correlation_id: string
          created_at: string | null
          id: string
          local_state: Json
          provenance: string | null
          recommendation: Json | null
          resolution_status: string | null
          specimen_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cloud_state: Json
          conflict_type: string
          correlation_id: string
          created_at?: string | null
          id?: string
          local_state: Json
          provenance?: string | null
          recommendation?: Json | null
          resolution_status?: string | null
          specimen_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cloud_state?: Json
          conflict_type?: string
          correlation_id?: string
          created_at?: string | null
          id?: string
          local_state?: Json
          provenance?: string | null
          recommendation?: Json | null
          resolution_status?: string | null
          specimen_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conflict_history_specimen_id_fkey"
            columns: ["specimen_id"]
            isOneToOne: false
            referencedRelation: "specimens"
            referencedColumns: ["id"]
          },
        ]
      }
      environmental_signals: {
        Row: {
          advisory_code: string
          confidence_score: number
          correlation_id: string
          created_at: string
          forecast_window_end: string
          forecast_window_start: string
          id: string
          observed_at: string
          operator_summary: string | null
          provenance: string
          provider: string
          raw_source_ref: string | null
          severity: Database["public"]["Enums"]["signal_severity"]
          signal_type: string
          source_hash: string
          specimen_id: string
          status: Database["public"]["Enums"]["signal_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          advisory_code: string
          confidence_score: number
          correlation_id: string
          created_at?: string
          forecast_window_end: string
          forecast_window_start: string
          id?: string
          observed_at?: string
          operator_summary?: string | null
          provenance: string
          provider: string
          raw_source_ref?: string | null
          severity?: Database["public"]["Enums"]["signal_severity"]
          signal_type: string
          source_hash: string
          specimen_id: string
          status?: Database["public"]["Enums"]["signal_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          advisory_code?: string
          confidence_score?: number
          correlation_id?: string
          created_at?: string
          forecast_window_end?: string
          forecast_window_start?: string
          id?: string
          observed_at?: string
          operator_summary?: string | null
          provenance?: string
          provider?: string
          raw_source_ref?: string | null
          severity?: Database["public"]["Enums"]["signal_severity"]
          signal_type?: string
          source_hash?: string
          specimen_id?: string
          status?: Database["public"]["Enums"]["signal_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "environmental_signals_specimen_id_fkey"
            columns: ["specimen_id"]
            isOneToOne: false
            referencedRelation: "specimens"
            referencedColumns: ["id"]
          },
        ]
      }
      integrity_timeline: {
        Row: {
          created_at: string | null
          description: string
          event_type: string
          id: string
          metadata: Json | null
          provenance: string
          significance_score: number | null
          specimen_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          event_type: string
          id?: string
          metadata?: Json | null
          provenance: string
          significance_score?: number | null
          specimen_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          provenance?: string
          significance_score?: number | null
          specimen_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integrity_timeline_specimen_id_fkey"
            columns: ["specimen_id"]
            isOneToOne: false
            referencedRelation: "specimens"
            referencedColumns: ["id"]
          },
        ]
      }
      operator_interventions: {
        Row: {
          correlation_id: string
          created_at: string | null
          id: string
          intervention_type: string
          payload: Json
          provenance: string | null
          rationale: string | null
          specimen_id: string | null
          sync_status: string | null
          user_id: string | null
        }
        Insert: {
          correlation_id: string
          created_at?: string | null
          id?: string
          intervention_type: string
          payload: Json
          provenance?: string | null
          rationale?: string | null
          specimen_id?: string | null
          sync_status?: string | null
          user_id?: string | null
        }
        Update: {
          correlation_id?: string
          created_at?: string | null
          id?: string
          intervention_type?: string
          payload?: Json
          provenance?: string | null
          rationale?: string | null
          specimen_id?: string | null
          sync_status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operator_interventions_specimen_id_fkey"
            columns: ["specimen_id"]
            isOneToOne: false
            referencedRelation: "specimens"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          role?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          role?: string
        }
        Relationships: []
      }
      specimen_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          last_action_type: string | null
          last_modified: string | null
          notes: string | null
          specimen_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          last_action_type?: string | null
          last_modified?: string | null
          notes?: string | null
          specimen_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          last_action_type?: string | null
          last_modified?: string | null
          notes?: string | null
          specimen_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "specimen_events_specimen_id_fkey"
            columns: ["specimen_id"]
            isOneToOne: false
            referencedRelation: "specimens"
            referencedColumns: ["id"]
          },
        ]
      }
      specimens: {
        Row: {
          activity_level: number | null
          created_at: string | null
          dietary_notes: string | null
          fertilizer: string | null
          hardware_attestation_statement: string | null
          health: number | null
          heart_rate: number | null
          id: string
          image_url: string | null
          kingdom: string | null
          last_action_type: string | null
          last_modified: string | null
          lat: number | null
          light: string | null
          location: string | null
          lon: number | null
          misting_schedule: string | null
          nickname: string
          notes: string | null
          region: string | null
          species_name: string | null
          substrate: string | null
          telemetry: Json | null
          user_id: string | null
          watering: string | null
        }
        Insert: {
          activity_level?: number | null
          created_at?: string | null
          dietary_notes?: string | null
          fertilizer?: string | null
          hardware_attestation_statement?: string | null
          health?: number | null
          heart_rate?: number | null
          id?: string
          image_url?: string | null
          kingdom?: string | null
          last_action_type?: string | null
          last_modified?: string | null
          lat?: number | null
          light?: string | null
          location?: string | null
          lon?: number | null
          misting_schedule?: string | null
          nickname: string
          notes?: string | null
          region?: string | null
          species_name?: string | null
          substrate?: string | null
          telemetry?: Json | null
          user_id?: string | null
          watering?: string | null
        }
        Update: {
          activity_level?: number | null
          created_at?: string | null
          dietary_notes?: string | null
          fertilizer?: string | null
          hardware_attestation_statement?: string | null
          health?: number | null
          heart_rate?: number | null
          id?: string
          image_url?: string | null
          kingdom?: string | null
          last_action_type?: string | null
          last_modified?: string | null
          lat?: number | null
          light?: string | null
          location?: string | null
          lon?: number | null
          misting_schedule?: string | null
          nickname?: string
          notes?: string | null
          region?: string | null
          species_name?: string | null
          substrate?: string | null
          telemetry?: Json | null
          user_id?: string | null
          watering?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed: boolean
          created_at: string
          due_date: string | null
          id: string
          last_action_type: string | null
          last_modified: string | null
          specimen_id: string
          task_type: string
          user_id: string | null
        }
        Insert: {
          completed?: boolean
          created_at?: string
          due_date?: string | null
          id?: string
          last_action_type?: string | null
          last_modified?: string | null
          specimen_id: string
          task_type: string
          user_id?: string | null
        }
        Update: {
          completed?: boolean
          created_at?: string
          due_date?: string | null
          id?: string
          last_action_type?: string | null
          last_modified?: string | null
          specimen_id?: string
          task_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_specimen_id_fkey"
            columns: ["specimen_id"]
            isOneToOne: false
            referencedRelation: "specimens"
            referencedColumns: ["id"]
          },
        ]
      }
      tester_feedback: {
        Row: {
          action_attempted: string | null
          content: string
          created_at: string | null
          device_info: Json | null
          error_context: string | null
          id: string
          route: string
          user_id: string
        }
        Insert: {
          action_attempted?: string | null
          content: string
          created_at?: string | null
          device_info?: Json | null
          error_context?: string | null
          id?: string
          route: string
          user_id: string
        }
        Update: {
          action_attempted?: string | null
          content?: string
          created_at?: string | null
          device_info?: Json | null
          error_context?: string | null
          id?: string
          route?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin_or_founder: { Args: never; Returns: boolean }
    }
    Enums: {
      signal_severity: "NOMINAL" | "ELEVATED" | "HIGH" | "CRITICAL"
      signal_status: "ACTIVE" | "EXPIRED" | "SUPPRESSED" | "NO_COVERAGE"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      signal_severity: ["NOMINAL", "ELEVATED", "HIGH", "CRITICAL"],
      signal_status: ["ACTIVE", "EXPIRED", "SUPPRESSED", "NO_COVERAGE"],
    },
  },
} as const

export type TaskType = "watered" | "fertilized" | "prune" | "repot" | "inspect"
export type CareEventType = "watered" | "fertilized" | "pruned" | "repotted" | "inspected" | "noted"
