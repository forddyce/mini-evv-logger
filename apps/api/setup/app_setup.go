package setup

import (
	"fmt"
	"log"
	"os"

	"github.com/forddyce/mini-evv-logger/apps/api/internal/handler"
	"github.com/forddyce/mini-evv-logger/apps/api/internal/repository"
	"github.com/forddyce/mini-evv-logger/apps/api/internal/service"
	"github.com/supabase-community/supabase-go"
)

var AppHandler *handler.ScheduleHandler

func SetupApp() error {
	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseServiceRoleKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")

	if supabaseURL == "" || supabaseServiceRoleKey == "" {
		return fmt.Errorf("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are not set")
	}

	client, err := supabase.NewClient(supabaseURL, supabaseServiceRoleKey, nil)
	if err != nil {
		return fmt.Errorf("failed to create Supabase client: %w", err)
	}
	fmt.Println("Supabase client initialized by setup package.")

	scheduleRepo := repository.NewScheduleRepository(client)
	scheduleService := service.NewScheduleService(scheduleRepo)
	AppHandler = handler.NewScheduleHandler(scheduleService)

	return nil
}

func init() {
	if err := SetupApp(); err != nil {
		log.Printf("Error during app setup: %v", err)
	}
}
