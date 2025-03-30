// Game Constants
const GRAVITY = 0.7;
const JUMP_FORCE = -12;
const GROUND_HEIGHT = 350;
const OBSTACLE_SPEED = 6;
const OBSTACLE_MIN_DISTANCE = 300;
const OBSTACLE_MAX_DISTANCE = 500;

// Game Variables
let canvas, ctx;
let player;
let obstacles = [];
let backgroundStars = [];
let score = 0;
let gameOver = false;
let gameStarted = false;
let frameCount = 0;
let lastObstacleX = 0;

// Player Customization
let playerColors = {
    primary: '#4caf50',
    secondary: '#2e7d32',
    outline: '#1b5e20'
};

// DOM Elements
let startScreen;
let gameOverScreen;
let gameUI;
let finalScoreElement;
let scoreElement;
let levelProgressElement;

// Initialize the game when the window loads
window.onload = function() {
    // Get DOM elements
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    startScreen = document.getElementById('start-screen');
    gameOverScreen = document.getElementById('game-over-screen');
    gameUI = document.getElementById('game-ui');
    finalScoreElement = document.getElementById('final-score');
    scoreElement = document.getElementById('score');
    levelProgressElement = document.getElementById('level-progress');
    
    // Set canvas dimensions
    canvas.width = 800;
    canvas.height = 450;
    
    // Setup event listeners
    setupEventListeners();
    
    // Generate background stars
    generateStars();
    
    // Start animation loop
    requestAnimationFrame(gameLoop);
};

// Set up all event listeners for the game
function setupEventListeners() {
    // Start button
    document.getElementById('play-btn').addEventListener('click', function() {
        startScreen.classList.add('hidden');
        gameUI.classList.remove('hidden');
        startGame();
    });
    
    // Customize button
    document.getElementById('customize-btn').addEventListener('click', function() {
        // Cycle through colors
        const colors = ['#4caf50', '#2196f3', '#f44336', '#ffeb3b', '#9c27b0'];
        const currentIndex = colors.indexOf(playerColors.primary);
        const nextIndex = (currentIndex + 1) % colors.length;
        
        playerColors.primary = colors[nextIndex];
        playerColors.secondary = adjustColor(colors[nextIndex], -30);
        playerColors.outline = adjustColor(colors[nextIndex], -50);
    });
    
    // Restart button
    document.getElementById('restart-btn').addEventListener('click', function() {
        gameOverScreen.classList.add('hidden');
        resetGame();
    });
    
    // Keyboard controls
    document.addEventListener('keydown', function(event) {
        // Jump with Space or Up Arrow
        if ((event.code === 'Space' || event.code === 'ArrowUp') && 
            gameStarted && !gameOver) {
            if (!player.jumping) {
                jump();
            }
        }
        
        // Restart with Enter
        if (event.code === 'Enter' && gameOver) {
            gameOverScreen.classList.add('hidden');
            resetGame();
        }
    });
    
    // Mouse/touch controls
    canvas.addEventListener('click', function() {
        if (gameStarted && !gameOver && !player.jumping) {
            jump();
        }
    });
}

// Generate stars for the background
function generateStars() {
    backgroundStars = [];
    for (let i = 0; i < 100; i++) {
        backgroundStars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 0.5 + 0.1
        });
    }
}

// Start the game
function startGame() {
    gameStarted = true;
    
    // Create player
    player = {
        x: 150,
        y: GROUND_HEIGHT,
        width: 40,
        height: 40,
        velocityY: 0,
        jumping: false,
        rotation: 0
    };
    
    // Reset game state
    obstacles = [];
    score = 0;
    gameOver = false;
    frameCount = 0;
    lastObstacleX = canvas.width;
    
    // Update UI
    scoreElement.textContent = score;
    levelProgressElement.style.width = '0%';
}

// Reset the game after game over
function resetGame() {
    startGame();
}

// Make the player jump
function jump() {
    player.velocityY = JUMP_FORCE;
    player.jumping = true;
}

// Adjust a color by a certain amount
function adjustColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Generate a new obstacle
function generateObstacle() {
    const height = Math.random() * 60 + 20;
    const obstacle = {
        x: lastObstacleX + Math.random() * (OBSTACLE_MAX_DISTANCE - OBSTACLE_MIN_DISTANCE) + OBSTACLE_MIN_DISTANCE,
        y: GROUND_HEIGHT - height,
        width: 40,
        height: height,
        passed: false
    };
    
    obstacles.push(obstacle);
    lastObstacleX = obstacle.x;
}

// Check for collisions between player and obstacles
function checkCollisions() {
    for (const obstacle of obstacles) {
        if (
            player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y
        ) {
            gameOver = true;
            finalScoreElement.textContent = `Score: ${score}`;
            gameOverScreen.classList.remove('hidden');
        }
    }
    
    // Check if player hits the ground or ceiling
    if (player.y > GROUND_HEIGHT) {
        player.y = GROUND_HEIGHT;
        player.velocityY = 0;
        player.jumping = false;
    } else if (player.y < 0) {
        player.y = 0;
        player.velocityY = 0;
    }
}

// Update game state
function update() {
    if (!gameStarted || gameOver) return;
    
    frameCount++;
    
    // Update player
    player.velocityY += GRAVITY;
    player.y += player.velocityY;
    player.rotation = player.jumping ? 45 : 0;
    
    // Generate obstacles
    if (frameCount % 60 === 0 || obstacles.length === 0) {
        generateObstacle();
    }
    
    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= OBSTACLE_SPEED;
        
        // Check if obstacle is passed
        if (!obstacles[i].passed && obstacles[i].x + obstacles[i].width < player.x) {
            obstacles[i].passed = true;
            score++;
            scoreElement.textContent = score;
        }
        
        // Remove obstacles that are off-screen
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
        }
    }
    
    // Update background stars
    for (const star of backgroundStars) {
        star.x -= star.speed;
        if (star.x < 0) {
            star.x = canvas.width;
            star.y = Math.random() * canvas.height;
        }
    }
    
    // Update level progress (for visual effect)
    levelProgressElement.style.width = `${Math.min(score, 100)}%`;
    
    // Check for collisions
    checkCollisions();
}

// Render the game
function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#000033';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars
    ctx.fillStyle = 'white';
    for (const star of backgroundStars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw ground
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, GROUND_HEIGHT + player.height, canvas.width, canvas.height - GROUND_HEIGHT - player.height);
    
    // Draw obstacles
    ctx.fillStyle = '#ff5722';
    for (const obstacle of obstacles) {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
    
    // Draw player
    if (gameStarted && !gameOver) {
        ctx.save();
        ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
        ctx.rotate(player.rotation * Math.PI / 180);
        
        // Draw player body
        ctx.fillStyle = playerColors.primary;
