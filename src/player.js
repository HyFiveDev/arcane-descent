class Player {
    constructor(x, y) {
        this.x = x; this.y = y; this.width = 30; this.height = 48;
        this.velocityX = 0; this.velocityY = 0;
        this.hp = 100; this.mana = 100; this.grounded = false; this.facing = 1;
        this.cooldowns = { fireball: 0, t: 0, q: 0 };
        this.coyoteTime = 0; // Tempo extra para pular após cair
        this.jumpBuffer = 0; // Buffer para pular se apertar antes de tocar o chão
    }
    update(input, platforms, dt) {
        if (this.hurt > 0) this.hurt -= dt;
        if (input.keys['KeyA']) { this.velocityX = -5; this.facing = -1; }
        else if (input.keys['KeyD']) { this.velocityX = 5; this.facing = 1; }
        else this.velocityX *= 0.8;

        if (this.grounded) {
            this.coyoteTime = 150; // 150ms de tolerância
            this.doubleJump = true;
        } else if (this.coyoteTime > 0) {
            this.coyoteTime -= dt;
        }

        if (input.keyPressed('Space')) this.jumpBuffer = 150;
        if (this.jumpBuffer > 0) this.jumpBuffer -= dt;

        // Lógica de Pulo Responsiva
        if (this.jumpBuffer > 0) {
            if (this.grounded || this.coyoteTime > 0) {
                this.velocityY = -12;
                this.grounded = false;
                this.coyoteTime = 0;
                this.jumpBuffer = 0;
            } else if (this.doubleJump) {
                this.velocityY = -12;
                this.doubleJump = false;
                this.jumpBuffer = 0;
            }
        }

        this.x += this.velocityX; this.y += this.velocityY;
        Physics.applyGravity(this);
        Physics.resolvePlatforms(this, platforms);

        Object.keys(this.cooldowns).forEach(k => { if (this.cooldowns[k] > 0) this.cooldowns[k] -= dt; });
    }
    draw(ctx) {
        ctx.save();
        ctx.shadowBlur = 15; ctx.shadowColor = '#8a2be2';
        ctx.fillStyle = this.hurt > 0 ? '#fff' : '#4b0082'; ctx.fillRect(this.x, this.y, this.width, this.height); // Corpo
        ctx.fillStyle = this.hurt > 0 ? '#fff' : '#ffdbac'; ctx.fillRect(this.x + 5, this.y - 10, 20, 20); // Cabeça
        ctx.fillStyle = '#00d4ff'; ctx.fillRect(this.x + (this.facing > 0 ? 18 : 5), this.y - 2, 5, 4); // Olhos
        ctx.restore();
    }
}
