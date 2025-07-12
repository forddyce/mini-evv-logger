package models

import (
	"time"
)

// Location represents the geographic coordinates for a visit.
// It will be stored as JSONB in the database, or as separate columns.
type Location struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Address   string  `json:"address"` // Human-readable address
}

// Schedule represents a caregiver's visit schedule.
// This struct maps to your 'schedules' table in Supabase.
type Schedule struct {
	ID          string    `json:"id" db:"id"` // UUID from Supabase
	ClientID    string    `json:"client_id" db:"client_id"` // Changed json tag to snake_case
	ClientName  string    `json:"client_name" db:"client_name"` // Changed json tag to snake_case
	ClientAvatar string   `json:"client_avatar" db:"client_avatar"` // Changed json tag to snake_case
	ServiceName string    `json:"service_name" db:"service_name"` // Changed json tag to snake_case
	Location    Location  `json:"location" db:"location"` // Stored as JSONB in DB, or separate columns
	ShiftDate   string    `json:"shift_date" db:"shift_date"` // Changed json tag to snake_case
	StartTime   string    `json:"start_time" db:"start_time"` // Changed json tag to snake_case
	EndTime     string    `json:"end_time" db:"end_time"`     // Changed json tag to snake_case
	Status      string    `json:"status" db:"status"`       // "scheduled", "in_progress", "completed", "cancelled"
	VisitStart  *time.Time `json:"visit_start,omitempty" db:"visit_start"` // Changed json tag to snake_case
	VisitEnd    *time.Time `json:"visit_end,omitempty" db:"visit_end"`     // Changed json tag to snake_case
	StartLocation *Location `json:"start_location,omitempty" db:"start_location"` // Changed json tag to snake_case
	EndLocation   *Location `json:"end_location,omitempty" db:"end_location"`     // Changed json tag to snake_case
	ServiceNotes string   `json:"service_notes" db:"service_notes"` // Changed json tag to snake_case
	Tasks       []Task    `json:"tasks,omitempty"` // Slice of Tasks associated with this schedule (handled separately in repo)
}

// ScheduleStats represents aggregated statistics for schedules.
type ScheduleStats struct {
	TotalSchedules    int `json:"totalSchedules"`
	MissedSchedules   int `json:"missedSchedules"`
	UpcomingToday     int `json:"upcomingToday"`
	CompletedToday    int `json:"completedToday"`
}
