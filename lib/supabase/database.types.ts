export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'arms'
  | 'core'
  | 'cardio'
  | 'other'

export type Database = {
  public: {
    Tables: {
      exercises: {
        Row: {
          id: string
          name: string
          muscle_group: MuscleGroup
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          muscle_group: MuscleGroup
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          muscle_group?: MuscleGroup
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      presets: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      preset_items: {
        Row: {
          id: string
          preset_id: string
          exercise_id: string
          order_index: number
          default_weight: number | null
          default_reps: number | null
          default_sets: number
          created_at: string
        }
        Insert: {
          id?: string
          preset_id: string
          exercise_id: string
          order_index?: number
          default_weight?: number | null
          default_reps?: number | null
          default_sets?: number
          created_at?: string
        }
        Update: {
          id?: string
          preset_id?: string
          exercise_id?: string
          order_index?: number
          default_weight?: number | null
          default_reps?: number | null
          default_sets?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'preset_items_preset_id_fkey'
            columns: ['preset_id']
            isOneToOne: false
            referencedRelation: 'presets'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'preset_items_exercise_id_fkey'
            columns: ['exercise_id']
            isOneToOne: false
            referencedRelation: 'exercises'
            referencedColumns: ['id']
          },
        ]
      }
      workout_sessions: {
        Row: {
          id: string
          date: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      workout_sets: {
        Row: {
          id: string
          session_id: string
          exercise_id: string
          set_number: number
          weight: number
          reps: number
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          exercise_id: string
          set_number: number
          weight: number
          reps: number
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          exercise_id?: string
          set_number?: number
          weight?: number
          reps?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'workout_sets_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'workout_sessions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'workout_sets_exercise_id_fkey'
            columns: ['exercise_id']
            isOneToOne: false
            referencedRelation: 'exercises'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<never, never>
    Functions: {
      create_preset: {
        Args: {
          p_name: string
          p_items: Array<{
            exercise_id: string
            order_index: number
            default_weight: number | null
            default_reps: number | null
            default_sets: number
          }>
        }
        Returns: string
      }
      update_preset: {
        Args: {
          p_preset_id: string
          p_name: string
          p_items: Array<{
            exercise_id: string
            order_index: number
            default_weight: number | null
            default_reps: number | null
            default_sets: number
          }>
        }
        Returns: boolean
      }
      create_workout_session: {
        Args: {
          p_date: string
          p_notes: string
          p_sets: Array<{
            exercise_id: string
            set_number: number
            weight: number
            reps: number
          }>
        }
        Returns: string
      }
      update_workout_session: {
        Args: {
          p_session_id: string
          p_date: string
          p_notes: string
          p_sets: Array<{
            exercise_id: string
            set_number: number
            weight: number
            reps: number
          }>
        }
        Returns: boolean
      }
      delete_workout_set: {
        Args: {
          p_set_id: string
          p_session_id: string
        }
        Returns: boolean
      }
    }
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}

export type Exercise = Database['public']['Tables']['exercises']['Row']
export type Preset = Database['public']['Tables']['presets']['Row']
export type PresetItem = Database['public']['Tables']['preset_items']['Row']
export type WorkoutSession = Database['public']['Tables']['workout_sessions']['Row']
export type WorkoutSet = Database['public']['Tables']['workout_sets']['Row']
