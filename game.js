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
const levelDisplayEl = document.getElementById('level-display');
const musicToggleBtn = document.getElementById('music-toggle');

// --- Configuration ---
const TILE_SIZE = 48;
const PLAYER_SIZE = 40;
const MAP_WIDTH = 15;
const MAP_HEIGHT = 10;

canvas.width = MAP_WIDTH * TILE_SIZE;
canvas.height = MAP_HEIGHT * TILE_SIZE;

// 0: Floor, 1: Wall, 2: Grass, 3: Portal
// 0: Floor, 1: Wall, 2: Grass, 3: Portal
const levels = [
    [
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
    ],
    [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 3, 0, 2, 2, 2, 0, 1, 0, 0, 2, 2, 2, 0, 1],
        [1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 2, 1, 2, 0, 1],
        [1, 0, 0, 0, 0, 2, 0, 1, 0, 1, 2, 1, 2, 0, 1],
        [1, 0, 1, 1, 0, 2, 0, 0, 0, 1, 0, 1, 0, 0, 1],
        [1, 2, 2, 1, 0, 2, 2, 2, 2, 1, 0, 1, 1, 1, 1],
        [1, 0, 2, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1],
        [1, 0, 2, 2, 2, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 2, 0, 0, 0, 2, 2, 2, 0, 0, 0, 3, 1],
        [1, 0, 2, 2, 0, 2, 0, 0, 0, 2, 0, 2, 2, 0, 1],
        [1, 0, 0, 2, 0, 2, 2, 2, 0, 2, 0, 2, 0, 0, 1],
        [1, 2, 0, 2, 0, 2, 0, 0, 0, 2, 0, 2, 0, 2, 1],
        [1, 2, 0, 2, 0, 0, 0, 2, 2, 2, 0, 2, 0, 2, 1],
        [1, 2, 0, 2, 2, 2, 0, 2, 0, 0, 0, 2, 0, 2, 1],
        [1, 2, 0, 0, 0, 2, 0, 2, 2, 2, 2, 2, 0, 2, 1],
        [1, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
];

const enemyData = [
    [], // Level 0 (Tutorial/Safe)
    [   // Level 1
        { x: 5 * TILE_SIZE, y: 7 * TILE_SIZE, vx: 2, vy: 0, range: 4 * TILE_SIZE, startX: 5 * TILE_SIZE, startY: 7 * TILE_SIZE },
        { x: 9 * TILE_SIZE, y: 4 * TILE_SIZE, vx: 0, vy: -2, range: 3 * TILE_SIZE, startX: 9 * TILE_SIZE, startY: 4 * TILE_SIZE }
    ],
    [   // Level 2
        { x: 7 * TILE_SIZE, y: 5 * TILE_SIZE, vx: 3, vy: 0, range: 5 * TILE_SIZE, startX: 7 * TILE_SIZE, startY: 5 * TILE_SIZE },
        { x: 2 * TILE_SIZE, y: 3 * TILE_SIZE, vx: 0, vy: 2, range: 4 * TILE_SIZE, startX: 2 * TILE_SIZE, startY: 3 * TILE_SIZE }
    ]
];

let enemies = [];
let currentLevel = 0;
let map = levels[currentLevel];

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
    targetX: TILE_SIZE * 1.5,
    targetY: TILE_SIZE * 1.5,
    isMoving: false,
    speed: 4,
    vx: 0,
    vy: 0
};

// --- Audio ---
let bgMusic = new Audio('assets/went.mp3');
bgMusic.loop = true;
let isMusicPlaying = false;

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

musicToggleBtn.addEventListener('click', () => {
    isMusicPlaying = !isMusicPlaying;
    if (isMusicPlaying) {
        bgMusic.play().catch(e => console.log("Erro ao tocar música:", e));
        musicToggleBtn.classList.add('active');
    } else {
        bgMusic.pause();
        musicToggleBtn.classList.remove('active');
    }
});

function resetGame() {
    map = levels[currentLevel];
    
    // Posições iniciais dinâmicas
    if (currentLevel === 1) {
        player.x = TILE_SIZE * 13.5;
        player.y = TILE_SIZE * 8.5;
    } else {
        player.x = TILE_SIZE * 1.5;
        player.y = TILE_SIZE * 1.5;
    }
    player.targetX = player.x;
    player.targetY = player.y;
    player.isMoving = false;

    isGameOver = false;
    overlay.classList.add('hidden');
    grassState = 'safe';
    grassTimer = 0;
    
    // Spawn inimigos
    enemies = JSON.parse(JSON.stringify(enemyData[currentLevel]));
    
    if (overlayTitle.innerText.includes("Escapou") || overlayTitle.innerText.includes("Fim")) {
        requestAnimationFrame(gameLoop);
    }
    
    levelDisplayEl.innerText = `Nível: ${currentLevel + 1}`;
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
    
    if (currentLevel < levels.length - 1) {
        currentLevel++;
        resetGame();
    } else {
        isGameOver = true;
        overlayTitle.innerText = "Você Escapou!";
        overlayTitle.style.color = "lightgreen";
        overlayMessage.innerText = "Você atravessou todos os labirintos!";
        overlay.classList.remove('hidden');
    }
}

// --- Logic ---
function update(dt) {
    if (isGameOver) return;

    // Grid Movement Logic
    if (!player.isMoving) {
        let dx = 0;
        let dy = 0;
        if (keys['ArrowUp'] || keys['KeyW']) dy = -1;
        else if (keys['ArrowDown'] || keys['KeyS']) dy = 1;
        else if (keys['ArrowLeft'] || keys['KeyA']) dx = -1;
        else if (keys['ArrowRight'] || keys['KeyD']) dx = 1;

        if (dx !== 0 || dy !== 0) {
            const nextTx = Math.floor(player.x / TILE_SIZE) + dx;
            const nextTy = Math.floor(player.y / TILE_SIZE) + dy;

            if (nextTx >= 0 && nextTx < MAP_WIDTH && nextTy >= 0 && nextTy < MAP_HEIGHT) {
                if (map[nextTy][nextTx] !== 1) { // 1 is wall
                    player.targetX = (nextTx + 0.5) * TILE_SIZE;
                    player.targetY = (nextTy + 0.5) * TILE_SIZE;
                    player.isMoving = true;
                }
            }
        }
    }

    if (player.isMoving) {
        const step = player.speed;
        if (Math.abs(player.x - player.targetX) > step) {
            player.x += Math.sign(player.targetX - player.x) * step;
        } else {
            player.x = player.targetX;
        }

        if (Math.abs(player.y - player.targetY) > step) {
            player.y += Math.sign(player.targetY - player.y) * step;
        } else {
            player.y = player.targetY;
        }

        if (player.x === player.targetX && player.y === player.targetY) {
            player.isMoving = false;
        }
    }

    // Enemy movement
    enemies.forEach(en => {
        en.x += en.vx;
        en.y += en.vy;
        
        const dist = Math.sqrt(Math.pow(en.x - en.startX, 2) + Math.pow(en.y - en.startY, 2));
        if (dist > en.range) {
            en.vx *= -1;
            en.vy *= -1;
        }

        // Collision with player
        const dx = player.x - en.x;
        const dy = player.y - en.y;
        if (Math.sqrt(dx*dx + dy*dy) < 25) {
            die();
        }
    });

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

    // Draw Enemies
    enemies.forEach(en => {
        ctx.save();
        ctx.translate(en.x, en.y);
        
        ctx.shadowBlur = 20;
        ctx.shadowColor = "rgba(255, 0, 84, 0.6)"; // Vermelho perigo
        
        ctx.fillStyle = "rgba(10, 10, 10, 0.9)";
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Olhos vermelhos
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(-5, -2, 2, 0, Math.PI * 2);
        ctx.arc(5, -2, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    });

    // --- Darkness Mask (Fog of War) ---
    // Create darkness overlay
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCtx.fillStyle = 'rgba(0, 0, 0, 0.98)';
    tempCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Cut hole around player
    const visionRadius = TILE_SIZE * 1.8; 
    const grad = tempCtx.createRadialGradient(player.x, player.y, TILE_SIZE * 0.4, player.x, player.y, visionRadius);
    grad.addColorStop(0, 'rgba(0,0,0,1)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    
    tempCtx.globalCompositeOperation = 'destination-out';
    tempCtx.fillStyle = grad;
    tempCtx.beginPath();
    tempCtx.arc(player.x, player.y, visionRadius, 0, Math.PI * 2);
    tempCtx.fill();
    
    ctx.drawImage(tempCanvas, 0, 0);

    // Draw Player (on top of darkness)
    ctx.save();
    ctx.translate(player.x, player.y);
    
    // Draw the PNG asset exactly as it is, slightly larger
    ctx.drawImage(assets.player, -PLAYER_SIZE / 2, -PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE);
    
    ctx.restore();
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
    enemies = JSON.parse(JSON.stringify(enemyData[currentLevel]));
    requestAnimationFrame(gameLoop);
};
