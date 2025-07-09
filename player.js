// Player Class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = GAME_CONFIG.PLAYER.SIZE;
        this.height = GAME_CONFIG.PLAYER.SIZE;
        this.speed = GAME_CONFIG.PLAYER.SPEED;
        this.maxHealth = GAME_CONFIG.PLAYER.MAX_HEALTH;
        this.health = this.maxHealth;
        this.healthRegen = GAME_CONFIG.PLAYER.HEALTH_REGEN;
        this.pickupRange = GAME_CONFIG.PLAYER.PICKUP_RANGE;
        
        this.experience = 0;
        this.level = 1;
        this.experienceToNextLevel = GAME_CONFIG.EXPERIENCE.BASE_LEVEL_XP;
        
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.invulnerabilityDuration = 1.0; // 1 second
        
        this.direction = 1; // 1 for right, -1 for left
        this.animationTime = 0;
        
        // Movement state
        this.velocity = { x: 0, y: 0 };
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        
        // Weapon upgrades
        this.weapons = [];
        this.weaponUpgrades = {
            damage: 1.0,
            speed: 1.0,
            range: 1.0,
            count: 1
        };
        
        // Player upgrades
        this.upgrades = {
            movementSpeed: 1.0,
            healthRegen: 1.0,
            pickupRange: 1.0,
            armor: 0
        };
        
        this.setupInputHandlers();
    }
    
    setupInputHandlers() {
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.keys.up = true;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.keys.down = true;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.keys.left = true;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.keys.right = true;
                    break;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            switch(e.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.keys.up = false;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.keys.down = false;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.keys.left = false;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.keys.right = false;
                    break;
            }
        });
    }
    
    update(dt) {
        this.updateMovement(dt);
        this.updateHealth(dt);
        this.updateInvulnerability(dt);
        this.updateAnimation(dt);
    }
    
    updateMovement(dt) {
        this.velocity.x = 0;
        this.velocity.y = 0;
        
        if (this.keys.left) {
            this.velocity.x = -1;
            this.direction = -1;
        }
        if (this.keys.right) {
            this.velocity.x = 1;
            this.direction = 1;
        }
        if (this.keys.up) {
            this.velocity.y = -1;
        }
        if (this.keys.down) {
            this.velocity.y = 1;
        }
        
        // Normalize diagonal movement
        if (this.velocity.x !== 0 && this.velocity.y !== 0) {
            const len = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
            this.velocity.x /= len;
            this.velocity.y /= len;
        }
        
        // Apply speed and upgrades
        const actualSpeed = this.speed * this.upgrades.movementSpeed;
        this.x += this.velocity.x * actualSpeed * dt;
        this.y += this.velocity.y * actualSpeed * dt;
        
        // Keep player within canvas bounds
        this.x = Utils.clamp(this.x, 0, GAME_CONFIG.CANVAS_WIDTH - this.width);
        this.y = Utils.clamp(this.y, 0, GAME_CONFIG.CANVAS_HEIGHT - this.height);
    }
    
    updateHealth(dt) {
        if (this.health < this.maxHealth) {
            this.health += this.healthRegen * this.upgrades.healthRegen * dt;
            this.health = Math.min(this.health, this.maxHealth);
        }
    }
    
    updateInvulnerability(dt) {
        if (this.invulnerable) {
            this.invulnerabilityTime -= dt;
            if (this.invulnerabilityTime <= 0) {
                this.invulnerable = false;
            }
        }
    }
    
    updateAnimation(dt) {
        this.animationTime += dt;
    }
    
    takeDamage(damage) {
        if (this.invulnerable) return false;
        
        // Apply armor reduction
        const actualDamage = Math.max(1, damage - this.upgrades.armor);
        this.health -= actualDamage;
        
        // Start invulnerability
        this.invulnerable = true;
        this.invulnerabilityTime = this.invulnerabilityDuration;
        
        // Screen shake
        Utils.screenShake.start(5, 0.2);
        
        return true;
    }
    
    addExperience(amount) {
        this.experience += amount;
        
        while (this.experience >= this.experienceToNextLevel) {
            this.experience -= this.experienceToNextLevel;
            this.levelUp();
        }
    }
    
    levelUp() {
        this.level++;
        this.experienceToNextLevel = Math.floor(
            GAME_CONFIG.EXPERIENCE.BASE_LEVEL_XP * 
            Math.pow(GAME_CONFIG.EXPERIENCE.LEVEL_XP_MULTIPLIER, this.level - 1)
        );
        
        // Trigger level up screen
        if (window.game) {
            window.game.showLevelUpScreen();
        }
    }
    
    addWeapon(weaponType) {
        // Check if player already has this weapon
        const existingWeapon = this.weapons.find(w => w.type === weaponType);
        if (existingWeapon) {
            existingWeapon.upgrade();
            return;
        }
        
        // Create new weapon
        let weapon;
        switch(weaponType) {
            case 'whip':
                weapon = new Whip(this);
                break;
            case 'missile':
                weapon = new MagicMissile(this);
                break;
            case 'fireball':
                weapon = new Fireball(this);
                break;
            case 'lightning':
                weapon = new Lightning(this);
                break;
        }
        
        if (weapon) {
            this.weapons.push(weapon);
        }
    }
    
    applyUpgrade(upgradeType, value) {
        switch(upgradeType) {
            case 'damage':
                this.weaponUpgrades.damage += value;
                break;
            case 'weaponSpeed':
                this.weaponUpgrades.speed += value;
                break;
            case 'weaponRange':
                this.weaponUpgrades.range += value;
                break;
            case 'weaponCount':
                this.weaponUpgrades.count += value;
                break;
            case 'movementSpeed':
                this.upgrades.movementSpeed += value;
                break;
            case 'healthRegen':
                this.upgrades.healthRegen += value;
                break;
            case 'pickupRange':
                this.upgrades.pickupRange += value;
                break;
            case 'armor':
                this.upgrades.armor += value;
                break;
            case 'maxHealth':
                this.maxHealth += value;
                this.health += value;
                break;
        }
    }
    
    getCenterX() {
        return this.x + this.width / 2;
    }
    
    getCenterY() {
        return this.y + this.height / 2;
    }
    
    draw(ctx) {
        ctx.save();
        
        // Flash effect during invulnerability
        if (this.invulnerable && Math.sin(this.animationTime * 20) > 0) {
            ctx.globalAlpha = 0.5;
        }
        
        // Draw player as a simple colored rectangle with face
        ctx.fillStyle = '#4ecdc4';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw face
        ctx.fillStyle = '#ffffff';
        const eyeSize = 2;
        const eyeOffsetX = this.width * 0.3;
        const eyeOffsetY = this.height * 0.3;
        
        // Eyes
        ctx.fillRect(
            this.x + eyeOffsetX - eyeSize/2, 
            this.y + eyeOffsetY - eyeSize/2, 
            eyeSize, eyeSize
        );
        ctx.fillRect(
            this.x + this.width - eyeOffsetX - eyeSize/2, 
            this.y + eyeOffsetY - eyeSize/2, 
            eyeSize, eyeSize
        );
        
        // Simple mouth
        ctx.fillRect(
            this.x + this.width/2 - 3, 
            this.y + this.height * 0.7 - 1, 
            6, 2
        );
        
        ctx.restore();
        
        // Debug: Draw pickup range
        Utils.debug.drawCircle(ctx, this.getCenterX(), this.getCenterY(), 
            this.pickupRange * this.upgrades.pickupRange, 'yellow');
    }
}