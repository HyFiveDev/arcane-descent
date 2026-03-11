class Enemy {
    constructor(x, y, w, h, c) {
        this.x = x; this.y = y; this.width = w; this.height = h; this.color = c;
        this.hp = 100; this.maxHp = 100; this.vx = 0; this.velocityY = 0; this.frozen = 0; this.hurt = 0;
        this.activated = false;
        this.activationRange = 600; // Distância para começar a perseguir
    }
    update(platforms, dt) {
        if (this.hurt > 0) this.hurt -= dt;
        if (this.frozen > 0) { this.frozen -= dt; return; }
        this.y += this.velocityY; Physics.applyGravity(this); Physics.resolvePlatforms(this, platforms);
    }
    draw(ctx) {
        let drawColor = this.color;
        if (this.frozen > 0) drawColor = '#00fbff';
        if (this.hurt > 0) drawColor = 'white';

        ctx.fillStyle = drawColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Barra de vida proporcional
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y - 10, this.width * (Math.max(0, this.hp) / this.maxHp), 5);
    }
}

class Orc extends Enemy {
    constructor(x, y) { super(x, y, 40, 60, '#556b2f'); this.speed = 1.5; }
    update(player, platforms, dt) {
        const dist = Math.hypot(player.x - this.x, player.y - this.y);
        if (dist < this.activationRange) this.activated = true;

        if (this.activated && this.frozen <= 0) {
            this.x += (player.x > this.x ? 1 : -1) * this.speed;
        }
        super.update(platforms, dt);
    }
}

class Soldier extends Enemy {
    constructor(x, y) { super(x, y, 30, 50, '#708090'); this.speed = 3.5; }
    update(player, platforms, dt) {
        const dist = Math.hypot(player.x - this.x, player.y - this.y);
        if (dist < this.activationRange) this.activated = true;

        if (this.activated && this.frozen <= 0) {
            this.x += (player.x > this.x ? 1 : -1) * this.speed;
        }
        super.update(platforms, dt);
    }
}

class DragonBoss extends Enemy {
    constructor(x, y) {
        super(x, y, 150, 200, '#8b0000');
        this.hp = 500; this.maxHp = 500; this.atkT = 0; this.clawT = 0;
        this.activationRange = 800;
    }
    update(player, platforms, dt, projectiles, showingMessage) {
        if (showingMessage) { this.atkT = 0; this.clawT = 0; return; }
        
        const dist = Math.hypot((player.x + player.width / 2) - (this.x + this.width / 2), (player.y + player.height / 2) - (this.y + this.height / 2));
        if (dist < this.activationRange) this.activated = true;

        if (!this.activated) return;

        this.atkT += dt;
        this.clawT += dt;

        if (this.clawT > 1000 && this.frozen <= 0 && dist < 220) {
            player.hp -= 15;
            this.clawT = 0;
            player.hurt = 100;
        }

        if (this.atkT > 800 && this.frozen <= 0 && dist < 1200) {
            const angle = Math.atan2((player.y + player.height / 2) - (this.y + 100), (player.x + player.width / 2) - (this.x + 40));
            projectiles.push({
                x: this.x + 40, y: this.y + 100,
                vx: Math.cos(angle) * 14, vy: Math.sin(angle) * 14,
                r: 25, color: '#ff4500', fromEn: true
            });
            this.atkT = 0;
        }
        super.update(platforms, dt);
    }
}
