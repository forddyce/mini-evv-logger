package handler

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/supabase-community/supabase-go"

	_ "github.com/forddyce/mini-evv-logger/apps/api/docs"
	httpSwagger "github.com/swaggo/http-swagger"

	"github.com/forddyce/mini-evv-logger/apps/api/internal/handler"
	"github.com/forddyce/mini-evv-logger/apps/api/internal/repository"
	"github.com/forddyce/mini-evv-logger/apps/api/internal/service"
)

var supabaseClient *supabase.Client
var scheduleHandler *handler.ScheduleHandler

func init() {
	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseServiceRoleKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")

	if supabaseURL == "" || supabaseServiceRoleKey == "" {
		log.Fatal("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are not set for Vercel Function.")
	}

	var err error
	supabaseClient, err = supabase.NewClient(supabaseURL, supabaseServiceRoleKey, nil)
	if err != nil {
		log.Fatalf("Failed to create Supabase client in init: %v", err)
	}
	fmt.Println("Successfully initialized Supabase client in Vercel Function!")

	scheduleRepo := repository.NewScheduleRepository(supabaseClient)
	scheduleService := service.NewScheduleService(scheduleRepo)
	scheduleHandler = handler.NewScheduleHandler(scheduleService)
}

// main entry point for Vercel Go Serverless Functions.
func Handler(w http.ResponseWriter, r *http.Request) {
	// CORS Preflight handling for Vercel Serverless Functions
	if r.Method == http.MethodOptions {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.WriteHeader(http.StatusOK)
		return
	}

	// Set CORS headers for actual requests
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	router := mux.NewRouter()

	apiRouter := router.PathPrefix("/api").Subrouter()

	apiRouter.HandleFunc("/schedules", scheduleHandler.GetSchedules).Methods("GET")
	apiRouter.HandleFunc("/schedules/today", scheduleHandler.GetTodaySchedules).Methods("GET")
	apiRouter.HandleFunc("/schedules/{id}", scheduleHandler.GetScheduleByID).Methods("GET")
	apiRouter.HandleFunc("/schedules/{id}/start", scheduleHandler.StartVisit).Methods("POST")
	apiRouter.HandleFunc("/schedules/{id}/end", scheduleHandler.EndVisit).Methods("POST")
	apiRouter.HandleFunc("/schedules/stats", scheduleHandler.GetScheduleStats).Methods("GET")
	apiRouter.HandleFunc("/schedules/reset", scheduleHandler.ResetSampleData).Methods("POST")

	apiRouter.HandleFunc("/tasks/{taskId}/update", scheduleHandler.UpdateTaskStatus).Methods("POST")

	router.PathPrefix("/swagger/").Handler(httpSwagger.WrapHandler)

	router.ServeHTTP(w, r)
}