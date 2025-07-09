# Vampire Survivor-style Roguelike Game

A 2D top-down roguelike game inspired by Vampire Survivors, built with HTML5 Canvas and vanilla JavaScript.

## Features

### Core Gameplay
- **Player Character**: Move in 8 directions using WASD or arrow keys
- **Auto-attacking**: Weapons automatically attack nearby enemies
- **Wave-based Enemies**: Increasing difficulty with different enemy types
- **Experience System**: Collect experience gems dropped by enemies
- **Level Up System**: Choose upgrades and new weapons when leveling up

### Game Systems
- **Health System**: Player health decreases when hit by enemies
- **Weapon System**: Multiple weapon types with different behaviors
- **Enemy AI**: Different enemy types with varying behaviors
- **Collision Detection**: Proper collision between all game objects
- **Game Over Screen**: Shows stats and restart option

### Weapons
- **Whip**: Melee arc attack weapon
- **Magic Missile**: Homing projectiles that track enemies
- **Fireball**: Explosive projectiles with area damage
- **Lightning**: Chain lightning that jumps between enemies

### Enemy Types
- **Skeleton**: Basic melee enemy
- **Bat**: Fast flying enemy
- **Zombie**: Slow but tanky enemy
- **Ghost**: Medium speed with special abilities
- **Boss**: Powerful enemies that spawn periodically

### Upgrades
- **Weapon Damage**: Increase all weapon damage
- **Attack Speed**: Increase weapon attack speed
- **Weapon Range**: Increase weapon range
- **Movement Speed**: Increase player movement speed
- **Health Regeneration**: Increase health regeneration rate
- **Pickup Range**: Increase experience gem pickup range
- **Armor**: Reduce incoming damage
- **Max Health**: Increase maximum health

## Controls

- **WASD** or **Arrow Keys**: Move player
- **SPACE** or **ESC**: Pause/Resume game
- **F1**: Toggle debug mode
- **Mouse**: Navigate menus and select upgrades

## Technical Features

- 60 FPS game loop with fixed timestep
- Responsive canvas that scales to screen size
- Screen shake effects for impact
- Particle effects and animations
- Local storage for high scores
- Modular code structure for easy expansion

## File Structure

```
├── index.html          # Main game page
├── style.css           # Game styling
├── game.js             # Core game logic and loop
├── player.js           # Player character management
├── enemy.js            # Enemy systems and AI
├── weapon.js           # Weapon systems and projectiles
├── ui.js               # User interface and menus
├── utils.js            # Utility functions and constants
└── assets/             # Images and audio files (placeholder)
    ├── images/
    │   ├── player.png
    │   ├── enemies/
    │   ├── weapons/
    │   ├── effects/
    │   └── ui/
    └── audio/
        ├── music/
        └── sfx/
```

## Getting Started

1. Open `index.html` in a modern web browser
2. The game will start automatically
3. Use WASD or arrow keys to move
4. Survive as long as possible!

## Game Mechanics

### Experience and Leveling
- Enemies drop experience gems when killed
- Walk near gems to collect them automatically
- Level up to choose from 3 random upgrades
- Each level requires more experience than the last

### Weapon System
- Start with a basic whip weapon
- Unlock new weapons through level up choices
- Upgrade existing weapons to increase their effectiveness
- Each weapon has unique behavior and upgrade paths

### Enemy Scaling
- Enemies become stronger over time
- New waves spawn with increased health and damage
- Boss enemies appear periodically
- Enemy spawn rate increases with time

### Survival Tips
- Keep moving to avoid enemy swarms
- Prioritize movement speed and weapon range upgrades early
- Balance offense and defense upgrades
- Use terrain and spacing to your advantage

## Development

The game is built with:
- **HTML5 Canvas** for rendering
- **Vanilla JavaScript** for game logic
- **CSS3** for styling and animations
- **Web Audio API** support for future sound implementation

### Adding New Content

#### New Weapons
1. Create a new weapon class in `weapon.js`
2. Add weapon data to the upgrades database in `ui.js`
3. Update the weapon selection logic in `player.js`

#### New Enemies
1. Add new enemy type in `enemy.js`
2. Update the enemy spawning logic in `EnemyManager`
3. Add specific behaviors and stats

#### New Upgrades
1. Add upgrade definition to `ui.js`
2. Implement upgrade logic in `player.js`
3. Update UI to display new upgrade options

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Performance

The game is optimized for smooth 60 FPS gameplay with:
- Efficient collision detection
- Object pooling for projectiles
- Optimized rendering pipeline
- Fixed timestep game loop

## License

This project is open source and available under the MIT License.