# Starbound Sprint Game

A dynamic 2D endless runner web game built with HTML5 Canvas and Vanilla JavaScript, featuring infinite platform generation, double jumping mechanics, and progressive difficulty.

🎮 **[Play Starbound Sprint Game](https://ayushgupta-7.github.io/Starbound-Sprint-Game/)**

## Overview

**Starbound Sprint** is an endless runner game where players navigate a character across floating platforms while avoiding pitfalls. The objective is to survive as long as possible, travel the maximum distance, and accumulate points by running and collecting stars. As the game progresses, the speed increases, adding to the challenge.

## Features

- **Endless Platform Generation:** Platforms dynamically spawn as the player progresses.
- **Advanced Movement:** Smooth left and right running, jumping, and double-jumping mechanics.
- **Collision Detection:** AABB collision for accurate platform interaction and collectible gathering.
- **Lives System:** Players start with 3 lives and respawn upon falling, until all lives are depleted.
- **Collectibles:** Floating stars can be collected for bonus points (+100).
- **Progressive Difficulty:** The game speed gradually increases over time to challenge the player.
- **Milestone System:** Reach distance milestones for bonus point rewards (+500).
- **Particle Effects:** Visual polish with landing dust, jump sparks, and star collection bursts.
- **Animations:** Sprite-based player animations and parallax scrolling backgrounds.
- **Professional HUD:** On-screen display for score, lives, distance, and current speed.
- **Game State Management:** Start screen, game over screen, and seamless restart functionality.

## Gameplay

- **Objective:** Survive as long as possible, jump across gaps, and collect stars to maximize your score.
- **Player Actions:** Move horizontally and use timing to jump or double-jump between platforms.
- **Scoring:** Points are earned by moving forward, collecting stars, and reaching distance milestones.
- **Obstacles:** Falling into the gaps between platforms will cost you a life.
- **Losing Conditions:** The game ends when all 3 lives are lost.

## Controls

| Control | Action | Key |
| :--- | :--- | :--- |
| Move Right | Run to the right | `ArrowRight` |
| Move Left | Run to the left | `ArrowLeft` |
| Jump | Jump / Double Jump | `ArrowUp` |
| Start / Restart | Begin or Restart game | `Space` or `R` |

## Tech Stack

| Technology | Purpose | Usage |
| :--- | :--- | :--- |
| **HTML5** | Structure & Rendering | Utilizes the `<canvas>` element for all game rendering. |
| **JavaScript (Vanilla)** | Game Logic | Handles the game loop, physics, collisions, state, and entities. |
| **CSS (Vanilla)** | Styling | Minimal styling to reset margins and set canvas background. |

## How to Run Locally

Since this is a client-side web game, no complex setup, build steps, or servers are required.

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari).

### Run
1. Clone the repository:
   ```bash
   git clone https://github.com/AyushGupta-7/Starbound-Sprint-Game.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Starbound-Sprint-Game
   ```
3. Open `index.html` directly in your web browser. You can do this by double-clicking the file in your file explorer.

## Project Structure

```text
Starbound-Sprint-Game/
├── images/             # Game assets (sprites, background, platforms)
├── js/
│   └── script.js       # Main game logic and classes
├── index.html          # Entry point and canvas container
└── README.md           # Project documentation
```

## Technical Implementation

- **Game Loop:** Uses `requestAnimationFrame` for a smooth, continuous rendering cycle.
- **Rendering:** Heavily utilizes the HTML5 Canvas API (`drawImage`, `fillRect`, `arc`) to draw sprites and custom shapes.
- **Collision Detection:** Implements Axis-Aligned Bounding Box (AABB) collision checks for player-platform and player-star interactions.
- **Object-Oriented Design:** Uses JavaScript classes (`Player`, `Platform`, `Star`, `Particle`) to manage entities cleanly.
- **Animation:** Achieves character animation by cropping specific frames from sprite sheets based on frame counters. The scrolling background uses modulo arithmetic to create an infinite parallax effect.
- **Particle System:** Custom particle class that handles velocity, gravity, and alpha decay to simulate physics-based visual effects.

## Future Improvements

- Add sound effects for jumping, collecting stars, and game over.
- Add background music.
- Implement a high score saving mechanism using `localStorage`.
- Introduce new enemy types or moving obstacles.
- Add touch controls for mobile device support.

## Learning Highlights

- **JavaScript OOP:** Practical application of ES6 classes and instance management.
- **Game Physics:** Simulating gravity, velocity, and jump mechanics.
- **Collision Math:** Understanding and implementing AABB collision logic.
- **HTML Canvas:** Mastering 2D rendering techniques, including paths, shadows, and alpha blending.
- **State Management:** Handling transitions between start, playing, and game-over states seamlessly.

## Author

**Ayush Gupta**
- GitHub: [https://github.com/AyushGupta-7](https://github.com/AyushGupta-7)
