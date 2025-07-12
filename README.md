# Mini EVV Logger Application Setup Guide

[Live Demo](https://evv-logger-forddyces-projects.vercel.app/)

This guide provides step-by-step instructions to set up and run the Mini EVV Logger application on a new development machine. The application consists of a Go backend API and a React frontend. Supabase is used as the database.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Git:** For cloning the repository.
  - [Download Git](https://git-scm.com/downloads)
- **Go (Golang):** Version 1.20 or higher.
  - [Download Go](https://golang.org/doc/install)
- **Node.js & pnpm:** Node.js (LTS recommended) and pnpm (a fast package manager for JavaScript).
  - [Download Node.js](https://nodejs.org/en/download/)
  - Install pnpm: `npm install -g pnpm`
- **Supabase Account & Project:** A free Supabase account and a new project.
  - [Sign up for Supabase](https://supabase.com/dashboard/sign-up)
  - [Create a new project](https://supabase.com/dashboard/projects)
- **Supabase CLI (Optional but Recommended):** For local database management, though we'll use the web UI for this guide.
  - [Install Supabase CLI](https://supabase.com/docs/guides/cli)

## 1. Clone the Repository

First, clone the application's repository to your local machine:

```bash
git clone <repository_url>
cd mini-evv-logger # Or whatever your repository's root folder is named
```

## 2. Supabase Database Setup

You need to set up your Supabase project with the necessary tables and data.

1.  **Create a New Supabase Project:**
    - Go to your [Supabase Dashboard](https://supabase.com/dashboard/projects).
    - Click "New project".
    - Choose an organization, give your project a name (e.g., `mini-evv-logger`), set a strong database password, and select a region.
    - Click "Create new project".

2.  **Get Supabase Credentials:**
    - Once your project is ready, navigate to "Project API" located on bottom right of the page.
    - Note down your:
      - **`Project URL`**: This is your Supabase URL (e.g., `https://abcdefg.supabase.co`).
      - **`API Key`**: This is your `anon` key, but for backend operations. Copy the key. **Keep this secret!**

3.  **Create Tables and RLS Policies:**
    - In your Supabase project dashboard, navigate to "SQL Editor" (the puzzle icon).
    - Click "New Query".
    - Open the `apps/api/schemas/schedules` file from your cloned repository. Copy the entire content of all the sql files and paste it into the SQL Editor.
    - Click "Run" (the play button). This will create the `schedules` table and set up its Row Level Security (RLS) policies.
    - Repeat the process for the `apps/api/schemas/task.sql` file . This will create the `tasks` table and its RLS policies.

4.  **Insert Sample Data:**
    - In the SQL Editor, click "New Query" again.
    - Open the `apps/api/schemas/schedules_sample_data.sql` file. Copy its content and paste it into the SQL Editor.
    - Click "Run". This will populate your `schedules` table with sample data.
    - Repeat for the `apps/api/schemas/tasks_sample_data.sql` file to populate the `tasks` table.

## 3. Backend (Go API) Setup

The Go API connects to your Supabase database.

1.  **Navigate to the API directory:**

    ```bash
    cd apps/api
    ```

2.  **Install Go Dependencies:**

    ```bash
    go mod tidy
    ```

3.  **Configure Environment Variables:**
    - Create a new file named `.env` in the `apps/api` directory.
    - Add the Supabase credentials you obtained earlier:
      ```
      SUPABASE_URL="YOUR_SUPABASE_URL"
      SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
      API_PORT="8080" # Or any other port you prefer for the Go API
      ```
    - Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_SERVICE_ROLE_KEY` with your actual credentials.

4.  **Run the Go API:**

    ```bash
    pnpm dev # This runs the 'go run cmd/api/main.go' script defined in package.json
    ```

    You should see output indicating the Supabase client is initialized and the server is starting (e.g., "Local Go API server starting on :8080").
    - **Troubleshooting:** If you encounter errors, check your `.env` file for typos and ensure your Supabase project is active and accessible.

## 4. Frontend (React Web) Setup

The React frontend consumes data from your Go API.

1.  **Navigate to the Web directory:**
    - Open a **new terminal tab/window** and navigate back to the root of your cloned repository, then into the `apps/web` directory:
      ```bash
      cd ../web
      ```

2.  **Install Node.js Dependencies:**

    ```bash
    pnpm install
    ```

3.  **Run the React Application:**
    ```bash
    pnpm dev
    ```
    This will start the React development server, usually on `http://localhost:5173` (or another available port).

## 5. Running the Full Application

1.  Ensure your **Go API** is running in one terminal (from step 3.4).
2.  Ensure your **React Frontend** is running in another terminal (from step 4.3).
3.  Open your web browser and navigate to the address where your React app is running (e.g., `http://localhost:5173`).

You should now see the Mini EVV Logger application, fetching data from your local Go API, which in turn connects to your Supabase database. You can interact with the "Clock In Now" and "Clock Out Now" buttons, and use the "Reset Data" button to revert the sample data in Supabase.

## 6. Running Backend Tests (Optional)

To run the unit tests for your Go backend service layer:

1.  **Navigate to the API directory:**
    ```bash
    cd apps/api
    ```
2.  **Run the tests:**
    ```bash
    go test ./internal/service -v
    ```
    You should see output indicating that the tests passed.

---

That's it! You now have the Mini EVV Logger application running locally.
