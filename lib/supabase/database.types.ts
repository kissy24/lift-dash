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
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}

export type Exercise = Database['public']['Tables']['exercises']['Row']
