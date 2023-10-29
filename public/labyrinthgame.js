let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");
let gamePaused = false;

// Pelialueen määrittely
const labyrinth = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 3, 0, 0, 1, 0, 0, 0],
  [1, 1, 0, 0, 1, 0, 1, 0],
  [1, 0, 0, 1, 0, 0, 1, 0],
  [1, 0, 1, 1, 0, 1, 1, 0],
  [1, 0, 1, 1, 0, 1, 0, 0],
  [1, 0, 1, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 1, 0, 0],
  [1, 0, 1, 1, 0, 1, 1, 0],
  [1, 0, 0, 0, 0, 1, 1, 0],
  [1, 0, 1, 1, 1, 2, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 0],
];

let startTime;
let elapsedTime = 0;
let timerInterval;
let isPlaying = false; // Track if the game is active
let gameStarted = false;
let cellSize = canvas.width / labyrinth[0].length; // assuming all rows have the same number of cells

const labyrinthHeight = cellSize * 14; // This is 700 if you have 14 rows
let startX, startY;

for (let row = 0; row < labyrinth.length; row++) {
  for (let col = 0; col < labyrinth[row].length; col++) {
    if (labyrinth[row][col] === 3) {
      startX = col;
      startY = row;
      break;
    }
  }
  if (startX !== undefined && startY !== undefined) {
    break;
  }
}

let ball = {
  x: (startX + 0.5) * cellSize,
  y: (startY + 0.5) * cellSize,
  radius: 10,
  speed: 2,
  velocityX: 0,
  velocityY: 0,
};

let tiltX = 0;
let tiltY = 0;

document.addEventListener("keydown", function (event) {
  switch (event.key) {
    case "q":
      tiltX -= 0.1;
      break;
    case "w":
      tiltX += 0.1;
      break;
    case "ArrowUp":
      tiltY -= 0.1;
      break;
    case "ArrowDown":
      tiltY += 0.1;
      break;
  }
  if (!gameStarted) {
    startTimer();
    gameStarted = true;
  }
});
const requestBtn = document.getElementById("requestPermissionBtn");

requestBtn.addEventListener("click", function () {
  if (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  ) {
    // iOS 13+
    DeviceOrientationEvent.requestPermission()
      .then((response) => {
        if (response == "granted") {
          window.addEventListener("deviceorientation", handleOrientation);
          requestBtn.style.display = "none"; // Optionally hide the button after getting permission
        }
      })
      .catch(console.error);
  } else {
    // For older devices or browsers that do not require permission
    window.addEventListener("deviceorientation", handleOrientation);
    requestBtn.style.display = "none"; // Optionally hide the button if permission is not needed
  }
});
function resizeCanvas() {
  const maxWidth = window.innerWidth - 20;
  const maxHeight = window.innerHeight - 20;

  const aspectRatio = 7 / 4; // Original canvas aspect ratio (width/height: 400/700)

  canvas.width = Math.min(maxWidth, maxHeight * (1 / aspectRatio));
  canvas.height = canvas.width * aspectRatio;
  cellSize = canvas.width / labyrinth[0].length;
  ball.radius = cellSize * 0.2;
}

resizeCanvas(); // Call this initially to set the canvas size
window.addEventListener("resize", resizeCanvas); // Adjust the canvas size whenever the window is resized
function startTimer() {
  startTime = Date.now() - (elapsedTime || 0);
  timerInterval = setInterval(function () {
    elapsedTime = Date.now() - startTime;
    displayTime(elapsedTime);
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}
function formatTime(time) {
  let totalSeconds = Math.floor(time / 1000);
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

function displayTime(time) {
  if (!gameStarted) {
    stopTimer();
    return; // exit the function if the game is not started
  }
  let totalSeconds = Math.floor(time / 1000);
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;
  console.log(`${minutes}:${seconds}`);
}

function saveTime() {
  let bestTimes = JSON.parse(localStorage.getItem("bestTimes") || "[]");
  bestTimes.push(elapsedTime);
  bestTimes.sort((a, b) => a - b); // Sort times from fastest to slowest
  bestTimes = bestTimes.slice(0, 5); // Store only the top 5 best times
  localStorage.setItem("bestTimes", JSON.stringify(bestTimes));
}

// Call the startTimer() function when the game starts
// Call the stopTimer() function when the game ends
function displayBestTimes() {
  gamePaused = true;
  const bestTimes = JSON.parse(localStorage.getItem("bestTimes") || "[]");
  const bestTimesList = document.createElement("ul");
  bestTimes.forEach((time) => {
    const totalSeconds = Math.floor(time / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const listItem = document.createElement("li");
    listItem.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    bestTimesList.appendChild(listItem);
  });
  document.body.appendChild(bestTimesList);
}
var outOfBoundsModal = document.getElementById("outOfBoundsModal");
var closeOutOfBoundsModalBtn = document.getElementsByClassName("close-btn")[1];
var startAgainFromOutOfBoundsBtn = document.getElementById(
  "startAgainFromOutOfBoundsBtn"
);

function showOutOfBoundsModal() {
  if (!gameStarted) return; // If the game isn't active, don't show the modal
  stopTimer();
  gameStarted = false;
  outOfBoundsModal.style.display = "block";
}

closeOutOfBoundsModalBtn.onclick = function () {
  outOfBoundsModal.style.display = "none";
  resetGame();
};

startAgainFromOutOfBoundsBtn.onclick = function () {
  outOfBoundsModal.style.display = "none";
  resetGame();
};

function resetGame() {
  ball.x = (startX + 0.5) * cellSize;
  ball.y = (startY + 0.5) * cellSize;
  ball.velocityX = 0;
  ball.velocityY = 0;
  tiltX = 0;
  tiltY = 0;
  gameStarted = true; // Set the game to active state upon restart
  elapsedTime = 0;
  gamePaused = false;
  gameStarted = false;
  return;
}

function handleOrientation(event) {
  // Your code to handle orientation changes

  // This is a basic implementation; you might need to adjust the values and logic
  tiltX = event.gamma / 45; // gamma is the x-axis tilt in degrees. Normalize to a value between -1 and 1
  tiltY = event.beta / 45; // beta is the y-axis tilt in degrees. Normalize to a value between -1 and 1

  // Ensure tilt values remain within the [-1,1] interval
  tiltX = Math.min(Math.max(tiltX, -1), 1);
  tiltY = Math.min(Math.max(tiltY, -1), 1);
  if (!gameStarted) {
    startTimer();
    gameStarted = true;
  }
}

function checkCollisionWithWalls() {
  const cellX = Math.floor(ball.x / cellSize);
  const cellY = Math.floor(ball.y / cellSize);

  if (labyrinth[cellY][cellX] === 1) {
    ball.x = (startX + 0.5) * cellSize;
    ball.y = (startY + 0.5) * cellSize;
    tiltX = 0;
    tiltY = 0;
    // Optional: If you want the game to reset upon hitting a wall
    // Timer logic when ball falls
    stopTimer(); // Stop the current timer
    elapsedTime = 0; // Reset the elapsed time
    //  displayTime(elapsedTime);  // Display the reset time (you'd need to implement this function)
    showOutOfBoundsModal(); // Optional: start the timer again if you want
  } else if (labyrinth[cellY][cellX] === 2) {
    stopTimer();
    saveTime(elapsedTime);
    //ball.x = (startX + 0.5) * cellSize;
    //ball.y = (startY + 0.5) * cellSize;

    gameStarted = false; // Setting the game to be inactive after reaching the end
    // Additional code to stop the ball movement
    ball.velocityX = 0;
    ball.velocityY = 0;
    tiltX = 0;
    tiltY = 0;
    showResults();
    return;
  }
}

function updateBallPosition() {
  const acceleration = 0.05;
  const damping = 0.98;

  ball.velocityX += tiltX * acceleration;
  ball.velocityY += tiltY * acceleration;

  ball.velocityX *= damping;
  ball.velocityY *= damping;

  ball.x += ball.velocityX;
  ball.y += ball.velocityY;

  checkCollisionWithWalls();
  checkCollisionWithCanvasBounds();
}

function checkCollisionWithCanvasBounds() {
  if (
    ball.x - ball.radius < 0 ||
    ball.x + ball.radius > canvas.width ||
    ball.y - ball.radius < 0 ||
    ball.y + ball.radius > canvas.height
  ) {
    // Ball has gone out of the canvas bounds

    if (gameStarted) {
      // Only show the modal if the game is still active

      ball.x = (startX + 0.5) * cellSize;
      ball.y = (startY + 0.5) * cellSize;
      ball.velocityX = 0;
      ball.velocityY = 0;
      tiltX = 0;
      tiltY = 0;
      gameStarted = false;
      stopTimer();
      elapsedTime = 0;
      showOutOfBoundsModal(); // Keep only this call
    }
  }
}

// Get modal element and other necessary elements
var modal = document.getElementById("resultModal");
var span = document.getElementsByClassName("close-btn")[0];
var restartGameBtn = document.getElementById("restartGameBtn");

let resultsShown = false;

function resetBallPosition() {}

let allLevelsBestTimes = JSON.parse(
  localStorage.getItem("allLevelsBestTimes") || "{}"
);
function showResults() {
  stopTimer();
  gamePaused = true;
  // Current level code (you can update this dynamically when you have multiple levels)
  const currentLevel = "LVL1";

  // Set the level in the "Congratulations" message
  document.getElementById(
    "congratsLevelMessage"
  ).textContent = `Congratulations! You passed ${currentLevel}`;

  document.getElementById("userTime").textContent = formatTime(elapsedTime);

  // If there aren't any saved times for this level yet, initialize an empty array
  if (!allLevelsBestTimes[currentLevel]) {
    allLevelsBestTimes[currentLevel] = [];
  }

  // Save new time
  allLevelsBestTimes[currentLevel].push(elapsedTime);

  // Sort and limit to top 20 times for this level
  allLevelsBestTimes[currentLevel] = allLevelsBestTimes[currentLevel]
    .sort((a, b) => a - b)
    .slice(0, 20);

  localStorage.setItem(
    "allLevelsBestTimes",
    JSON.stringify(allLevelsBestTimes)
  );

  // Display best times for the current level
  let bestTimesList = document.getElementById("bestTimesList");
  bestTimesList.innerHTML = ""; // clear any previous times

  let orderNumber = 1; // initialize order number
  for (let time of allLevelsBestTimes[currentLevel]) {
    let listItem = document.createElement("li");
    listItem.textContent = `${orderNumber}. ` + formatTime(time); // Add order number before the time
    bestTimesList.appendChild(listItem);
    orderNumber++; // increment order number
  }

  resetGame();
  modal.style.display = "block"; // assuming you already have a reference to the modal
}

// When user clicks on the close button, close the modal
span.onclick = function () {
  // 1. Reset Ball Position
  ball.x = (startX + 0.5) * cellSize;
  ball.y = (startY + 0.5) * cellSize;

  // 2. Reset Ball Velocity
  ball.velocityX = 0;
  ball.velocityY = 0;

  // 3. Reset Tilt
  tiltX = 0;
  tiltY = 0;

  // 4. Reset Timer
  stopTimer();
  elapsedTime = 0;

  // 5. Reset Game State
  gameStarted = false;
  gamePaused = false;
  modal.style.display = "none";
};

// When user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    // 1. Reset Ball Position
    ball.x = (startX + 0.5) * cellSize;
    ball.y = (startY + 0.5) * cellSize;

    // 2. Reset Ball Velocity
    ball.velocityX = 0;
    ball.velocityY = 0;

    // 3. Reset Tilt
    tiltX = 0;
    tiltY = 0;

    // 4. Reset Timer
    stopTimer();
    elapsedTime = 0;

    // 5. Reset Game State
    gameStarted = false;
    gamePaused = false;
    modal.style.display = "none";
  }
};

// Add an event listener for the restart button
restartGameBtn.addEventListener("click", function () {
  // 1. Reset Ball Position
  ball.x = (startX + 0.5) * cellSize;
  ball.y = (startY + 0.5) * cellSize;

  // 2. Reset Ball Velocity
  ball.velocityX = 0;
  ball.velocityY = 0;

  // 3. Reset Tilt
  tiltX = 0;
  tiltY = 0;

  // 4. Reset Timer
  stopTimer();
  elapsedTime = 0;

  // 5. Reset Game State
  gameStarted = false;
  gamePaused = false;
  modal.style.display = "none"; // Close the modal
});

function drawLabyrinth() {
  for (let y = 0; y < labyrinth.length; y++) {
    for (let x = 0; x < labyrinth[y].length; x++) {
      if (labyrinth[y][x] === 1) {
        ctx.fillStyle = "black";
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      } else if (labyrinth[y][x] === 2) {
        ctx.fillStyle = "green";
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      } else if (labyrinth[y][x] === 3) {
        ctx.fillStyle = "white";
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "red";
  ctx.fill();
  ctx.closePath();
}

function drawGame() {
  console.log("Draw game gameStarted: ", gameStarted);
  console.log("Draw game gamePaused:", gamePaused);
  if (gamePaused) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawLabyrinth();
  updateBallPosition();
  drawBall();
  requestAnimationFrame(drawGame);
}

drawGame();
