package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/forddyce/mini-evv-logger/apps/api/internal/models"
	"github.com/supabase-community/supabase-go"
)

type ScheduleRepository interface {
	GetSchedules(ctx context.Context) ([]models.Schedule, error)
	GetTodaySchedules(ctx context.Context) ([]models.Schedule, error)
	GetScheduleByID(ctx context.Context, id string) (*models.Schedule, error)
	StartVisit(ctx context.Context, id string, visitStart time.Time, startLocation models.Location) error
	EndVisit(ctx context.Context, id string, visitEnd time.Time, endLocation models.Location) error
	UpdateTaskStatus(ctx context.Context, taskID string, completed bool, reason *string) error
	ResetSampleData(ctx context.Context) error
}

type SupabaseScheduleRepository struct {
	client *supabase.Client
}

func NewScheduleRepository(client *supabase.Client) ScheduleRepository {
	return &SupabaseScheduleRepository{client: client}
}

func (r *SupabaseScheduleRepository) GetSchedules(ctx context.Context) ([]models.Schedule, error) {
	var schedules []models.Schedule
	resp, _, err := r.client.From("schedules").Select("*", "exact", false).Execute()
	if err != nil {
		return nil, fmt.Errorf("failed to fetch schedules from Supabase: %w", err)
	}

	if err := json.Unmarshal(resp, &schedules); err != nil {
		return nil, fmt.Errorf("failed to unmarshal schedules response: %w", err)
	}

	for i := range schedules {
		tasks, err := r.getTasksByScheduleID(ctx, schedules[i].ID)
		if err != nil {
			fmt.Printf("Warning: Failed to fetch tasks for schedule %s: %v\n", schedules[i].ID, err)
		}
		schedules[i].Tasks = tasks
	}

	return schedules, nil
}

func (r *SupabaseScheduleRepository) GetTodaySchedules(ctx context.Context) ([]models.Schedule, error) {
	// today := time.Now().Format("Mon, 02 Jan 2006")
	// resp, _, err := r.client.From("schedules").Select("*", "exact", false).Filter("shift_date", "eq", today).Execute()
	return r.GetSchedules(ctx)
}

func (r *SupabaseScheduleRepository) GetScheduleByID(ctx context.Context, id string) (*models.Schedule, error) {
	var schedules []models.Schedule
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

	tasks, err := r.getTasksByScheduleID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch tasks for schedule %s: %w", id, err)
	}
	schedule.Tasks = tasks

	return schedule, nil
}

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

func (r *SupabaseScheduleRepository) StartVisit(ctx context.Context, id string, visitStart time.Time, startLocation models.Location) error {
	updateData := map[string]interface{}{
		"status": "in_progress",
		"visit_start": visitStart.Format(time.RFC3339),
		"start_location": startLocation,
	}

	resp, _, err := r.client.From("schedules").
		Update(updateData, "exact", "representation").
		Filter("id", "eq", id).
		Execute()

	if err != nil {
		return fmt.Errorf("repository: failed to update schedule status to in_progress for ID %s: %w, Supabase response: %s", id, err, string(resp))
	}

	return nil
}

func (r *SupabaseScheduleRepository) EndVisit(ctx context.Context, id string, visitEnd time.Time, endLocation models.Location) error {
	updateData := map[string]interface{}{
		"status": "completed",
		"visit_end": visitEnd.Format(time.RFC3339),
		"end_location": endLocation,
	}

	resp, _, err := r.client.From("schedules").
		Update(updateData, "exact", "representation").
		Filter("id", "eq", id).
		Execute()

	if err != nil {
		return fmt.Errorf("repository: failed to update schedule status to completed for ID %s: %w, Supabase response: %s", id, err, string(resp))
	}

	return nil
}

func (r *SupabaseScheduleRepository) UpdateTaskStatus(ctx context.Context, taskID string, completed bool, reason *string) error {
	updateData := map[string]interface{}{
		"completed": completed,
		"reason": reason,
	}

	resp, _, err := r.client.From("tasks").
		Update(updateData, "exact", "representation").
		Filter("id", "eq", taskID).
		Execute()

	if err != nil {
		return fmt.Errorf("repository: failed to update task status for ID %s: %w, Supabase response: %s", taskID, err, string(resp))
	}

	return nil
}

func (r *SupabaseScheduleRepository) ResetSampleData(ctx context.Context) error {
	schedulesToReset := []string{"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12", "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13", "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14", "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15"}

	for _, id := range schedulesToReset {
		updateData := map[string]interface{}{
			"status":        "scheduled",
			"visit_start":   nil,
			"visit_end":     nil,
			"start_location": nil,
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
