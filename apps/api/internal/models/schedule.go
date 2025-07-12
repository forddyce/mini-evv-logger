package models

import (
	"time"
)

type Location struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Address   string  `json:"address"`
}

type Schedule struct {
	ID          string    `json:"id" db:"id"`
	ClientID    string    `json:"client_id" db:"client_id"`
	ClientName  string    `json:"client_name" db:"client_name"`
	ClientAvatar string   `json:"client_avatar" db:"client_avatar"`
	ServiceName string    `json:"service_name" db:"service_name"`
	Location    Location  `json:"location" db:"location"`
	ShiftDate   string    `json:"shift_date" db:"shift_date"`
	StartTime   string    `json:"start_time" db:"start_time"`
	EndTime     string    `json:"end_time" db:"end_time"`
	Status      string    `json:"status" db:"status"`
	VisitStart  *time.Time `json:"visit_start,omitempty" db:"visit_start"`
	VisitEnd    *time.Time `json:"visit_end,omitempty" db:"visit_end"`
	StartLocation *Location `json:"start_location,omitempty" db:"start_location"`
	EndLocation   *Location `json:"end_location,omitempty" db:"end_location"`
	ServiceNotes string   `json:"service_notes" db:"service_notes"`
	Tasks       []Task    `json:"tasks,omitempty"`
}

type ScheduleStats struct {
	TotalSchedules    int `json:"totalSchedules"`
	MissedSchedules   int `json:"missedSchedules"`
	UpcomingToday     int `json:"upcomingToday"`
	CompletedToday    int `json:"completedToday"`
}
