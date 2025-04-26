const ship = document.getElementById("ship");
const scoreElement = document.getElementById("score");
const gameOverElement = document.getElementById("gameOver");

let score = 0;
let gameOver = false;
let shipPosition = { x: window.innerWidth / 2 - 30, y: 60 };

let bullets = [];
let targets = [];

let lastTargetSpawnTime = 0;
const targetSpawnInterval = 2000;

ship.style.left = shipPosition.x + "px";
ship.style.bottom = shipPosition.y + "px";

let movingLeft = false;
let movingRight = false;

document.addEventListener("keydown", (e) => {
    if (gameOver) return;
    if (e.key === "ArrowLeft" || e.key === "a") movingLeft = true;
    if (e.key === "ArrowRight" || e.key === "d") movingRight = true;
    if (e.key === " " && !gameOver) fireBullet();
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a") movingLeft = false;
    if (e.key === "ArrowRight" || e.key === "d") movingRight = false;
});

function moveShip() {
    if (movingLeft && shipPosition.x > 0) shipPosition.x -= 5;
    if (movingRight && shipPosition.x < window.innerWidth - 60) shipPosition.x += 5;
    ship.style.left = shipPosition.x + "px";
}

function checkCollision(elementA, elementB) {
    const rectA = elementA.getBoundingClientRect();
    const rectB = elementB.getBoundingClientRect();

    return (
        rectA.right >= rectB.left &&
        rectA.left <= rectB.right &&
        rectA.bottom >= rectB.top &&
        rectA.top <= rectB.bottom
    );
}

function fireBullet() {
    let bullet = document.createElement("div");
    bullet.classList.add("bullet");
    bullet.style.left = shipPosition.x + 25 + "px"; 
    bullet.style.bottom = shipPosition.y + 50 + "px";
    document.body.appendChild(bullet);

    bullets.push({ element: bullet, position: { x: shipPosition.x + 25, y: shipPosition.y + 50 } });
}

function spawnTarget() {
    let target = document.createElement("div");
    target.classList.add("target");
    target.style.left = Math.random() * (window.innerWidth - 50) + "px";
    target.style.top = "0px";
    document.body.appendChild(target);

    targets.push({ element: target, position: { x: parseInt(target.style.left), y: 0 } });
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        let bullet = bullets[i];
        bullet.position.y += 8;
        bullet.element.style.bottom = bullet.position.y + "px";

        if (bullet.position.y > window.innerHeight) {
            document.body.removeChild(bullet.element);
            bullets.splice(i, 1);
        }
    }
}

function updateTargets() {
    for (let i = targets.length - 1; i >= 0; i--) {
        let target = targets[i];
        target.position.y += 3;
        target.element.style.top = target.position.y + "px";

        if (target.position.y > window.innerHeight) {
            gameOver = true;
            gameOverElement.style.display = "block";
        }
    }
}

function createExplosion(x, y) {
    let explosion = document.createElement("div");
    explosion.style.position = "absolute";
    explosion.style.left = x + "px";
    explosion.style.top = y + "px";
    explosion.style.width = "30px";
    explosion.style.height = "30px";
    explosion.style.borderRadius = "50%";
    explosion.style.backgroundColor = "yellow";
    explosion.style.opacity = "1";
    explosion.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";
    document.body.appendChild(explosion);

    setTimeout(() => {
        explosion.style.opacity = "0";
        explosion.style.transform = "scale(2)";
    }, 10);

    setTimeout(() => {
        document.body.removeChild(explosion);
    }, 600);
}

function checkBulletCollisions() {
    for (let b = bullets.length - 1; b >= 0; b--) {
        let bullet = bullets[b];
        for (let t = targets.length - 1; t >= 0; t--) {
            let target = targets[t];

            if (checkCollision(bullet.element, target.element)) {
                score++;
                scoreElement.textContent = "Scor: " + score;

                createExplosion(target.position.x, target.position.y);

                document.body.removeChild(bullet.element);
                document.body.removeChild(target.element);
                bullets.splice(b, 1);
                targets.splice(t, 1);
                break;
            }
        }
    }
}

function checkShipCollision() {
    const shipRect = ship.getBoundingClientRect();

    for (let i = 0; i < targets.length; i++) {
        const targetRect = targets[i].element.getBoundingClientRect();

        if (
            shipRect.right >= targetRect.left &&
            shipRect.left <= targetRect.right &&
            shipRect.bottom >= targetRect.top &&
            shipRect.top <= targetRect.bottom
        ) {
            createExplosion(shipRect.left + 20, shipRect.top + 20);
            gameOver = true;
            gameOverElement.style.display = "block";
            break;
        }
    }
}

function gameLoop(timestamp) {
    if (!gameOver) {
        moveShip();
        updateBullets();
        updateTargets();
        checkBulletCollisions();
        checkShipCollision();

        if (timestamp - lastTargetSpawnTime > targetSpawnInterval) {
            spawnTarget();
            lastTargetSpawnTime = timestamp;
        }

        requestAnimationFrame(gameLoop);
    }
}

requestAnimationFrame(gameLoop);
