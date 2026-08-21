const hat = "^";
const hole = "O";
const fieldCharacter = "░";
const pathCharacter = "*";

class Player {
  constructor(name, symbol, position) {
    this.name = name;
    this.symbol = symbol;
    this.position = position;
  }

  moveLeft() {
    this.position[0]--; // ลดค่าแกน X = เดินซ้าย
  }

  moveRight() {
    this.position[0]++;
  }

  moveUp() {
    this.position[1]--; // ลดค่าแกน Y = เดินขึ้น
  }

  moveDown() {
    this.position[1]++;
  }
}

class Map {
  constructor(width, height) {
    this.height = height;
    this.width = width;
    this.grid = Array(height).fill().map(() => Array(width).fill(fieldCharacter)); //array ตอนนีั้เป็น empty slots ไม่มีอะไรเลยต่องใส่ .fill() ให้ขึ้นเป็น undefined ไม่งั้นจะไปแมพต่อไม่ได้ แล้วค่อยมาเตจิมค่า  fieldCharacter ทีหลัง
    this.hat = null;
    this.holes = [];
  }

  spawnHatAndHoles() {
    do {
      this.hat = this.randomPosition();
    } while (this.hat[0] === 0 && this.hat[1] === 0); //ถ้าสุ่มจุดหมวกไปซ้ำกับตำแหน่ง index [0,0] จะต้องสุ่มใหม่เพราะทับกับ player

    this.holes = []; //เคลียร์ค่ารอรับการสุ่มใหม่

    while (this.holes.length < 3) {
      let randomHole = this.randomPosition();
      
      if (!this.positionExists(randomHole, this.holes) && 
          !(randomHole[0] === this.hat[0] && randomHole[1] === this.hat[1]) &&
          !(randomHole[0] === 0 && randomHole[1] === 0) &&
          !(randomHole[0] === 0 && randomHole[1] === 1) &&
          !(randomHole[0] === 1 && randomHole[1] === 0)) {
        this.holes.push(randomHole);
      }
    }
  }

  randomPosition() {
    return [
      Math.floor(Math.random() * this.height),
      Math.floor(Math.random() * this.width)
    ];
  }

  positionExists(pos, array) {
    return array.some(p => p[0] === pos[0] && p[1] === pos[1]);
  }

  getCharAt(row, col, player) {
    if (row === player.position[1] && col === player.position[0]) return pathCharacter;
    if (row === this.hat[0] && col === this.hat[1]) return hat;
    if (this.positionExists([row, col], this.holes)) return hole;
    return this.grid[row][col];
  }

  printMap(player) {
    let mapDisplay = "";
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        mapDisplay += this.getCharAt(row, col, player) + " ";
      }
      mapDisplay += "\n";
    }
    console.log(mapDisplay);
  }

  isWalkable(row, col) {
    return row >= 0 && row < this.height && col >= 0 && col < this.width;
  }

  checkGameStatus(player) {
    const row = player.position[1];
    const col = player.position[0];

    // Check out of bounds
    if (!this.isWalkable(row, col)) {
      console.log("🚫 You went out of bounds! Game over.");
      return "lose";
    }

    // Check if fell into hole
    if (this.positionExists([row, col], this.holes)) {
      console.log("💀 You fell into a hole! Game over.");
      return "lose";
    }

    // Check if found hat
    if (row === this.hat[0] && col === this.hat[1]) {
      console.log("🎉 You found the hat! You win!");
      return "win";
    }

    return "continue";
  }
}

// Main Game Loop
const gameMap = new Map(5, 5);
const player = new Player("Hero", pathCharacter, [0, 0]);

gameMap.spawnHatAndHoles();

console.log("🎮 Welcome to Find My Hat!");
console.log("Controls: w(up), s(down), a(left), d(right)\n");

gameMap.printMap(player);

// ใช้ stdin อ่าน input ทีละ character
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let gameStatus = "continue";

function playGame() {
  if (gameStatus !== "continue") {
    rl.close();
    return;
  }

  rl.question("Move (w/a/s/d): ", (input) => {
    const move = input.toLowerCase();

    switch (move) {
      case "w":
        player.moveUp();
        console.clear();
        break;
      case "s":
        player.moveDown();
        console.clear();
        break;
      case "a":
        player.moveLeft();
        console.clear();
        break;
      case "d":
        player.moveRight();
        console.clear();
        break;
      default:
        console.log("Invalid input!");
        console.clear();
        playGame();
        return;
    }

    gameStatus = gameMap.checkGameStatus(player);
    gameMap.printMap(player);
    playGame();
  });
}

playGame();


/* 
1 สร้าง Player class เพื่อเก็บข้อมูลผู้เล่น เช่น ชื่อ, symbol, ตำแหน่ง และสร้าง method เดิน 4 ทิศ (ขึ้น-ลง-ซ้าย-ขวา) เพื่อเปลี่ยนตำแหน่ง

2 สร้าง Map class เพื่อจัดการแผนที่
-สร้าง grid 5x5 ใส่ทางเดินปกติ
-สุ่มตำแหน่ง hat ให้ไม่ซ้ำกับผู้เล่น
-สุ่มตำแหน่ง holes 3 ตัว ให้ไม่ซ้ำกับ hat หรือผู้เล่น

3 แสดงแผนที่ ให้เห็น สร้าง printMap() เพื่อวาด grid ออกมา โดยแต่ละช่องต้องดูว่าเป็นตำแหน่งผู้เล่น hat หรือ hole

4 เวลาผู้เล่น move ต้อง เช็คว่าเดินได้ไหม สร้าง isWalkable() ที่เช็คว่าตำแหน่งใหม่อยู่ในแมพหรือเดินออกนอก

5 เมื่อผู้เล่นเดินแล้ว ต้อง เช็คว่า game จบหรือยัง สร้าง checkGameStatus() ที่ตรวจสอบ:
ถ้าออกนอกแมพ → lose
ถ้าชนหลุม → lose
ถ้าชนหมวก → win
ถ้าไม่เกิดอะไร → ให้เดินต่อ

6 สุดท้าย สร้าง game loop ที่วนทำซ้ำ: แสดงแผนที่ → รับ input → ให้เดิน → เช็คว่าชนอะไร → ถ้าจบเกมก็ออก ถ้ายังไม่จบก็วนใหม่

*/