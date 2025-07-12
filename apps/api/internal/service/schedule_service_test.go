package service_test

import (
	"context"
	"errors"
	"reflect"
	"testing"
	"time"

	"github.com/forddyce/mini-evv-logger/apps/api/internal/models"
	"github.com/forddyce/mini-evv-logger/apps/api/internal/repository"
	"github.com/forddyce/mini-evv-logger/apps/api/internal/service"
)

// MockScheduleRepository is a mock implementation of repository.ScheduleRepository for testing.
type MockScheduleRepository struct {
	GetSchedulesFunc      func(ctx context.Context) ([]models.Schedule, error)
	GetTodaySchedulesFunc func(ctx context.Context) ([]models.Schedule, error)
	GetScheduleByIDFunc   func(ctx context.Context, id string) (*models.Schedule, error)
	StartVisitFunc        func(ctx context.Context, id string, visitStart time.Time, startLocation models.Location) error
	EndVisitFunc          func(ctx context.Context, id string, visitEnd time.Time, endLocation models.Location) error
	UpdateTaskStatusFunc  func(ctx context.Context, taskID string, completed bool, reason *string) error
	ResetSampleDataFunc   func(ctx context.Context) error
}

// Ensure MockScheduleRepository implements the ScheduleRepository interface.
var _ repository.ScheduleRepository = &MockScheduleRepository{}

// GetSchedules implements the ScheduleRepository interface for the mock.
func (m *MockScheduleRepository) GetSchedules(ctx context.Context) ([]models.Schedule, error) {
	if m.GetSchedulesFunc != nil {
		return m.GetSchedulesFunc(ctx)
	}
	return nil, errors.New("GetSchedulesFunc not set")
}

// GetTodaySchedules implements the ScheduleRepository interface for the mock.
func (m *MockScheduleRepository) GetTodaySchedules(ctx context.Context) ([]models.Schedule, error) {
	if m.GetTodaySchedulesFunc != nil {
		return m.GetTodaySchedulesFunc(ctx)
	}
	return nil, errors.New("GetTodaySchedulesFunc not set")
}

// GetScheduleByID implements the ScheduleRepository interface for the mock.
func (m *MockScheduleRepository) GetScheduleByID(ctx context.Context, id string) (*models.Schedule, error) {
	if m.GetScheduleByIDFunc != nil {
		return m.GetScheduleByIDFunc(ctx, id)
	}
	return nil, errors.New("GetScheduleByIDFunc not set")
}

// StartVisit implements the ScheduleRepository interface for the mock.
func (m *MockScheduleRepository) StartVisit(ctx context.Context, id string, visitStart time.Time, startLocation models.Location) error {
	if m.StartVisitFunc != nil {
		return m.StartVisitFunc(ctx, id, visitStart, startLocation)
	}
	return errors.New("StartVisitFunc not set")
}

// EndVisit implements the ScheduleRepository interface for the mock.
func (m *MockScheduleRepository) EndVisit(ctx context.Context, id string, visitEnd time.Time, endLocation models.Location) error {
	if m.EndVisitFunc != nil {
		return m.EndVisitFunc(ctx, id, visitEnd, endLocation)
	}
	return errors.New("EndVisitFunc not set")
}

// UpdateTaskStatus implements the ScheduleRepository interface for the mock.
func (m *MockScheduleRepository) UpdateTaskStatus(ctx context.Context, taskID string, completed bool, reason *string) error {
	if m.UpdateTaskStatusFunc != nil {
		return m.UpdateTaskStatusFunc(ctx, taskID, completed, reason)
	}
	return errors.New("UpdateTaskStatusFunc not set")
}

// ResetSampleData implements the ScheduleRepository interface for the mock.
func (m *MockScheduleRepository) ResetSampleData(ctx context.Context) error {
	if m.ResetSampleDataFunc != nil {
		return m.ResetSampleDataFunc(ctx)
	}
	return errors.New("ResetSampleDataFunc not set")
}


// TestGetSchedules_Success tests the successful retrieval of schedules.
func TestGetSchedules_Success(t *testing.T) {
	// Define expected schedules to be returned by the mock repository
	expectedSchedules := []models.Schedule{
		{
			ID:          "sch-001",
			ClientName:  "Test Client 1",
			ServiceName: "Test Service 1",
			Location:    models.Location{Address: "123 Test St"},
			ShiftDate:   "Mon, 02 Jan 2025",
			StartTime:   "09:00",
			EndTime:     "10:00",
			Status:      "scheduled",
			Tasks:       []models.Task{{ID: "task-001", Description: "Task 1"}},
		},
		{
			ID:          "sch-002",
			ClientName:  "Test Client 2",
			ServiceName: "Test Service 2",
			Location:    models.Location{Address: "456 Mock Ave"},
			ShiftDate:   "Tue, 03 Jan 2025",
			StartTime:   "11:00",
			EndTime:     "12:00",
			Status:      "completed",
			Tasks:       []models.Task{{ID: "task-002", Description: "Task 2"}},
		},
	}

	// Create a mock repository and set its GetSchedulesFunc to return our expected data
	mockRepo := &MockScheduleRepository{
		GetSchedulesFunc: func(ctx context.Context) ([]models.Schedule, error) {
			return expectedSchedules, nil
		},
	}

	// Create the service with the mock repository
	s := service.NewScheduleService(mockRepo)

	// Call the service method under test
	schedules, err := s.GetSchedules(context.Background())

	// Assertions
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}
	if !reflect.DeepEqual(schedules, expectedSchedules) {
		t.Errorf("Expected schedules %v, got %v", expectedSchedules, schedules)
	}
}

// TestGetSchedules_RepositoryError tests error handling when the repository fails.
func TestGetSchedules_RepositoryError(t *testing.T) {
	// Define an error to be returned by the mock repository
	repoError := errors.New("database connection failed")

	// Create a mock repository and set its GetSchedulesFunc to return an error
	mockRepo := &MockScheduleRepository{
		GetSchedulesFunc: func(ctx context.Context) ([]models.Schedule, error) {
			return nil, repoError
		},
	}

	// Create the service with the mock repository
	s := service.NewScheduleService(mockRepo)

	// Call the service method under test
	schedules, err := s.GetSchedules(context.Background())

	// Assertions
	if err == nil {
		t.Fatal("Expected an error, got nil")
	}
	if !errors.Is(err, repoError) {
		t.Errorf("Expected error to be %v, got %v", repoError, err)
	}
	if schedules != nil {
		t.Errorf("Expected nil schedules, got %v", schedules)
	}
}
