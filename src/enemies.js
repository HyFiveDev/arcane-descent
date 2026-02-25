import { Physics } from './physics.js';

class Enemy {
    constructor(x, y, w, h, c) {
        this.x = x; this.y = y; this.width = w; this.height = h; this.color = c;
        this.hp = 100; this.vx = 0; this.velocityY = 0; this.frozen = 0;
    }
    update(platforms, dt) {
        if (this.frozen > 0) { this.frozen -= dt; return; }
        this.y += this.velocityY; Physics.applyGravity(this); Physics.resolvePlatforms(this, platforms);
    }
    draw(ctx) {
        ctx.fillStyle = this.frozen > 0 ? '#00fbff' : this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'red'; ctx.fillRect(this.x, this.y - 10, this.width * (this.hp / 100), 5);
    }
}

export class Orc extends Enemy {
    constructor(x, y) { super(x, y, 40, 60, '#556b2f'); this.speed = 1.5; }
    update(player, platforms, dt) {
        if (this.frozen <= 0) this.x += (player.x > this.x ? 1 : -1) * this.speed;
        super.update(platforms, dt);
    }
}

export class Soldier extends Enemy {
    constructor(x, y) { super(x, y, 30, 50, '#708090'); this.speed = 3.5; }
    update(player, platforms, dt) {
        if (this.frozen <= 0) {
            const dist = Math.abs(player.x - this.x);
            if (dist > 50) this.x += (player.x > this.x ? 1 : -1) * this.speed;
        }
        super.update(platforms, dt);
    }
}

export class DragonBoss extends Enemy {
    constructor(x, y) { super(x, y, 150, 200, '#8b0000'); this.hp = 500; this.atkT = 0; }
    update(player, platforms, dt, projectiles) {
        this.atkT += dt;
        if (this.atkT > 2000 && this.frozen <= 0) {
            projectiles.push({ x: this.x, y: this.y + 50, vx: -5, vy: 0, r: 15, color: '#ff4500', fromEn: true });
            this.atkT = 0;
        }
        super.update(platforms, dt);
    }
}
