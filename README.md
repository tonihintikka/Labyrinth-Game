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
