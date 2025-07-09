// Main Game Class
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.gameOver = false;
        this.lastTime = 0;
        this.accumulator = 0;
        this.currentTime = 0;
        
        // Game objects
        this.player = null;
        this.enemyManager = null;
        this.uiManager = null;
        this.camera = { x: 0, y: 0 };
        
        // Game settings
        this.fixedTimeStep = 1000 / 60; // 60 FPS
        this.maxFrameTime = 250; // Max 250ms frame time
        
        // Initialize game
        this.init();
    }
    
    init() {
        // Setup canvas
        this.setupCanvas();
        
        // Initialize game objects
        this.player = new Player(
            GAME_CONFIG.CANVAS_WIDTH / 2 - GAME_CONFIG.PLAYER.SIZE / 2,
            GAME_CONFIG.CANVAS_HEIGHT / 2 - GAME_CONFIG.PLAYER.SIZE / 2
        );
        
        this.enemyManager = new EnemyManager();
        this.uiManager = new UIManager();
        
        // Give player starting weapon
        this.player.addWeapon('whip');
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start game loop
        this.start();
    }
    
    setupCanvas() {
        // Set canvas size
        this.canvas.width = GAME_CONFIG.CANVAS_WIDTH;
        this.canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
        
        // Setup canvas context
        this.ctx.imageSmoothingEnabled = false;
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        this.handleResize();
    }
    
    handleResize() {
        const container = document.getElementById('gameContainer');
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Calculate scale to fit screen while maintaining aspect ratio
        const scaleX = windowWidth / GAME_CONFIG.CANVAS_WIDTH;
        const scaleY = windowHeight / GAME_CONFIG.CANVAS_HEIGHT;
        const scale = Math.min(scaleX, scaleY) * 0.9; // 90% of available space
        
        // Apply scale
        this.canvas.style.transform = `scale(${scale})`;
        this.canvas.style.transformOrigin = 'center';
        
        // Update container size
        container.style.width = `${GAME_CONFIG.CANVAS_WIDTH * scale}px`;
        container.style.height = `${GAME_CONFIG.CANVAS_HEIGHT * scale}px`;
    }
    
    setupEventListeners() {
        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // Handle visibility change (pause when tab is not active)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isRunning && !this.isPaused) {
                this.pause();
            }
        });
    }
    
    start() {
        this.isRunning = true;
        this.isPaused = false;
        this.gameOver = false;
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    pause() {
        if (this.gameOver) return;
        
        this.isPaused = true;
        this.uiManager.showPauseScreen();
    }
    
    resume() {
        if (this.gameOver) return;
        
        this.isPaused = false;
        this.uiManager.hidePauseScreen();
        this.lastTime = performance.now(); // Reset time to prevent large delta
    }
    
    restart() {
        // Reset game state
        this.isRunning = false;
        this.isPaused = false;
        this.gameOver = false;
        this.accumulator = 0;
        
        // Reset game objects
        this.player = new Player(
            GAME_CONFIG.CANVAS_WIDTH / 2 - GAME_CONFIG.PLAYER.SIZE / 2,
            GAME_CONFIG.CANVAS_HEIGHT / 2 - GAME_CONFIG.PLAYER.SIZE / 2
        );
        
        this.enemyManager = new EnemyManager();
        this.uiManager.reset();
        
        // Give player starting weapon
        this.player.addWeapon('whip');
        
        // Restart game loop
        this.start();
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        this.currentTime = performance.now();
        let frameTime = this.currentTime - this.lastTime;
        this.lastTime = this.currentTime;
        
        // Cap frame time to prevent spiral of death
        frameTime = Math.min(frameTime, this.maxFrameTime);
        
        this.accumulator += frameTime;
        
        // Fixed timestep updates
        while (this.accumulator >= this.fixedTimeStep) {
            if (!this.isPaused && !this.gameOver) {
                this.update(this.fixedTimeStep / 1000); // Convert to seconds
            }
            this.accumulator -= this.fixedTimeStep;
        }
        
        // Render
        this.render();
        
        // Continue game loop
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update(dt) {
        // Update screen shake
        Utils.screenShake.update(dt);
        
        // Update player
        this.player.update(dt);
        
        // Update player weapons
        for (const weapon of this.player.weapons) {
            weapon.update(dt);
        }
        
        // Update enemies
        this.enemyManager.update(dt, this.player);
        
        // Update UI
        this.uiManager.update(dt, this.player, this.enemyManager);
        
        // Check game over
        if (this.player.health <= 0) {
            this.endGame();
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply screen shake
        const shakeOffset = Utils.screenShake.getOffset();
        this.ctx.save();
        this.ctx.translate(shakeOffset.x, shakeOffset.y);
        
        // Draw game objects
        this.renderGame();
        
        // Restore context
        this.ctx.restore();
    }
    
    renderGame() {
        // Draw background
        this.drawBackground();
        
        // Draw enemies
        this.enemyManager.draw(this.ctx);
        
        // Draw player
        this.player.draw(this.ctx);
        
        // Draw weapons
        for (const weapon of this.player.weapons) {
            weapon.draw(this.ctx);
        }
        
        // Draw debug info
        this.drawDebugInfo();
    }
    
    drawBackground() {
        // Simple grid background
        this.ctx.save();
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.3;
        
        const gridSize = 40;
        
        // Vertical lines
        for (let x = 0; x <= this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    drawDebugInfo() {
        if (!Utils.debug.enabled) return;
        
        this.ctx.save();
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';
        
        const debugInfo = [
            `FPS: ${Math.round(1000 / (this.currentTime - this.lastTime))}`,
            `Player: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
            `Enemies: ${this.enemyManager.enemies.length}`,
            `Wave: ${this.enemyManager.waveNumber}`,
            `Gems: ${this.enemyManager.experienceGems.length}`,
            `Weapons: ${this.player.weapons.length}`
        ];
        
        for (let i = 0; i < debugInfo.length; i++) {
            this.ctx.fillText(debugInfo[i], 10, this.canvas.height - 10 - (debugInfo.length - i - 1) * 15);
        }
        
        this.ctx.restore();
    }
    
    endGame() {
        this.gameOver = true;
        this.uiManager.showGameOverScreen(this.player, this.enemyManager);
    }
    
    showLevelUpScreen() {
        this.pause();
        this.uiManager.showLevelUpScreen(this.player);
    }
    
    addExperienceGem(x, y, value) {
        this.enemyManager.addExperienceGem(x, y, value);
    }
}

// Assets folder creation helper
function createAssetsFolder() {
    // This would typically be handled by the build process
    // For now, we'll just document the expected structure
    const assetsStructure = {
        'assets/': {
            'images/': {
                'player.png': 'Player sprite',
                'enemies/': {
                    'skeleton.png': 'Skeleton enemy sprite',
                    'bat.png': 'Bat enemy sprite',
                    'zombie.png': 'Zombie enemy sprite',
                    'ghost.png': 'Ghost enemy sprite',
                    'boss.png': 'Boss enemy sprite'
                },
                'weapons/': {
                    'whip.png': 'Whip weapon sprite',
                    'missile.png': 'Magic missile sprite',
                    'fireball.png': 'Fireball sprite',
                    'lightning.png': 'Lightning effect sprite'
                },
                'effects/': {
                    'explosion.png': 'Explosion effect sprite',
                    'blood.png': 'Blood effect sprite',
                    'sparkle.png': 'Sparkle effect sprite'
                },
                'ui/': {
                    'heart.png': 'Health icon',
                    'gem.png': 'Experience gem icon',
                    'cursor.png': 'Custom cursor'
                }
            },
            'audio/': {
                'music/': {
                    'background.mp3': 'Background music',
                    'boss.mp3': 'Boss fight music'
                },
                'sfx/': {
                    'hit.wav': 'Hit sound effect',
                    'death.wav': 'Death sound effect',
                    'levelup.wav': 'Level up sound effect',
                    'pickup.wav': 'Pickup sound effect',
                    'shoot.wav': 'Shooting sound effect',
                    'explosion.wav': 'Explosion sound effect'
                }
            }
        }
    };
    
    console.log('Expected assets structure:', assetsStructure);
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Create assets folder structure (placeholder)
    createAssetsFolder();
    
    // Initialize game
    window.game = new Game();
    
    // Debug mode toggle (press F1)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F1') {
            e.preventDefault();
            Utils.debug.enabled = !Utils.debug.enabled;
            console.log('Debug mode:', Utils.debug.enabled ? 'ON' : 'OFF');
        }
    });
    
    // Show initial instructions
    console.log('=== Vampire Survivor Game ===');
    console.log('Controls:');
    console.log('- WASD or Arrow Keys: Move player');
    console.log('- SPACE/ESC: Pause/Resume game');
    console.log('- F1: Toggle debug mode');
    console.log('');
    console.log('Game Features:');
    console.log('- Auto-attacking weapons');
    console.log('- Experience and leveling system');
    console.log('- Multiple enemy types');
    console.log('- Weapon upgrades and new weapons');
    console.log('- Increasing difficulty waves');
    console.log('');
    console.log('Good luck surviving!');
});