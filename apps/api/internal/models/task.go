package models

// Task represents a care activity associated with a schedule.
// This struct maps to your 'tasks' table in Supabase.
type Task struct {
	ID         string `json:"id" db:"id"` // UUID
	ScheduleID string `json:"schedule_id" db:"schedule_id"` // Changed json tag to snake_case
	Description string `json:"description" db:"description"`
	Completed  bool   `json:"completed" db:"completed"` // True if task is completed
	Reason     *string `json:"reason,omitempty" db:"reason"` // Optional reason if not completed
}
