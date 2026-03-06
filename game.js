/**
 * Shadows in the Grass - Core Game Logic
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const deathCountEl = document.getElementById('death-count');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayMessage = document.getElementById('overlay-message');
const restartBtn = document.getElementById('restart-btn');

// --- Configuration ---
const TILE_SIZE = 48;
const PLAYER_SIZE = 32;
const MAP_WIDTH = 15;
const MAP_HEIGHT = 10;

canvas.width = MAP_WIDTH * TILE_SIZE;
canvas.height = MAP_HEIGHT * TILE_SIZE;

// 0: Floor, 1: Wall, 2: Grass, 3: Portal
const map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 2, 2, 2, 0, 0, 0, 0, 3, 1],
    [1, 0, 1, 0, 1, 0, 2, 1, 2, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 2, 2, 2, 2, 1, 2, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 2, 1, 1, 1, 1, 2, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 2, 0, 0, 0, 0, 2, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 2, 2, 2, 0, 0, 0, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// --- Assets ---
const assets = {
    player: new Image(),
    grassSafe: new Image(),
    grassActive: new Image(),
    floor: new Image(),
    wall: new Image(),
    portal: new Image()
};

assets.player.src = 'assets/player.png';
assets.grassSafe.src = 'assets/grass_safe.png';
assets.grassActive.src = 'assets/grass_active.png';
assets.floor.src = 'assets/floor.png';
assets.wall.src = 'assets/wall.png';
assets.portal.src = 'assets/portal.png';

// --- Game State ---
let player = {
    x: TILE_SIZE * 1.5,
    y: TILE_SIZE * 1.5,
    speed: 3,
    vx: 0,
    vy: 0
};

let deaths = 0;
let isGameOver = false;
let grassState = 'safe'; // 'safe', 'warning', 'danger'
let grassTimer = 0;
let lastTime = 0;

const CYCLE = {
    safe: 3000,
    warning: 1000,
    danger: 1500
};

// --- Input Handling ---
const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

restartBtn.addEventListener('click', resetGame);

function resetGame() {
    player.x = TILE_SIZE * 1.5;
    player.y = TILE_SIZE * 1.5;
    isGameOver = false;
    overlay.classList.add('hidden');
    grassState = 'safe';
    grassTimer = 0;
    requestAnimationFrame(gameLoop);
}

function die() {
    if (isGameOver) return;
    isGameOver = true;
    deaths++;
    deathCountEl.innerText = `Mortes: ${deaths}`;
    overlayTitle.innerText = "Fim de Jogo";
    overlayTitle.style.color = "var(--danger-color)";
    overlayMessage.innerText = "As sombras te alcançaram...";
    overlay.classList.remove('hidden');
}

function win() {
    if (isGameOver) return;
    isGameOver = true;
    overlayTitle.innerText = "Você Escapou!";
    overlayTitle.style.color = "lightgreen";
    overlayMessage.innerText = "Você atravessou o labirinto com vida.";
    overlay.classList.remove('hidden');
}

// --- Logic ---
function update(dt) {
    if (isGameOver) return;

    // Movement
    player.vx = 0;
    player.vy = 0;
    if (keys['ArrowUp'] || keys['KeyW']) player.vy = -player.speed;
    if (keys['ArrowDown'] || keys['KeyS']) player.vy = player.speed;
    if (keys['ArrowLeft'] || keys['KeyA']) player.vx = -player.speed;
    if (keys['ArrowRight'] || keys['KeyD']) player.vx = player.speed;

    // Collision detection (simple)
    const nextX = player.x + player.vx;
    const nextY = player.y + player.vy;

    if (!isColliding(nextX, player.y)) player.x = nextX;
    if (!isColliding(player.x, nextY)) player.y = nextY;

    // Grass Cycle logic
    grassTimer += dt;
    if (grassState === 'safe' && grassTimer > CYCLE.safe) {
        grassState = 'warning';
        grassTimer = 0;
    } else if (grassState === 'warning' && grassTimer > CYCLE.warning) {
        grassState = 'danger';
        grassTimer = 0;
    } else if (grassState === 'danger' && grassTimer > CYCLE.danger) {
        grassState = 'safe';
        grassTimer = 0;
    }

    // Check triggers (Danger/Win)
    checkTriggers();
}

function isColliding(x, y) {
    const left = x - PLAYER_SIZE / 2;
    const right = x + PLAYER_SIZE / 2;
    const top = y - PLAYER_SIZE / 2;
    const bottom = y + PLAYER_SIZE / 2;

    const corners = [
        { x: left, y: top },
        { x: right, y: top },
        { x: left, y: bottom },
        { x: right, y: bottom }
    ];

    for (const p of corners) {
        const tx = Math.floor(p.x / TILE_SIZE);
        const ty = Math.floor(p.y / TILE_SIZE);
        
        if (tx < 0 || tx >= MAP_WIDTH || ty < 0 || ty >= MAP_HEIGHT) return true;
        if (map[ty][tx] === 1) return true; // Wall
    }
    return false;
}

function checkTriggers() {
    const tx = Math.floor(player.x / TILE_SIZE);
    const ty = Math.floor(player.y / TILE_SIZE);
    
    const tileType = map[ty][tx];
    
    if (tileType === 2 && grassState === 'danger') {
        die();
    }
    
    if (tileType === 3) {
        win();
    }
}

// --- Drawing ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            const tile = map[y][x];
            const px = x * TILE_SIZE;
            const py = y * TILE_SIZE;

            // Draw floor first
            if (tile !== 1) {
                ctx.drawImage(assets.floor, px, py, TILE_SIZE, TILE_SIZE);
            }

            if (tile === 1) {
                ctx.drawImage(assets.wall, px, py, TILE_SIZE, TILE_SIZE);
            } else if (tile === 2) {
                let img = assets.grassSafe;
                if (grassState === 'warning' || grassState === 'danger') {
                    img = assets.grassActive;
                    
                    // Shake effect in warning/danger
                    ctx.save();
                    if (grassState === 'warning') {
                        ctx.translate(Math.sin(Date.now() / 50) * 2, 0);
                    } else {
                        ctx.translate(Math.sin(Date.now() / 20) * 4, 0);
                    }
                }
                ctx.drawImage(img, px, py, TILE_SIZE, TILE_SIZE);
                if (grassState === 'warning' || grassState === 'danger') ctx.restore();
            } else if (tile === 3) {
                ctx.drawImage(assets.portal, px, py, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    // Draw Player
    ctx.save();
    ctx.translate(player.x, player.y);
    // Slight bobbing animation
    const bob = Math.sin(Date.now() / 200) * 2;
    ctx.drawImage(assets.player, -PLAYER_SIZE / 2, -PLAYER_SIZE / 2 + bob, PLAYER_SIZE, PLAYER_SIZE);
    ctx.restore();

    // Lighting effect (vignette is handled in CSS, but we can add a radial gradient for flashlight feel)
    const gradient = ctx.createRadialGradient(player.x, player.y, 20, player.x, player.y, 200);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function gameLoop(time) {
    if (lastTime === 0) lastTime = time;
    const dt = time - lastTime;
    lastTime = time;

    update(dt);
    draw();

    if (!isGameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// Start
assets.portal.onload = () => {
    requestAnimationFrame(gameLoop);
};
