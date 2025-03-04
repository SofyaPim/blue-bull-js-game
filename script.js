window.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  //   используется для получения контекста рисования на канвасе. Контекст — это объект, который содержит методы и свойства для рисования на канвасе.   • '2d':  двумерный контекст.
  const ctx = canvas.getContext("2d");
  canvas.width = 1280;
  canvas.height = 720;
  ctx.fillStyle = "white";
  ctx.strokeWidth = "3";
  ctx.strokeStyle = "black";
  ctx.font = "20px Sigmar"
  ctx.textAlign = 'center';
  class Player {
    constructor(game) {
      this.game = game;
      // изначальные координаты центра базового круга игрока
      this.collisionX = this.game.width * 0.5;
      this.collisionY = this.game.height * 0.5;
      this.collisionRadius = 50;
      this.speedX = 0;
      this.speedY = 0;
      this.dx = 0;
      this.dy = 0;
      this.speeedModifier = 5;
      this.spriteWidth = 255;
      this.spriteHeight = 256;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      // top left of sprite
      // координаты верхнего левого угла спрайта
      this.spriteX;
      this.spriteY;
      // изначально конкрейтный спрайт ставим
      this.frameX = 0;
      this.frameY = 5;
      this.image = document.getElementById("bull");
    }
    restart(){
      this.collisionX = this.game.width * 0.5;
      this.collisionY = this.game.height * 0.5;
      this.spriteX = this.collisionX - this.width * 0.5;
      this.spriteY = this.collisionY - this.height * 0.5 - 10;
    }
    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        this.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        this.spriteX,
        this.spriteY,
        this.width,
        this.height
      );
      // кружок для дебага
      if (this.game.debug) {
        context.beginPath();
        context.arc(
          this.collisionX,
          this.collisionY,
          this.collisionRadius,
          0,
          Math.PI * 2
        );
        //сохраняет текущее состояние контекста
        context.save();
        context.globalAlpha = 0.5;
        context.fill();
        // Этот метод восстанавливает предыдущее состояние контекста, что позволяет отменить изменения, сделанные после последнего вызова save().
        context.restore();
        context.stroke();
        // метод  позволяет начать рисовать новую фигуру или линию. без вызова этого метода новые линии будут добавляться к предыдущему пути
        context.beginPath();
        // Этот метод перемещает "перо" в указанную точку (x, y) без рисования линии.  используется для установки начальной точки для следующей линии или фигуры.
        context.moveTo(this.collisionX, this.collisionY);
        // тот метод создает линию от текущей точки (которая была установлена с помощью moveTo() или последнего вызова lineTo()) до указанной точки (this.game.mouse.x, this.game.mouse.y).
        context.lineTo(this.game.mouse.x, this.game.mouse.y);
        context.stroke();
        // рисуем линию до новой точки перемещения  context.beginPath(); context.moveTo(this.collisionX, this.collisionY);context.lineTo(this.game.mouse.x, this.game.mouse.y); context.stroke();
      }
    }
    update() {
      // обновляем стороны (разница между координатами)
      this.dx = this.game.mouse.x - this.collisionX;
      this.dy = this.game.mouse.y - this.collisionY;
      //sprite animation
      const angle = Math.atan2(this.dy, this.dx);
      //установка значения frameY для выбора соответствующего кадра анимации в зависимости от направления движения объекта (от угла).
      if (angle < -2.74 || angle > 2.74) this.frameY = 6;
      else if (angle < -1.96) this.frameY = 7;
      else if (angle < -1.17) this.frameY = 0;
      else if (angle < -0.39) this.frameY = 1;
      else if (angle < 0.39) this.frameY = 2;
      else if (angle < 1.17) this.frameY = 3;
      else if (angle < 1.96) this.frameY = 4;
      else if (angle < 2.74) this.frameY = 5;

      // в качестве аргументов разности координат (this.game.mouse.x - this.collisionX) и возвращает длину гипотенузы, что эквивалентно расстоянию между двумя точками в 2D-пространстве.
      const distance = Math.hypot(this.dy, this.dx);
      if (distance > this.speeedModifier) {
        this.speedX = this.dx / distance || 0;
        this.speedY = this.dy / distance || 0;
      } else {
        this.speedX = 0;
        this.speedY = 0;
      }
      // console.log("this.game.mouse.x", this.game.mouse.x, "this.collisionX", this.collisionX);
      this.collisionX += this.speedX * this.speeedModifier;
      this.collisionY += this.speedY * this.speeedModifier;
      // устанавливаем центр спрайта вниз
      this.spriteX = this.collisionX - this.width * 0.5;
      this.spriteY = this.collisionY - this.height * 0.5 - 10;
      // горизонтальные границы
      if (this.collisionX < this.collisionRadius) {
        this.collisionX = this.collisionRadius;
      } else if (this.collisionX > this.game.width - this.collisionRadius) {
        this.collisionX = this.game.width - this.collisionRadius;
      }
      // вертикальные границы
      if (this.collisionY < this.game.topMargin + this.collisionRadius) {
        this.collisionY = this.game.topMargin + this.collisionRadius;
      } else if (this.collisionY > this.game.height - this.collisionRadius) {
        this.collisionY = this.game.height - this.collisionRadius;
      }
      // устанавливаем растояние между игроком и препятствиями
      this.game.obstacles.forEach((obstacle) => {
        //  [(distance < sumOfRadii), distance, sumOfRadii, dx, dy]
        let [collision, distance, sumOfRadii, dx, dy] =
          this.game.checkCollision(this, obstacle);

        if (collision) {
          // Вычисляем вектор по оси X и Y
          const unit_x = dx / distance;
          const unit_y = dy / distance;
          // Обновляем координаты текущего объекта так, чтобы он находился вне препятствия, сдвигаем объект от препятствия
          this.collisionX = obstacle.collisionX + (sumOfRadii + 1) * unit_x;
          this.collisionY = obstacle.collisionY + (sumOfRadii + 1) * unit_y;
        }
      });
    }
  }
  class Obstacle {
    constructor(game) {
      this.game = game;
      this.collisionX = Math.random() * this.game.width;
      this.collisionY = Math.random() * this.game.height;
      this.collisionRadius = 40;
      this.image = document.getElementById("obstacles");
      this.spriteWidth = 250;
      this.spriteHeight = 250;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      // устанавливаем  центр спрайта
      this.spriteX = this.collisionX - this.width * 0.5;
      this.spriteY = this.collisionY - this.height * 0.5 - 70;
      // берем рандомный фрейм по Х и У
      this.frameX = Math.floor(Math.random() * 4);
      this.frameY = Math.floor(Math.random() * 3);
    }
    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        this.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        this.spriteX,
        this.spriteY,
        this.width,
        this.height
      );
      if (this.game.debug) {
        context.beginPath();
        context.arc(
          this.collisionX,
          this.collisionY,
          this.collisionRadius,
          0,
          Math.PI * 2
        );
        context.save();
        context.globalAlpha = 0.5;
        context.fill();
        context.restore();
        context.stroke();
      }
    }
    update() {}
  }
  class Egg {
    constructor(game) {
      this.game = game;
      this.collisionRadius = 55;
      this.margin = this.collisionRadius * 2;
      // позиционируем яйца с отступами
      this.collisionX =
        this.margin + Math.random() * (this.game.width - this.margin * 2);
      this.collisionY =
        this.game.topMargin +
        Math.random() * (this.game.height - this.game.topMargin - this.margin);
      this.image = document.getElementById("egg");
      this.spriteWidth = 110;
      this.spriteHeight = 135;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.spriteX;
      this.spriteY;
      this.hatchTimer = 0;
      this.hatchInterval = 5000;
      // маркер для вылупления
      this.markedForDeletion = false;
    }
    draw(context) {
      context.drawImage(this.image, this.spriteX, this.spriteY);
      if (this.game.debug) {
        context.beginPath();
        context.arc(
          this.collisionX,
          this.collisionY,
          this.collisionRadius,
          0,
          Math.PI * 2
        );
        context.save();
        context.globalAlpha = 0.5;
        context.fill();
        context.restore();
        context.stroke();
        // метод для отслеживания времени вылупления
        const displayTimer = (this.hatchTimer * 0.001).toFixed(0)
        context.fillText(displayTimer, this.collisionX, this.collisionY - this.collisionRadius * 1.5);
      }
    }
    update(deltaTime) {
      // устанавливаем spriteX и spriteY в центр и вниз спрайта
      this.spriteX = this.collisionX - this.width * 0.5;
      this.spriteY = this.collisionY - this.height * 0.5 - 10;
      // столкновения
      let collisionObject = [this.game.player, ...this.game.obstacles, ...this.game.enemies, ...this.game.hatchlings];
      collisionObject.forEach((object) => {
        let [collision, distance, sumOfRadii, dx, dy] =
          this.game.checkCollision(this, object);
        if (collision) {
          // устанавливаем напрвление смещения +/-
          const unit_x = dx / distance;
          const unit_y = dy / distance;
          this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
          this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
        }
      });
      // вылупление
      if (this.hatchTimer > this.hatchInterval || this.collisionY < this.game.topMargin) {
        this.game.hatchlings.push(new Larva (this.game, this.collisionX, this.collisionY));
        this.markedForDeletion = true;
        this.game.removeGameObjects();
       console.log(this.game.eggs);
        
      } else{
        this.hatchTimer += deltaTime;
      }
    }
  }
  class Larva{
    constructor(game, x, y){
      this.game = game;
      this.collisionX = x;
      this.collisionY = y;
      this.collisionRadius = 30;
      this.image = document.getElementById("larva");
      this.spriteWidth = 150;
      this.spriteHeight = 150;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.spriteX;
      this.spriteY;
      this.speedY = 1 + Math.random();
      this.frameX = 0;
      this.frameY = Math.floor(Math.random() * 2);
    }
    draw(context) {
      context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
      if (this.game.debug) {
        context.beginPath();
        context.arc(
          this.collisionX,
          this.collisionY,
          this.collisionRadius,
          0,
          Math.PI * 2
        );
        context.save();
        context.globalAlpha = 0.5;
        context.fill();
        context.restore();
        context.stroke();
      }
    }
    update() {
      this.collisionY -= this.speedY;
      this.spriteX = this.collisionX - this.width * 0.5;
      this.spriteY = this.collisionY - this.height * 0.5 - 50;
      // ларва в безопасности если достигнет высоты 
      if (this.collisionY < this.game.topMargin / 2) {
       this.markedForDeletion = true;
       this.game.removeGameObjects();
       if(!this.game.gameOver){
         this.game.score++;
       }
       for (let i = 0; i < 3; i++) {
         this.game.particles.push( new Firefly(this.game, this.collisionX, this.collisionY, 'yellow'));       
        
       }

      }
      // столкновение с игроком и препятствиями
      let collisionObject = [this.game.player, ...this.game.obstacles];
      collisionObject.forEach((object) => {
        let [collision, distance, sumOfRadii, dx, dy] =
          this.game.checkCollision(this, object);
        if (collision) {
          // устанавливаем напрвление смещения +/-
          const unit_x = dx / distance;
          const unit_y = dy / distance;
          this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
          this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
        }
      });
        // столкновение с врагами
        this.game.enemies.forEach(enemy => {
          if(this.game.checkCollision(this, enemy)[0]){
            this.markedForDeletion = true;
            this.game.removeGameObjects();
            this.game.lostHatchlings++;
            for (let i = 0; i < 5; i++) {
              this.game.particles.push( new Spark(this.game, this.collisionX, this.collisionY, 'blue'));       
             
            }
     
          }
        });
    }
  }
  class Enemy {
    constructor(game) {
      this.game = game;
      this.collisionRadius = 30;
      this.speedX = Math.random() * 3 + 0.5;
      this.image = document.getElementById("toads");
      this.spriteWidth = 140;
      this.spriteHeight = 260;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.collisionX = this.game.width + this.width + Math.random() * this.game.width * 0.5;
      this.collisionY = this.game.topMargin +  (Math.random() * (this.game.height - this.game.topMargin));
      this.spriteX;
      this.spriteY;
      this.frameX = 0;
      this.frameY = Math.floor(Math.random() * 4);
    }
    draw(context) {
      context.drawImage(this.image,  this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
      if (this.game.debug) {
        context.beginPath();
        context.arc(
          this.collisionX,
          this.collisionY,
          this.collisionRadius,
          0,
          Math.PI * 2
        );
        context.save();
        context.globalAlpha = 0.5;
        context.fill();
        context.restore();
        context.stroke();
      }
    }
    update() {
      this.spriteX = this.collisionX - this.width * 0.5;
      this.spriteY = this.collisionY - this.height + 40;
      this.collisionX -= this.speedX;
      if ((this.spriteX + this.width) < 0 && !this.game.gameOver) {
        this.collisionX = this.game.width + this.width + Math.random() * this.game.width * 0.5;
        this.collisionY = this.game.topMargin +  (Math.random() * (this.game.height - this.game.topMargin));
        this.frameY = Math.floor(Math.random() * 4);
      }
      let collisionObject = [this.game.player, ...this.game.obstacles];
        collisionObject.forEach((object) => {
          let [collision, distance, sumOfRadii, dx, dy] =
            this.game.checkCollision(this, object);
          if (collision) {
            // устанавливаем напрвление смещения +/-
            const unit_x = dx / distance;
            const unit_y = dy / distance;
            this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
            this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
          }
        });
    }
  }
  class Particle {
    constructor(game, x, y, color){
      this.game = game;
      this.collisionX = x;
      this.collisionY = y;
      this.color = color;
      this.radius = Math.floor(Math.random() * 10 + 5);
      this.speedX = Math.random() * 6 - 3;
      this.speedY = Math.random() * 2 + 0.5;
      this.angle = 0;
      this.va = Math.random() * 0.1 + 0.01;
      this.markedForDeletion = false;    
    }
    draw(context){
      context.save();
      context.fillStyle = this.color;
      context.beginPath();
      context.arc(
        this.collisionX,
        this.collisionY,
        this.radius,
        0,
        Math.PI * 2
      );
     
      context.fill();
      context.stroke();
      context.restore();
    }
  }
  class Firefly extends Particle {
    update(){
      this.angle += this.va;
      this.collisionX += Math.cos(this.angle) * this.speedX;
      this.collisionY -= this.speedY;
      if (this.collisionY < 0 - this.radius){
        this.markedForDeletion = true;
        this.game.removeGameObjects();
      }        
    }

  }
  class Spark extends Particle {
    update(){
      this.angle += this.va * 0.5;
      this.collisionX -= Math.cos(this.angle) * this.speedX;
      this.collisionY -=  Math.sin(this.angle) * this.speedY;
      if (this.radius > 0.1) this.radius -= 0.05;
      if (this.radius < 0.2){
        this.markedForDeletion = true;
        this.game.removeGameObjects();
      } 
    }

  }
  class Game {
    constructor(canvas) {
      this.canvas = canvas;
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.topMargin = 260;
      this.debug = true;
      this.player = new Player(this);
      this.fps = 70;
      this.timer = 0;
      this.interval = 1000 / this.fps;
      this.eggTimer = 0;
      this.eggInterval = 500;
      this.numberOfObstacles = 10;
      this.maxEggs = 5;
      this.obstacles = [];
      this.eggs = [];
      this.enemies = [];
      this.hatchlings = [];
      this.particles = [];
      this.gameObjects = [];
      this.score = 0;
      this.winnigScore = 5;
      this.gameOver = false;
      this.lostHatchlings = 0;
      this.mouse = {
        x: this.width * 0.5,
        y: this.height * 0.5,
        pressed: false,
      };
      // event listeners
      canvas.addEventListener("mousedown", (e) => {
        //offsetX, доступное только для чтения, показывает отступ курсора мыши по оси X от края целевого DOM узла.
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
        this.mouse.pressed = true;
      });
      canvas.addEventListener("mouseup", (e) => {
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
        this.mouse.pressed = false;
      });
      canvas.addEventListener("mousemove", (e) => {
        if (this.mouse.pressed) {
          this.mouse.x = e.offsetX;
          this.mouse.y = e.offsetY;
        }
      });
      // вывод данных в дебаг режиме - кружочки, таймеры
    
      window.addEventListener("keydown", (e) => {
        if (e.key == "d") this.debug = !this.debug;
        else if (e.key == "r") this.restart();
      });
    }
    render(context, deltaTime) {
    

      if (this.timer > this.interval) {
        // animate next frame
        ctx.clearRect(0, 0, this.width, this.height); //стираем любое ранее нарисованное содержимое.
        // выносим все сущности в один массив, у всех есть методы draw & update
        this.gameObjects = [this.player, ...this.eggs, ...this.obstacles, ...this.enemies, ...this.hatchlings, ...this.particles ];
        this.gameObjects.sort((a, b) => {
          // Если collisionY у объекта a меньше, чем у объекта b, то a будет располагаться перед b в отсортированном массиве.
          return a.collisionY - b.collisionY;
        });
        this.gameObjects.forEach((object) => {
          object.draw(context);
          object.update(deltaTime);
        });

        this.timer = 0;
      }
      this.timer += deltaTime;
      // edd eggs periodically
      if (this.eggTimer > this.eggInterval && this.eggs.length < this.maxEggs && !this.gameOver) {
        this.addEgg();
        this.eggTimer = 0;
      } else {
        this.eggTimer += deltaTime;
      }
      // выводим данные по личинкам
      context.save();
      context.textAlign = 'left';
      context.fillText('score ' + this.score, 55, 50);
      if(this.debug){
        context.fillText('lost ' + this.score, 55, 90);
      }
      context.restore();
      // сообщенеие о результате
      if(this.score >= this.winnigScore){
        this.gameOver = true;
        context.save();
        context.fillStyle = 'rgba(0,0,0,0.5)';
        context.fillRect(0, 0, this.width, this.height);
        context.fillStyle = 'rgba(256,256,256)';
        context.textAlign = 'center';
        context.shadowOffsetX = 4;
        context.shadowOffsetY = 4;
        context.shadowColor = 'blue'
        let message1;
        let message2;
        if(this.lostHatchlings <= 5){
          // win
          message1 = "Bullseye!!!";
          message2 = "You bullied the bullies!"
        } else {
          // lose
          message1 = "Bullocks!!!";
          message2 = "You lost " + this.lostHatchlings + "!"
        }
        context.font = '70px Sigmar';
        context.fillText(message1, this.width * 0.5, this.height * 0.5 - 50);
        context.font = '40px Sigmar';
        context.fillText(message2, this.width * 0.5, this.height * 0.5 );
        context.fillText("Final score " + this.score + " . Press 'R' to butt heads again!", this.width * 0.5, this.height * 0.5 + 50);
        context.restore();
      }
    }
   
    checkCollision(a, b) {
      // Вычисляем разницу по осям X и Y между центрами объектов a и b
      const dx = a.collisionX - b.collisionX;
      const dy = a.collisionY - b.collisionY;
      const distance = Math.hypot(dy, dx);
      const sumOfRadii = a.collisionRadius + b.collisionRadius;
      // Возвращаем массив 1. Результат проверки столкновения, 2. Расстояние между центрами объектов, 3. Сумму радиусов объектов, 4. разницу по осям X и Y между центрами объектов a и b

      return [distance < sumOfRadii, distance, sumOfRadii, dx, dy];
    }
    addEgg() {
      this.eggs.push(new Egg(this));
    }
    addEnemy() {
      this.enemies.push(new Enemy(this));
    }
    removeGameObjects(){
      this.eggs = this.eggs.filter(object => !object.markedForDeletion);
      this.hatchlings = this.hatchlings.filter(object => !object.markedForDeletion);
      this.particles = this.particles.filter(object => !object.markedForDeletion);
    }
    restart(){
      this.player.restart();
      this.obstacles = [];
      this.eggs = [];
      this.enemies = [];
      this.hatchlings = [];
      this.particles = [];
      this.mouse = {
        x: this.width * 0.5,
        y: this.height * 0.5,
        pressed: false,
      };
      this.score = 0;
      this.lostHatchlings = 0;
      this.gameOver = false;
      this.init();

    }
    init() {

      for (let i = 0; i < 3; i++) {
        this.addEnemy();
        // console.log(this.enemies);
      }
      // чтобы не перекрывали друг друга
      let attempts = 0;
      while (this.obstacles.length < this.numberOfObstacles && attempts < 500) {
        let testObstacle = new Obstacle(this);
        let overlap = false;
        this.obstacles.forEach((obstacle) => {
          const dx = testObstacle.collisionX - obstacle.collisionX;
          const dy = testObstacle.collisionY - obstacle.collisionY;

          const distance = Math.hypot(dy, dx);
          const distanceBuffer = 150;
          const sumOfRadii =
            testObstacle.collisionRadius +
            obstacle.collisionRadius +
            distanceBuffer;
          if (distance < sumOfRadii) {
            overlap = true;
          }
        });
        const margin = testObstacle.collisionRadius * 3;
        if (
          !overlap &&
          testObstacle.spriteX > 0 &&
          testObstacle.spriteX < this.width - testObstacle.width &&
          testObstacle.collisionY > this.topMargin + margin &&
          testObstacle.collisionY < this.height - margin
        ) {
          this.obstacles.push(testObstacle);
        }
        attempts++;
      }

      // for (let i = 0; i < this.numberOfObstacles; i++) {
      //   this.obstacles.push(new Obstacle(this))
      // }
    }
  }
  const game = new Game(canvas);  
  game.init();
  console.log(game);
  let lastTime = 0;
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    game.render(ctx, deltaTime);
    // запросы происходят 60 раз в секунду
    requestAnimationFrame(animate);
     
  }
  animate(0);
});
