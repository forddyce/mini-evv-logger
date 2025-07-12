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

type MockScheduleRepository struct {
	GetSchedulesFunc      func(ctx context.Context) ([]models.Schedule, error)
	GetTodaySchedulesFunc func(ctx context.Context) ([]models.Schedule, error)
	GetScheduleByIDFunc   func(ctx context.Context, id string) (*models.Schedule, error)
	StartVisitFunc        func(ctx context.Context, id string, visitStart time.Time, startLocation models.Location) error
	EndVisitFunc          func(ctx context.Context, id string, visitEnd time.Time, endLocation models.Location) error
	UpdateTaskStatusFunc  func(ctx context.Context, taskID string, completed bool, reason *string) error
	ResetSampleDataFunc   func(ctx context.Context) error
}

var _ repository.ScheduleRepository = &MockScheduleRepository{}

func (m *MockScheduleRepository) GetSchedules(ctx context.Context) ([]models.Schedule, error) {
	if m.GetSchedulesFunc != nil {
		return m.GetSchedulesFunc(ctx)
	}
	return nil, errors.New("GetSchedulesFunc not set")
}

func (m *MockScheduleRepository) GetTodaySchedules(ctx context.Context) ([]models.Schedule, error) {
	if m.GetTodaySchedulesFunc != nil {
		return m.GetTodaySchedulesFunc(ctx)
	}
	return nil, errors.New("GetTodaySchedulesFunc not set")
}

func (m *MockScheduleRepository) GetScheduleByID(ctx context.Context, id string) (*models.Schedule, error) {
	if m.GetScheduleByIDFunc != nil {
		return m.GetScheduleByIDFunc(ctx, id)
	}
	return nil, errors.New("GetScheduleByIDFunc not set")
}

func (m *MockScheduleRepository) StartVisit(ctx context.Context, id string, visitStart time.Time, startLocation models.Location) error {
	if m.StartVisitFunc != nil {
		return m.StartVisitFunc(ctx, id, visitStart, startLocation)
	}
	return errors.New("StartVisitFunc not set")
}

func (m *MockScheduleRepository) EndVisit(ctx context.Context, id string, visitEnd time.Time, endLocation models.Location) error {
	if m.EndVisitFunc != nil {
		return m.EndVisitFunc(ctx, id, visitEnd, endLocation)
	}
	return errors.New("EndVisitFunc not set")
}

func (m *MockScheduleRepository) UpdateTaskStatus(ctx context.Context, taskID string, completed bool, reason *string) error {
	if m.UpdateTaskStatusFunc != nil {
		return m.UpdateTaskStatusFunc(ctx, taskID, completed, reason)
	}
	return errors.New("UpdateTaskStatusFunc not set")
}

func (m *MockScheduleRepository) ResetSampleData(ctx context.Context) error {
	if m.ResetSampleDataFunc != nil {
		return m.ResetSampleDataFunc(ctx)
	}
	return errors.New("ResetSampleDataFunc not set")
}

func TestGetSchedules_Success(t *testing.T) {
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

	mockRepo := &MockScheduleRepository{
		GetSchedulesFunc: func(ctx context.Context) ([]models.Schedule, error) {
			return expectedSchedules, nil
		},
	}

	s := service.NewScheduleService(mockRepo)

	schedules, err := s.GetSchedules(context.Background())

	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}
	if !reflect.DeepEqual(schedules, expectedSchedules) {
		t.Errorf("Expected schedules %v, got %v", expectedSchedules, schedules)
	}
}

func TestGetSchedules_RepositoryError(t *testing.T) {
	repoError := errors.New("database connection failed")

	mockRepo := &MockScheduleRepository{
		GetSchedulesFunc: func(ctx context.Context) ([]models.Schedule, error) {
			return nil, repoError
		},
	}

	s := service.NewScheduleService(mockRepo)

	schedules, err := s.GetSchedules(context.Background())

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
