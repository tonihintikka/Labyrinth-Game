# Labyrinth Game

A simple browser-based Labyrinth game where users guide a ball through a maze using keyboard controls or device tilt on mobile.

## demo

[Vercel](https://labyrinth-game-11xqp5rqn-tonihintikka.vercel.app)

## Features

- Navigate the ball through the maze using the keyboard (for desktop users).
- Mobile users can tilt their devices to guide the ball.
- Reach the green square (end gate) to win!

## Getting Started

### Clone the Repository

```bash
git clone [repository-url]
cd [repository-name]
```

## Install Dependencies

Before you start the server, ensure you have installed all the required dependencies:

```bash
Copy code
npm install
```

## Starting the Development Server

Before you can use ngrok for tunneling, you'll need to sign up for an ngrok https://ngrok.com/ account and authenticate using your ngrok token. This is required to expose your local server to the internet.

To start the development server:

```bash
Copy code
npm run dev
```

This will run both the Express server and ngrok. You can view the game in your local browser at http://localhost:3000 and access the ngrok dashboard at http://127.0.0.1:4040 to get the public URL.

## Open in a Browser

Navigate to the project directory and open index.html in a browser to start playing.

## Controls

### Desktop

Use the q and w keys to control horizontal movement.
Use the ArrowUp and ArrowDown keys to control vertical movement.

### Mobile

Tilt your device to guide the ball through the maze.
Ensure you grant the necessary permissions when prompted to use device tilt.
Contributing
We welcome contributions! Please fork the repository and submit a pull request with your changes.

## License

This project is open source and available under the MIT License.

## Overview

This code is designed for a simple labyrinth game where a ball moves inside a maze based on keyboard arrow keys and/or device orientation (e.g., tilting the device). The objective is to navigate the ball from a starting point to an endpoint without hitting the walls. There's also a timer to track the time taken to complete the labyrinth.

### Components

#### Canvas Setup:

The canvas element is accessed with its ID (gameCanvas) and its 2D rendering context is fetched.
The labyrinth structure is defined using a 2D array where different numbers signify different elements (1 for walls, 2 for endpoint, 3 for starting point, 0 for empty path).
Initial Game Variables:

Game-related variables like gamePaused, startTime, elapsedTime, and others are initialized.
The starting position (startX, startY) of the ball is determined from the labyrinth array.

#### Ball Object:

Represents the moving ball in the game, having properties like position (x, y), radius, speed, and velocity (velocityX, velocityY).
Keyboard Controls:

Event listener to detect arrow key presses (ArrowUp, ArrowDown) and other keys (q, w) to move the ball. Starting the timer if the game hasn't already started.

#### Device Orientation:

Listeners are added to detect changes in device orientation (tilt). For newer iOS devices, permissions are requested before accessing the orientation data.

#### Game Timer:

The startTimer function starts the game timer, which will keep updating the elapsed time.
The stopTimer function stops the game timer.
The formatTime and displayTime functions handle time formatting and display.

#### Game Logic:

The resetGame function resets the ball to the starting position and initializes other necessary game variables.
The handleOrientation function updates the ball's movement based on device tilt.
The checkCollisionWithWalls function detects if the ball hits a wall or reaches the end. It resets the game upon hitting a wall and stops the game when the endpoint is reached.
The updateBallPosition function updates the ball's position based on its current velocity and checks for collisions.

#### Modal Handling:

If the ball goes out of bounds or hits a wall, a modal (outOfBoundsModal) is shown to the user with options to restart the game or close the modal.

#### Canvas Resizing:

The canvas size adjusts based on the window's size, keeping the original aspect ratio intact. The ball's size is also adjusted accordingly.

#### Local Storage:

The saveTime function saves the elapsed time to the local storage, and the displayBestTimes function retrieves and displays the best times from local storage.

#### Points of Interest:

The code assumes that all rows of the labyrinth array have an equal number of cells. If that assumption doesn't hold, the code may break.
The ball's movement logic is based on both keyboard inputs and device orientation.
There are certain commented-out lines and unfinished parts in the provided code that might need further implementation or adjustments.
