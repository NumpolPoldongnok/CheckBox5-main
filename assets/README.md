# Assets Directory

This directory contains all the game assets including images, audio files, and other resources.

## Directory Structure

```
assets/
├── images/
│   ├── player.png          # Player character sprite
│   ├── enemies/
│   │   ├── skeleton.png    # Skeleton enemy sprite
│   │   ├── bat.png         # Bat enemy sprite
│   │   ├── zombie.png      # Zombie enemy sprite
│   │   ├── ghost.png       # Ghost enemy sprite
│   │   └── boss.png        # Boss enemy sprite
│   ├── weapons/
│   │   ├── whip.png        # Whip weapon sprite
│   │   ├── missile.png     # Magic missile sprite
│   │   ├── fireball.png    # Fireball sprite
│   │   └── lightning.png   # Lightning effect sprite
│   ├── effects/
│   │   ├── explosion.png   # Explosion effect sprite
│   │   ├── blood.png       # Blood effect sprite
│   │   └── sparkle.png     # Sparkle effect sprite
│   └── ui/
│       ├── heart.png       # Health icon
│       ├── gem.png         # Experience gem icon
│       └── cursor.png      # Custom cursor
└── audio/
    ├── music/
    │   ├── background.mp3  # Background music
    │   └── boss.mp3        # Boss fight music
    └── sfx/
        ├── hit.wav         # Hit sound effect
        ├── death.wav       # Death sound effect
        ├── levelup.wav     # Level up sound effect
        ├── pickup.wav      # Pickup sound effect
        ├── shoot.wav       # Shooting sound effect
        └── explosion.wav   # Explosion sound effect
```

## Asset Guidelines

### Images
- Use PNG format for sprites with transparency
- Recommended sprite sizes: 16x16, 32x32, or 64x64 pixels
- Use consistent pixel art style
- Include proper alpha channels for transparency

### Audio
- Use MP3 format for music files
- Use WAV format for short sound effects
- Keep file sizes reasonable for web deployment
- Normalize audio levels across all files

## Placeholder Implementation

Currently, the game uses simple colored rectangles and shapes as placeholders for sprites. The asset system is designed to be easily replaceable with actual image files when they become available.

## Loading Assets

To add actual image assets:

1. Place image files in the appropriate directories
2. Update the game code to load and use the images instead of drawing shapes
3. Add loading screens and progress indicators as needed

Example code for loading images:
```javascript
const playerImage = new Image();
playerImage.src = 'assets/images/player.png';
```

## Future Enhancements

- Animated sprites with multiple frames
- Particle effect textures
- Background textures and tiles
- UI element graphics
- Sound effect variations
- Dynamic music system