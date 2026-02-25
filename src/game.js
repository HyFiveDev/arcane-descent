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
        this.input = { keys: {}, pressed: {} };
        this.state = 'menu'; this.lt = 0;
        this.setup();
        requestAnimationFrame(t => this.loop(t));
    }
    setup() {
        window.addEventListener('keydown', e => { this.input.keys[e.code] = true; this.input.pressed[e.code] = true; });
        window.addEventListener('keyup', e => this.input.keys[e.code] = false);
        this.canvas.addEventListener('mousedown', e => {
            if (e.button === 0) this.fire();
            if (e.button === 2) this.teleport(e);
        });
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
        document.getElementById('start-btn').onclick = () => {
            document.getElementById('menu-overlay').style.display = 'none';
            this.state = 'playing';
            this.generate();
        };
    }
    generate() {
        this.platforms = [{ x: 0, y: 550, width: 3000, height: 50 }, { x: 400, y: 400, width: 200, height: 20 }, { x: 800, y: 300, width: 250, height: 20 }];
        for (let i = 0; i < 3; i++) this.enemies.push(new Orc(1000 + i * 500, 400), new Soldier(1200 + i * 500, 400));
        this.enemies.push(new DragonBoss(2500, 350));
    }
    fire() {
        if (this.player.cooldowns.f <= 0) {
            this.projectiles.push({ x: this.player.x + 15, y: this.player.y + 20, vx: this.player.facing * 10, vy: 0, r: 8, color: '#ff4500' });
            this.player.cooldowns.f = 300;
        }
    }
    teleport(e) {
        if (this.player.cooldowns.t <= 0) {
            const r = this.canvas.getBoundingClientRect();
            this.player.x = e.clientX - r.left; this.player.y = e.clientY - r.top;
            this.player.cooldowns.t = 1000;
        }
    }
    update(dt) {
        if (this.state !== 'playing') return;
        if (this.input.pressed['KeyQ']) {
            this.enemies.forEach(en => { if (Math.hypot(en.x - this.player.x, en.y - this.player.y) < 200) en.frozen = 2000; });
            this.input.pressed['KeyQ'] = false;
        }
        this.player.update({ keys: this.input.keys, keyPressed: k => { let v = this.input.pressed[k]; this.input.pressed[k] = false; return v; } }, this.platforms, dt);
        this.enemies.forEach((en, i) => {
            en.update(this.player, this.platforms, dt, this.projectiles);
            if (en.hp <= 0) this.enemies.splice(i, 1);
        });
        this.projectiles.forEach((p, i) => {
            p.x += p.vx;
            this.enemies.forEach(en => { if (Physics.checkCollision(p, en)) { en.hp -= 34; this.projectiles.splice(i, 1); } });
        });
        document.getElementById('hp-bar').style.width = this.player.hp + '%';
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
