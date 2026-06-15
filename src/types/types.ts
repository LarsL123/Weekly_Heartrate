import { Tables } from "@/types/supabase";

export type ActivityHrData = Tables<"activity_heartrate_data">;

export type CropState = Record<
  string,
  { cropStart: number; cropEnd: number | null }
>;
