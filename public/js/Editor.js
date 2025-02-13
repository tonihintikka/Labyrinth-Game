class LabyrinthEditor {
    constructor(game) {
        this.game = game;
        this.isEditorMode = false;
        this.isTestMode = false;
        this.currentTileType = 1; // WALL
        this.isDragging = false;
        this.originalLabyrinth = null;

        this.initializeEditor();
    }

    initializeEditor() {
        this.createEditorControls();
        this.setupEditorEventListeners();
    }

    createEditorControls() {
        // Editor controls are now in the HTML
    }

    setupEditorEventListeners() {
        // Add mousemove listener for cursor updates
        this.game.canvas.addEventListener('mousemove', (e) => this.updateCursor(e));
        
        // Tile button listeners
        document.querySelectorAll('.tile-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tile-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTileType = parseInt(e.target.dataset.tile);
            });
        });

        // Canvas painting listeners
        this.game.canvas.addEventListener('mousedown', (e) => this.startPainting(e));
        this.game.canvas.addEventListener('mousemove', (e) => this.paint(e));
        this.game.canvas.addEventListener('mouseup', () => this.stopPainting());
        this.game.canvas.addEventListener('mouseleave', () => this.stopPainting());

        // Other button listeners
        document.getElementById('testLevel').addEventListener('click', () => this.toggleTestMode());
        document.getElementById('saveLevel').addEventListener('click', () => this.showSaveLevelDialog());
        document.getElementById('loadLevel').addEventListener('click', () => this.showLevelSelector());

        // ESC key listener
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.isTestMode) {
                    this.toggleTestMode();
                }
                // Close any open modals
                const modals = document.querySelectorAll('.modal-overlay');
                modals.forEach(modal => document.body.removeChild(modal));
            }
        });
    }

    startPainting(e) {
        if (!this.isEditorMode || this.isTestMode) return;
        this.isDragging = true;
        this.paint(e);
    }

    stopPainting() {
        this.isDragging = false;
    }

    updateCursor(e) {
        if (!this.isEditorMode || this.isTestMode) {
            this.game.canvas.className = '';
            return;
        }

        // Map tile types to cursor classes
        const cursorClasses = {
            [this.game.WALL]: 'cursor-wall',
            [this.game.PATH]: 'cursor-path',
            [this.game.START]: 'cursor-start',
            [this.game.END]: 'cursor-end',
            [this.game.WOOD]: 'cursor-wood',
            [this.game.HOLE_TOP]: 'cursor-hole',
            [this.game.HOLE_RIGHT]: 'cursor-hole',
            [this.game.HOLE_BOTTOM]: 'cursor-hole',
            [this.game.HOLE_LEFT]: 'cursor-hole'
        };

        this.game.canvas.className = cursorClasses[this.currentTileType] || '';
    }

    paint(e) {
        if (!this.isDragging || !this.isEditorMode || this.isTestMode) return;

        // Get the canvas's bounding rectangle and compute scaling factors in case the canvas is resized via CSS.
        const rect = this.game.canvas.getBoundingClientRect();
        const scaleX = this.game.canvas.width / rect.width;
        const scaleY = this.game.canvas.height / rect.height;
        
        // Convert mouse coordinates to canvas coordinates accounting for potential scaling.
        const mouseXUnclamped = (e.clientX - rect.left) * scaleX;
        const mouseYUnclamped = (e.clientY - rect.top) * scaleY;
        
        // Clamp the mouse positions so that they never exceed the canvas boundaries.
        const mouseX = Math.min(mouseXUnclamped, this.game.canvas.width - 1);
        const mouseY = Math.min(mouseYUnclamped, this.game.canvas.height - 1);
        
        // Compute the cell indices using the cell size.
        let cellX = Math.floor(mouseX / this.game.cellSize);
        let cellY = Math.floor(mouseY / this.game.cellSize);

        // For START tile: remove any existing start tile so there's only one.
        if (this.currentTileType === this.game.START) {
            for (let row = 0; row < this.game.labyrinth.length; row++) {
                for (let col = 0; col < this.game.labyrinth[row].length; col++) {
                    if (this.game.labyrinth[row][col] === this.game.START) {
                        this.game.labyrinth[row][col] = this.game.PATH;
                    }
                }
            }
        }
        // For END tile: ensure only one exists.
        else if (this.currentTileType === this.game.END) {
            for (let row = 0; row < this.game.labyrinth.length; row++) {
                for (let col = 0; col < this.game.labyrinth[row].length; col++) {
                    if (this.game.labyrinth[row][col] === this.game.END) {
                        this.game.labyrinth[row][col] = this.game.PATH;
                    }
                }
            }
        }

        // Update the labyrinth matrix with the selected tile
        this.game.labyrinth[cellY][cellX] = this.currentTileType;

        // Redraw the labyrinth to reflect the changes
        this.game.drawLabyrinth();
    }

    toggleTestMode() {
        this.isTestMode = !this.isTestMode;
        const testModeIndicator = document.getElementById('testModeIndicator');
        
        if (this.isTestMode) {
            this.originalLabyrinth = this.game.labyrinth.map(row => [...row]);
            this.game.resetBall();
            this.game.gameStarted = false;
            this.game.gamePaused = false;
            testModeIndicator.style.display = 'block';
        } else {
            this.game.labyrinth = this.originalLabyrinth.map(row => [...row]);
            this.game.gamePaused = true;
            this.game.gameStarted = false;
            testModeIndicator.style.display = 'none';
            this.game.drawLabyrinth();
        }
    }

    showSaveLevelDialog() {
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';

        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.innerHTML = `
            <h3 class="modal-header">Save Level</h3>
            <input type="text" class="modal-select" placeholder="Enter level name" id="levelNameInput">
            <div class="modal-buttons">
                <button class="modal-button modal-button-secondary" id="cancelSave">Cancel</button>
                <button class="modal-button modal-button-primary" id="confirmSave">Save</button>
            </div>
        `;

        // Add modal content to overlay
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);

        // Focus the input field
        const input = modalContent.querySelector('#levelNameInput');
        input.focus();

        // Handle modal closing
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                document.body.removeChild(modalOverlay);
            }
        });

        // Handle button clicks
        document.getElementById('confirmSave').addEventListener('click', () => {
            const levelName = input.value.trim();
            if (levelName) {
                const savedLevels = JSON.parse(localStorage.getItem('labyrinthLevels') || '{}');
                savedLevels[levelName] = this.game.labyrinth;
                localStorage.setItem('labyrinthLevels', JSON.stringify(savedLevels));
                document.body.removeChild(modalOverlay);
            } else {
                input.classList.add('error');
                setTimeout(() => input.classList.remove('error'), 500);
            }
        });

        document.getElementById('cancelSave').addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
        });

        // Handle enter key in input
        input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('confirmSave').click();
            }
        });

        // Prevent clicks inside modal content from closing the modal
        modalContent.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    showLevelSelector() {
        const savedLevels = JSON.parse(localStorage.getItem('labyrinthLevels') || '{}');
        const levelNames = Object.keys(savedLevels);
        
        if (levelNames.length === 0) {
            alert('No saved levels found!');
            return;
        }

        // Remove any existing selector
        const existingSelector = document.getElementById('levelSelectorModal');
        if (existingSelector) {
            document.body.removeChild(existingSelector);
        }

        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'levelSelectorModal';
        modalOverlay.className = 'modal-overlay';

        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.innerHTML = `
            <h3 class="modal-header">Select a level to load:</h3>
            <select class="modal-select">
                ${levelNames.map(name => `<option value="${name}">${name}</option>`).join('')}
            </select>
            <div class="modal-buttons">
                <button class="modal-button modal-button-secondary" id="cancelLoad">Cancel</button>
                <button class="modal-button modal-button-primary" id="confirmLoad">Load</button>
            </div>
        `;

        // Add modal content to overlay
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);

        // Handle modal closing
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                document.body.removeChild(modalOverlay);
            }
        });

        // Handle button clicks
        document.getElementById('confirmLoad').addEventListener('click', () => {
            const selectedLevel = modalContent.querySelector('select').value;
            const newLevel = savedLevels[selectedLevel];
            this.game.setLabyrinth(newLevel.map(row => [...row]));
            document.body.removeChild(modalOverlay);
        });

        document.getElementById('cancelLoad').addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
        });

        // Prevent clicks inside modal content from closing the modal
        modalContent.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

export default LabyrinthEditor;
