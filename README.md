# Labyrinth Game

A simple browser-based Labyrinth game where users guide a ball through a maze using keyboard controls or device tilt on mobile.

## Demo

[Vercel](https://labyrinth-game-11xqp5rqn-tonihintikka.vercel.app)

## Features

- Navigate the ball through the maze using the keyboard (for desktop users).
- Mobile users can tilt their devices to guide the ball.
- Reach the green square (end gate) to win!
- Editor mode to create and save custom levels (admin only).
- High score tracking for each level with user authentication.
- Offline support with automatic sync when online.
- Real-time leaderboard updates.

## Getting Started

### Clone the Repository

```bash
git clone [repository-url]
cd [repository-name]
```

### Install Dependencies

Before you start the server, ensure you have installed all the required dependencies:

```bash
npm install
```

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)

2. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password provider

3. Set up Firestore Database:
   - Go to Firestore Database
   - Create database in your preferred region
   - Start in production mode

4. Set up Realtime Database:
   - Go to Realtime Database
   - Create database in your preferred region
   - Start in locked mode

5. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps"
   - Click the web icon (</>)
   - Register your app
   - Copy the firebaseConfig object

6. Run the setup script:
   ```bash
   npm run setup-firebase
   ```
   - Enter your Firebase configuration values when prompted
   - This will create your firebase-config.js file

7. Deploy Security Rules:
   - Go to Firestore Database > Rules
   - Copy the contents of `firestore-rules.txt`
   - Replace the existing rules and publish
   - Go to Realtime Database > Rules
   - Copy the contents of `database-rules.txt`
   - Replace the existing rules and publish

### Creating an Admin User

1. Start the application and create a new user account
2. Go to Firebase Console > Realtime Database
3. Create a new entry under 'users/{your-user-id}':
   ```json
   {
     "role": "admin"
   }
   ```
4. Go to Firestore Database
5. Create a document in the 'users' collection with your user ID
6. Add the fields:
   ```json
   {
     "email": "your-email@example.com",
     "role": "admin",
     "createdAt": "2024-02-13T00:00:00.000Z"
   }
   ```

### Starting the Development Server

To start the development server:

```bash
npm run dev
```

This will run both the Express server. You can view the game in your local browser at http://localhost:3000.

### Open in a Browser

Navigate to the project directory and open `index.html` in a browser to start playing.

## Controls

### Desktop

- Use the `q` and `w` keys to control horizontal movement.
- Use the `ArrowUp` and `ArrowDown` keys to control vertical movement.

### Mobile

- Tilt your device to guide the ball through the maze.
- Ensure you grant the necessary permissions when prompted to use device tilt.

## Features Overview

### Authentication

- Users can sign up/login to save their high scores
- Admin users have access to the level editor
- Guest users can play but can't save scores

### Level Management

- Admin users can create and edit levels
- All users can play any published level
- Levels are stored in both Firestore and Realtime Database
- Local backup for offline play

### High Scores

- Authenticated users' scores are saved to Firebase
- Real-time global leaderboard for each level
- Local backup for offline play
- Automatic sync when online

## Database Structure

### Firestore Collections

- **users**: User profiles and roles
- **levels**: Level metadata and admin information
- **scores**: High score records for querying

### Realtime Database

- **levels/{levelId}**: Actual level data
- **scores/{levelId}**: Real-time high scores
- **users/{userId}**: User roles and permissions

## Contributing

We welcome contributions! Please fork the repository and submit a pull request with your changes.

## License

This project is open source and available under the MIT License.
