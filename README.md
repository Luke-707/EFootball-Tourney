# eFootball Tournament Manager

A full-stack web application to manage football tournaments with automatic fixture generation and real-time standings.

## Tech Stack
- **Frontend:** React (Vite), React Router, Axios, Lucide Icons
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Containerization:** Docker, Docker Compose

## Features
- Create multiple tournaments.
- Add teams to each tournament.
- Generate Round-Robin fixtures automatically.
- Record match results.
- Automatic standings updates (Points, GD, GS).
- Modern, responsive Dark UI.

## How to Run

### Using Docker (Recommended)
1. Ensure you have Docker and Docker Compose installed.
2. In the root directory, run:
   ```bash
   docker-compose up --build
   ```
3. Access the application at: `http://localhost:3000`
4. The backend is running at: `http://localhost:5000`

### Running Locally (Manually)
If you prefer to run it without Docker:

#### 1. Backend
1. `cd backend`
2. `npm install`
3. Set `MONGO_URI` in `.env` (default is `mongodb://localhost:27017/efootball`)
4. `npm run dev`

#### 2. Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. Access `http://localhost:3000`

## Project Structure
- `/backend`: Express API, Models, Controllers, and Utils.
- `/frontend`: React application using Vite.
- `/docker-compose.yml`: Orchestrates the mongo, backend, and frontend containers.
