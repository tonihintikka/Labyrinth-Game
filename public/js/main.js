import LabyrinthGame from './Game.js';
import LabyrinthEditor from './Editor.js';

document.addEventListener('DOMContentLoaded', () => {
    const game = new LabyrinthGame('gameCanvas');
    const editor = new LabyrinthEditor(game);

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
});
