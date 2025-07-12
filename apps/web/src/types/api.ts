export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface Task {
  id: string;
  scheduleId: string;
  description: string;
  completed: boolean;
  reason?: string | null;
}

export interface Schedule {
  id: string;
  client_id: string; // Corresponds to client_id in DB
  client_name: string;
  client_avatar?: string; // Optional URL for client avatar
  service_name: string;
  location: Location; // Parsed from JSONB
  shift_date: string; // e.g., "Mon, 15 Jan 2025"
  start_time: string; // e.g., "09:00"
  end_time: string; // e.g., "10:00"
  status: "scheduled" | "in_progress" | "completed" | "cancelled"; // Corrected to snake_case
  visit_start?: string | null; // ISO 8601 string or null
  visit_end?: string | null; // ISO 8601 string or null
  start_location?: Location | null;
  end_location?: Location | null;
  service_notes?: string;
  tasks?: Task[]; // Array of Tasks associated with this schedule
}

export interface ScheduleStats {
  totalSchedules: number;
  completedSchedules: number;
  scheduledSchedules: number;
  cancelledSchedules: number;
  missedSchedules: number;
  upcomingToday: number;
  completedToday: number;
}
