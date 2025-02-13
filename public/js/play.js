import LabyrinthGame from './Game.js';
import LevelStorage from './Storage.js';
import AuthService from './AuthService.js';

document.addEventListener('DOMContentLoaded', async () => {
    const game = new LabyrinthGame('gameCanvas');

    // Setup modal close buttons
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                game.gamePaused = false;
            }
        });
    });

    // Function to format time for display
    const formatTime = (timeInMs) => {
        const seconds = Math.floor(timeInMs / 1000);
        const milliseconds = timeInMs % 1000;
        return `${seconds}.${milliseconds.toString().padStart(3, '0')}s`;
    };

    // Function to format date for display
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    // Function to update high scores table
    const updateHighScoresTable = async (levelName, currentTime) => {
        const bestTimesList = document.getElementById('bestTimesList');
        bestTimesList.innerHTML = ''; // Clear existing scores

        try {
            const scores = await LevelStorage.getHighScores(levelName);
            
            // Add current score if user is logged in
            if (AuthService.currentUser && currentTime) {
                scores.push({
                    levelName,
                    time: currentTime,
                    playerName: AuthService.currentUser.email,
                    createdAt: new Date().toISOString(),
                    userId: AuthService.currentUser.uid
                });
            }

            // Sort scores by time
            scores.sort((a, b) => a.time - b.time);

            // Display top 5 scores
            scores.slice(0, 5).forEach((score, index) => {
                const row = document.createElement('tr');
                const isCurrentUser = AuthService.currentUser && score.userId === AuthService.currentUser.uid;
                if (isCurrentUser) {
                    row.classList.add('current-user-score');
                }

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${score.playerName || 'Anonymous'}</td>
                    <td>${formatTime(score.time)}</td>
                    <td>${formatDate(score.createdAt)}</td>
                `;
                bestTimesList.appendChild(row);
            });

            // Show/hide login prompt
            const loginPrompt = document.getElementById('loginPrompt');
            if (loginPrompt) {
                loginPrompt.style.display = AuthService.currentUser ? 'none' : 'block';
            }
        } catch (error) {
            console.error('Error updating high scores:', error);
        }
    };

    // Setup restart buttons
    const restartGameBtn = document.getElementById('restartGameBtn');
    const startAgainFromOutOfBoundsBtn = document.getElementById('startAgainFromOutOfBoundsBtn');

    const handleRestart = () => {
        // Hide all modals
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        
        // Reset game state
        game.resetBall();
        game.gameStarted = false;
        game.gamePaused = false;
        game.elapsedTime = 0;
        if (game.timerInterval) {
            clearInterval(game.timerInterval);
        }
    };

    restartGameBtn.addEventListener('click', handleRestart);
    startAgainFromOutOfBoundsBtn.addEventListener('click', handleRestart);

    // Load a random level to start
    try {
        const levels = await LevelStorage.getSavedLevels();
        const levelNames = Object.keys(levels);
        
        if (levelNames.length > 0) {
            const randomLevel = levelNames[Math.floor(Math.random() * levelNames.length)];
            game.currentLevelName = randomLevel;
            game.setLabyrinth(levels[randomLevel].map(row => [...row]));

            // Pre-load high scores for the current level
            await updateHighScoresTable(randomLevel);
        }
    } catch (error) {
        console.error('Error loading levels:', error);
    }

    // Override the game's levelComplete method to handle high scores
    const originalLevelComplete = game.levelComplete.bind(game);
    game.levelComplete = async () => {
        originalLevelComplete();
        
        // Update congratulations message
        const congratsMessage = document.getElementById('congratsLevelMessage');
        congratsMessage.textContent = `Congratulations! You passed ${game.currentLevelName}`;
        
        // Update user time
        const userTimeSpan = document.getElementById('userTime');
        userTimeSpan.textContent = formatTime(game.elapsedTime);

        // Save high score if user is logged in
        if (AuthService.currentUser) {
            try {
                await LevelStorage.saveHighScore(game.currentLevelName, game.elapsedTime);
            } catch (error) {
                console.error('Error saving high score:', error);
            }
        }

        // Update high scores table
        await updateHighScoresTable(game.currentLevelName, game.elapsedTime);
    };
});
