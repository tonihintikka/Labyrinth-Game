class LabyrinthGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.gamePaused = false;
        this.gameStarted = false;
        this.isPlaying = false;
        this.currentLevelName = null;
        
        // Define tile types
        this.WALL = 1;
        this.PATH = 0;
        this.END = 2;
        this.START = 3;
        this.WOOD = 4;
        this.HOLE_TOP = 5;
        this.HOLE_RIGHT = 6;
        this.HOLE_BOTTOM = 7;
        this.HOLE_LEFT = 8;

        // Initial labyrinth
        this.labyrinth = [
    // Row 0 (top border)
    [1, 1, 1, 1, 1, 1, 1, 1],
    // Row 1: Start at col 1; HOLE_TOP at col 6
    [1, 3, 0, 0, 0, 0, 5, 1],
    // Row 2
    [1, 0, 1, 1, 0, 0, 0, 1],
    // Row 3: HOLE_RIGHT at col 6
    [1, 0, 0, 1, 0, 1, 6, 1],
    // Row 4
    [1, 1, 0, 1, 0, 0, 0, 1],
    // Row 5: WOOD at col 3
    [1, 0, 0, 4, 1, 1, 0, 1],
    // Row 6
    [1, 0, 1, 1, 0, 0, 0, 1],
    // Row 7: HOLE_BOTTOM at col 5
    [1, 0, 1, 0, 0, 7, 0, 1],
    // Row 8
    [1, 0, 1, 0, 1, 0, 0, 1],
    // Row 9: HOLE_LEFT at col 6
    [1, 0, 0, 0, 1, 0, 8, 1],
    // Row 10
    [1, 0, 1, 0, 0, 0, 0, 1],
    // Row 11
    [1, 0, 1, 1, 1, 0, 0, 1],
    // Row 12: Finish (END) at col 5
    [1, 0, 0, 0, 1, 2, 0, 1],
    // Row 13 (bottom border)
    [1, 1, 1, 1, 1, 1, 1, 1]
        ];
        
        // Timer related
        this.startTime = null;
        this.elapsedTime = 0;
        this.timerInterval = null;

        this.resizeCanvas();
        this.initializeGame();
        this.setupEventListeners();
        this.startGameLoop();
    }

    resizeCanvas() {
        const maxWidth = window.innerWidth - 20;
        const maxHeight = window.innerHeight - 20;
        const aspectRatio = 7/4;

        this.canvas.width = Math.min(maxWidth, maxHeight * (1/aspectRatio));
        this.canvas.height = this.canvas.width * aspectRatio;
        this.cellSize = this.canvas.width / this.labyrinth[0].length;
    }

    initializeGame() {
        this.cellSize = this.canvas.width / this.labyrinth[0].length;
        this.labyrinthHeight = this.cellSize * this.labyrinth.length;
        
        [this.startX, this.startY] = this.findStartPosition();
        
        this.ball = {
            x: (this.startX + 0.5) * this.cellSize,
            y: (this.startY + 0.5) * this.cellSize,
            radius: this.cellSize * 0.2,
            speed: 2,
            velocityX: 0,
            velocityY: 0
        };

        this.tiltX = 0;
        this.tiltY = 0;
    }

    findStartPosition() {
        for (let row = 0; row < this.labyrinth.length; row++) {
            for (let col = 0; col < this.labyrinth[row].length; col++) {
                if (this.labyrinth[row][col] === 3) {
                    return [col, row];
                }
            }
        }
        return [0, 0]; // Default if no start position found
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener("keydown", this.handleKeyDown.bind(this));
        
        // Device orientation
        this.setupDeviceOrientation();
        
        // Window resize
        window.addEventListener("resize", this.resizeCanvas.bind(this));
    }

    startGameLoop() {
        const gameLoop = () => {
            if (!this.gamePaused) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.drawLabyrinth();
                this.updateBallPosition();
                this.drawBall();
            }
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }

    handleKeyDown(event) {
        if (!this.gameStarted) {
            this.startTimer();
            this.gameStarted = true;
        }

        switch (event.key) {
            case "ArrowLeft":
                this.tiltX -= 0.1;
                break;
            case "ArrowRight":
                this.tiltX += 0.1;
                break;
            case "ArrowUp":
                this.tiltY -= 0.1;
                break;
            case "ArrowDown":
                this.tiltY += 0.1;
                break;
        }
    }

    setupDeviceOrientation() {
        const requestBtn = document.getElementById("requestPermissionBtn");
        if (requestBtn) {
            requestBtn.addEventListener("click", () => {
                if (typeof DeviceOrientationEvent !== 'undefined' && 
                    typeof DeviceOrientationEvent.requestPermission === 'function') {
                    DeviceOrientationEvent.requestPermission()
                        .then(response => {
                            if (response === 'granted') {
                                window.addEventListener('deviceorientation', this.handleOrientation.bind(this));
                                requestBtn.style.display = 'none';
                            }
                        })
                        .catch(console.error);
                } else {
                    window.addEventListener('deviceorientation', this.handleOrientation.bind(this));
                    requestBtn.style.display = 'none';
                }
            });
        }
    }

    handleOrientation(event) {
        this.tiltX = event.gamma / 45;
        this.tiltY = event.beta / 45;
        
        this.tiltX = Math.min(Math.max(this.tiltX, -1), 1);
        this.tiltY = Math.min(Math.max(this.tiltY, -1), 1);

        if (!this.gameStarted) {
            this.startTimer();
            this.gameStarted = true;
        }
    }

    drawLabyrinth() {
        for (let y = 0; y < this.labyrinth.length; y++) {
            for (let x = 0; x < this.labyrinth[y].length; x++) {
                if (this.labyrinth[y][x] === this.WALL) {
                    this.ctx.fillStyle = "black";
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                } else if (this.labyrinth[y][x] === this.END) {
                    this.ctx.fillStyle = "green";
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                } else if (this.labyrinth[y][x] === this.START) {
                    this.ctx.fillStyle = "blue";
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                } else if (this.labyrinth[y][x] === this.WOOD) {
                    // Create gradient for 3D wood effect
                    const woodGradient = this.ctx.createLinearGradient(
                        x * this.cellSize,
                        y * this.cellSize,
                        (x + 1) * this.cellSize,
                        (y + 1) * this.cellSize
                    );
                    
                    // Add color stops for 3D wood effect
                    woodGradient.addColorStop(0, '#8B4513');    // Light wood
                    woodGradient.addColorStop(0.2, '#654321');  // Main wood color
                    woodGradient.addColorStop(0.8, '#654321');  // Main wood color
                    woodGradient.addColorStop(1, '#3D2B1F');    // Dark wood

                    this.ctx.fillStyle = woodGradient;
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);

                    // Add bevel effect
                    const bevelSize = this.cellSize * 0.1;
                    
                    // Top bevel
                    const topBevel = this.ctx.createLinearGradient(
                        x * this.cellSize,
                        y * this.cellSize,
                        x * this.cellSize,
                        y * this.cellSize + bevelSize
                    );
                    topBevel.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
                    topBevel.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    this.ctx.fillStyle = topBevel;
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, bevelSize);

                    // Left bevel
                    const leftBevel = this.ctx.createLinearGradient(
                        x * this.cellSize,
                        y * this.cellSize,
                        x * this.cellSize + bevelSize,
                        y * this.cellSize
                    );
                    leftBevel.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
                    leftBevel.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    this.ctx.fillStyle = leftBevel;
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, bevelSize, this.cellSize);

                    // Bottom shadow
                    const bottomShadow = this.ctx.createLinearGradient(
                        x * this.cellSize,
                        y * this.cellSize + this.cellSize - bevelSize,
                        x * this.cellSize,
                        y * this.cellSize + this.cellSize
                    );
                    bottomShadow.addColorStop(0, 'rgba(0, 0, 0, 0)');
                    bottomShadow.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
                    this.ctx.fillStyle = bottomShadow;
                    this.ctx.fillRect(
                        x * this.cellSize,
                        y * this.cellSize + this.cellSize - bevelSize,
                        this.cellSize,
                        bevelSize
                    );

                    // Right shadow
                    const rightShadow = this.ctx.createLinearGradient(
                        x * this.cellSize + this.cellSize - bevelSize,
                        y * this.cellSize,
                        x * this.cellSize + this.cellSize,
                        y * this.cellSize
                    );
                    rightShadow.addColorStop(0, 'rgba(0, 0, 0, 0)');
                    rightShadow.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
                    this.ctx.fillStyle = rightShadow;
                    this.ctx.fillRect(
                        x * this.cellSize + this.cellSize - bevelSize,
                        y * this.cellSize,
                        bevelSize,
                        this.cellSize
                    );
                } else if (this.labyrinth[y][x] === this.HOLE_TOP) {
                    this.ctx.fillStyle = "white";
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                    this.ctx.fillStyle = "black";
                    this.ctx.beginPath();
                    this.ctx.arc(
                        (x + 0.5) * this.cellSize,
                        (y + 0.2) * this.cellSize,
                        this.ball.radius,
                        0,
                        Math.PI * 2
                    );
                    this.ctx.fill();
                } else if (this.labyrinth[y][x] === this.HOLE_RIGHT) {
                    this.ctx.fillStyle = "white";
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                    this.ctx.fillStyle = "black";
                    this.ctx.beginPath();
                    this.ctx.arc(
                        (x + 0.8) * this.cellSize,
                        (y + 0.5) * this.cellSize,
                        this.ball.radius,
                        0,
                        Math.PI * 2
                    );
                    this.ctx.fill();
                } else if (this.labyrinth[y][x] === this.HOLE_BOTTOM) {
                    this.ctx.fillStyle = "white";
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                    this.ctx.fillStyle = "black";
                    this.ctx.beginPath();
                    this.ctx.arc(
                        (x + 0.5) * this.cellSize,
                        (y + 0.8) * this.cellSize,
                        this.ball.radius,
                        0,
                        Math.PI * 2
                    );
                    this.ctx.fill();
                } else if (this.labyrinth[y][x] === this.HOLE_LEFT) {
                    this.ctx.fillStyle = "white";
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                    this.ctx.fillStyle = "black";
                    this.ctx.beginPath();
                    this.ctx.arc(
                        (x + 0.2) * this.cellSize,
                        (y + 0.5) * this.cellSize,
                        this.ball.radius,
                        0,
                        Math.PI * 2
                    );
                    this.ctx.fill();
                } else if (this.labyrinth[y][x] === this.PATH) {
                    this.ctx.fillStyle = "white";
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                }
            }
        }
    }

    drawBall() {
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);

        // Create metallic gradient
        const gradient = this.ctx.createRadialGradient(
            this.ball.x - this.ball.radius * 0.3, // x0
            this.ball.y - this.ball.radius * 0.3, // y0
            this.ball.radius * 0.1, // r0
            this.ball.x, // x1
            this.ball.y, // y1
            this.ball.radius // r1
        );
        
        // Add color stops for metallic effect
        gradient.addColorStop(0, '#ffffff'); // Highlight
        gradient.addColorStop(0.2, '#e0e0e0'); // Light steel
        gradient.addColorStop(0.5, '#a0a0a0'); // Medium steel
        gradient.addColorStop(1, '#707070'); // Dark steel

        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // Add shine effect
        this.ctx.beginPath();
        this.ctx.arc(
            this.ball.x - this.ball.radius * 0.3,
            this.ball.y - this.ball.radius * 0.3,
            this.ball.radius * 0.3,
            0,
            Math.PI * 2
        );
        const shineGradient = this.ctx.createRadialGradient(
            this.ball.x - this.ball.radius * 0.3,
            this.ball.y - this.ball.radius * 0.3,
            this.ball.radius * 0.1,
            this.ball.x - this.ball.radius * 0.3,
            this.ball.y - this.ball.radius * 0.3,
            this.ball.radius * 0.3
        );
        shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = shineGradient;
        this.ctx.fill();

        this.ctx.closePath();
    }

    updateBallPosition() {
        if (!this.gameStarted || this.gamePaused) return;

        const acceleration = 0.05;
        const damping = 0.98;

        this.ball.velocityX += this.tiltX * acceleration;
        this.ball.velocityY += this.tiltY * acceleration;

        this.ball.velocityX *= damping;
        this.ball.velocityY *= damping;

        this.ball.x += this.ball.velocityX;
        this.ball.y += this.ball.velocityY;

        this.checkCollisions();
    }

    checkCollisions() {
        // Check for collisions at the ball's edges
        const points = [
            { x: this.ball.x - this.ball.radius, y: this.ball.y }, // Left point
            { x: this.ball.x + this.ball.radius, y: this.ball.y }, // Right point
            { x: this.ball.x, y: this.ball.y - this.ball.radius }, // Top point
            { x: this.ball.x, y: this.ball.y + this.ball.radius }  // Bottom point
        ];

        for (const point of points) {
            const cellX = Math.floor(point.x / this.cellSize);
            const cellY = Math.floor(point.y / this.cellSize);

            if (this.isOutOfBounds(cellX, cellY)) {
                this.handleOutOfBounds();
                return;
            }

            const currentTile = this.labyrinth[cellY][cellX];
            if (currentTile === this.WALL) {
                this.handleWallCollision();
                return;
            } else if (currentTile === this.WOOD) {
                this.handleWoodCollision();
                return;
            } else if (currentTile === this.HOLE_TOP ||
                      currentTile === this.HOLE_RIGHT ||
                      currentTile === this.HOLE_BOTTOM ||
                      currentTile === this.HOLE_LEFT) {
                if (this.isNearHole(currentTile, cellX, cellY)) {
                    this.handleFallIntoHole();
                    return;
                }
            } else if (currentTile === this.END) {
                this.handleFinish();
                return;
            }
        }
    }

    isNearHole(holeType, cellX, cellY) {
        const ballCenterX = this.ball.x / this.cellSize;
        const ballCenterY = this.ball.y / this.cellSize;
        const holePositions = {
            [this.HOLE_TOP]: { x: cellX + 0.5, y: cellY + 0.2 },
            [this.HOLE_RIGHT]: { x: cellX + 0.8, y: cellY + 0.5 },
            [this.HOLE_BOTTOM]: { x: cellX + 0.5, y: cellY + 0.8 },
            [this.HOLE_LEFT]: { x: cellX + 0.2, y: cellY + 0.5 }
        };
        const holePos = holePositions[holeType];
        const distance = Math.sqrt(
            Math.pow(ballCenterX - holePos.x, 2) + 
            Math.pow(ballCenterY - holePos.y, 2)
        );
        return distance < 0.3; // Adjust this value to make it easier/harder to fall into holes
    }

    handleFallIntoHole() {
        this.resetBall();
        this.showOutOfBoundsModal();
    }

    isOutOfBounds(cellX, cellY) {
        return cellX < 0 || cellX >= this.labyrinth[0].length || 
               cellY < 0 || cellY >= this.labyrinth.length;
    }

    handleOutOfBounds() {
        this.resetBall();
        this.showOutOfBoundsModal();
    }

    handleWallCollision() {
        this.resetBall();
        this.showOutOfBoundsModal();
    }

    handleWoodCollision() {
        // Check all adjacent cells for wood tiles to handle multiple collisions
        const checkRadius = this.ball.radius + this.cellSize;
        const centerCellX = Math.floor(this.ball.x / this.cellSize);
        const centerCellY = Math.floor(this.ball.y / this.cellSize);
        
        // Track all wood collisions
        let collisions = [];
        
        // Check a 3x3 grid around the ball for wood tiles
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const checkX = centerCellX + dx;
                const checkY = centerCellY + dy;
                
                // Skip if out of bounds
                if (checkX < 0 || checkY < 0 || 
                    checkY >= this.labyrinth.length || 
                    checkX >= this.labyrinth[0].length) {
                    continue;
                }
                
                // If this cell is wood, calculate collision
                if (this.labyrinth[checkY][checkX] === this.WOOD) {
                    const woodLeft = checkX * this.cellSize;
                    const woodRight = woodLeft + this.cellSize;
                    const woodTop = checkY * this.cellSize;
                    const woodBottom = woodTop + this.cellSize;
                    
                    // Find nearest point on this wood tile
                    const nearestX = Math.max(woodLeft, Math.min(this.ball.x, woodRight));
                    const nearestY = Math.max(woodTop, Math.min(this.ball.y, woodBottom));
                    
                    const dx = this.ball.x - nearestX;
                    const dy = this.ball.y - nearestY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // If collision detected, add to list
                    if (distance < this.ball.radius) {
                        collisions.push({
                            distance,
                            dx,
                            dy,
                            penetration: this.ball.radius - distance
                        });
                    }
                }
            }
        }
        
        // Handle all collisions
        if (collisions.length > 0) {
            // Sort collisions by penetration depth
            collisions.sort((a, b) => b.penetration - a.penetration);
            
            // Calculate average normal for all collisions
            let avgNormX = 0;
            let avgNormY = 0;
            
            collisions.forEach(collision => {
                if (collision.distance === 0) {
                    avgNormX += 1;
                    avgNormY += 0;
                } else {
                    avgNormX += collision.dx / collision.distance;
                    avgNormY += collision.dy / collision.distance;
                }
            });
            
            // Normalize the average normal
            const avgLength = Math.sqrt(avgNormX * avgNormX + avgNormY * avgNormY);
            if (avgLength > 0) {
                avgNormX /= avgLength;
                avgNormY /= avgLength;
            }
            
            // Use the deepest penetration for repositioning
            const maxPenetration = collisions[0].penetration;
            
            // Reposition ball using average normal and max penetration
            this.ball.x += avgNormX * maxPenetration * 1.1; // Slight extra push to prevent sticking
            this.ball.y += avgNormY * maxPenetration * 1.1;
            
            // Reflect velocity using average normal
            const dot = this.ball.velocityX * avgNormX + this.ball.velocityY * avgNormY;
            this.ball.velocityX = (this.ball.velocityX - 2 * dot * avgNormX) * 0.8;
            this.ball.velocityY = (this.ball.velocityY - 2 * dot * avgNormY) * 0.8;
            
            // Add minimum velocity to help prevent sticking
            const minVelocity = 0.1;
            if (Math.abs(this.ball.velocityX) < minVelocity && Math.abs(this.ball.velocityY) < minVelocity) {
                this.ball.velocityX += avgNormX * minVelocity;
                this.ball.velocityY += avgNormY * minVelocity;
            }
        }
    }

    getBestTimes() {
        return JSON.parse(localStorage.getItem('labyrinthBestTimes') || '{}');
    }

    saveBestTime(levelName, time) {
        const bestTimes = this.getBestTimes();
        if (!bestTimes[levelName] || time < bestTimes[levelName]) {
            bestTimes[levelName] = time;
            localStorage.setItem('labyrinthBestTimes', JSON.stringify(bestTimes));
            return true;
        }
        return false;
    }

    loadRandomLevel() {
        const savedLevels = JSON.parse(localStorage.getItem('labyrinthLevels') || '{}');
        const levelNames = Object.keys(savedLevels);
        
        if (levelNames.length > 0) {
            const randomLevel = levelNames[Math.floor(Math.random() * levelNames.length)];
            this.currentLevelName = randomLevel;
            this.setLabyrinth(savedLevels[randomLevel].map(row => [...row]));
            return true;
        }
        return false;
    }

    handleFinish() {
        this.stopTimer();
        this.gameStarted = false;

        // Check if this is a new best time
        const isNewBestTime = this.saveBestTime(this.currentLevelName, this.elapsedTime);
        
        this.showResults(isNewBestTime);

        // Load next random level after a short delay
        setTimeout(() => {
            if (this.loadRandomLevel()) {
                // Reset game state for the new level
                this.resetBall();
                this.gameStarted = false;
                this.gamePaused = false;
                this.elapsedTime = 0;
                
                // Hide the results modal
                const modal = document.getElementById('resultModal');
                if (modal) {
                    modal.style.display = 'none';
                }
            }
        }, 2000); // 2 second delay to show the results
    }

    resetBall() {
        this.ball.x = (this.startX + 0.5) * this.cellSize;
        this.ball.y = (this.startY + 0.5) * this.cellSize;
        this.ball.velocityX = 0;
        this.ball.velocityY = 0;
        this.tiltX = 0;
        this.tiltY = 0;
    }

    startTimer() {
        this.startTime = Date.now() - (this.elapsedTime || 0);
        this.timerInterval = setInterval(() => {
            this.elapsedTime = Date.now() - this.startTime;
        }, 10);
    }

    stopTimer() {
        clearInterval(this.timerInterval);
    }

    setLabyrinth(newLabyrinth) {
        this.labyrinth = newLabyrinth;
        this.initializeGame();
    }

    getLabyrinth() {
        return this.labyrinth;
    }

    showOutOfBoundsModal() {
        const modal = document.getElementById('outOfBoundsModal');
        if (modal) {
            modal.style.display = 'block';
            this.gamePaused = true;
            this.gameStarted = false;
        }
    }

    showResults(isNewBestTime) {
        const modal = document.getElementById('resultModal');
        if (modal) {
            // Update level name
            document.getElementById('congratsLevelMessage').textContent = 
                `Level Complete: ${this.currentLevelName}`;
            
            // Update current time
            document.getElementById('userTime').textContent = this.formatTime(this.elapsedTime);
            
            // Update best time
            const bestTimes = this.getBestTimes();
            const bestTime = bestTimes[this.currentLevelName];
            const bestTimesList = document.getElementById('bestTimesList');
            
            if (bestTimesList) {
                bestTimesList.innerHTML = `
                    <li>Best Time: ${this.formatTime(bestTime)}</li>
                    ${isNewBestTime ? '<li class="new-record">New Record!</li>' : ''}
                `;
            }
            
            modal.style.display = 'block';
            this.gamePaused = true;
        }
    }

    formatTime(time) {
        const totalSeconds = Math.floor(time / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
}

export default LabyrinthGame;
