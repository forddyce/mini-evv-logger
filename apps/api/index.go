// apps/api/main.go
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/supabase-community/supabase-go"

	_ "github.com/forddyce/mini-evv-logger/apps/api/docs"
	httpSwagger "github.com/swaggo/http-swagger"
)

// @title Go Backend API
// @version 1.0
// @description This is a sample API for a fullstack application.
// @host localhost:8080
// @BasePath /api

var supabaseClient *supabase.Client

type User struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

func initDB() {
	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseServiceRoleKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")

	if supabaseURL == "" || supabaseServiceRoleKey == "" {
		log.Fatal("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are not set.")
	}

	var err error
	supabaseClient, err = supabase.NewClient(supabaseURL, supabaseServiceRoleKey, nil)
	if err != nil {
		log.Fatalf("Failed to create Supabase client: %v", err)
	}
	fmt.Println("Successfully initialized Supabase client!")
}

// @Summary Get all users
// @Description Get a list of all users from the database
// @Produce json
// @Success 200 {array} User
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /users [get]
func getUsers(w http.ResponseWriter, r *http.Request) {
	var users []User
	resp, count, err := supabaseClient.From("users").Select("*", "exact", false).Execute()
	if err != nil {
		log.Printf("Error fetching users from Supabase: %v", err)
		http.Error(w, fmt.Sprintf("Error fetching users: %v", err), http.StatusInternalServerError)
		return
	}
	_ = count

	if err := json.Unmarshal(resp, &users); err != nil {
		log.Printf("Error unmarshaling Supabase response: %v", err)
		http.Error(w, fmt.Sprintf("Error processing response: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(users); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, fmt.Sprintf("Error encoding response: %v", err), http.StatusInternalServerError)
	}
}

// @Summary Create a new user
// @Description Add a new user to the database
// @Accept json
// @Produce json
// @Param user body User true "User object to be created"
// @Success 201 {object} User
// @Failure 400 {object} map[string]string "Bad Request"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /users [post]
func createUser(w http.ResponseWriter, r *http.Request) {
	var newUser User
	if err := json.NewDecoder(r.Body).Decode(&newUser); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Basic validation
	if newUser.Name == "" || newUser.Email == "" {
		http.Error(w, "Name and Email are required", http.StatusBadRequest)
		return
	}

	var createdUsers []User
	resp, count, err := supabaseClient.From("users").Insert(newUser, false, "", "", "").Execute()
	if err != nil {
		log.Printf("Error inserting user into Supabase: %v", err)
		http.Error(w, fmt.Sprintf("Error inserting user: %v", err), http.StatusInternalServerError)
		return
	}
	_ = count

	if err := json.Unmarshal(resp, &createdUsers); err != nil {
		log.Printf("Error unmarshaling Supabase insert response: %v", err)
		http.Error(w, fmt.Sprintf("Error processing insert response: %v", err), http.StatusInternalServerError)
		return
	}

	if len(createdUsers) == 0 {
		http.Error(w, "Failed to create user, no data returned", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(createdUsers[0]); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, fmt.Sprintf("Error encoding response: %v", err), http.StatusInternalServerError)
	}
}

func main() {
	initDB()

	router := mux.NewRouter()

	apiRouter := router.PathPrefix("/api").Subrouter()
	apiRouter.HandleFunc("/users", getUsers).Methods("GET")
	apiRouter.HandleFunc("/users", createUser).Methods("POST")

	router.PathPrefix("/swagger/").Handler(httpSwagger.WrapHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Go Backend listening on :%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}