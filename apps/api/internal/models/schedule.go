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
	ClientID    string    `json:"clientId" db:"client_id"`
	ClientName  string    `json:"clientName" db:"client_name"`
	ClientAvatar string   `json:"clientAvatar" db:"client_avatar"`
	ServiceName string    `json:"serviceName" db:"service_name"`
	Location    Location  `json:"location" db:"location"`
	ShiftDate   string    `json:"shiftDate" db:"shift_date"`
	StartTime   string    `json:"startTime" db:"start_time"`
	EndTime     string    `json:"endTime" db:"end_time"`
	Status      string    `json:"status" db:"status"`
	VisitStart  *time.Time `json:"visitStart,omitempty" db:"visit_start"`
	VisitEnd    *time.Time `json:"visitEnd,omitempty" db:"visit_end"`
	StartLocation *Location `json:"startLocation,omitempty" db:"start_location"`
	EndLocation   *Location `json:"endLocation,omitempty" db:"end_location"`
	ServiceNotes string   `json:"serviceNotes" db:"service_notes"`
	Tasks       []Task    `json:"tasks,omitempty"`
}

type ScheduleStats struct {
	TotalSchedules    int `json:"totalSchedules"`
	MissedSchedules   int `json:"missedSchedules"`
	UpcomingToday     int `json:"upcomingToday"`
	CompletedToday    int `json:"completedToday"`
}
