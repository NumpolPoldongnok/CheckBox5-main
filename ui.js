// UI Manager
class UIManager {
    constructor() {
        this.healthBar = document.getElementById('healthBar');
        this.healthFill = document.getElementById('healthFill');
        this.healthText = document.getElementById('healthText');
        
        this.experienceBar = document.getElementById('experienceBar');
        this.experienceFill = document.getElementById('experienceFill');
        this.experienceText = document.getElementById('experienceText');
        
        this.timer = document.getElementById('timer');
        this.enemiesKilled = document.getElementById('enemiesKilled');
        
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.gameOverContent = document.getElementById('gameOverContent');
        this.finalTime = document.getElementById('finalTime');
        this.finalEnemies = document.getElementById('finalEnemies');
        this.finalLevel = document.getElementById('finalLevel');
        this.restartButton = document.getElementById('restartButton');
        
        this.levelUpScreen = document.getElementById('levelUpScreen');
        this.levelUpContent = document.getElementById('levelUpContent');
        this.upgradeOptions = document.getElementById('upgradeOptions');
        
        this.pauseScreen = document.getElementById('pauseScreen');
        this.pauseContent = document.getElementById('pauseContent');
        
        this.gameTime = 0;
        this.setupEventListeners();
        this.createUpgradeDatabase();
    }
    
    setupEventListeners() {
        this.restartButton.addEventListener('click', () => {
            this.hideGameOverScreen();
            if (window.game) {
                window.game.restart();
            }
        });
        
        // Pause/Resume functionality
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'Escape') {
                e.preventDefault();
                if (window.game) {
                    if (window.game.isPaused) {
                        window.game.resume();
                    } else {
                        window.game.pause();
                    }
                }
            }
        });
    }
    
    createUpgradeDatabase() {
        this.upgrades = {
            weapons: [
                {
                    id: 'whip',
                    name: 'Whip',
                    description: 'Melee weapon with arc attack',
                    icon: '🔪'
                },
                {
                    id: 'missile',
                    name: 'Magic Missile',
                    description: 'Homing projectiles that track enemies',
                    icon: '🎯'
                },
                {
                    id: 'fireball',
                    name: 'Fireball',
                    description: 'Explosive projectiles with area damage',
                    icon: '🔥'
                },
                {
                    id: 'lightning',
                    name: 'Lightning',
                    description: 'Chain lightning that jumps between enemies',
                    icon: '⚡'
                }
            ],
            stats: [
                {
                    id: 'damage',
                    name: 'Weapon Damage',
                    description: 'Increases all weapon damage by 20%',
                    icon: '💪',
                    value: 0.2
                },
                {
                    id: 'weaponSpeed',
                    name: 'Attack Speed',
                    description: 'Increases weapon attack speed by 15%',
                    icon: '⚡',
                    value: 0.15
                },
                {
                    id: 'weaponRange',
                    name: 'Weapon Range',
                    description: 'Increases weapon range by 25%',
                    icon: '🎯',
                    value: 0.25
                },
                {
                    id: 'movementSpeed',
                    name: 'Movement Speed',
                    description: 'Increases movement speed by 20%',
                    icon: '👟',
                    value: 0.2
                },
                {
                    id: 'healthRegen',
                    name: 'Health Regeneration',
                    description: 'Increases health regeneration by 50%',
                    icon: '💚',
                    value: 0.5
                },
                {
                    id: 'pickupRange',
                    name: 'Pickup Range',
                    description: 'Increases experience gem pickup range by 30%',
                    icon: '🔮',
                    value: 0.3
                },
                {
                    id: 'armor',
                    name: 'Armor',
                    description: 'Reduces incoming damage by 2 points',
                    icon: '🛡️',
                    value: 2
                },
                {
                    id: 'maxHealth',
                    name: 'Max Health',
                    description: 'Increases maximum health by 25 points',
                    icon: '❤️',
                    value: 25
                }
            ]
        };
    }
    
    update(dt, player, enemyManager) {
        this.gameTime += dt;
        this.updateHealthBar(player);
        this.updateExperienceBar(player);
        this.updateGameStats(enemyManager);
    }
    
    updateHealthBar(player) {
        const healthPercent = (player.health / player.maxHealth) * 100;
        this.healthFill.style.width = healthPercent + '%';
        this.healthText.textContent = `${Math.ceil(player.health)}/${player.maxHealth}`;
        
        // Change color based on health
        if (healthPercent > 60) {
            this.healthFill.style.background = 'linear-gradient(90deg, #ff6b6b, #ff8e8e)';
        } else if (healthPercent > 30) {
            this.healthFill.style.background = 'linear-gradient(90deg, #ffaa00, #ffcc00)';
        } else {
            this.healthFill.style.background = 'linear-gradient(90deg, #ff0000, #ff4444)';
        }
    }
    
    updateExperienceBar(player) {
        const experiencePercent = (player.experience / player.experienceToNextLevel) * 100;
        this.experienceFill.style.width = experiencePercent + '%';
        this.experienceText.textContent = `Level ${player.level}`;
    }
    
    updateGameStats(enemyManager) {
        this.timer.textContent = `Time: ${Utils.formatTime(this.gameTime)}`;
        this.enemiesKilled.textContent = `Enemies: ${enemyManager.enemiesKilled}`;
    }
    
    showGameOverScreen(player, enemyManager) {
        this.finalTime.textContent = Utils.formatTime(this.gameTime);
        this.finalEnemies.textContent = enemyManager.enemiesKilled;
        this.finalLevel.textContent = player.level;
        
        this.gameOverScreen.classList.remove('hidden');
        
        // Save high score
        this.saveHighScore(player, enemyManager);
    }
    
    hideGameOverScreen() {
        this.gameOverScreen.classList.add('hidden');
    }
    
    showLevelUpScreen(player) {
        this.generateUpgradeOptions(player);
        this.levelUpScreen.classList.remove('hidden');
    }
    
    hideLevelUpScreen() {
        this.levelUpScreen.classList.add('hidden');
    }
    
    generateUpgradeOptions(player) {
        this.upgradeOptions.innerHTML = '';
        
        const availableUpgrades = this.getAvailableUpgrades(player);
        const selectedUpgrades = this.selectRandomUpgrades(availableUpgrades, 3);
        
        for (const upgrade of selectedUpgrades) {
            const option = this.createUpgradeOption(upgrade, player);
            this.upgradeOptions.appendChild(option);
        }
    }
    
    getAvailableUpgrades(player) {
        const available = [];
        
        // Add weapon upgrades
        for (const weapon of this.upgrades.weapons) {
            const playerWeapon = player.weapons.find(w => w.type === weapon.id);
            if (!playerWeapon) {
                available.push({ ...weapon, type: 'weapon' });
            } else if (playerWeapon.level < 5) {
                available.push({ 
                    ...weapon, 
                    type: 'weapon', 
                    name: `${weapon.name} (Level ${playerWeapon.level + 1})`,
                    description: `Upgrade ${weapon.name} to level ${playerWeapon.level + 1}`
                });
            }
        }
        
        // Add stat upgrades
        for (const stat of this.upgrades.stats) {
            available.push({ ...stat, type: 'stat' });
        }
        
        return available;
    }
    
    selectRandomUpgrades(available, count) {
        const selected = [];
        const availableCopy = [...available];
        
        for (let i = 0; i < count && availableCopy.length > 0; i++) {
            const index = Math.floor(Math.random() * availableCopy.length);
            selected.push(availableCopy.splice(index, 1)[0]);
        }
        
        return selected;
    }
    
    createUpgradeOption(upgrade, player) {
        const option = document.createElement('div');
        option.className = 'upgrade-option';
        
        option.innerHTML = `
            <h3>${upgrade.icon} ${upgrade.name}</h3>
            <p>${upgrade.description}</p>
        `;
        
        option.addEventListener('click', () => {
            this.selectUpgrade(upgrade, player);
        });
        
        return option;
    }
    
    selectUpgrade(upgrade, player) {
        if (upgrade.type === 'weapon') {
            player.addWeapon(upgrade.id);
        } else if (upgrade.type === 'stat') {
            player.applyUpgrade(upgrade.id, upgrade.value);
        }
        
        this.hideLevelUpScreen();
        
        // Resume game
        if (window.game) {
            window.game.resume();
        }
    }
    
    showPauseScreen() {
        this.pauseScreen.classList.remove('hidden');
    }
    
    hidePauseScreen() {
        this.pauseScreen.classList.add('hidden');
    }
    
    saveHighScore(player, enemyManager) {
        const score = {
            time: this.gameTime,
            level: player.level,
            enemiesKilled: enemyManager.enemiesKilled,
            date: new Date().toISOString()
        };
        
        const highScores = Utils.loadFromStorage('highScores', []);
        highScores.push(score);
        
        // Sort by time survived (descending)
        highScores.sort((a, b) => b.time - a.time);
        
        // Keep only top 10
        highScores.splice(10);
        
        Utils.saveToStorage('highScores', highScores);
    }
    
    reset() {
        this.gameTime = 0;
        this.hideGameOverScreen();
        this.hideLevelUpScreen();
        this.hidePauseScreen();
    }
    
    // Helper method to create floating damage text
    createDamageText(x, y, damage, color = '#ff6b6b') {
        // TODO: Implement floating damage text system
        // This could create DOM elements that animate upward and fade out
    }
    
    // Helper method to create notification messages
    showNotification(message, duration = 2000) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            border: 2px solid #4ecdc4;
            font-family: 'Courier New', monospace;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, duration);
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);