const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const car = {
    x: 400,
    y: 500,
    width: 50,
    height: 80,
    speed: 5,
    dx: 0,
    dy: 0
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

let score = 0;
let gameOver = false;

function drawCar() {
    ctx.fillStyle = 'red';
    ctx.fillRect(car.x, car.y, car.width, car.height);
    
    // Add car details
    ctx.fillStyle = 'black';
    ctx.fillRect(car.x + 10, car.y + 10, 10, 20); // Left window
    ctx.fillRect(car.x + 30, car.y + 10, 10, 20); // Right window
    ctx.fillRect(car.x + 5, car.y + 60, 40, 15); // Rear bumper
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
        speed: Math.random() * 2 + 1
    };
    obstacles.push(obstacle);
}

function drawObstacles() {
    ctx.fillStyle = 'blue';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function moveObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.y += obstacle.speed;
    });
    
    // Remove obstacles that are off-screen
    obstacles = obstacles.filter(obstacle => obstacle.y < canvas.height);
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
}

function moveCar() {
    car.x += car.dx;
    car.y += car.dy;

    // Keep the car within the road
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
    ctx.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 100);
}

function restartGame() {
    car.x = 400;
    car.y = 500;
    car.dx = 0;
    car.dy = 0;
    obstacles.length = 0;
    score = 0;
    gameOver = false;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameOver) {
        drawRoad();
        moveCar();
        moveObstacles();
        drawObstacles();
        drawCar();
        checkCollision();
        drawScore();
        
        score++;
        
        if (Math.random() < 0.02) {
            createObstacle();
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