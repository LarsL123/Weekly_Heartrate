import { Tables } from "@/types/supabase";

export type ActivityHrData = Tables<"activity_heartrate_data">;

export interface CropUpdate {
  activity_id: string;
  crop_start: number;
  crop_end: number | null;
}
