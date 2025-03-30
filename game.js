// Game elements
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const restartButton = document.getElementById('restart-btn');

// Game constants
const GRAVITY = 0.5;
const JUMP_FORCE = -10;
const GROUND_HEIGHT = 350;
const OBSTACLE_SPEED = 5;

// Game variables
let player = {
    x: 100,
    y: GROUND_HEIGHT,
    width: 40,
    height: 40,
    velocityY: 0,
    jumping: false,
    color: '#4caf50'
};

let obstacles = [];
let score = 0;
let gameOver = false;
let animationId;

// Event listeners
document.addEventListener('keydown', function(event) {
    if ((event.code === 'Space' || event.code === 'ArrowUp') && !player.jumping && !gameOver) {
        jump();
    }
});

canvas.addEventListener('click', function() {
    if (!player.jumping && !gameOver) {
        jump();
    }
});

restartButton.addEventListener('click', resetGame);

// Game functions
function jump() {
    player.velocityY = JUMP_FORCE;
    player.jumping = true;
}

function createObstacle() {
    const height = Math.random() * 60 + 20;
    const obstacle = {
        x: canvas.width,
        y: GROUND_HEIGHT - height + player.height,
        width: 40,
        height: height,
        counted: false
    };
    obstacles.push(obstacle);
}

function resetGame() {
    player.y = GROUND_HEIGHT;
    player.velocityY = 0;
    player.jumping = false;
    obstacles = [];
    score = 0;
    gameOver = false;
    scoreElement.textContent = score;
    gameOverElement.style.display = 'none';
    
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    gameLoop();
}

function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update player
    player.velocityY += GRAVITY;
    player.y += player.velocityY;
    
    // Ground collision
    if (player.y > GROUND_HEIGHT) {
        player.y = GROUND_HEIGHT;
        player.velocityY = 0;
        player.jumping = false;
    }
    
    // Generate obstacles
    if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - 300) {
        createObstacle();
    }
    
    // Update and draw obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.x -= OBSTACLE_SPEED;
        
        // Remove off-screen obstacles
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(i, 1);
            continue;
        }
        
        // Score when passing obstacle
        if (!obstacle.counted && obstacle.x + obstacle.width < player.x) {
            score++;
            scoreElement.textContent = score;
            obstacle.counted = true;
        }
        
        // Check collision
        if (
            player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y
        ) {
            gameOver = true;
            finalScoreElement.textContent = `Score: ${score}`;
            gameOverElement.style.display = 'flex';
        }
        
        // Draw obstacle
        ctx.fillStyle = '#ff5722';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
    
    // Draw ground
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, GROUND_HEIGHT + player.height, canvas.width, canvas.height - GROUND_HEIGHT - player.height);
    
    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Continue game loop if not game over
    if (!gameOver) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// Start the game
resetGame();
