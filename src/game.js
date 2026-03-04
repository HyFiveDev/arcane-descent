

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1200; this.canvas.height = 600;
        this.player = new Player(100, 450);
        this.enemies = []; this.platforms = []; this.projectiles = []; this.particles = [];
        this.input = { keys: {}, pressed: {}, mouseX: 0, mouseY: 0, mouseDown: false };
        this.state = 'menu'; this.lt = 0;
        this.camX = 0;
        this.door = { x: 2200, y: 350, w: 40, h: 200, open: false };
        this.playerNearDoor = false;
        this.showingBossMessage = false;
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
            if (e.button === 0) this.input.mouseDown = true;
            if (e.button === 2) {
                // Teleporte usa a posição ATUAL da câmera
                this.teleport(pos.x + this.camX, pos.y);
            }
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
        this.platforms = [
            { x: 0, y: 550, width: 4000, height: 50 }, // Chão estendido
            { x: 400, y: 400, width: 200, height: 20 },
            { x: 800, y: 300, width: 250, height: 20 },
            { x: 2200, y: 540, width: 200, height: 10 } // Plataforma na porta
        ];
        for (let i = 0; i < 3; i++) this.enemies.push(new Orc(1000 + i * 500, 400), new Soldier(1200 + i * 500, 400));
        this.enemies.push(new DragonBoss(3400, 350)); // Dragão mais longe na sala dele
    }
    fire(tx, ty) {
        if (this.player.cooldowns.fireball <= 0) {
            const angle = Math.atan2(ty - (this.player.y + 20), tx - (this.player.x + 15));
            this.projectiles.push({
                x: this.player.x + 15,
                y: this.player.y + 20,
                vx: Math.cos(angle) * 18,
                vy: Math.sin(angle) * 18,
                r: 8, color: '#ff4500'
            });
            this.player.cooldowns.fireball = 300; // Disparo mais rápido (0.3s)
        }
    }
    teleport(tx, ty) {
        if (this.player.cooldowns.t <= 0) {
            // Se a porta estiver fechada, não permite teleportar para o outro lado
            if (!this.door.open && this.player.x < this.door.x && tx > this.door.x) {
                tx = this.door.x - 21; // Limita o teleporte para antes da porta
            }

            // Efeito de saída
            this.createParticles(this.player.x + 15, this.player.y + 24, '#8a2be2', 20);

            // Move o jogador
            this.player.x = tx - this.player.width / 2;
            this.player.y = ty - this.player.height / 2;

            // Efeito de chegada
            this.createParticles(this.player.x + 15, this.player.y + 24, '#00d4ff', 20);

            this.player.cooldowns.t = 250; // Teleporte rápido (0.25s)
        }
    }
    createParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1.0,
                color: color,
                size: Math.random() * 4 + 2
            });
        }
    }
    update(dt) {
        if (this.state !== 'playing') return;

        // Atualização da Câmera: Segue o jogador mas para nas bordas do nível (3000px)
        // Canvas tem 1200px, então a câmera pode ir de 0 a 1800
        const targetCamX = Math.max(0, Math.min(this.player.x - 600, 2800)); // Limite estendido
        this.camX += (targetCamX - this.camX) * 0.1;

        // Lógica da Porta
        const distToDoor = Math.hypot(this.player.x - this.door.x, this.player.y - (this.door.y + this.door.h / 2));
        this.playerNearDoor = !this.door.open && distToDoor < 150;

        if (this.playerNearDoor && this.input.pressed['KeyE']) {
            this.door.open = true;
            this.createParticles(this.door.x + 20, this.door.y + 100, '#8b4513', 30); // Partículas de madeira
            this.input.pressed['KeyE'] = false;

            // Exibir Bem-vindo ao palácio do dragão
            const msg = document.getElementById('boss-message');
            if (msg) {
                msg.classList.add('show');
                this.showingBossMessage = true;
                setTimeout(() => {
                    msg.classList.remove('show');
                    this.showingBossMessage = false;
                }, 3000); // 3 segundos de exibição
            }
        }

        // Bloqueio físico da porta
        if (!this.door.open && this.player.x + this.player.width > this.door.x && this.player.x < this.door.x + this.door.w) {
            this.player.x = this.door.x - this.player.width;
        }

        const worldMouseX = this.input.mouseX + this.camX;
        const worldMouseY = this.input.mouseY;

        if (this.input.pressed['KeyQ']) {
            this.enemies.forEach(en => {
                if (Math.hypot(en.x - this.player.x, en.y - this.player.y) < 200) {
                    en.frozen = (en instanceof DragonBoss) ? 1000 : 2000;
                }
            });
            this.input.pressed['KeyQ'] = false;
        }

        if (this.input.mouseDown) this.fire(worldMouseX, worldMouseY);

        this.player.update({ keys: this.input.keys, keyPressed: k => { let v = this.input.pressed[k]; this.input.pressed[k] = false; return v; } }, this.platforms, dt);
        // Atualizar Inimigos (loop invertido para remoção segura)
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const en = this.enemies[i];
            en.update(this.player, this.platforms, dt, this.projectiles, this.showingBossMessage);

            // Dano por contato (apenas se não estiver congelado)
            if (Physics.checkCollision(this.player, en) && en.frozen <= 0) {
                this.player.hp -= 0.5;
            }

            if (en.hp <= 0) {
                this.createParticles(en.x + en.width / 2, en.y + en.height / 2, en.color, 15);

                // Se for o Boss, ativa a vitória
                if (en instanceof DragonBoss) {
                    this.state = 'win';
                    const winOverlay = document.getElementById('win-overlay');
                    if (winOverlay) winOverlay.style.display = 'flex';
                }

                this.enemies.splice(i, 1);
            }
        }

        // Atualizar Projéteis
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];

            // Move primeiro
            p.x += p.vx;
            p.y += p.vy || 0;

            let removed = false;

            // Checa colisão após o movimento
            if (p.fromEn) {
                if (Physics.checkCollision(p, this.player)) {
                    this.player.hp -= 10;
                    removed = true;
                }
            } else {
                for (let j = this.enemies.length - 1; j >= 0; j--) {
                    const en = this.enemies[j];
                    if (Physics.checkCollision(p, en)) {
                        en.hp -= 35;
                        en.hurt = 150; // Aumentado para feedback mais visível
                        this.createParticles(p.x, p.y, p.color, 12);
                        removed = true;
                        break;
                    }
                }
            }

            // Remover se colidiu ou saiu do mapa
            if (!removed && (p.x < -500 || p.x > 4500 || p.y < -500 || p.y > 1000)) {
                removed = true;
            }

            if (removed) {
                this.projectiles.splice(i, 1);
            }
        }

        // Atualizar Partículas
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02; // Diminui a vida gradualmente
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // --- RESTAURADO: UI e Game Over ---
        const hpBar = document.getElementById('hp-bar');
        if (hpBar) hpBar.style.width = Math.max(0, this.player.hp) + '%';

        const manaValue = document.getElementById('mana-value');
        if (manaValue) manaValue.innerText = Math.floor(this.player.mana);

        if (this.player.hp <= 0) {
            this.state = 'gameOver';
            const overlay = document.getElementById('gameover-overlay');
            if (overlay) overlay.style.display = 'flex';
        }
    }
    draw() {
        this.ctx.clearRect(0, 0, 1200, 600);
        this.ctx.save();
        this.ctx.translate(-this.camX, 0);

        // Chão e Plataformas
        this.platforms.forEach(p => { this.ctx.fillStyle = '#222'; this.ctx.fillRect(p.x, p.y, p.width, p.height); });

        // Partículas
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        this.ctx.globalAlpha = 1;

        this.player.draw(this.ctx);
        this.enemies.forEach(en => {
            // Só desenha e atualiza o dragão se a porta estiver aberta ou ele estiver longe o suficiente (opcional)
            en.draw(this.ctx);
        });

        // Desenhar Porta
        if (!this.door.open) {
            this.ctx.fillStyle = '#4a2c10'; // Cor de madeira escura
            this.ctx.fillRect(this.door.x, this.door.y, this.door.w, this.door.h);
            this.ctx.strokeStyle = '#ffd700'; // Maçaneta dourada
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(this.door.x + 10, this.door.y + 90, 10, 20);

            if (this.playerNearDoor) {
                this.ctx.fillStyle = 'white';
                this.ctx.font = '20px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('[E] ABRIR PORTA', this.door.x + 20, this.door.y - 20);
            }
        }
        this.projectiles.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.shadowBlur = 10; this.ctx.shadowColor = p.color;
            this.ctx.beginPath(); this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
        this.ctx.restore();
    }
    loop(t) {
        if (!this.lt) this.lt = t; // Inicializa lt no primeiro frame
        const dt = t - this.lt;
        this.update(dt);
        this.draw();
        this.lt = t;
        requestAnimationFrame(t => this.loop(t));
    }
}
new Game();
