const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const car = {
    x: 400,
    y: 300,
    width: 50,
    height: 80,
    speed: 5,
    dx: 0,
    dy: 0
};

function drawCar() {
    ctx.fillStyle = 'red';
    ctx.fillRect(car.x, car.y, car.width, car.height);
}

function moveCar() {
    car.x += car.dx;
    car.y += car.dy;

    // Keep the car within the canvas
    if (car.x < 0) car.x = 0;
    if (car.x + car.width > canvas.width) car.x = canvas.width - car.width;
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

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    moveCar();
    drawCar();

    requestAnimationFrame(gameLoop);
}

gameLoop();