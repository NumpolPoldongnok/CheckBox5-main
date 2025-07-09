// Utility Functions
const Utils = {
    // Distance calculation
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    // Angle calculation
    angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },

    // Normalize angle to 0-2π range
    normalizeAngle(angle) {
        while (angle < 0) angle += 2 * Math.PI;
        while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
        return angle;
    },

    // Random number between min and max
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    // Random integer between min and max (inclusive)
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Choose random element from array
    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    // Clamp value between min and max
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    // Linear interpolation
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    },

    // Check if point is inside rectangle
    pointInRect(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    },

    // Check if two rectangles intersect
    rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    },

    // Check if two circles intersect
    circleIntersect(x1, y1, r1, x2, y2, r2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < r1 + r2;
    },

    // Normalize vector
    normalize(x, y) {
        const length = Math.sqrt(x * x + y * y);
        if (length === 0) return { x: 0, y: 0 };
        return { x: x / length, y: y / length };
    },

    // Format time in MM:SS format
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },

    // Color utilities
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },

    // Particle system helper
    createParticle(x, y, vx, vy, life, color, size) {
        return {
            x: x,
            y: y,
            vx: vx,
            vy: vy,
            life: life,
            maxLife: life,
            color: color,
            size: size,
            alpha: 1.0
        };
    },

    // Screen shake helper
    screenShake: {
        intensity: 0,
        duration: 0,
        start(intensity, duration) {
            this.intensity = intensity;
            this.duration = duration;
        },
        update(dt) {
            if (this.duration > 0) {
                this.duration -= dt;
                if (this.duration <= 0) {
                    this.intensity = 0;
                }
            }
        },
        getOffset() {
            if (this.intensity <= 0) return { x: 0, y: 0 };
            return {
                x: (Math.random() - 0.5) * this.intensity,
                y: (Math.random() - 0.5) * this.intensity
            };
        }
    },

    // Sound management
    sounds: {},
    loadSound(name, url) {
        this.sounds[name] = new Audio(url);
        this.sounds[name].volume = 0.5;
    },
    playSound(name) {
        if (this.sounds[name]) {
            this.sounds[name].currentTime = 0;
            this.sounds[name].play().catch(e => {
                // Ignore audio play errors (common in browsers)
            });
        }
    },

    // Local storage helpers
    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
        }
    },
    loadFromStorage(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.warn('Failed to load from localStorage:', e);
            return defaultValue;
        }
    },

    // Debug helpers
    debug: {
        enabled: false,
        log(...args) {
            if (this.enabled) {
                console.log(...args);
            }
        },
        drawCircle(ctx, x, y, radius, color = 'red') {
            if (!this.enabled) return;
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        },
        drawRect(ctx, x, y, width, height, color = 'red') {
            if (!this.enabled) return;
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);
            ctx.restore();
        }
    }
};

// Game Constants
const GAME_CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    TARGET_FPS: 60,
    
    PLAYER: {
        SPEED: 200,
        SIZE: 16,
        MAX_HEALTH: 100,
        HEALTH_REGEN: 0.5,
        PICKUP_RANGE: 30
    },
    
    ENEMY: {
        SPAWN_DISTANCE: 50,
        MAX_ENEMIES: 100,
        WAVE_MULTIPLIER: 1.1
    },
    
    WEAPON: {
        WHIP_DAMAGE: 25,
        WHIP_RANGE: 60,
        WHIP_SPEED: 1.5,
        
        MISSILE_DAMAGE: 15,
        MISSILE_SPEED: 300,
        MISSILE_TURN_SPEED: 5,
        
        FIREBALL_DAMAGE: 30,
        FIREBALL_SPEED: 250,
        FIREBALL_EXPLOSION_RADIUS: 40,
        
        LIGHTNING_DAMAGE: 20,
        LIGHTNING_CHAIN_COUNT: 3,
        LIGHTNING_CHAIN_RANGE: 80
    },
    
    EXPERIENCE: {
        BASE_LEVEL_XP: 100,
        LEVEL_XP_MULTIPLIER: 1.5,
        GEM_VALUE: 10,
        GEM_LIFETIME: 30
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Utils, GAME_CONFIG };
}