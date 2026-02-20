//1. Project Setup
// Html->canvas, javascript ->references,
// canvas set (width,height,background-color)
//obtain the context
//2. Player
//3. FAlling , gravity
//4. Movement->optimize
//5. Platforms
//6. Collision
//7. Multiple Platforms
//8. Scrolling -> plalform
//9. Win situation -> now: Milestone system (endless)
//10. Pitfall -> now: Lives system (3 lives)
//11. [NEW] Endless platform generation
//12. [NEW] HUD (score, lives, speed)
//13. [NEW] Particle effects
//14. [NEW] Progressive difficulty
//15. [NEW] Star collectibles for bonus points


function showStartScreen() {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    context.fillStyle = "rgba(0,0,0,0.85)";
    context.fillRect(0, 0, window.innerWidth, window.innerHeight);

    context.fillStyle = "#FFD700";
    context.font = "bold 72px 'Segoe UI', sans-serif";
    context.textAlign = "center";
    context.shadowColor = "#FF8800";
    context.shadowBlur = 25;
    context.fillText("STARBOUND SPRINT", window.innerWidth / 2, window.innerHeight / 2 - 80);

    context.shadowBlur = 0;
    context.fillStyle = "#ffffff";
    context.font = "26px 'Segoe UI', sans-serif";
    context.fillText("Run • Jump • Collect • Survive", window.innerWidth / 2, window.innerHeight / 2 - 20);

    context.fillStyle = "#88FF88";
    context.font = "22px 'Segoe UI', sans-serif";
    context.fillText("Press SPACE to Start", window.innerWidth / 2, window.innerHeight / 2 + 60);

    gameStart = false;
}


let speed = 7;
let offset = 0;

const backImage = new Image();
backImage.src = "./images/background.png";

const hillsImage = new Image();
hillsImage.src = "./images/hills.png";

const plaformBase = new Image();
plaformBase.src = "./images/platform.png";

const plaformSmall = new Image();
plaformSmall.src = "./images/platformSmallTall.png";

const playerStandRight = new Image();
playerStandRight.src = "./images/spriteStandRight.png";

const playerStandLeft = new Image();
playerStandLeft.src = "./images/spriteStandLeft.png";

const playerRunRight = new Image();
playerRunRight.src = "./images/spriteRunRight.png";

// [FIX] Added left running sprite
const playerRunLeft = new Image();
playerRunLeft.src = "./images/spriteRunLeft.png";

let images = [backImage, hillsImage, plaformBase, plaformSmall, playerStandRight, playerRunRight, playerStandLeft, playerRunLeft];
const totalImages = images.length;
let gameStart = false;
let count = 0;

images.forEach((image) => {
    image.addEventListener("load", () => {
        count++;
    })
})


const gameCanvas = document.querySelector("#gameCanvas");
gameCanvas.width = window.innerWidth;
gameCanvas.height = window.innerHeight;
gameCanvas.style.background = "black";
const context = gameCanvas.getContext("2d");
const gravity = 0.5;
const keys = {
    right: false,
    left: false
}

// [NEW] Game state variables
let lives = 3;
let score = 0;
let distance = 0;
let milestone = 2000;
let milestoneMessage = "";
let milestoneTimer = 0;
let particles = [];
let wasOnGround = false;
let difficultyTimer = 0;
let maxSpeed = 2000;

// [NEW] Stars array for collectibles
let stars = [];
let lastStarWorldX = 0; // track world x for star spawning

// [NEW] Particle class for landing/jump effects
class Particle {
    constructor(x, y, color = "#FFD700") {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() * -4) - 1;
        this.alpha = 1;
        this.size = Math.random() * 6 + 2;
        this.color = color;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2;
        this.alpha -= 0.04;
    }
    draw() {
        context.save();
        context.globalAlpha = Math.max(0, this.alpha);
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
        context.restore();
    }
}

// [NEW] Star class — floating collectibles that give +100 pts each
class Star {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 14;
        this.collected = false;
        this.bobOffset = Math.random() * Math.PI * 2; // random start phase for bobbing
        this.bobTimer = 0;
        this.glowPhase = Math.random() * Math.PI * 2;
    }

    update() {
        this.bobTimer += 0.05;
        this.glowPhase += 0.07;
    }

    draw() {
        if (this.collected) return;

        const bob = Math.sin(this.bobTimer + this.bobOffset) * 6;
        const drawY = this.y + bob;
        const glow = (Math.sin(this.glowPhase) + 1) / 2; // 0 to 1

        context.save();

        // Outer glow
        context.shadowColor = "#FFD700";
        context.shadowBlur = 10 + glow * 15;

        // Draw 5-pointed star shape
        context.fillStyle = `rgba(255, ${Math.floor(200 + glow * 55)}, 0, 1)`;
        context.beginPath();
        const numPoints = 5;
        const outerR = this.radius;
        const innerR = this.radius * 0.45;
        for (let i = 0; i < numPoints * 2; i++) {
            const angle = (i * Math.PI) / numPoints - Math.PI / 2;
            const r = i % 2 === 0 ? outerR : innerR;
            const px = this.x + Math.cos(angle) * r;
            const py = drawY + Math.sin(angle) * r;
            if (i === 0) context.moveTo(px, py);
            else context.lineTo(px, py);
        }
        context.closePath();
        context.fill();

        // White sparkle center
        context.fillStyle = "rgba(255,255,255,0.7)";
        context.beginPath();
        context.arc(this.x, drawY, 4, 0, Math.PI * 2);
        context.fill();

        context.restore();
    }

    // Check collision with player (returns true if collected)
    checkCollect(player) {
        if (this.collected) return false;
        const bob = Math.sin(this.bobTimer + this.bobOffset) * 6;
        const drawY = this.y + bob;

        // Simple AABB against star bounding box
        if (
            player.position.x < this.x + this.radius &&
            player.position.x + player.width > this.x - this.radius &&
            player.position.y < drawY + this.radius &&
            player.position.y + player.height > drawY - this.radius
        ) {
            this.collected = true;
            return true;
        }
        return false;
    }
}

//2. Player
class Player {
    constructor() {
        this.position = {
            x: 100,
            y: 300
        }
        this.velocity = {
            x: 0,
            y: 1
        }
        this.width = 66;
        this.frames = 0;
        this.height = 150;
        this.image = playerStandRight;
        this.cropWidth = 177;
        this.onGround = false;
        this.jumpCount = 0; // [NEW] double jump support
    }
    draw() {
        // context.fillStyle = "black";
        // context.fillRect(this.position.x, this.position.y, this.width, this.height);
        context.drawImage(
            this.image,
            this.cropWidth * this.frames,
            0,
            this.cropWidth,
            400,
            this.position.x,
            this.position.y,
            this.width,
            this.height);
    }
    update() {
        this.frames++;
        if (this.frames > 59 && this.image == playerStandRight)
            this.frames = 0;

        if (this.frames > 29 && this.image == playerRunRight)
            this.frames = 0;

        // [FIX] Reset frames for left running sprite (matches playerRunRight frame count)
        if (this.frames > 29 && this.image == playerRunLeft)
            this.frames = 0;

        if (this.frames > 59 && this.image == playerStandLeft)
            this.frames = 0;

        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;

        //10. Pitfall -> now: Lives system
        if (this.position.y + this.height + this.velocity.y >= window.innerHeight) {
            this.velocity.y = 0;
            loseLife();
        } else {
            this.velocity.y += gravity;
        }

        // [NEW] Track if player just landed (for particles)
        const prevOnGround = this.onGround;
        this.onGround = false; // reset each frame, set in collision
        if (!prevOnGround && this.onGround) {
            spawnLandParticles(this.position.x + this.width / 2, this.position.y + this.height);
        }

        this.draw();
    }
}

class Platform {
    constructor(x, y, image) {
        this.position = {
            x: x,
            y: y
        }
        this.width = image.width;
        this.height = image.height;
        this.image = image;
        this.active = true; // [NEW] for culling off-screen platforms
    }
    draw() {
        // context.fillStyle="red";
        // context.fillRect(this.position.x,this.position.y,this.width,this.height);
        context.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }
    update() {
        this.draw();
    }
}

const player = new Player();
player.draw();

const platform1 = new Platform(200, window.innerHeight - plaformSmall.height, plaformSmall);

//base platform
const basePlaform1 = new Platform(0, window.innerHeight - plaformBase.height, plaformBase);
const basePlaform2 = new Platform(plaformBase.width + 200, window.innerHeight - plaformBase.height, plaformBase);
const basePlaform3 = new Platform(plaformBase.width * 2 + 400, window.innerHeight - plaformBase.height, plaformBase);
const basePlaform4 = new Platform(plaformBase.width * 3 + 600, window.innerHeight - plaformBase.height, plaformBase);

const platforms = [];
platforms.push(platform1, basePlaform1, basePlaform2, basePlaform3, basePlaform4);

// [NEW] Endless platform generation
let lastPlatformX = plaformBase.width * 3 + 600 + plaformBase.width; // track where the last platform ends (world coords)

function generateNextPlatform() {
    // Random gap between 40 and 100 (gets slightly bigger with difficulty)
    const gap = 100 + Math.random() * 60 + Math.min(offset / 3000, 30);
    const newX = lastPlatformX + gap;

    // Alternate between base and small platforms, sometimes two smalls in a row
    const useSmall = Math.random() > 0.4;
    const img = useSmall ? plaformSmall : plaformBase;

    // Random y within reason (not too high, not off screen)
    const minY = window.innerHeight - plaformBase.height - 300;
    const maxY = window.innerHeight - plaformBase.height;
    const y = useSmall ? minY + Math.random() * 300 : maxY;

    const newPlatform = new Platform(newX - offset, y, img);
    platforms.push(newPlatform);

    // [NEW] Chance to spawn a star above new platforms
    // Stars appear ~60% of the time, floating above the platform
    if (Math.random() < 0.6) {
        const starScreenX = newX - offset + img.width / 2;
        const starY = y - 50; // float above the platform top
        stars.push(new Star(starScreenX, starY));
    }

    lastPlatformX = newX + img.width;
}

// [NEW] Spawn landing dust particles
function spawnLandParticles(x, y) {
    for (let i = 0; i < 10; i++) {
        particles.push(new Particle(x, y, "#D2B48C"));
    }
}

// [NEW] Spawn jump particles
function spawnJumpParticles(x, y) {
    for (let i = 0; i < 6; i++) {
        particles.push(new Particle(x, y, "#87CEEB"));
    }
}

// [NEW] Spawn star collect burst particles
function spawnStarParticles(x, y) {
    for (let i = 0; i < 14; i++) {
        particles.push(new Particle(x, y, "#FFD700"));
    }
    // A few white sparks too
    for (let i = 0; i < 6; i++) {
        particles.push(new Particle(x, y, "#FFFFFF"));
    }
}

// [NEW] Lose a life and respawn
function loseLife() {
    lives--;
    if (lives <= 0) {
        // Game over
        showGameOver();
        return;
    }
    // Respawn player at current visible position
    player.position.x = 200;
    player.position.y = 100;
    player.velocity.x = 0;
    player.velocity.y = 1;
}

// [NEW] Game over screen
function showGameOver() {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    context.fillStyle = "rgba(0,0,0,0.85)";
    context.fillRect(0, 0, window.innerWidth, window.innerHeight);

    context.fillStyle = "#FF4444";
    context.font = "bold 72px 'Segoe UI', sans-serif";
    context.textAlign = "center";
    context.fillText("GAME OVER", window.innerWidth / 2, window.innerHeight / 2 - 60);

    context.fillStyle = "#ffffff";
    context.font = "32px 'Segoe UI', sans-serif";
    context.fillText(`Distance: ${Math.floor(distance)}m`, window.innerWidth / 2, window.innerHeight / 2);
    context.fillText(`Score: ${score}`, window.innerWidth / 2, window.innerHeight / 2 + 50);

    context.fillStyle = "#FFD700";
    context.font = "24px 'Segoe UI', sans-serif";
    context.fillText("Press SPACE or R to restart", window.innerWidth / 2, window.innerHeight / 2 + 120);

    gameStart = false;
}

// [NEW] Draw professional HUD
function drawHUD() {
    // Background strip
    context.fillStyle = "rgba(0,0,0,0.45)";
    context.fillRect(0, 0, window.innerWidth, 60);

    // Lives
    context.fillStyle = "#FF4444";
    context.font = "bold 22px 'Segoe UI', sans-serif";
    context.textAlign = "left";
    context.fillText("❤️".repeat(lives) + "🖤".repeat(Math.max(0, 3 - lives)), 20, 38);

    // Distance
    context.fillStyle = "#ffffff";
    context.font = "bold 22px 'Segoe UI', sans-serif";
    context.textAlign = "center";
    context.fillText(`📏 ${Math.floor(distance)}m`, window.innerWidth / 2, 38);

    // Score
    context.fillStyle = "#FFD700";
    context.font = "bold 22px 'Segoe UI', sans-serif";
    context.textAlign = "right";
    context.fillText(`⭐ ${score}`, window.innerWidth - 20, 38);

    // Speed indicator
    context.fillStyle = "#88FF88";
    context.font = "14px 'Segoe UI', sans-serif";
    context.textAlign = "right";
    context.fillText(`SPD: ${speed.toFixed(1)}`, window.innerWidth - 20, 58);

    // Milestone message
    if (milestoneTimer > 0) {
        const alpha = Math.min(1, milestoneTimer / 30);
        context.save();
        context.globalAlpha = alpha;
        context.fillStyle = "#FFD700";
        context.font = "bold 48px 'Segoe UI', sans-serif";
        context.textAlign = "center";
        context.shadowColor = "#FF8800";
        context.shadowBlur = 20;
        context.fillText(milestoneMessage, window.innerWidth / 2, window.innerHeight / 2 - 80);
        context.restore();
        milestoneTimer--;
    }
}

// [NEW] Check and trigger milestones
function checkMilestones() {
    if (distance >= milestone) {
        score += 500;
        milestoneMessage = `🏆 ${Math.floor(distance)}m! +500 pts`;
        milestoneTimer = 90;
        milestone += 500; // next milestone
    }
}

// [NEW] Progressive difficulty
function updateDifficulty() {
    difficultyTimer++;
    if (difficultyTimer % 600 === 0 && speed < maxSpeed) {
        speed = Math.min(maxSpeed, speed + 0.5);
    }
}

function animate() {
    if (!gameStart) return;

    requestAnimationFrame(animate);
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // Scrolling background (tiled)
    //8. Scrolling -> platform
    const bgOffset = offset % backImage.width;
    context.drawImage(backImage, -bgOffset, 0);
    if (bgOffset > 0) context.drawImage(backImage, backImage.width - bgOffset, 0);

    const hillsOffset = (offset * 0.6) % hillsImage.width;
    context.drawImage(hillsImage, -hillsOffset, 0);
    if (hillsOffset > 0) context.drawImage(hillsImage, hillsImage.width - hillsOffset, 0);

    //5. Platforms
    // [NEW] Remove platforms that have scrolled far off-screen (left side)
    for (let i = platforms.length - 1; i >= 0; i--) {
        if (platforms[i].position.x + platforms[i].width < -200) {
            platforms.splice(i, 1);
        }
    }

    // [NEW] Remove stars that have scrolled off-screen
    for (let i = stars.length - 1; i >= 0; i--) {
        if (stars[i].x + stars[i].radius < -50) {
            stars.splice(i, 1);
        }
    }

    // [NEW] Generate new platforms ahead as player moves right
    const worldX = offset + window.innerWidth + 200;
    if (worldX > lastPlatformX - 200) {
        generateNextPlatform();
    }

    platforms.forEach((platform) => {
        platform.update();
    })

    // [NEW] Update and draw stars; check collection
    stars.forEach((star) => {
        star.update();
        star.draw();
        if (star.checkCollect(player)) {
            score += 100;
            spawnStarParticles(star.x, star.y);
            milestoneMessage = `⭐ +100!`;
            milestoneTimer = 40; // brief pop-up
        }
    });

    player.update();

    // [NEW] Particles
    particles = particles.filter(p => p.alpha > 0);
    particles.forEach(p => { p.update(); p.draw(); });

    // [NEW] Score from movement
    if (keys.right) score++;
    distance = Math.floor(offset / 10);

    //4. Movement->optimize
    if (keys.right) {
        player.image = playerRunRight;
        player.cropWidth = 340;
        player.width = 127;
    } else if (keys.left) {
        // [FIX] Use playerRunLeft sprite when running left
        player.image = playerRunLeft;
        player.cropWidth = 340; // match your spriteRunLeft.png frame width
        player.width = 127;
    } else {
        player.image = playerStandRight;
        player.cropWidth = 177;
        player.width = 66;
    }

    if (keys.right && player.position.x < 950)
        player.velocity.x = speed;
    else if (keys.left && player.position.x > 250)
        player.velocity.x = -speed;
    else {
        player.velocity.x = 0;
        if (keys.right) {
            offset += speed;
            platforms.forEach((platform) => {
                platform.position.x -= speed;
            })
            // [NEW] Scroll stars with the world
            stars.forEach((star) => {
                star.x -= speed;
            });
        }

        if (keys.left && offset > 0) {
            offset -= speed;
            platforms.forEach((platform) => {
                platform.position.x += speed;
            })
            // [NEW] Scroll stars with the world (backwards)
            stars.forEach((star) => {
                star.x += speed;
            });
        }
    }

    //9. Win situation -> Milestone system (endless)
    checkMilestones();

    // [NEW] Progressive difficulty
    updateDifficulty();

    //6. Collision
    let onGroundThisFrame = false;
    platforms.forEach((platform) => {
        // Side collision
        if (player.position.x + player.width + 1 >= platform.position.x &&
            player.position.x <= platform.position.x + platform.width &&
            player.position.y + player.height >= platform.position.y &&
            player.position.y <= platform.position.y + platform.height
        )
            player.velocity.x = 0;

        // Top collision (landing)
        if ((player.position.y + player.height) <= platform.position.y &&
            (player.position.y + player.height + player.velocity.y) >= platform.position.y
            && player.position.x + player.width >= platform.position.x
            && player.position.x <= platform.position.x + platform.width
        ) {
            if (player.velocity.y > 3 && !player.onGround) {
                // Just landed — spawn dust
                spawnLandParticles(player.position.x + player.width / 2, platform.position.y);
            }
            player.velocity.y = 0;
            player.jumpCount = 0; // [NEW] reset double jump on land
            onGroundThisFrame = true;
        }
    })
    player.onGround = onGroundThisFrame;

    // [NEW] HUD drawn last so it's always on top
    drawHUD();
}

let id = setInterval(check, 100);
function check() {
    if (count == totalImages && gameStart == false) {
        gameStart = true;
        clearInterval(id);
        showStartScreen();

    }
}

addEventListener("keydown", (e) => {
    if (e.key == "ArrowRight")
        keys.right = true;
    if (e.key == "ArrowLeft")
        keys.left = true;
    if (e.key == "ArrowUp") {
        // [NEW] Double jump support
        if (player.jumpCount < 2) {
            player.velocity.y = -12;
            player.jumpCount++;
            spawnJumpParticles(player.position.x + player.width / 2, player.position.y + player.height);
        }
    }
    // [NEW] Restart on game over
    if ((e.key == " " || e.key == "r" || e.key == "R") && !gameStart) {
        restartGame();
    }
})

addEventListener("keyup", (e) => {
    if (e.key == "ArrowRight")
        keys.right = false;
    if (e.key == "ArrowLeft")
        keys.left = false;
})

// [NEW] Full restart
function restartGame() {
    lives = 3;
    score = 0;
    distance = 0;
    offset = 0;
    speed = 150;
    milestone = 2000;
    milestoneTimer = 0;
    particles = [];
    stars = []; // [NEW] clear stars on restart
    difficultyTimer = 0;

    // Reset platforms
    platforms.length = 0;
    platforms.push(
        new Platform(200, window.innerHeight - plaformSmall.height, plaformSmall),
        new Platform(0, window.innerHeight - plaformBase.height, plaformBase),
        new Platform(plaformBase.width + 200, window.innerHeight - plaformBase.height, plaformBase),
        new Platform(plaformBase.width * 2 + 400, window.innerHeight - plaformBase.height, plaformBase),
        new Platform(plaformBase.width * 3 + 600, window.innerHeight - plaformBase.height, plaformBase)
    );
    lastPlatformX = plaformBase.width * 3 + 600 + plaformBase.width;

    player.position.x = 100;
    player.position.y = 300;
    player.velocity.x = 0;
    player.velocity.y = 1;
    player.jumpCount = 0;

    gameStart = true;
    animate();
}
