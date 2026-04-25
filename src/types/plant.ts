export type Plant = {
  id: string;
  user_id?: string | null;
  nickname: string;
  species_name?: string | null;
  notes?: string | null;
  image_url?: string | null;
  created_at: string;
};

export type CareEvent = {
  id: string;
  user_id?: string | null;
  plant_id?: string;
  event_type: string;
  notes?: string | null;
  created_at: string;
};

export type Reminder = {
  id: string;
  user_id?: string | null;
  plant_id?: string;
  message?: string | null;
  due_date?: string | null;
  created_at?: string;
};
