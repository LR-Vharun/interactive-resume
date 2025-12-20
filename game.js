// ===========================
// Snake Game
// ===========================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const startBtn = document.getElementById('startGame');

// Game constants
const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;

// Game state
let snake = [];
let food = { x: 0, y: 0 };
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop = null;
let gameRunning = false;
let gameSpeed = 100;

// Colors
const COLORS = {
    snake: '#8b5cf6',
    snakeHead: '#06b6d4',
    food: '#f43f5e',
    grid: 'rgba(255, 255, 255, 0.03)'
};

// Initialize
highScoreElement.textContent = highScore;

// Draw functions
function drawGrid() {
    ctx.fillStyle = '#12121a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 0.5;

    for (let i = 0; i <= TILE_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(canvas.width, i * GRID_SIZE);
        ctx.stroke();
    }
}

function drawSnake() {
    snake.forEach((segment, index) => {
        const isHead = index === 0;

        // Gradient effect for snake body
        const gradient = ctx.createRadialGradient(
            segment.x * GRID_SIZE + GRID_SIZE / 2,
            segment.y * GRID_SIZE + GRID_SIZE / 2,
            0,
            segment.x * GRID_SIZE + GRID_SIZE / 2,
            segment.y * GRID_SIZE + GRID_SIZE / 2,
            GRID_SIZE
        );

        if (isHead) {
            gradient.addColorStop(0, COLORS.snakeHead);
            gradient.addColorStop(1, '#0891b2');
        } else {
            gradient.addColorStop(0, COLORS.snake);
            gradient.addColorStop(1, '#7c3aed');
        }

        ctx.fillStyle = gradient;

        // Rounded rectangle for each segment
        const padding = 2;
        const size = GRID_SIZE - padding * 2;
        const x = segment.x * GRID_SIZE + padding;
        const y = segment.y * GRID_SIZE + padding;
        const radius = 4;

        ctx.beginPath();
        ctx.roundRect(x, y, size, size, radius);
        ctx.fill();

        // Add glow effect for head
        if (isHead) {
            ctx.shadowColor = COLORS.snakeHead;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    });
}

function drawFood() {
    const centerX = food.x * GRID_SIZE + GRID_SIZE / 2;
    const centerY = food.y * GRID_SIZE + GRID_SIZE / 2;

    // Glow effect
    ctx.shadowColor = COLORS.food;
    ctx.shadowBlur = 15;

    // Food circle with gradient
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, GRID_SIZE / 2);
    gradient.addColorStop(0, '#fb7185');
    gradient.addColorStop(1, COLORS.food);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, GRID_SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    // Add sparkle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(centerX - 3, centerY - 3, 2, 0, Math.PI * 2);
    ctx.fill();
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);

    ctx.font = '18px Inter';
    ctx.fillStyle = '#a0a0b0';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText('Press Start to play again', canvas.width / 2, canvas.height / 2 + 50);
}

// Game logic
function spawnFood() {
    do {
        food.x = Math.floor(Math.random() * TILE_COUNT);
        food.y = Math.floor(Math.random() * TILE_COUNT);
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
}

function resetGame() {
    snake = [
        { x: Math.floor(TILE_COUNT / 2), y: Math.floor(TILE_COUNT / 2) }
    ];
    direction = { x: 0, y: 0 };
    nextDirection = { x: 0, y: 0 };
    score = 0;
    gameSpeed = 100;
    scoreElement.textContent = score;
    spawnFood();
}

function update() {
    // Apply next direction
    direction = { ...nextDirection };

    // Don't move if no direction set
    if (direction.x === 0 && direction.y === 0) {
        return true;
    }

    // Calculate new head position
    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    // Check wall collision
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        return false;
    }

    // Check self collision (skip first segment as it will move)
    for (let i = 0; i < snake.length - 1; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            return false;
        }
    }

    // Add new head
    snake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;

        // Increase speed slightly
        if (gameSpeed > 50) {
            gameSpeed -= 2;
        }

        spawnFood();
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }

    return true;
}

function gameFrame() {
    if (!update()) {
        // Game over
        gameRunning = false;

        // Update high score
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            highScoreElement.textContent = highScore;
        }

        drawGrid();
        drawSnake();
        drawFood();
        drawGameOver();

        startBtn.textContent = 'Play Again';
        return;
    }

    drawGrid();
    drawFood();
    drawSnake();

    gameLoop = setTimeout(gameFrame, gameSpeed);
}

function startGame() {
    if (gameRunning) return;

    resetGame();
    gameRunning = true;
    startBtn.textContent = 'Playing...';
    gameFrame();
}

function stopGame() {
    gameRunning = false;
    if (gameLoop) {
        clearTimeout(gameLoop);
        gameLoop = null;
    }
    startBtn.textContent = 'Start Game';
}

// Event listeners
startBtn.addEventListener('click', startGame);

document.addEventListener('keydown', (e) => {
    // Only handle if game modal is open
    if (!document.getElementById('gameModal').classList.contains('active')) return;

    const key = e.key.toLowerCase();

    // Prevent scrolling with arrow keys
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
    }

    // Don't allow 180 degree turns
    switch (key) {
        case 'arrowup':
        case 'w':
            if (direction.y !== 1) {
                nextDirection = { x: 0, y: -1 };
            }
            break;
        case 'arrowdown':
        case 's':
            if (direction.y !== -1) {
                nextDirection = { x: 0, y: 1 };
            }
            break;
        case 'arrowleft':
        case 'a':
            if (direction.x !== 1) {
                nextDirection = { x: -1, y: 0 };
            }
            break;
        case 'arrowright':
        case 'd':
            if (direction.x !== -1) {
                nextDirection = { x: 1, y: 0 };
            }
            break;
    }
});

// Draw initial state
drawGrid();
ctx.fillStyle = '#a0a0b0';
ctx.font = '18px Inter';
ctx.textAlign = 'center';
ctx.fillText('Click "Start Game" to play!', canvas.width / 2, canvas.height / 2);
