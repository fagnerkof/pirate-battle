import { Application, Container, Graphics } from 'pixi.js';
import { GameConfig, GameHUDState } from '../types';
import { InputManager } from './InputManager';
import { CollisionManager } from './CollisionManager';

interface Bullet {
  graphics: Graphics;
  vx: number;
  vy: number;
  isPlayer: boolean;
  lifeTime: number;
}

interface Enemy {
  graphics: Graphics;
  type: 'chaser' | 'shooter';
  hp: number;
  x: number;
  y: number;
  radius: number;
  lastShootTime: number;
}

export class GameEngine {
  public app: Application;
  private input: InputManager;
  private config: GameConfig;

  // Controle de Ciclo de Vida do PixiJS (Previne corrida no StrictMode)
  private isInitialized = false;
  private isDestroyed = false;

  // Containers e Entidades
  private gameStage: Container = new Container();
  private player!: Graphics;
  private playerRadius = 18;
  private playerHp = 100;
  private maxPlayerHp = 100;
  private playerRotation = 0;
  private playerSpeed = 3.5;

  private island = { x: 320, y: 220, width: 160, height: 160 };
  private enemies: Enemy[] = [];
  private bullets: Bullet[] = [];

  // Estado e Controle
  private score = 0;
  private timeRemaining: number;
  private isRunning = false;
  private lastSpawnTime = 0;
  private lastFrontShoot = 0;
  private lastSideShoot = 0;

  public onHUDUpdate?: (hud: GameHUDState) => void;

  constructor(config: GameConfig) {
    this.config = config;
    this.timeRemaining = config.sessionTime;
    this.app = new Application();
    this.input = new InputManager();
  }

  public async init(container: HTMLDivElement): Promise<void> {
    await this.app.init({
      width: 800,
      height: 600,
      backgroundColor: 0x1d3557,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    // Se o componente React desmontou enquanto o PixiJS inicializava
    if (this.isDestroyed) {
      this.app.destroy(true, { children: true, texture: true });
      return;
    }

    this.isInitialized = true;
    container.appendChild(this.app.canvas);
    this.app.stage.addChild(this.gameStage);

    this.createIsland();
    this.createPlayer();
    this.setupLoop();
  }

  private createIsland(): void {
    const islandGfx = new Graphics();
    islandGfx.rect(this.island.x, this.island.y, this.island.width, this.island.height);
    islandGfx.fill(0x2a9d8f);
    this.gameStage.addChild(islandGfx);
  }

  private createPlayer(): void {
    this.player = new Graphics();
    this.player.poly([20, 0, -15, -12, -10, 0, -15, 12]);
    this.player.fill(0xe63946);
    this.player.x = 100;
    this.player.y = 300;
    this.gameStage.addChild(this.player);
  }

  private setupLoop(): void {
    this.isRunning = true;
    let accumulatedTime = 0;

    this.app.ticker.add((ticker) => {
      if (!this.isRunning || this.isDestroyed) return;

      const delta = ticker.deltaTime;
      const deltaSec = ticker.deltaMS / 1000;

      accumulatedTime += deltaSec;
      if (accumulatedTime >= 1) {
        this.timeRemaining = Math.max(0, this.timeRemaining - 1);
        accumulatedTime = 0;

        if (this.timeRemaining <= 0) {
          this.endGame('time_up');
          return;
        }
      }

      this.updatePlayer(delta);
      this.updateShooting();
      this.updateSpawns(deltaSec);
      this.updateEnemies(delta);
      this.updateBullets(delta);
      this.checkCollisions();
      this.emitHUD();
    });
  }

  private updatePlayer(delta: number): void {
    if (this.input.isRotateLeft()) this.playerRotation -= 0.06 * delta;
    if (this.input.isRotateRight()) this.playerRotation += 0.06 * delta;
    this.player.rotation = this.playerRotation;

    if (this.input.isForward()) {
      const nextX = this.player.x + Math.cos(this.playerRotation) * this.playerSpeed * delta;
      const nextY = this.player.y + Math.sin(this.playerRotation) * this.playerSpeed * delta;

      const testCircle = { x: nextX, y: nextY, radius: this.playerRadius };
      if (!CollisionManager.checkCircleRect(testCircle, this.island) &&
          nextX > 20 && nextX < 780 && nextY > 20 && nextY < 580) {
        this.player.x = nextX;
        this.player.y = nextY;
      }
    }
  }

  private updateShooting(): void {
    const now = performance.now();

    if (this.input.isShootFront() && now - this.lastFrontShoot > 300) {
      this.fireBullet(this.player.x, this.player.y, this.playerRotation, true);
      this.lastFrontShoot = now;
    }

    if (this.input.isShootSides() && now - this.lastSideShoot > 800) {
      const leftAngle = this.playerRotation - Math.PI / 2;
      const rightAngle = this.playerRotation + Math.PI / 2;

      [-0.15, 0, 0.15].forEach((offset) => {
        this.fireBullet(this.player.x, this.player.y, leftAngle + offset, true);
        this.fireBullet(this.player.x, this.player.y, rightAngle + offset, true);
      });
      this.lastSideShoot = now;
    }
  }

  private fireBullet(x: number, y: number, angle: number, isPlayer: boolean): void {
    const gfx = new Graphics();
    gfx.circle(0, 0, isPlayer ? 4 : 5);
    gfx.fill(isPlayer ? 0xffb703 : 0xf4a261);
    gfx.x = x;
    gfx.y = y;

    const speed = isPlayer ? 8 : 4.5;
    this.bullets.push({
      graphics: gfx,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      isPlayer,
      lifeTime: 0,
    });

    this.gameStage.addChild(gfx);
  }

  private updateSpawns(deltaSec: number): void {
    this.lastSpawnTime += deltaSec;
    if (this.lastSpawnTime >= this.config.spawnInterval) {
      this.lastSpawnTime = 0;
      this.spawnEnemy();
    }
  }

  private spawnEnemy(): void {
    const side = Math.floor(Math.random() * 4);
    let x = 0, y = 0;
    if (side === 0) { x = Math.random() * 800; y = 10; }
    else if (side === 1) { x = 790; y = Math.random() * 600; }
    else if (side === 2) { x = Math.random() * 800; y = 590; }
    else { x = 10; y = Math.random() * 600; }

    const type: 'chaser' | 'shooter' = Math.random() > 0.4 ? 'chaser' : 'shooter';
    const gfx = new Graphics();

    if (type === 'chaser') {
      gfx.poly([12, 0, -10, -10, -10, 10]);
      gfx.fill(0xe76f51);
    } else {
      gfx.rect(-10, -10, 20, 20);
      gfx.fill(0xf4a261);
    }

    gfx.x = x;
    gfx.y = y;

    const enemy: Enemy = {
      graphics: gfx,
      type,
      hp: type === 'chaser' ? 20 : 40,
      x,
      y,
      radius: 12,
      lastShootTime: performance.now(),
    };

    this.enemies.push(enemy);
    this.gameStage.addChild(gfx);
  }

  private updateEnemies(delta: number): void {
    const now = performance.now();

    this.enemies.forEach((enemy) => {
      const angle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
      enemy.graphics.rotation = angle;

      const speed = enemy.type === 'chaser' ? 2.2 : 1.2;
      const nextX = enemy.x + Math.cos(angle) * speed * delta;
      const nextY = enemy.y + Math.sin(angle) * speed * delta;

      if (!CollisionManager.checkCircleRect({ x: nextX, y: nextY, radius: enemy.radius }, this.island)) {
        enemy.x = nextX;
        enemy.y = nextY;
        enemy.graphics.x = nextX;
        enemy.graphics.y = nextY;
      }

      if (enemy.type === 'shooter' && now - enemy.lastShootTime > 2000) {
        this.fireBullet(enemy.x, enemy.y, angle, false);
        enemy.lastShootTime = now;
      }
    });
  }

  private updateBullets(delta: number): void {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.graphics.x += b.vx * delta;
      b.graphics.y += b.vy * delta;
      b.lifeTime += delta;

      const outOfBounds = b.graphics.x < 0 || b.graphics.x > 800 || b.graphics.y < 0 || b.graphics.y > 600;
      const hitIsland = CollisionManager.checkCircleRect({ x: b.graphics.x, y: b.graphics.y, radius: 4 }, this.island);

      if (outOfBounds || hitIsland || b.lifeTime > 180) {
        this.removeBullet(i);
      }
    }
  }

  private checkCollisions(): void {
    for (let bIndex = this.bullets.length - 1; bIndex >= 0; bIndex--) {
      const b = this.bullets[bIndex];
      const bulletCircle = { x: b.graphics.x, y: b.graphics.y, radius: 4 };

      if (b.isPlayer) {
        for (let eIndex = this.enemies.length - 1; eIndex >= 0; eIndex--) {
          const enemy = this.enemies[eIndex];
          if (CollisionManager.checkCircleCircle(bulletCircle, { x: enemy.x, y: enemy.y, radius: enemy.radius })) {
            enemy.hp -= 20;
            this.removeBullet(bIndex);

            if (enemy.hp <= 0) {
              this.score += 1;
              this.removeEnemy(eIndex);
            }
            break;
          }
        }
      } else {
        if (CollisionManager.checkCircleCircle(bulletCircle, { x: this.player.x, y: this.player.y, radius: this.playerRadius })) {
          this.playerHp = Math.max(0, this.playerHp - 10);
          this.removeBullet(bIndex);
          if (this.playerHp <= 0) this.endGame('destroyed');
        }
      }
    }

    for (let eIndex = this.enemies.length - 1; eIndex >= 0; eIndex--) {
      const enemy = this.enemies[eIndex];
      if (CollisionManager.checkCircleCircle({ x: this.player.x, y: this.player.y, radius: this.playerRadius }, { x: enemy.x, y: enemy.y, radius: enemy.radius })) {
        this.playerHp = Math.max(0, this.playerHp - 25);
        this.removeEnemy(eIndex);
        if (this.playerHp <= 0) this.endGame('destroyed');
      }
    }
  }

  private removeBullet(index: number): void {
    if (this.bullets[index]) {
      this.gameStage.removeChild(this.bullets[index].graphics);
      this.bullets[index].graphics.destroy();
      this.bullets.splice(index, 1);
    }
  }

  private removeEnemy(index: number): void {
    if (this.enemies[index]) {
      this.gameStage.removeChild(this.enemies[index].graphics);
      this.enemies[index].graphics.destroy();
      this.enemies.splice(index, 1);
    }
  }

  private emitHUD(): void {
    if (this.onHUDUpdate) {
      this.onHUDUpdate({
        score: this.score,
        timeLeft: this.timeRemaining,
        playerHp: this.playerHp,
        maxHp: this.maxPlayerHp,
        isGameOver: !this.isRunning,
        gameOverReason: this.playerHp <= 0 ? 'destroyed' : this.timeRemaining <= 0 ? 'time_up' : null,
      });
    }
  }

  private endGame(_reason: 'destroyed' | 'time_up'): void {
    this.isRunning = false;
    this.emitHUD();
  }

  public pause(): void {
    this.isRunning = false;
    if (this.app.ticker) this.app.ticker.stop();
  }

  public resume(): void {
    if (this.playerHp > 0 && this.timeRemaining > 0 && !this.isDestroyed) {
      this.isRunning = true;
      if (this.app.ticker) this.app.ticker.start();
    }
  }

  public destroy(): void {
    this.isDestroyed = true;
    this.isRunning = false;
    this.input.destroy();

    // Destrói a aplicação PixiJS somente se ela concluiu a inicialização
    if (this.isInitialized) {
      this.app.destroy(true, { children: true, texture: true });
    }
  }
}