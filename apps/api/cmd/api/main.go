package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv" // For loading .env file locally

	_ "github.com/forddyce/mini-evv-logger/apps/api/docs"
	httpSwagger "github.com/swaggo/http-swagger"

	"github.com/forddyce/mini-evv-logger/apps/api/internal/handler"
	"github.com/forddyce/mini-evv-logger/apps/api/internal/repository"
	"github.com/forddyce/mini-evv-logger/apps/api/internal/service"
	"github.com/supabase-community/supabase-go"
)

// This init function is for the local main.go server only.
func init() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, assuming environment variables are set.")
	}

	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseServiceRoleKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")

	if supabaseURL == "" || supabaseServiceRoleKey == "" {
		log.Fatal("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are not set.")
	}

	var err error
	supabaseClient, err := supabase.NewClient(supabaseURL, supabaseServiceRoleKey, nil)
	if err != nil {
		log.Fatalf("Failed to create Supabase client in local main.go init: %v", err)
	}
	fmt.Println("Successfully initialized Supabase client for local development!")

	scheduleRepo := repository.NewScheduleRepository(supabaseClient)
	scheduleService := service.NewScheduleService(scheduleRepo)

	localRouter := mux.NewRouter()

	localScheduleHandler := handler.NewScheduleHandler(scheduleService)

	apiRouter := localRouter.PathPrefix("/api").Subrouter()
	apiRouter.HandleFunc("/schedules", localScheduleHandler.GetSchedules).Methods("GET")
	apiRouter.HandleFunc("/schedules/today", localScheduleHandler.GetTodaySchedules).Methods("GET")
	apiRouter.HandleFunc("/schedules/{id}", localScheduleHandler.GetScheduleByID).Methods("GET")
	apiRouter.HandleFunc("/schedules/{id}/start", localScheduleHandler.StartVisit).Methods("POST")
	apiRouter.HandleFunc("/schedules/{id}/end", localScheduleHandler.EndVisit).Methods("POST")
	apiRouter.HandleFunc("/schedules/stats", localScheduleHandler.GetScheduleStats).Methods("GET")
	apiRouter.HandleFunc("/schedules/reset", localScheduleHandler.ResetSampleData).Methods("POST")
	apiRouter.HandleFunc("/tasks/{taskId}/update", localScheduleHandler.UpdateTaskStatus).Methods("POST")

	localRouter.PathPrefix("/swagger/").Handler(httpSwagger.WrapHandler)
	http.Handle("/", localRouter)
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, assuming environment variables are set.")
	}

	port := os.Getenv("API_PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Local Go API server starting on :%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
