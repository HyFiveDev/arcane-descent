

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1200; this.canvas.height = 600;
        this.player = new Player(100, 450);
        this.enemies = []; this.platforms = []; this.projectiles = []; this.particles = [];
        this.ladders = []; this.doors = [];
        this.input = { keys: {}, pressed: {}, mouseX: 0, mouseY: 0, mouseDown: false };
        this.state = 'menu'; this.lt = 0;
        this.camX = 0;
        this.camY = 0;
        this.roomCount = 0;
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
            this.player.cooldowns.fireball = 300;
        }
    }
    teleport(tx, ty) {
        if (this.player.cooldowns.t <= 0) {
            // Posição desejada (centro do jogador no clique)
            let targetX = tx - this.player.width / 2;
            let targetY = ty - this.player.height / 2;

            // Checar se o destino está DENTRO de alguma plataforma preta
            // Se estiver, cancelamos o teleporte para evitar que o jogador fique preso ou saia do mapa
            let insideWall = false;
            const tempPlayer = { x: targetX, y: targetY, width: this.player.width, height: this.player.height };
            
            for (let p of this.platforms) {
                if (Physics.checkCollision(tempPlayer, p)) {
                    insideWall = true;
                    break;
                }
            }

            if (!insideWall) {
                // Efeito de saída
                this.createParticles(this.player.x + 15, this.player.y + 24, '#8a2be2', 20);

                // Move o jogador
                this.player.x = targetX;
                this.player.y = targetY;
                this.player.velocityY = 0;

                // Efeito de chegada
                this.createParticles(this.player.x + 15, this.player.y + 24, '#00d4ff', 20);
                this.player.cooldowns.t = 250;
            } else {
                // Feedback visual de falha (opcional: algumas partículas vermelhas no mouse)
                this.createParticles(tx, ty, '#ff0000', 5);
            }
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
    generate(triggerDoor = null) {
        let offsetX = 0;
        let offsetY = 0;
        let requiredSide = null;

        if (triggerDoor) {
            requiredSide = triggerDoor.side;
            
            // Lógica de Alinhamento:
            // Se a porta estava na Direita (x=29), a nova sala surge à direita (offsetX += width).
            // Precisamos que a porta da Esquerda (x=0) da nova sala se alinhe com o Y da porta antiga.
            if (requiredSide === 'right') offsetX = triggerDoor.x + 20; // +20 para compensar o ajuste do gatilho
            if (requiredSide === 'left') offsetX = triggerDoor.x - (30 * TILE_SIZE);
            if (requiredSide === 'top') offsetY = triggerDoor.y - (15 * TILE_SIZE);
            if (requiredSide === 'bottom') offsetY = triggerDoor.y + 20;
        }

        const roomIndex = (this.roomCount === 0) ? 0 : -1;
        const roomData = RoomManager.generateRoom(roomIndex, offsetX, offsetY, requiredSide);

        // Se houver uma porta de entrada na nova sala que se alinha com a de saída da antiga,
        // ajustamos a posição da nova sala para que as portas fiquem perfeitas.
        if (triggerDoor) {
            let oppositeSide = '';
            if (requiredSide === 'right') oppositeSide = 'left';
            if (requiredSide === 'left') oppositeSide = 'right';
            if (requiredSide === 'top') oppositeSide = 'bottom';
            if (requiredSide === 'bottom') oppositeSide = 'top';

            const entryDoor = roomData.doors.find(d => d.side === oppositeSide);
            if (entryDoor) {
                // Ajuste fino para alinhar as alturas/posições das portas
                const diffX = triggerDoor.x - entryDoor.x;
                const diffY = triggerDoor.y - entryDoor.y;
                
                // Aplica o ajuste a todos os elementos da nova sala
                roomData.platforms.forEach(p => { p.x += diffX; p.y += diffY; });
                roomData.ladders.forEach(l => { l.x += diffX; l.y += diffY; });
                roomData.enemies.forEach(e => { e.x += diffX; e.y += diffY; });
                roomData.doors.forEach(d => { d.x += diffX; d.y += diffY; });
                
                // Apaga a porta de entrada da nova sala
                const entryIdx = roomData.doors.indexOf(entryDoor);
                roomData.doors.splice(entryIdx, 1);
            }
        }

        // Adiciona os novos elementos aos existentes ao invés de substituir
        this.platforms.push(...roomData.platforms);
        this.ladders.push(...roomData.ladders);
        this.enemies.push(...roomData.enemies);
        this.doors.push(...roomData.doors);

        if (this.roomCount === 0) {
            this.player.x = roomData.spawn.x;
            this.player.y = roomData.spawn.y;
        }

        this.roomCount++;

        if (this.roomCount % 10 === 0) {
            // Boss surge à frente do jogador
            this.enemies.push(new DragonBoss(this.player.x + 500, this.player.y - 100));
        }
    }
    update(dt) {
        if (this.state !== 'playing') return;

        const targetCamX = this.player.x - 600 + this.player.width / 2;
        const targetCamY = this.player.y - 300 + this.player.height / 2;
        this.camX += (targetCamX - this.camX) * 0.1;
        this.camY += (targetCamY - this.camY) * 0.1;

        // Checar transição e expandir
        for (let i = this.doors.length - 1; i >= 0; i--) {
            const d = this.doors[i];
            if (Physics.checkCollision(this.player, d)) {
                const triggerDoor = { ...d };
                this.doors.splice(i, 1); // Remove a porta vermelha que o player encostou
                this.generate(triggerDoor); 
                break;
            }
        }

        const worldMouseX = this.input.mouseX + this.camX;
        const worldMouseY = this.input.mouseY + this.camY;

        if (this.input.pressed['KeyQ']) {
            this.enemies.forEach(en => {
                if (Math.hypot(en.x - this.player.x, en.y - this.player.y) < 200) {
                    en.frozen = (en instanceof DragonBoss) ? 1000 : 2000;
                }
            });
            this.input.pressed['KeyQ'] = false;
        }

        if (this.input.mouseDown) this.fire(worldMouseX, worldMouseY);

        this.player.update({ 
            keys: this.input.keys, 
            keyPressed: k => { let v = this.input.pressed[k]; this.input.pressed[k] = false; return v; } 
        }, this.platforms, this.ladders, dt);

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const en = this.enemies[i];
            en.update(this.player, this.platforms, dt, this.projectiles, false);

            if (Physics.checkCollision(this.player, en) && en.frozen <= 0) {
                this.player.hp -= 0.5;
            }

            if (en.hp <= 0) {
                this.createParticles(en.x + en.width / 2, en.y + en.height / 2, en.color, 15);
                if (en instanceof DragonBoss) {
                    this.state = 'win';
                    document.getElementById('win-overlay').style.display = 'flex';
                }
                this.enemies.splice(i, 1);
            }
        }

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.x += p.vx; p.y += p.vy || 0;
            let removed = false;
            if (p.fromEn) {
                if (Physics.checkCollision(p, this.player)) { this.player.hp -= 10; removed = true; }
            } else {
                for (let j = this.enemies.length - 1; j >= 0; j--) {
                    const en = this.enemies[j];
                    if (Physics.checkCollision(p, en)) {
                        en.hp -= 35; en.hurt = 150;
                        this.createParticles(p.x, p.y, p.color, 12);
                        removed = true; break;
                    }
                }
            }
            // Limites baseados na posição da câmera ou um mundo maior
            if (!removed && (p.x < this.camX - 200 || p.x > this.camX + 1400 || p.y < this.camY - 200 || p.y > this.camY + 800)) removed = true;
            if (removed) this.projectiles.splice(i, 1);
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx; p.y += p.vy; p.life -= 0.02;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        const hpBar = document.getElementById('hp-bar');
        if (hpBar) hpBar.style.width = Math.max(0, this.player.hp) + '%';
        const manaValue = document.getElementById('mana-value');
        if (manaValue) manaValue.innerText = Math.floor(this.player.mana);

        if (this.player.hp <= 0) {
            this.state = 'gameOver';
            document.getElementById('gameover-overlay').style.display = 'flex';
        }
    }
    draw() {
        this.ctx.clearRect(0, 0, 1200, 600);
        
        // Fundo estável (Cinza escuro) - Desenhar antes do translate ou cobrindo tudo
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, 1200, 600);

        this.ctx.save();
        this.ctx.translate(-this.camX, -this.camY);

        // Plataformas (Preto)
        this.ctx.fillStyle = '#000';
        this.platforms.forEach(p => { this.ctx.fillRect(p.x, p.y, p.width, p.height); });

        // Escadas (Amarelo)
        this.ctx.fillStyle = '#ffdf00';
        this.ladders.forEach(l => {
            // Desenha degraus
            for (let y = l.y; y < l.y + l.height; y += 10) {
                this.ctx.fillRect(l.x, y, l.width, 4);
            }
            this.ctx.fillRect(l.x, l.y, 4, l.height);
            this.ctx.fillRect(l.x + l.width - 4, l.y, 4, l.height);
        });

        // Portas (Vermelho)
        this.ctx.fillStyle = '#ff0000';
        this.doors.forEach(d => { this.ctx.fillRect(d.x, d.y, d.width, d.height); });

        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        this.ctx.globalAlpha = 1;

        this.player.draw(this.ctx);
        this.enemies.forEach(en => en.draw(this.ctx));

        this.projectiles.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.shadowBlur = 10; this.ctx.shadowColor = p.color;
            this.ctx.beginPath(); this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
        this.ctx.restore();
    }
    loop(t) {
        if (!this.lt) this.lt = t;
        const dt = t - this.lt;
        this.update(dt);
        this.draw();
        this.lt = t;
        requestAnimationFrame(t => this.loop(t));
    }
}
new Game();

