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
  client_id: string;
  client_name: string;
  client_avatar?: string;
  service_name: string;
  location: Location;
  shift_date: string;
  start_time: string;
  end_time: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  visit_start?: string | null;
  visit_end?: string | null;
  start_location?: Location | null;
  end_location?: Location | null;
  service_notes?: string;
  tasks?: Task[];
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
