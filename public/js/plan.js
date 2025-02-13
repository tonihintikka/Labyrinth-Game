import LabyrinthGame from './Game.js';
import LabyrinthEditor from './Editor.js';

document.addEventListener('DOMContentLoaded', () => {
    const game = new LabyrinthGame('gameCanvas');
    const editor = new LabyrinthEditor(game);
    
    // Start in editor mode automatically since we're on the plan page
    editor.isEditorMode = true;
    game.gamePaused = true;

    // Setup editor controls
    document.querySelectorAll('.tile-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tile-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            editor.currentTileType = parseInt(e.target.dataset.tile);
        });
    });

    // Canvas painting listeners
    game.canvas.addEventListener('mousedown', (e) => editor.startPainting(e));
    game.canvas.addEventListener('mousemove', (e) => {
        editor.updateCursor(e);
        editor.paint(e);
    });
    game.canvas.addEventListener('mouseup', () => editor.stopPainting());
    game.canvas.addEventListener('mouseleave', () => editor.stopPainting());

    // Other button listeners
    document.getElementById('testLevel').addEventListener('click', () => editor.toggleTestMode());
    document.getElementById('saveLevel').addEventListener('click', () => editor.saveLevelToStorage());
    document.getElementById('loadLevel').addEventListener('click', () => editor.showLevelSelector());

    // ESC key listener for test mode
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && editor.isTestMode) {
            editor.toggleTestMode();
        }
    });
});
