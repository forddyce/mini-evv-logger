package handler

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"

	_ "github.com/forddyce/mini-evv-logger/apps/api/docs"
	httpSwagger "github.com/swaggo/http-swagger"

	"github.com/forddyce/mini-evv-logger/apps/api/setup"
)

func init() {
	if setup.AppHandler == nil {
		log.Fatal("ScheduleHandler was not initialized by the setup package.")
	}
	fmt.Println("Vercel Function handler package initialized.")
}

func Handler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.WriteHeader(http.StatusOK)
		return
	}

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	router := mux.NewRouter()

	apiRouter := router.PathPrefix("/api").Subrouter()

	scheduleHandler := setup.AppHandler

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
