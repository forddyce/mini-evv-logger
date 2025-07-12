package models

type Task struct {
	ID         string `json:"id" db:"id"`
	ScheduleID string `json:"schedule_id" db:"schedule_id"`
	Description string `json:"description" db:"description"`
	Completed  bool   `json:"completed" db:"completed"`
	Reason     *string `json:"reason,omitempty" db:"reason"`
}
