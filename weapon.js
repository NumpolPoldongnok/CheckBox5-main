// Base Weapon Class
class Weapon {
    constructor(player, type) {
        this.player = player;
        this.type = type;
        this.damage = 10;
        this.range = 50;
        this.speed = 1.0;
        this.level = 1;
        this.cooldown = 1.0;
        this.lastAttackTime = 0;
        this.projectiles = [];
    }
    
    update(dt) {
        this.lastAttackTime += dt;
        
        if (this.lastAttackTime >= this.cooldown / this.player.weaponUpgrades.speed) {
            this.attack();
            this.lastAttackTime = 0;
        }
        
        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            if (!projectile.update(dt)) {
                this.projectiles.splice(i, 1);
            }
        }
    }
    
    attack() {
        // Override in subclasses
    }
    
    upgrade() {
        this.level++;
        this.damage += Math.floor(this.damage * 0.2);
        this.cooldown = Math.max(0.1, this.cooldown * 0.9);
    }
    
    getActualDamage() {
        return Math.floor(this.damage * this.player.weaponUpgrades.damage);
    }
    
    getActualRange() {
        return this.range * this.player.weaponUpgrades.range;
    }
    
    findNearestEnemy() {
        if (!window.game || !window.game.enemyManager) return null;
        
        let nearestEnemy = null;
        let nearestDistance = Infinity;
        
        for (const enemy of window.game.enemyManager.enemies) {
            if (!enemy.alive) continue;
            
            const distance = Utils.distance(
                this.player.getCenterX(), this.player.getCenterY(),
                enemy.getCenterX(), enemy.getCenterY()
            );
            
            if (distance < nearestDistance && distance <= this.getActualRange()) {
                nearestDistance = distance;
                nearestEnemy = enemy;
            }
        }
        
        return nearestEnemy;
    }
    
    checkCollision(enemy) {
        // Default collision check - override in subclasses
        return false;
    }
    
    draw(ctx) {
        // Draw projectiles
        for (const projectile of this.projectiles) {
            projectile.draw(ctx);
        }
    }
}

// Whip Weapon
class Whip extends Weapon {
    constructor(player) {
        super(player, 'whip');
        this.damage = GAME_CONFIG.WEAPON.WHIP_DAMAGE;
        this.range = GAME_CONFIG.WEAPON.WHIP_RANGE;
        this.speed = GAME_CONFIG.WEAPON.WHIP_SPEED;
        this.cooldown = 1.0;
        this.attacking = false;
        this.attackDuration = 0.3;
        this.attackTime = 0;
        this.attackAngle = 0;
        this.arcWidth = Math.PI / 3; // 60 degrees
    }
    
    attack() {
        if (this.attacking) return;
        
        // Find attack direction based on nearest enemy
        const nearestEnemy = this.findNearestEnemy();
        if (nearestEnemy) {
            this.attackAngle = Utils.angle(
                this.player.getCenterX(), this.player.getCenterY(),
                nearestEnemy.getCenterX(), nearestEnemy.getCenterY()
            );
        } else {
            this.attackAngle = this.player.direction > 0 ? 0 : Math.PI;
        }
        
        this.attacking = true;
        this.attackTime = 0;
        
        // Check for hits immediately
        this.checkHits();
    }
    
    update(dt) {
        super.update(dt);
        
        if (this.attacking) {
            this.attackTime += dt;
            if (this.attackTime >= this.attackDuration) {
                this.attacking = false;
            }
        }
    }
    
    checkHits() {
        if (!window.game || !window.game.enemyManager) return;
        
        for (const enemy of window.game.enemyManager.enemies) {
            if (!enemy.alive) continue;
            
            const distance = Utils.distance(
                this.player.getCenterX(), this.player.getCenterY(),
                enemy.getCenterX(), enemy.getCenterY()
            );
            
            if (distance <= this.getActualRange()) {
                const angleToEnemy = Utils.angle(
                    this.player.getCenterX(), this.player.getCenterY(),
                    enemy.getCenterX(), enemy.getCenterY()
                );
                
                const angleDiff = Math.abs(Utils.normalizeAngle(angleToEnemy - this.attackAngle));
                if (angleDiff <= this.arcWidth / 2 || angleDiff >= (2 * Math.PI - this.arcWidth / 2)) {
                    enemy.takeDamage(this.getActualDamage());
                }
            }
        }
    }
    
    draw(ctx) {
        super.draw(ctx);
        
        if (this.attacking) {
            ctx.save();
            
            const progress = this.attackTime / this.attackDuration;
            const alpha = 1 - progress;
            
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = '#ff6b6b';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            
            const startAngle = this.attackAngle - this.arcWidth / 2;
            const endAngle = this.attackAngle + this.arcWidth / 2;
            
            ctx.beginPath();
            ctx.arc(
                this.player.getCenterX(), 
                this.player.getCenterY(), 
                this.getActualRange(), 
                startAngle, 
                endAngle
            );
            ctx.stroke();
            
            ctx.restore();
        }
    }
}

// Projectile Base Class
class Projectile {
    constructor(x, y, angle, speed, damage, lifetime) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.damage = damage;
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.size = 4;
        this.color = '#4ecdc4';
        this.alive = true;
    }
    
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.lifetime -= dt;
        
        // Check bounds
        if (this.x < 0 || this.x > GAME_CONFIG.CANVAS_WIDTH || 
            this.y < 0 || this.y > GAME_CONFIG.CANVAS_HEIGHT) {
            this.alive = false;
        }
        
        // Check lifetime
        if (this.lifetime <= 0) {
            this.alive = false;
        }
        
        return this.alive;
    }
    
    checkCollision(enemy) {
        return Utils.circleIntersect(
            this.x, this.y, this.size,
            enemy.getCenterX(), enemy.getCenterY(), enemy.width / 2
        );
    }
    
    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Magic Missile Weapon
class MagicMissile extends Weapon {
    constructor(player) {
        super(player, 'missile');
        this.damage = GAME_CONFIG.WEAPON.MISSILE_DAMAGE;
        this.range = 300;
        this.speed = GAME_CONFIG.WEAPON.MISSILE_SPEED;
        this.cooldown = 0.5;
        this.turnSpeed = GAME_CONFIG.WEAPON.MISSILE_TURN_SPEED;
    }
    
    attack() {
        const nearestEnemy = this.findNearestEnemy();
        if (!nearestEnemy) return;
        
        const angle = Utils.angle(
            this.player.getCenterX(), this.player.getCenterY(),
            nearestEnemy.getCenterX(), nearestEnemy.getCenterY()
        );
        
        const missile = new HomingMissile(
            this.player.getCenterX(), 
            this.player.getCenterY(), 
            angle, 
            this.speed, 
            this.getActualDamage(),
            3.0,
            this.turnSpeed
        );
        
        this.projectiles.push(missile);
    }
}

// Homing Missile Projectile
class HomingMissile extends Projectile {
    constructor(x, y, angle, speed, damage, lifetime, turnSpeed) {
        super(x, y, angle, speed, damage, lifetime);
        this.turnSpeed = turnSpeed;
        this.color = '#ff6b6b';
        this.size = 6;
        this.target = null;
    }
    
    update(dt) {
        // Find nearest enemy to home in on
        if (!this.target || !this.target.alive) {
            this.findTarget();
        }
        
        // Home in on target
        if (this.target && this.target.alive) {
            const targetAngle = Utils.angle(
                this.x, this.y,
                this.target.getCenterX(), this.target.getCenterY()
            );
            
            let angleDiff = targetAngle - this.angle;
            
            // Normalize angle difference
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
            
            // Turn towards target
            const turnAmount = this.turnSpeed * dt;
            if (Math.abs(angleDiff) < turnAmount) {
                this.angle = targetAngle;
            } else {
                this.angle += Math.sign(angleDiff) * turnAmount;
            }
            
            // Update velocity
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
        }
        
        // Check collision with enemies
        if (window.game && window.game.enemyManager) {
            for (const enemy of window.game.enemyManager.enemies) {
                if (!enemy.alive) continue;
                
                if (this.checkCollision(enemy)) {
                    enemy.takeDamage(this.damage);
                    this.alive = false;
                    return false;
                }
            }
        }
        
        return super.update(dt);
    }
    
    findTarget() {
        if (!window.game || !window.game.enemyManager) return;
        
        let nearestEnemy = null;
        let nearestDistance = Infinity;
        
        for (const enemy of window.game.enemyManager.enemies) {
            if (!enemy.alive) continue;
            
            const distance = Utils.distance(
                this.x, this.y,
                enemy.getCenterX(), enemy.getCenterY()
            );
            
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestEnemy = enemy;
            }
        }
        
        this.target = nearestEnemy;
    }
    
    draw(ctx) {
        ctx.save();
        
        // Draw missile body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw trail
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * 0.1, this.y - this.vy * 0.1);
        ctx.stroke();
        
        ctx.restore();
    }
}

// Fireball Weapon
class Fireball extends Weapon {
    constructor(player) {
        super(player, 'fireball');
        this.damage = GAME_CONFIG.WEAPON.FIREBALL_DAMAGE;
        this.range = 250;
        this.speed = GAME_CONFIG.WEAPON.FIREBALL_SPEED;
        this.cooldown = 1.2;
        this.explosionRadius = GAME_CONFIG.WEAPON.FIREBALL_EXPLOSION_RADIUS;
    }
    
    attack() {
        const nearestEnemy = this.findNearestEnemy();
        if (!nearestEnemy) return;
        
        const angle = Utils.angle(
            this.player.getCenterX(), this.player.getCenterY(),
            nearestEnemy.getCenterX(), nearestEnemy.getCenterY()
        );
        
        const fireball = new FireballProjectile(
            this.player.getCenterX(), 
            this.player.getCenterY(), 
            angle, 
            this.speed, 
            this.getActualDamage(),
            2.0,
            this.explosionRadius
        );
        
        this.projectiles.push(fireball);
    }
}

// Fireball Projectile
class FireballProjectile extends Projectile {
    constructor(x, y, angle, speed, damage, lifetime, explosionRadius) {
        super(x, y, angle, speed, damage, lifetime);
        this.explosionRadius = explosionRadius;
        this.color = '#ff8c00';
        this.size = 8;
        this.animationTime = 0;
    }
    
    update(dt) {
        this.animationTime += dt;
        
        // Check collision with enemies
        if (window.game && window.game.enemyManager) {
            for (const enemy of window.game.enemyManager.enemies) {
                if (!enemy.alive) continue;
                
                if (this.checkCollision(enemy)) {
                    this.explode();
                    return false;
                }
            }
        }
        
        return super.update(dt);
    }
    
    explode() {
        if (!window.game || !window.game.enemyManager) return;
        
        // Damage all enemies within explosion radius
        for (const enemy of window.game.enemyManager.enemies) {
            if (!enemy.alive) continue;
            
            const distance = Utils.distance(
                this.x, this.y,
                enemy.getCenterX(), enemy.getCenterY()
            );
            
            if (distance <= this.explosionRadius) {
                enemy.takeDamage(this.damage);
            }
        }
        
        // Create explosion effect
        this.createExplosionEffect();
        
        this.alive = false;
    }
    
    createExplosionEffect() {
        // TODO: Add particle effects for explosion
    }
    
    draw(ctx) {
        ctx.save();
        
        // Pulsing fireball effect
        const pulseSize = this.size + Math.sin(this.animationTime * 10) * 2;
        
        // Outer glow
        ctx.fillStyle = '#ff4500';
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseSize * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Main fireball
        ctx.globalAlpha = 1;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner core
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Lightning Weapon
class Lightning extends Weapon {
    constructor(player) {
        super(player, 'lightning');
        this.damage = GAME_CONFIG.WEAPON.LIGHTNING_DAMAGE;
        this.range = 150;
        this.cooldown = 0.8;
        this.chainCount = GAME_CONFIG.WEAPON.LIGHTNING_CHAIN_COUNT;
        this.chainRange = GAME_CONFIG.WEAPON.LIGHTNING_CHAIN_RANGE;
        this.lightningEffects = [];
    }
    
    attack() {
        const nearestEnemy = this.findNearestEnemy();
        if (!nearestEnemy) return;
        
        // Create chain lightning
        this.createLightningChain(nearestEnemy);
    }
    
    createLightningChain(startEnemy) {
        const hitEnemies = new Set();
        let currentEnemy = startEnemy;
        let chainCount = 0;
        
        while (currentEnemy && chainCount < this.chainCount) {
            if (hitEnemies.has(currentEnemy)) break;
            
            hitEnemies.add(currentEnemy);
            currentEnemy.takeDamage(this.getActualDamage());
            
            // Create lightning effect
            const effect = new LightningEffect(
                chainCount === 0 ? this.player.getCenterX() : this.lastX,
                chainCount === 0 ? this.player.getCenterY() : this.lastY,
                currentEnemy.getCenterX(),
                currentEnemy.getCenterY(),
                0.3
            );
            this.lightningEffects.push(effect);
            
            // Find next target
            const nextEnemy = this.findNearestUnhitEnemy(currentEnemy, hitEnemies);
            
            this.lastX = currentEnemy.getCenterX();
            this.lastY = currentEnemy.getCenterY();
            currentEnemy = nextEnemy;
            chainCount++;
        }
    }
    
    findNearestUnhitEnemy(fromEnemy, hitEnemies) {
        if (!window.game || !window.game.enemyManager) return null;
        
        let nearestEnemy = null;
        let nearestDistance = Infinity;
        
        for (const enemy of window.game.enemyManager.enemies) {
            if (!enemy.alive || hitEnemies.has(enemy)) continue;
            
            const distance = Utils.distance(
                fromEnemy.getCenterX(), fromEnemy.getCenterY(),
                enemy.getCenterX(), enemy.getCenterY()
            );
            
            if (distance < nearestDistance && distance <= this.chainRange) {
                nearestDistance = distance;
                nearestEnemy = enemy;
            }
        }
        
        return nearestEnemy;
    }
    
    update(dt) {
        super.update(dt);
        
        // Update lightning effects
        for (let i = this.lightningEffects.length - 1; i >= 0; i--) {
            const effect = this.lightningEffects[i];
            if (!effect.update(dt)) {
                this.lightningEffects.splice(i, 1);
            }
        }
    }
    
    draw(ctx) {
        super.draw(ctx);
        
        // Draw lightning effects
        for (const effect of this.lightningEffects) {
            effect.draw(ctx);
        }
    }
}

// Lightning Effect
class LightningEffect {
    constructor(x1, y1, x2, y2, duration) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.duration = duration;
        this.maxDuration = duration;
        this.segments = this.generateSegments();
    }
    
    generateSegments() {
        const segments = [];
        const numSegments = 8;
        
        for (let i = 0; i <= numSegments; i++) {
            const t = i / numSegments;
            const x = Utils.lerp(this.x1, this.x2, t);
            const y = Utils.lerp(this.y1, this.y2, t);
            
            // Add random offset for lightning effect
            const offset = (Math.random() - 0.5) * 20;
            const perpX = -(this.y2 - this.y1);
            const perpY = this.x2 - this.x1;
            const len = Math.sqrt(perpX * perpX + perpY * perpY);
            
            if (len > 0) {
                segments.push({
                    x: x + (perpX / len) * offset,
                    y: y + (perpY / len) * offset
                });
            } else {
                segments.push({ x, y });
            }
        }
        
        return segments;
    }
    
    update(dt) {
        this.duration -= dt;
        return this.duration > 0;
    }
    
    draw(ctx) {
        ctx.save();
        
        const alpha = this.duration / this.maxDuration;
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Draw main lightning
        ctx.beginPath();
        ctx.moveTo(this.segments[0].x, this.segments[0].y);
        for (let i = 1; i < this.segments.length; i++) {
            ctx.lineTo(this.segments[i].x, this.segments[i].y);
        }
        ctx.stroke();
        
        // Draw glow effect
        ctx.globalAlpha = alpha * 0.3;
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(this.segments[0].x, this.segments[0].y);
        for (let i = 1; i < this.segments.length; i++) {
            ctx.lineTo(this.segments[i].x, this.segments[i].y);
        }
        ctx.stroke();
        
        ctx.restore();
    }
}