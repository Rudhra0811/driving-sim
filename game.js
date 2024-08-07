const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const menu = document.getElementById('menu');
const gameOverScreen = document.getElementById('gameOverScreen');
const hud = document.getElementById('hud');
const startButton = document.getElementById('startButton');
const instructionsButton = document.getElementById('instructionsButton');
const highScoresButton = document.getElementById('highScoresButton');
const submitScoreButton = document.getElementById('submitScoreButton');
const restartButton = document.getElementById('restartButton');
const menuButton = document.getElementById('menuButton');

const car = {
    x: 400,
    y: 500,
    width: 50,
    height: 80,
    speed: 5,
    dx: 0,
    dy: 0,
    color: 'red',
    fuel: 100,
    image: new Image()
};

car.image.src = 'https://example.com/car.png'; // Replace with actual car image URL

const road = {
    x: 150,
    y: 0,
    width: 500,
    height: canvas.height,
    stripeWidth: 10,
    stripeHeight: 50,
    stripeGap: 30
};

const obstacles = [];
const powerUps = [];
const particles = [];

let score = 0;
let gameOver = false;
let level = 1;
let obstacleSpeed = 2;
let obstacleFrequency = 0.02;
let gameState = 'menu';
let lastTime = 0;
let fuelConsumptionRate = 0.1;
let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

const sounds = {
    background: new Audio('https://example.com/background.mp3'),
    collision: new Audio('https://example.com/collision.mp3'),
    powerUp: new Audio('https://example.com/powerup.mp3'),
    fuelLow: new Audio('https://example.com/fuel_low.mp3')
};

sounds.background.loop = true;

function drawCar() {
    if (car.image.complete) {
        ctx.drawImage(car.image, car.x, car.y, car.width, car.height);
    } else {
        ctx.fillStyle = car.color;
        ctx.fillRect(car.x, car.y, car.width, car.height);
    }
}

function drawRoad() {
    ctx.fillStyle = 'gray';
    ctx.fillRect(road.x, road.y, road.width, road.height);
    
    ctx.fillStyle = 'white';
    for (let y = (road.y % (road.stripeHeight + road.stripeGap)) - (road.stripeHeight + road.stripeGap); 
         y < canvas.height; 
         y += road.stripeHeight + road.stripeGap) {
        ctx.fillRect(road.x + road.width / 2 - road.stripeWidth / 2, y, road.stripeWidth, road.stripeHeight);
    }
}

function createObstacle() {
    const obstacle = {
        x: Math.random() * (road.width - 40) + road.x,
        y: -50,
        width: 40,
        height: 40,
        speed: Math.random() * obstacleSpeed + 1,
        color: colors[Math.floor(Math.random() * colors.length)]
    };
    obstacles.push(obstacle);
}

function createPowerUp() {
    const types = ['speed', 'invincibility', 'fuel'];
    const type = types[Math.floor(Math.random() * types.length)];
    const powerUp = {
        x: Math.random() * (road.width - 30) + road.x,
        y: -30,
        width: 30,
        height: 30,
        speed: 2,
        type: type
    };
    powerUps.push(powerUp);
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function drawPowerUps() {
    powerUps.forEach(powerUp => {
        ctx.fillStyle = powerUp.type === 'speed' ? 'gold' : powerUp.type === 'invincibility' ? 'silver' : 'green';
        ctx.beginPath();
        ctx.arc(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2, powerUp.width / 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

function moveObstacles(deltaTime) {
    obstacles.forEach(obstacle => {
        obstacle.y += obstacle.speed * (deltaTime / 16);
    });
    
    obstacles = obstacles.filter(obstacle => obstacle.y < canvas.height);
}

function movePowerUps(deltaTime) {
    powerUps.forEach(powerUp => {
        powerUp.y += powerUp.speed * (deltaTime / 16);
    });
    
    powerUps = powerUps.filter(powerUp => powerUp.y < canvas.height);
}

function checkCollision() {
    for (let obstacle of obstacles) {
        if (
            car.x < obstacle.x + obstacle.width &&
            car.x + car.width > obstacle.x &&
            car.y < obstacle.y + obstacle.height &&
            car.y + car.height > obstacle.y
        ) {
            sounds.collision.play();
            gameState = 'gameOver';
            showGameOverScreen();
        }
    }

    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        if (
            car.x < powerUp.x + powerUp.width &&
            car.x + car.width > powerUp.x &&
            car.y < powerUp.y + powerUp.height &&
            car.y + car.height > powerUp.y
        ) {
            sounds.powerUp.play();
            if (powerUp.type === 'speed') {
                car.speed += 2;
                setTimeout(() => car.speed -= 2, 5000);
            } else if (powerUp.type === 'invincibility') {
                car.color = 'rgba(255, 255, 255, 0.5)';
                setTimeout(() => car.color = 'red', 5000);
            } else if (powerUp.type === 'fuel') {
                car.fuel = Math.min(car.fuel + 30, 100);
            }
            powerUps.splice(i, 1);
            createParticles(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
        }
    }
}

function moveCar(deltaTime) {
    car.x += car.dx * (deltaTime / 16);
    car.y += car.dy * (deltaTime / 16);

    if (car.x < road.x) car.x = road.x;
    if (car.x + car.width > road.x + road.width) car.x = road.x + road.width - car.width;
    if (car.y < 0) car.y = 0;
    if (car.y + car.height > canvas.height) car.y = canvas.height - car.height;
}

function handleKeyDown(e) {
    if (e.key === 'ArrowRight') car.dx = car.speed;
    if (e.key === 'ArrowLeft') car.dx = -car.speed;
    if (e.key === 'ArrowDown') car.dy = car.speed;
    if (e.key === 'ArrowUp') car.dy = -car.speed;
}

function handleKeyUp(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') car.dx = 0;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') car.dy = 0;
}

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

function drawHUD() {
    hud.innerHTML = `Score: ${score}<br>Level: ${level}<br>Fuel: ${Math.round(car.fuel)}%`;
}

function showGameOverScreen() {
    gameOverScreen.style.display = 'block';
    document.getElementById('finalScore').textContent = `Final Score: ${score}`;
    document.getElementById('finalLevel').textContent = `Level Reached: ${level}`;
}

function restartGame() {
    car.x = 400;
    car.y = 500;
    car.dx = 0;
    car.dy = 0;
    car.color = 'red';
    car.speed = 5;
    car.fuel = 100;
    obstacles.length = 0;
    powerUps.length = 0;
    particles.length = 0;
    score = 0;
    level = 1;
    obstacleSpeed = 2;
    obstacleFrequency = 0.02;
    gameState = 'playing';
    sounds.background.currentTime = 0;
    sounds.background.play();
    gameOverScreen.style.display = 'none';
}

function updateDifficulty() {
    if (score % 1000 === 0) {
        level++;
        obstacleSpeed += 0.5;
        obstacleFrequency += 0.005;
        fuelConsumptionRate += 0.02;
    }
}

function showInstructions() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Instructions', canvas.width / 2, 100);
    ctx.fillText('Use arrow keys to move the car', canvas.width / 2, 150);
    ctx.fillText('Avoid obstacles and collect power-ups', canvas.width / 2, 200);
    ctx.fillText('Gold power-ups: Speed boost', canvas.width / 2, 250);
    ctx.fillText('Silver power-ups: Temporary invincibility', canvas.width / 2, 300);
    ctx.fillText('Green power-ups: Refuel', canvas.width / 2, 350);
    ctx.fillText('Watch your fuel level!', canvas.width / 2, 400);
    ctx.fillText('Press Space to return to menu', canvas.width / 2, 450);
}

function showHighScores() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('High Scores', canvas.width / 2, 100);
    
    highScores.sort((a, b) => b.score - a.score);
    highScores.slice(0, 5).forEach((score, index) => {
        ctx.fillText(`${index + 1}. ${score.name}: ${score.score}`, canvas.width / 2, 150 + index * 50);
    });
    
    ctx.fillText('Press Space to return to menu', canvas.width / 2, 450);
}

function createParticles(x, y) {
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: x,
            y: y,
            size: Math.random() * 5 + 1,
            speedX: Math.random() * 4 - 2,
            speedY: Math.random() * 4 - 2,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            life: 30
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life--;
        
        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    particles.forEach(particle => {
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function consumeFuel(deltaTime) {
    car.fuel -= fuelConsumptionRate * (deltaTime / 16);
    if (car.fuel <= 0) {
        gameState = 'gameOver';
        showGameOverScreen();
    } else if (car.fuel <= 20 && !sounds.fuelLow.playing) {
        sounds.fuelLow.play();
    }
}

function updateGame(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    if (gameState === 'playing') {
        moveCar(deltaTime);
        moveObstacles(deltaTime);
        movePowerUps(deltaTime);
        checkCollision();
        consumeFuel(deltaTime);
        updateDifficulty();
        updateParticles();

        if (Math.random() < obstacleFrequency) {
            createObstacle();
        }

        if (Math.random() < 0.005) {
            createPowerUp();
        }

        score++;
    }

    drawGame();
    requestAnimationFrame(updateGame);
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'menu') {
        menu.style.display = 'block';
        canvas.style.display = 'none';
        hud.style.display = 'none';
    } else if (gameState === 'playing') {
        menu.style.display = 'none';
        canvas.style.display = 'block';
        hud.style.display = 'block';
        drawRoad();
        drawCar();
        drawObstacles();
        drawPowerUps();
        drawParticles();
        drawHUD();
    } else if (gameState === 'instructions') {
        showInstructions();
    } else if (gameState === 'highScores') {
        showHighScores();
    }
}

function startGame() {
    gameState = 'playing';
    restartGame();
    lastTime = performance.now();
    requestAnimationFrame(updateGame);
}

startButton.addEventListener('click', startGame);
instructionsButton.addEventListener('click', () => gameState = 'instructions');
highScoresButton.addEventListener('click', () => gameState = 'highScores');
submitScoreButton.addEventListener('click', () => {
    const name = prompt('Enter your name:');
    if (name) {
        highScores.push({ name, score });
        localStorage.setItem('highScores', JSON.stringify(highScores));
    }
});
restartButton.addEventListener('click', startGame);
menuButton.addEventListener('click', () => {
    gameState = 'menu';
    gameOverScreen.style.display = 'none';
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && (gameState === 'instructions' || gameState === 'highScores')) {
        gameState = 'menu';
    }
});

// Initial setup
drawGame();