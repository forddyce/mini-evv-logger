package service

import (
	"context"
	"fmt"
	"strings" // Import strings package for TrimSpace
	"time"

	"github.com/forddyce/mini-evv-logger/apps/api/internal/models"
	"github.com/forddyce/mini-evv-logger/apps/api/internal/repository"
)

// ScheduleService defines the interface for business logic related to schedules.
type ScheduleService interface {
	GetSchedules(ctx context.Context) ([]models.Schedule, error)
	GetTodaySchedules(ctx context.Context) ([]models.Schedule, error)
	GetScheduleByID(ctx context.Context, id string) (*models.Schedule, error)
	StartVisit(ctx context.Context, id string, latitude, longitude float64, address string) error
	EndVisit(ctx context.Context, id string, latitude, longitude float64, address string) error
	UpdateTaskStatus(ctx context.Context, taskID string, completed bool, reason *string) error
	ResetSampleData(ctx context.Context) error
	GetScheduleStats(ctx context.Context) (*models.ScheduleStats, error) // New method for dashboard stats
}

// scheduleService implements ScheduleService using a ScheduleRepository.
type scheduleService struct {
	repo repository.ScheduleRepository
}

// NewScheduleService creates a new ScheduleService.
func NewScheduleService(repo repository.ScheduleRepository) ScheduleService {
	return &scheduleService{repo: repo}
}

// GetSchedules retrieves all schedules.
func (s *scheduleService) GetSchedules(ctx context.Context) ([]models.Schedule, error) {
	schedules, err := s.repo.GetSchedules(ctx)
	if err != nil {
		return nil, fmt.Errorf("service: failed to get all schedules: %w", err)
	}
	return schedules, nil
}

// GetTodaySchedules retrieves all schedules (for demo purposes).
// In a production app, this would filter by the current date.
func (s *scheduleService) GetTodaySchedules(ctx context.Context) ([]models.Schedule, error) {
	schedules, err := s.repo.GetTodaySchedules(ctx)
	if err != nil {
		return nil, fmt.Errorf("service: failed to get today's schedules: %w", err)
	}
	return schedules, nil
}

// GetScheduleByID retrieves a single schedule by its ID, including its tasks.
func (s *scheduleService) GetScheduleByID(ctx context.Context, id string) (*models.Schedule, error) {
	schedule, err := s.repo.GetScheduleByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("service: failed to get schedule by ID %s: %w", id, err)
	}
	return schedule, nil
}

// StartVisit logs the start of a visit, updating status and capturing location/timestamp.
func (s *scheduleService) StartVisit(ctx context.Context, id string, latitude, longitude float64, address string) error {
	visitStart := time.Now()
	startLocation := models.Location{
		Latitude:  latitude,
		Longitude: longitude,
		Address:   address,
	}

	// You might add business logic here, e.g., check if schedule is already in progress
	schedule, err := s.repo.GetScheduleByID(ctx, id)
	if err != nil {
		return fmt.Errorf("service: failed to get schedule before starting visit: %w", err)
	}
	if schedule.Status != "scheduled" {
		return fmt.Errorf("service: cannot start visit for schedule %s with status %s", id, schedule.Status)
	}

	err = s.repo.StartVisit(ctx, id, visitStart, startLocation)
	if err != nil {
		return fmt.Errorf("service: failed to start visit for ID %s: %w", id, err)
	}
	return nil
}

// EndVisit logs the end of a visit, updating status and capturing location/timestamp.
func (s *scheduleService) EndVisit(ctx context.Context, id string, latitude, longitude float64, address string) error {
	visitEnd := time.Now()
	endLocation := models.Location{
		Latitude:  latitude,
		Longitude: longitude,
		Address:   address,
	}

	// You might add business logic here, e.g., check if schedule is actually in progress
	schedule, err := s.repo.GetScheduleByID(ctx, id)
	if err != nil {
		return fmt.Errorf("service: failed to get schedule before ending visit: %w", err)
	}
	if schedule.Status != "in_progress" {
		return fmt.Errorf("service: cannot end visit for schedule %s with status %s", id, schedule.Status)
	}

	err = s.repo.EndVisit(ctx, id, visitEnd, endLocation)
	if err != nil {
		return fmt.Errorf("service: failed to end visit for ID %s: %w", id, err)
	}
	return nil
}

// UpdateTaskStatus updates the completion status and reason for a specific task.
func (s *scheduleService) UpdateTaskStatus(ctx context.Context, taskID string, completed bool, reason *string) error {
	// Add any business logic for task updates here, e.g., validation
	err := s.repo.UpdateTaskStatus(ctx, taskID, completed, reason)
	if err != nil {
		return fmt.Errorf("service: failed to update task status for ID %s: %w", taskID, err)
	}
	return nil
}

// ResetSampleData calls the repository to reset sample data.
func (s *scheduleService) ResetSampleData(ctx context.Context) error {
	err := s.repo.ResetSampleData(ctx)
	if err != nil {
		return fmt.Errorf("service: failed to reset sample data: %w", err)
	}
	return nil
}

// GetScheduleStats calculates and returns dashboard statistics.
func (s *scheduleService) GetScheduleStats(ctx context.Context) (*models.ScheduleStats, error) {
	allSchedules, err := s.repo.GetSchedules(ctx) // Fetch all schedules
	if err != nil {
		return nil, fmt.Errorf("service: failed to get schedules for stats: %w", err)
	}

	totalSchedules := len(allSchedules)
	missedSchedules := 0
	upcomingToday := 0
	completedToday := 0

	todayFormatted := time.Now().Format("Mon, 02 Jan 2006") // e.g., "Mon, 15 Jan 2025"

	for _, schedule := range allSchedules {
		// --- DEBUGGING LOG ---
		fmt.Printf("DEBUG: Processing schedule ID: %s, ShiftDate: '%s', Status: '%s'\n", schedule.ID, schedule.ShiftDate, schedule.Status)
		// --- END DEBUGGING LOG ---

		// Defensive check: Skip if ShiftDate is empty
		if strings.TrimSpace(schedule.ShiftDate) == "" {
			fmt.Printf("Warning: Skipping schedule %s due to empty ShiftDate.\n", schedule.ID)
			continue // Skip this schedule for stats calculation if date is missing
		}

		switch schedule.Status {
		case "scheduled":
			shiftDate, err := time.Parse("Mon, 02 Jan 2006", schedule.ShiftDate)
			if err != nil {
				fmt.Printf("Warning: Could not parse shift date '%s' for schedule %s: %v\n", schedule.ShiftDate, schedule.ID, err)
				continue // Skip this schedule if date parsing fails
			}
			if shiftDate.Before(time.Now().Truncate(24 * time.Hour)) { // If shift date is before today
				missedSchedules++
			} else if schedule.ShiftDate == todayFormatted {
				upcomingToday++
			}
		case "completed":
			// Check if completed today
			if schedule.VisitEnd != nil && schedule.VisitEnd.Format("Mon, 02 Jan 2006") == todayFormatted {
				completedToday++
			}
		}
	}

	stats := &models.ScheduleStats{
		TotalSchedules:    totalSchedules,
		MissedSchedules:   missedSchedules,
		UpcomingToday:     upcomingToday,
		CompletedToday:    completedToday,
	}

	return stats, nil
}
