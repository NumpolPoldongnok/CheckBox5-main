// Enemy Classes
class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 12;
        this.height = 12;
        this.speed = 50;
        this.maxHealth = 30;
        this.health = this.maxHealth;
        this.damage = 10;
        this.experienceValue = 10;
        this.alive = true;
        this.color = '#ff6b6b';
        this.animationTime = 0;
        this.lastAttackTime = 0;
        this.attackCooldown = 1.0;
        
        this.setupByType();
    }
    
    setupByType() {
        switch(this.type) {
            case 'skeleton':
                this.speed = 50;
                this.maxHealth = 30;
                this.damage = 10;
                this.experienceValue = 10;
                this.color = '#e6e6e6';
                break;
            case 'bat':
                this.speed = 120;
                this.maxHealth = 15;
                this.damage = 8;
                this.experienceValue = 15;
                this.color = '#8b4513';
                this.width = 10;
                this.height = 10;
                break;
            case 'zombie':
                this.speed = 30;
                this.maxHealth = 80;
                this.damage = 15;
                this.experienceValue = 20;
                this.color = '#228b22';
                this.width = 14;
                this.height = 14;
                break;
            case 'ghost':
                this.speed = 80;
                this.maxHealth = 20;
                this.damage = 12;
                this.experienceValue = 25;
                this.color = '#dda0dd';
                this.width = 12;
                this.height = 12;
                break;
            case 'boss':
                this.speed = 40;
                this.maxHealth = 200;
                this.damage = 25;
                this.experienceValue = 100;
                this.color = '#ff4500';
                this.width = 24;
                this.height = 24;
                break;
        }
        
        this.health = this.maxHealth;
    }
    
    update(dt, player) {
        if (!this.alive) return;
        
        this.animationTime += dt;
        this.moveTowardPlayer(dt, player);
        this.checkPlayerCollision(dt, player);
    }
    
    moveTowardPlayer(dt, player) {
        const dx = player.getCenterX() - this.getCenterX();
        const dy = player.getCenterY() - this.getCenterY();
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const normalizedX = dx / distance;
            const normalizedY = dy / distance;
            
            this.x += normalizedX * this.speed * dt;
            this.y += normalizedY * this.speed * dt;
        }
    }
    
    checkPlayerCollision(dt, player) {
        if (Utils.circleIntersect(
            this.getCenterX(), this.getCenterY(), this.width/2,
            player.getCenterX(), player.getCenterY(), player.width/2
        )) {
            this.lastAttackTime += dt;
            if (this.lastAttackTime >= this.attackCooldown) {
                if (player.takeDamage(this.damage)) {
                    this.lastAttackTime = 0;
                }
            }
        }
    }
    
    takeDamage(damage) {
        this.health -= damage;
        
        if (this.health <= 0) {
            this.alive = false;
            this.dropExperience();
            return true; // Enemy died
        }
        
        return false; // Enemy survived
    }
    
    dropExperience() {
        if (window.game) {
            window.game.addExperienceGem(this.getCenterX(), this.getCenterY(), this.experienceValue);
        }
    }
    
    getCenterX() {
        return this.x + this.width / 2;
    }
    
    getCenterY() {
        return this.y + this.height / 2;
    }
    
    draw(ctx) {
        if (!this.alive) return;
        
        ctx.save();
        
        // Draw enemy body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw simple eyes
        ctx.fillStyle = '#ffffff';
        const eyeSize = 2;
        ctx.fillRect(this.x + 2, this.y + 2, eyeSize, eyeSize);
        ctx.fillRect(this.x + this.width - 4, this.y + 2, eyeSize, eyeSize);
        
        // Draw health bar if damaged
        if (this.health < this.maxHealth) {
            this.drawHealthBar(ctx);
        }
        
        ctx.restore();
    }
    
    drawHealthBar(ctx) {
        const barWidth = this.width;
        const barHeight = 3;
        const barY = this.y - 8;
        
        // Background
        ctx.fillStyle = '#333333';
        ctx.fillRect(this.x, barY, barWidth, barHeight);
        
        // Health
        ctx.fillStyle = '#ff6b6b';
        const healthWidth = (this.health / this.maxHealth) * barWidth;
        ctx.fillRect(this.x, barY, healthWidth, barHeight);
        
        // Border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, barY, barWidth, barHeight);
    }
}

// Experience Gem Class
class ExperienceGem {
    constructor(x, y, value) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.lifetime = GAME_CONFIG.EXPERIENCE.GEM_LIFETIME;
        this.maxLifetime = this.lifetime;
        this.size = 6;
        this.color = '#4ecdc4';
        this.animationTime = 0;
        this.magnetized = false;
        this.magnetSpeed = 200;
    }
    
    update(dt, player) {
        this.animationTime += dt;
        this.lifetime -= dt;
        
        // Check if player is close enough to magnetize
        const distance = Utils.distance(
            this.x, this.y, 
            player.getCenterX(), player.getCenterY()
        );
        
        if (distance < player.pickupRange * player.upgrades.pickupRange) {
            this.magnetized = true;
        }
        
        // Move toward player if magnetized
        if (this.magnetized) {
            const dx = player.getCenterX() - this.x;
            const dy = player.getCenterY() - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0) {
                const normalizedX = dx / dist;
                const normalizedY = dy / dist;
                
                this.x += normalizedX * this.magnetSpeed * dt;
                this.y += normalizedY * this.magnetSpeed * dt;
            }
            
            // Check if collected
            if (distance < 10) {
                player.addExperience(this.value);
                return false; // Remove gem
            }
        }
        
        return this.lifetime > 0;
    }
    
    draw(ctx) {
        ctx.save();
        
        // Pulsing effect
        const pulseSize = this.size + Math.sin(this.animationTime * 8) * 2;
        
        // Fade effect based on lifetime
        const alpha = this.lifetime / this.maxLifetime;
        ctx.globalAlpha = alpha;
        
        // Draw gem
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner glow
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Enemy Manager
class EnemyManager {
    constructor() {
        this.enemies = [];
        this.experienceGems = [];
        this.spawnTimer = 0;
        this.spawnInterval = 2.0;
        this.waveNumber = 1;
        this.enemiesKilled = 0;
        this.maxEnemies = GAME_CONFIG.ENEMY.MAX_ENEMIES;
        
        this.enemyTypes = ['skeleton', 'bat', 'zombie', 'ghost'];
        this.bossSpawnInterval = 30; // Spawn boss every 30 seconds
        this.lastBossSpawn = 0;
    }
    
    update(dt, player) {
        // Update spawn timer
        this.spawnTimer += dt;
        this.lastBossSpawn += dt;
        
        // Spawn enemies
        if (this.spawnTimer >= this.spawnInterval && this.enemies.length < this.maxEnemies) {
            this.spawnEnemy(player);
            this.spawnTimer = 0;
        }
        
        // Spawn boss
        if (this.lastBossSpawn >= this.bossSpawnInterval) {
            this.spawnBoss(player);
            this.lastBossSpawn = 0;
        }
        
        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(dt, player);
            
            if (!enemy.alive) {
                this.enemies.splice(i, 1);
                this.enemiesKilled++;
            }
        }
        
        // Update experience gems
        for (let i = this.experienceGems.length - 1; i >= 0; i--) {
            const gem = this.experienceGems[i];
            if (!gem.update(dt, player)) {
                this.experienceGems.splice(i, 1);
            }
        }
        
        // Increase difficulty over time
        this.updateDifficulty();
    }
    
    spawnEnemy(player) {
        const spawnPos = this.getSpawnPosition(player);
        const enemyType = Utils.randomChoice(this.enemyTypes);
        const enemy = new Enemy(spawnPos.x, spawnPos.y, enemyType);
        
        // Scale enemy stats based on wave
        enemy.maxHealth = Math.floor(enemy.maxHealth * Math.pow(GAME_CONFIG.ENEMY.WAVE_MULTIPLIER, this.waveNumber - 1));
        enemy.health = enemy.maxHealth;
        enemy.damage = Math.floor(enemy.damage * Math.pow(GAME_CONFIG.ENEMY.WAVE_MULTIPLIER, this.waveNumber - 1));
        
        this.enemies.push(enemy);
    }
    
    spawnBoss(player) {
        const spawnPos = this.getSpawnPosition(player);
        const boss = new Enemy(spawnPos.x, spawnPos.y, 'boss');
        
        // Scale boss stats
        boss.maxHealth = Math.floor(boss.maxHealth * Math.pow(GAME_CONFIG.ENEMY.WAVE_MULTIPLIER, this.waveNumber - 1));
        boss.health = boss.maxHealth;
        boss.damage = Math.floor(boss.damage * Math.pow(GAME_CONFIG.ENEMY.WAVE_MULTIPLIER, this.waveNumber - 1));
        
        this.enemies.push(boss);
    }
    
    getSpawnPosition(player) {
        const angle = Math.random() * Math.PI * 2;
        const distance = GAME_CONFIG.ENEMY.SPAWN_DISTANCE + Math.random() * 100;
        
        const x = player.getCenterX() + Math.cos(angle) * distance;
        const y = player.getCenterY() + Math.sin(angle) * distance;
        
        // Clamp to canvas bounds
        return {
            x: Utils.clamp(x, 0, GAME_CONFIG.CANVAS_WIDTH - 12),
            y: Utils.clamp(y, 0, GAME_CONFIG.CANVAS_HEIGHT - 12)
        };
    }
    
    updateDifficulty() {
        // Increase wave number every 100 enemies killed
        const newWave = Math.floor(this.enemiesKilled / 100) + 1;
        if (newWave > this.waveNumber) {
            this.waveNumber = newWave;
            this.spawnInterval = Math.max(0.5, this.spawnInterval * 0.9); // Faster spawning
        }
    }
    
    addExperienceGem(x, y, value) {
        this.experienceGems.push(new ExperienceGem(x, y, value));
    }
    
    checkWeaponCollisions(weapon) {
        const hitEnemies = [];
        
        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;
            
            if (weapon.checkCollision(enemy)) {
                if (enemy.takeDamage(weapon.damage)) {
                    hitEnemies.push(enemy);
                }
            }
        }
        
        return hitEnemies;
    }
    
    draw(ctx) {
        // Draw enemies
        for (const enemy of this.enemies) {
            enemy.draw(ctx);
        }
        
        // Draw experience gems
        for (const gem of this.experienceGems) {
            gem.draw(ctx);
        }
    }
}