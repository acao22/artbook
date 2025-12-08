# Artsbook

Art. It’s what makes life colorful. We interact with the arts often; we feel things and we learn things. We want to remember these interactions. 

Keeping track of everything you read, watch, listen to, and experience across the arts is difficult…

So here is Artsbook! A unified space to track, reflect on, and explore everything you experience in the arts and humanities.

## Features

- User authentication with Firebase
- Personal stacks (books, movies, TV, music)
- Stubs (concerts, museums, events)
- Collections and notes
- Follow other users and discover content
- Search for people, collections, and notes

## Setup

### Prerequisites

- Python 3.9+
- Node.js 18+
- Firebase project with Realtime Database enabled
- Spotify API credentials (for music search)
- TMDB API key (for movies/TV search)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and install dependencies:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your API credentials:
   - `SPOTIFY_CLIENT_ID` - From Spotify Developer Dashboard
   - `SPOTIFY_CLIENT_SECRET` - From Spotify Developer Dashboard
   - `TMDB_API_KEY` - From TMDB API Settings

4. Place your Firebase service account key as `servicekey.json` in the backend directory.

5. Run the backend server:
   ```bash
   python main.py
   ```
   The API will be available at `http://127.0.0.1:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend-vite
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Firebase configuration:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_DATABASE_URL`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   
   Get these values from Firebase Console > Project Settings > General > Your apps

4. Start the development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

## Project Structure

- `backend/` - Flask API server with Firebase Admin SDK
- `frontend-vite/` - React frontend with Vite
- `backend/.env` - Backend environment variables (not committed)
- `frontend-vite/.env` - Frontend environment variables (not committed)

## API Endpoints

- `GET /api/stacks` - Get user's stack items
- `POST /api/stacks` - Add item to stack
- `GET /api/stubs` - Get user's stubs
- `POST /api/stubs` - Add stub
- `GET /api/notes` - Get notes
- `POST /api/notes` - Create note
- `GET /api/search/profiles` - Search users
- `POST /api/auth/verify` - Verify Firebase token
- `POST /api/users/<id>/follow` - Follow user
- `DELETE /api/users/<id>/follow` - Unfollow user

## Development

The backend uses Flask with CORS enabled for development. The frontend uses Vite for fast hot module replacement.

Make sure both servers are running simultaneously for full functionality.
