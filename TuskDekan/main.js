let playerName = "";
let startTime = 0;
let gameInterval;
let monsters = [];
let traps = [];
let lives = 5;
let gameTime = 0;
let canvas;
let ctx;
let playerX = 150;
let playerY = 150;
let playerSpeed = 3;
let monsterSpeed = 1;
let monsterCount = 10;

let playerWidth = 50; // Новая ширина персонажа
let playerHeight = 50; // Новая высота персонажа
let monsterWidth = 50; // Новая ширина зомби
let monsterHeight = 50; // Новая высота зомби
let trapWidth = 50; // Новая ширина ловушки
let trapHeight = 50; // Новая высота ловушки

let playerImage = new Image();
playerImage.src = "./Жак.png";

let trapImage = new Image();
trapImage.src = "./Trap.png";

let monsterImage = new Image();
monsterImage.src = "./Zombie.png";


let monsterTimerInterval;
let monsterTimerSeconds = 3;

let trapTimerInterval;
let trapTimerSeconds = 3; 

let keysPressed = {};

document.addEventListener("keydown", function(event) {
  keysPressed[event.key] = true;
});

document.addEventListener("keyup", function(event) {
  delete keysPressed[event.key];
});

let loginScreen = document.getElementById("login-screen");
let gameScreen = document.getElementById("game-screen");
let resultsScreen = document.getElementById("results-screen");

let startGame = function() {
  playerName = document.getElementById("username").value;
  document.getElementById("player-name").textContent = playerName;
  loginScreen.style.display = "none";
  gameScreen.style.display = "block";
  startTime = Date.now();
  gameTime = 0;
  lives = 5;

  canvas = document.getElementById("game-canvas");
  ctx = canvas.getContext("2d");

  gameInterval = setInterval(updateGame, 20);

  generateMonsters();
  generateTraps();

  startTimer();
  startTrapTimer();
};

let startTimer = function() {
  document.getElementById("timer").textContent = monsterTimerSeconds;

  monsterTimerInterval = setInterval(function() {
    monsterTimerSeconds--;
    document.getElementById("timer").textContent = monsterTimerSeconds;

    if (monsterTimerSeconds === 0) {
      generateMonsters();
      monsterTimerSeconds = 3;
    }
  }, 1000);
};

let startTrapTimer = function() {
  trapTimerInterval = setInterval(function() {
    trapTimerSeconds--;

    if (trapTimerSeconds === 0) {
      generateTraps();
      trapTimerSeconds = 5;
    }
  }, 1000);
};

let stopTimer = function() {
  clearInterval(monsterTimerInterval);
  clearInterval(trapTimerInterval);
};

let updateGame = function() {
  clearCanvas();
  updateTime();
  updatePlayer();
  updateMonsters();
  updateTraps();
  drawPlayer();
  checkCollisions();
  if (lives <= 0) {
    endGame();
  }
};

let clearCanvas = function() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

let updateTime = function() {
  const currentTime = new Date();
  document.getElementById("current-time").textContent = currentTime.toLocaleTimeString();
  gameTime = Math.floor((currentTime.getTime() - startTime) / 1000);
  document.getElementById("game-time").textContent = formatTime(gameTime);
};

let formatTime = function(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

let updatePlayer = function() {
  if (!paused) {
    if (keysPressed["ArrowUp"]) playerY -= playerSpeed;
    if (keysPressed["ArrowDown"]) playerY += playerSpeed;
    if (keysPressed["ArrowLeft"]) playerX -= playerSpeed;
    if (keysPressed["ArrowRight"]) playerX += playerSpeed;

    if (playerX < 0) playerX = 0;
    if (playerY < 0) playerY = 0;
    if (playerX > canvas.width - 50) playerX = canvas.width - 50;
    if (playerY > canvas.height - 50) playerY = canvas.height - 50;
  }
};

let updateMonsters = function() {
  for (let monster of monsters) {
    const dx = playerX - monster.x;
    const dy = playerY - monster.y;
    const angle = Math.atan2(dy, dx);
    monster.x += monsterSpeed * Math.cos(angle);
    monster.y += monsterSpeed * Math.sin(angle);

    if (monster.x < 0) monster.x = 0;
    if (monster.y < 0) monster.y = 0;
    if (monster.x > canvas.width - 50) monster.x = canvas.width - 50;
    if (monster.y > canvas.height - 50) monster.y = canvas.height - 50;

    ctx.drawImage(monsterImage, monster.x, monster.y, monster.width, monster.height);
  }
};

let updateTraps = function() {
  for (let trap of traps) {
    ctx.drawImage(trapImage, trap.x, trap.y, trap.width, trap.height);
    ctx.beginPath();
    ctx.moveTo(trap.x + 50, trap.y);
    ctx.closePath();
    ctx.fill();
  }
};

let drawPlayer = function() {
  ctx.drawImage(playerImage, playerX, playerY, 50, 50);
};

let checkCollisions = function() {
  for (let i = 0; i < monsters.length; i++) {
    let monster = monsters[i];
    for (let j = 0; j < traps.length; j++) {
      let trap = traps[j];
      if (monsterCollisionWithTrap(monster, trap)) {
        monsters.splice(i, 1);
        traps.splice(j, 1);
        i--;
        break;
      }
    }
  }

  for (let i = 0; i < monsters.length; i++) {
    let monster = monsters[i];
    if (playerCollision(monster)) {
      lives--;
      document.getElementById("lives").textContent = lives;
      monsters.splice(i, 1);
      i--;
    }
  }

  for (let i = 0; i < traps.length; i++) {
    let trap = traps[i];
    if (playerCollision(trap)) {
      lives--;
      document.getElementById("lives").textContent = lives;
      traps.splice(i, 1);
      i--;
    }
  }
};

let monsterCollisionWithTrap = function(monster, trap) {
  return (
    monster.x < trap.x + 50 &&
    monster.x + 50 > trap.x &&
    monster.y < trap.y + 50 &&
    monster.y + 50 > trap.y
  );
};

let endGame = function() {
  clearInterval(gameInterval);
  stopTimer();
  gameScreen.style.display = "none";
  resultsScreen.style.display = "block";
  document.getElementById("result-time").textContent = formatTime(gameTime);
  const monsterCount = monsters.length;
  const trapCount = traps.length;
  document.getElementById("result-monsters").textContent = monsterCount;
  document.getElementById("result-traps").textContent = trapCount;
  document.getElementById("result-lives").textContent = lives;
};

let restartGame = function() {
  clearInterval(gameInterval);
  gameScreen.style.display = "none";
  resultsScreen.style.display = "none";
  loginScreen.style.display = "block";
  document.getElementById("username").value = "";
  monsters = [];
  traps = [];
  lives = 5;
  gameTime = 0;
  clearCanvas();
};

let generateMonsters = function() {
  for (let i = 0; i < monsterCount; i++) {
    let monsterX = Math.floor(Math.random() * canvas.width);
    let monsterY = Math.floor(Math.random() * canvas.height);
    monsters.push({ x: monsterX, y: monsterY, width: monsterWidth, height: monsterHeight });
  }
};

let generateTraps = function() {
  for (let i = 0; i < 15; i++) {
    let trapX = Math.floor(Math.random() * canvas.width);
    let trapY = Math.floor(Math.random() * canvas.height);
    traps.push({ x: trapX, y: trapY, width: trapWidth, height: trapHeight });
  }
};

let playerCollision = function(object) {
  return (
    playerX < object.x + 50 &&
    playerX + 50 > object.x &&
    playerY < object.y + 50 &&
    playerY + 50 > object.y
  );
};

document.addEventListener("keydown", function(event) {
  if (event.key === "Escape") {
    togglePause();
  } else {
    keysPressed[event.key] = true;
  }
});

document.addEventListener("keyup", function(event) {
  delete keysPressed[event.key];
});

let paused = false;

let togglePause = function() {
  paused = !paused;
  if (paused) {
    clearInterval(gameInterval);
    stopTimer();
  } else {
    gameInterval = setInterval(updateGame, 20);
    startTimer();
    startTrapTimer();
  }
};
