const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const car = {
    x: 400,
    y: 500,
    width: 50,
    height: 80,
    speed: 5,
    dx: 0,
    dy: 0,
    color: 'red'
};

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

let score = 0;
let gameOver = false;
let level = 1;
let obstacleSpeed = 2;
let obstacleFrequency = 0.02;

const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

function drawCar() {
    ctx.fillStyle = car.color;
    ctx.fillRect(car.x, car.y, car.width, car.height);
    
    // Car details
    ctx.fillStyle = 'black';
    ctx.fillRect(car.x + 10, car.y + 10, 10, 20); // Left window
    ctx.fillRect(car.x + 30, car.y + 10, 10, 20); // Right window
    ctx.fillRect(car.x + 5, car.y + 60, 40, 15); // Rear bumper
    
    // Wheels
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(car.x + 10, car.y + 70, 8, 0, Math.PI * 2);
    ctx.arc(car.x + 40, car.y + 70, 8, 0, Math.PI * 2);
    ctx.fill();
}

function drawRoad() {
    ctx.fillStyle = 'gray';
    ctx.fillRect(road.x, road.y, road.width, road.height);
    
    ctx.fillStyle = 'white';
    for (let y = 0; y < canvas.height; y += road.stripeHeight + road.stripeGap) {
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
    const powerUp = {
        x: Math.random() * (road.width - 30) + road.x,
        y: -30,
        width: 30,
        height: 30,
        speed: 2,
        type: Math.random() < 0.5 ? 'speed' : 'invincibility'
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
        ctx.fillStyle = powerUp.type === 'speed' ? 'gold' : 'silver';
        ctx.beginPath();
        ctx.arc(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2, powerUp.width / 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

function moveObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.y += obstacle.speed;
    });
    
    obstacles = obstacles.filter(obstacle => obstacle.y < canvas.height);
}

function movePowerUps() {
    powerUps.forEach(powerUp => {
        powerUp.y += powerUp.speed;
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
            gameOver = true;
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
            if (powerUp.type === 'speed') {
                car.speed += 2;
                setTimeout(() => car.speed -= 2, 5000);
            } else if (powerUp.type === 'invincibility') {
                car.color = 'rgba(255, 255, 255, 0.5)';
                setTimeout(() => car.color = 'red', 5000);
            }
            powerUps.splice(i, 1);
        }
    }
}

function moveCar() {
    car.x += car.dx;
    car.y += car.dy;

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

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.fillText(`Level: ${level}`, 20, 60);
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
    
    ctx.font = '24px Arial';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 50);
    ctx.fillText(`Level Reached: ${level}`, canvas.width / 2, canvas.height / 2 + 80);
    ctx.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 130);
}

function restartGame() {
    car.x = 400;
    car.y = 500;
    car.dx = 0;
    car.dy = 0;
    car.color = 'red';
    car.speed = 5;
    obstacles.length = 0;
    powerUps.length = 0;
    score = 0;
    level = 1;
    obstacleSpeed = 2;
    obstacleFrequency = 0.02;
    gameOver = false;
}

function updateDifficulty() {
    if (score % 1000 === 0) {
        level++;
        obstacleSpeed += 0.5;
        obstacleFrequency += 0.005;
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameOver) {
        drawRoad();
        moveCar();
        moveObstacles();
        movePowerUps();
        drawObstacles();
        drawPowerUps();
        drawCar();
        checkCollision();
        drawScore();
        
        score++;
        updateDifficulty();
        
        if (Math.random() < obstacleFrequency) {
            createObstacle();
        }
        
        if (Math.random() < 0.001) {
            createPowerUp();
        }
    } else {
        drawGameOver();
    }

    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameOver) {
        restartGame();
    }
});

gameLoop();