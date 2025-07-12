package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/forddyce/mini-evv-logger/apps/api/internal/models" // Import your models
	"github.com/supabase-community/supabase-go"
)

// ScheduleRepository defines the interface for schedule data operations.
// This abstraction allows for easier testing and changing data sources in the future.
type ScheduleRepository interface {
	GetSchedules(ctx context.Context) ([]models.Schedule, error)
	GetTodaySchedules(ctx context.Context) ([]models.Schedule, error) // Will now return all schedules for demo
	GetScheduleByID(ctx context.Context, id string) (*models.Schedule, error) // Corrected: Added 'id string'
	StartVisit(ctx context.Context, id string, visitStart time.Time, startLocation models.Location) error
	EndVisit(ctx context.Context, id string, visitEnd time.Time, endLocation models.Location) error
	UpdateTaskStatus(ctx context.Context, taskID string, completed bool, reason *string) error
	// Add a reset endpoint for demonstration purposes
	ResetSampleData(ctx context.Context) error
}

// SupabaseScheduleRepository implements ScheduleRepository for Supabase.
type SupabaseScheduleRepository struct {
	client *supabase.Client
}

// NewScheduleRepository creates a new SupabaseScheduleRepository.
func NewScheduleRepository(client *supabase.Client) ScheduleRepository {
	return &SupabaseScheduleRepository{client: client}
}

// GetSchedules fetches all schedules from Supabase.
func (r *SupabaseScheduleRepository) GetSchedules(ctx context.Context) ([]models.Schedule, error) {
	var schedules []models.Schedule
	// Select all columns from the 'schedules' table
	// Using "exact" for count and false for returning a single object (we want an array)
	resp, _, err := r.client.From("schedules").Select("*", "exact", false).Execute()
	if err != nil {
		return nil, fmt.Errorf("failed to fetch schedules from Supabase: %w", err)
	}

	if err := json.Unmarshal(resp, &schedules); err != nil {
		return nil, fmt.Errorf("failed to unmarshal schedules response: %w", err)
	}

	// For each schedule, fetch its tasks
	for i := range schedules {
		tasks, err := r.getTasksByScheduleID(ctx, schedules[i].ID)
		if err != nil {
			// Log the error but continue if tasks for one schedule fail to fetch
			fmt.Printf("Warning: Failed to fetch tasks for schedule %s: %v\n", schedules[i].ID, err)
		}
		schedules[i].Tasks = tasks // Assign tasks to the Schedule struct
	}

	return schedules, nil
}

// GetTodaySchedules now fetches all schedules for demonstration purposes.
// In a production environment, this would filter by the current date.
func (r *SupabaseScheduleRepository) GetTodaySchedules(ctx context.Context) ([]models.Schedule, error) {
	// For demo purposes, we'll return all schedules here so the homepage always has data.
	// In a real application, you would filter by today's date:
	// today := time.Now().Format("Mon, 02 Jan 2006")
	// resp, _, err := r.client.From("schedules").Select("*", "exact", false).Filter("shift_date", "eq", today).Execute()
	return r.GetSchedules(ctx) // Re-use GetSchedules to fetch all
}

// GetScheduleByID fetches a single schedule and its associated tasks by ID.
func (r *SupabaseScheduleRepository) GetScheduleByID(ctx context.Context, id string) (*models.Schedule, error) {
	var schedules []models.Schedule // Supabase client returns an array even for single results
	resp, _, err := r.client.From("schedules").
		Select("*", "exact", false).
		Filter("id", "eq", id).
		Execute()
	if err != nil {
		return nil, fmt.Errorf("failed to fetch schedule by ID from Supabase: %w", err)
	}

	if err := json.Unmarshal(resp, &schedules); err != nil {
		return nil, fmt.Errorf("failed to unmarshal schedule by ID response: %w", err)
	}

	if len(schedules) == 0 {
		return nil, fmt.Errorf("schedule with ID %s not found", id)
	}

	schedule := &schedules[0]

	// Fetch and attach associated tasks for this schedule
	tasks, err := r.getTasksByScheduleID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch tasks for schedule %s: %w", id, err)
	}
	schedule.Tasks = tasks // Assign tasks to the Schedule struct

	return schedule, nil
}

// getTasksByScheduleID is a helper function to fetch tasks for a given schedule ID.
func (r *SupabaseScheduleRepository) getTasksByScheduleID(ctx context.Context, scheduleID string) ([]models.Task, error) {
	var tasks []models.Task
	taskResp, _, err := r.client.From("tasks").
		Select("*", "exact", false).
		Filter("schedule_id", "eq", scheduleID).
		Execute()
	if err != nil {
		return nil, fmt.Errorf("failed to fetch tasks for schedule %s from Supabase: %w", scheduleID, err)
	}

	if err := json.Unmarshal(taskResp, &tasks); err != nil {
		return nil, fmt.Errorf("failed to unmarshal tasks response for schedule %s: %w", scheduleID, err)
	}
	return tasks, nil
}


// StartVisit updates a schedule's status to 'in_progress' and logs start time/location.
func (r *SupabaseScheduleRepository) StartVisit(ctx context.Context, id string, visitStart time.Time, startLocation models.Location) error {
	updateData := map[string]interface{}{
		"status": "in_progress",
		"visit_start": visitStart.Format(time.RFC3339), // Supabase prefers RFC3339 for timestamps
		"start_location": startLocation, // This assumes 'start_location' is a JSONB column
	}

	resp, _, err := r.client.From("schedules"). // Capture count for debugging
		Update(updateData, "exact", "representation").
		Filter("id", "eq", id).
		Execute()

	if err != nil {
		return fmt.Errorf("repository: failed to update schedule status to in_progress for ID %s: %w, Supabase response: %s", id, err, string(resp))
	}

	return nil
}

// EndVisit updates a schedule's status to 'completed' and logs end time/location.
func (r *SupabaseScheduleRepository) EndVisit(ctx context.Context, id string, visitEnd time.Time, endLocation models.Location) error {
	updateData := map[string]interface{}{
		"status": "completed",
		"visit_end": visitEnd.Format(time.RFC3339), // Supabase prefers RFC3339 for timestamps
		"end_location": endLocation, // This assumes 'end_location' is a JSONB column
	}

	resp, _, err := r.client.From("schedules"). // Capture count for debugging
		Update(updateData, "exact", "representation").
		Filter("id", "eq", id).
		Execute()

	if err != nil {
		return fmt.Errorf("repository: failed to update schedule status to completed for ID %s: %w, Supabase response: %s", id, err, string(resp))
	}

	return nil
}

// UpdateTaskStatus updates a specific task's completion status and optional reason.
func (r *SupabaseScheduleRepository) UpdateTaskStatus(ctx context.Context, taskID string, completed bool, reason *string) error {
	updateData := map[string]interface{}{
		"completed": completed,
		"reason": reason, // Supabase will handle null for *string
	}

	resp, _, err := r.client.From("tasks"). // Capture count for debugging
		Update(updateData, "exact", "representation").
		Filter("id", "eq", taskID).
		Execute()

	if err != nil {
		return fmt.Errorf("repository: failed to update task status for ID %s: %w, Supabase response: %s", taskID, err, string(resp))
	}

	return nil
}

// ResetSampleData resets the status of specific schedules and tasks for demonstration.
// This is a crucial method for your demo purposes.
func (r *SupabaseScheduleRepository) ResetSampleData(ctx context.Context) error {
	// Define the IDs of the schedules you want to reset
	schedulesToReset := []string{"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12", "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13", "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14", "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15"}

	// Reset schedules to 'scheduled' status and clear visit times/locations
	for _, id := range schedulesToReset {
		updateData := map[string]interface{}{
			"status":        "scheduled",
			"visit_start":   nil, // Clear timestamps
			"visit_end":     nil,
			"start_location": nil, // Clear locations
			"end_location":   nil,
		}
		resp, _, err := r.client.From("schedules").
			Update(updateData, "exact", "representation").
			Filter("id", "eq", id).
			Execute()
		if err != nil {
			return fmt.Errorf("repository: failed to reset schedule %s: %w, response: %s", id, err, string(resp))
		}
	}

	// Reset tasks associated with these schedules to not completed and clear reasons
	for _, scheduleID := range schedulesToReset {
		updateTaskData := map[string]interface{}{
			"completed": false,
			"reason":    nil,
		}
		resp, _, err := r.client.From("tasks").
			Update(updateTaskData, "exact", "representation").
			Filter("schedule_id", "eq", scheduleID).
			Execute()
		if err != nil {
			fmt.Printf("Warning: Failed to reset tasks for schedule %s: %v, response: %s\n", scheduleID, err, string(resp))
		}
	}

	fmt.Println("Sample data reset successfully!")
	return nil
}
