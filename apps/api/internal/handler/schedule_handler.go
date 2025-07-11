package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http" // For parsing float64
	"time"

	"github.com/forddyce/mini-evv-logger/apps/api/internal/service"
	"github.com/gorilla/mux"
)

type ScheduleHandler struct {
	scheduleService service.ScheduleService
}

func NewScheduleHandler(s service.ScheduleService) *ScheduleHandler {
	return &ScheduleHandler{scheduleService: s}
}

// @Summary Get all schedules
// @Description Get a list of all schedules with their associated tasks.
// @Produce json
// @Success 200 {array} models.Schedule "Successfully retrieved schedules"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /schedules [get]
func (h *ScheduleHandler) GetSchedules(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	schedules, err := h.scheduleService.GetSchedules(ctx)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(schedules)
}

// @Summary Get today's schedules
// @Description Get a list of all schedules (for demo purposes, returns all schedules).
// @Produce json
// @Success 200 {array} models.Schedule "Successfully retrieved today's schedules"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /schedules/today [get]
func (h *ScheduleHandler) GetTodaySchedules(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	schedules, err := h.scheduleService.GetTodaySchedules(ctx)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(schedules)
}

// @Summary Get schedule by ID
// @Description Get a single schedule by its ID, including its tasks.
// @Produce json
// @Param id path string true "Schedule ID"
// @Success 200 {object} models.Schedule "Successfully retrieved schedule"
// @Failure 404 {object} map[string]string "Schedule not found"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /schedules/{id} [get]
func (h *ScheduleHandler) GetScheduleByID(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	vars := mux.Vars(r)
	id := vars["id"]

	schedule, err := h.scheduleService.GetScheduleByID(ctx, id)
	if err != nil {
		if err.Error() == fmt.Sprintf("schedule with ID %s not found", id) { // Simple check for not found
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(schedule)
}

type StartVisitRequest struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Address   string  `json:"address"`
}

// @Summary Start a visit
// @Description Log the start time and location for a schedule.
// @Accept json
// @Produce json
// @Param id path string true "Schedule ID"
// @Param request body StartVisitRequest true "Start visit details"
// @Success 200 {object} map[string]string "Visit started successfully"
// @Failure 400 {object} map[string]string "Bad Request"
// @Failure 409 {object} map[string]string "Conflict (e.g., visit already in progress)"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /schedules/{id}/start [post]
func (h *ScheduleHandler) StartVisit(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	vars := mux.Vars(r)
	id := vars["id"]

	var req StartVisitRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Address == "" || req.Latitude == 0 || req.Longitude == 0 { // Basic validation
		http.Error(w, "Latitude, Longitude, and Address are required", http.StatusBadRequest)
		return
	}

	err := h.scheduleService.StartVisit(ctx, id, req.Latitude, req.Longitude, req.Address)
	if err != nil {
		if err.Error() == fmt.Sprintf("service: cannot start visit for schedule %s with status in_progress", id) { // Example conflict check
			http.Error(w, "Visit already in progress or completed", http.StatusConflict)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Visit started successfully"})
}

type EndVisitRequest struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Address   string  `json:"address"`
}

// @Summary End a visit
// @Description Log the end time and location for a schedule.
// @Accept json
// @Produce json
// @Param id path string true "Schedule ID"
// @Param request body EndVisitRequest true "End visit details"
// @Success 200 {object} map[string]string "Visit ended successfully"
// @Failure 400 {object} map[string]string "Bad Request"
// @Failure 409 {object} map[string]string "Conflict (e.g., visit not in progress)"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /schedules/{id}/end [post]
func (h *ScheduleHandler) EndVisit(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	vars := mux.Vars(r)
	id := vars["id"]

	var req EndVisitRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Address == "" || req.Latitude == 0 || req.Longitude == 0 { // Basic validation
		http.Error(w, "Latitude, Longitude, and Address are required", http.StatusBadRequest)
		return
	}

	err := h.scheduleService.EndVisit(ctx, id, req.Latitude, req.Longitude, req.Address)
	if err != nil {
		if err.Error() == fmt.Sprintf("service: cannot end visit for schedule %s with status scheduled", id) { // Example conflict check
			http.Error(w, "Visit not in progress", http.StatusConflict)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Visit ended successfully"})
}

type UpdateTaskStatusRequest struct {
	Completed bool    `json:"completed"`
	Reason    *string `json:"reason,omitempty"` // Optional reason
}

// @Summary Update task status
// @Description Update the completion status of a specific task.
// @Accept json
// @Produce json
// @Param taskId path string true "Task ID"
// @Param request body UpdateTaskStatusRequest true "Task update details"
// @Success 200 {object} map[string]string "Task status updated successfully"
// @Failure 400 {object} map[string]string "Bad Request"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /tasks/{taskId}/update [post]
func (h *ScheduleHandler) UpdateTaskStatus(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	vars := mux.Vars(r)
	taskID := vars["taskId"]

	var req UpdateTaskStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// If task is not completed, reason is required
	if !req.Completed && (req.Reason == nil || *req.Reason == "") {
		http.Error(w, "Reason is required if task is not completed", http.StatusBadRequest)
		return
	}

	err := h.scheduleService.UpdateTaskStatus(ctx, taskID, req.Completed, req.Reason)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Task status updated successfully"})
}

// @Summary Get schedule statistics
// @Description Get aggregated statistics for all schedules (Total, Missed, Upcoming, Completed).
// @Produce json
// @Success 200 {object} models.ScheduleStats "Successfully retrieved schedule statistics"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /schedules/stats [get]
func (h *ScheduleHandler) GetScheduleStats(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	stats, err := h.scheduleService.GetScheduleStats(ctx)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

// @Summary Reset sample data
// @Description Resets the status of sample schedules and tasks for demonstration purposes.
// @Produce json
// @Success 200 {object} map[string]string "Sample data reset successfully"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /schedules/reset [post]
func (h *ScheduleHandler) ResetSampleData(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	err := h.scheduleService.ResetSampleData(ctx)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Sample data reset successfully"})
}
