import { Player } from './player.js';
import { Orc, Soldier, DragonBoss } from './enemies.js';
import { Physics } from './physics.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1200; this.canvas.height = 600;
        this.player = new Player(100, 450);
        this.enemies = []; this.platforms = []; this.projectiles = []; this.particles = [];
        this.input = { keys: {}, pressed: {}, mouseX: 0, mouseY: 0, mouseDown: false, rightMouseDown: false };
        this.state = 'menu'; this.lt = 0;
        this.setup();
        requestAnimationFrame(t => this.loop(t));
    }
    setup() {
        window.addEventListener('keydown', e => { this.input.keys[e.code] = true; this.input.pressed[e.code] = true; });
        window.addEventListener('keyup', e => this.input.keys[e.code] = false);

        const getMousePos = (e) => {
            const r = this.canvas.getBoundingClientRect();
            return {
                x: (e.clientX - r.left) * (this.canvas.width / r.width),
                y: (e.clientY - r.top) * (this.canvas.height / r.height)
            };
        };

        this.canvas.addEventListener('mousemove', e => {
            const pos = getMousePos(e);
            this.input.mouseX = pos.x;
            this.input.mouseY = pos.y;
        });

        this.canvas.addEventListener('mousedown', e => {
            const pos = getMousePos(e);
            const camX = Math.max(0, this.player.x - 400);
            if (e.button === 0) this.input.mouseDown = true;
            if (e.button === 2) this.teleport(pos.x + camX, pos.y);
        });

        this.canvas.addEventListener('mouseup', e => {
            if (e.button === 0) this.input.mouseDown = false;
        });

        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
        document.getElementById('start-btn').onclick = () => {
            document.getElementById('menu-overlay').style.display = 'none';
            this.state = 'playing'; this.generate();
        };
    }
    generate() {
        this.platforms = [{ x: 0, y: 550, width: 3000, height: 50 }, { x: 400, y: 400, width: 200, height: 20 }, { x: 800, y: 300, width: 250, height: 20 }];
        for (let i = 0; i < 3; i++) this.enemies.push(new Orc(1000 + i * 500, 400), new Soldier(1200 + i * 500, 400));
        this.enemies.push(new DragonBoss(2500, 350));
    }
    fire(tx, ty) {
        if (this.player.cooldowns.fireball <= 0) {
            // Calcula o ângulo em direção ao mouse no mundo
            const angle = Math.atan2(ty - (this.player.y + 20), tx - (this.player.x + 15));
            this.projectiles.push({
                x: this.player.x + 15,
                y: this.player.y + 20,
                vx: Math.cos(angle) * 10,
                vy: Math.sin(angle) * 10,
                r: 8, color: '#ff4500'
            });
            this.player.cooldowns.fireball = 1000; // 1s
        }
    }
    teleport(tx, ty) {
        if (this.player.cooldowns.t <= 0) {
            // Agora o teleporte vai para onde você clicou no MUNDO
            this.player.x = tx - this.player.width / 2;
            this.player.y = ty - this.player.height / 2;
            this.player.cooldowns.t = 1000;
        }
    }
    update(dt) {
        if (this.state !== 'playing') return;

        // Cálculo do deslocamento da câmera (mesma lógica usada no draw)
        const camX = Math.max(0, this.player.x - 400);

        // Coordenadas do mouse convertidas para o mundo
        // Se houver scroll vertical no futuro, somaríamos camY aqui também
        const worldMouseX = this.input.mouseX + camX;
        const worldMouseY = this.input.mouseY;

        if (this.input.pressed['KeyQ']) {
            this.enemies.forEach(en => { if (Math.hypot(en.x - this.player.x, en.y - this.player.y) < 200) en.frozen = 2000; });
            this.input.pressed['KeyQ'] = false;
        }

        if (this.input.mouseDown) this.fire(worldMouseX, worldMouseY);

        this.player.update({ keys: this.input.keys, keyPressed: k => { let v = this.input.pressed[k]; this.input.pressed[k] = false; return v; } }, this.platforms, dt);
        this.enemies.forEach((en, i) => {
            en.update(this.player, this.platforms, dt, this.projectiles);

            // Dano por contato
            if (Physics.checkCollision(this.player, en)) {
                this.player.hp -= 0.5;
            }

            if (en.hp <= 0) this.enemies.splice(i, 1);
        });
        this.projectiles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy || 0; // Move na vertical também
            this.enemies.forEach(en => { if (Physics.checkCollision(p, en)) { en.hp -= 34; this.projectiles.splice(i, 1); } });
        });
        document.getElementById('hp-bar').style.width = this.player.hp + '%';

        // Verificação de Game Over
        if (this.player.hp <= 0) {
            this.state = 'gameOver';
            document.getElementById('gameover-overlay').style.display = 'flex';
        }
    }
    draw() {
        this.ctx.clearRect(0, 0, 1200, 600);
        this.ctx.save();
        this.ctx.translate(-Math.max(0, this.player.x - 400), 0);
        this.platforms.forEach(p => { this.ctx.fillStyle = '#222'; this.ctx.fillRect(p.x, p.y, p.width, p.height); });
        this.player.draw(this.ctx);
        this.enemies.forEach(en => en.draw(this.ctx));
        this.projectiles.forEach(p => { this.ctx.fillStyle = p.color; this.ctx.beginPath(); this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); this.ctx.fill(); });
        this.ctx.restore();
    }
    loop(t) {
        this.update(t - this.lt); this.draw(); this.lt = t;
        requestAnimationFrame(t => this.loop(t));
    }
}
new Game();
