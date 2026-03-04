class Physics {
    static checkCollision(r1, r2) {
        if (!r1 || !r2) return false;

        // Extrai a caixa de colisão do Objeto 1
        const b1 = {
            x: r1.r ? r1.x - r1.r : r1.x,
            y: r1.r ? r1.y - r1.r : r1.y,
            w: r1.r ? r1.r * 2 : (r1.width || 0),
            h: r1.r ? r1.r * 2 : (r1.height || 0)
        };

        // Extrai a caixa de colisão do Objeto 2
        const b2 = {
            x: r2.r ? r2.x - r2.r : r2.x,
            y: r2.r ? r2.y - r2.r : r2.y,
            w: r2.r ? r2.r * 2 : (r2.width || 0),
            h: r2.r ? r2.r * 2 : (r2.height || 0)
        };

        // Retorna true se houver qualquer sobreposição
        return b1.x < b2.x + b2.w &&
            b1.x + b1.w > b2.x &&
            b1.y < b2.y + b2.h &&
            b1.y + b1.h > b2.y;
    }
    static applyGravity(e) { if (!e.grounded) e.velocityY += 0.5; }
    static resolvePlatforms(e, platforms) {
        e.grounded = false;
        platforms.forEach(p => {
            if (this.checkCollision(e, p)) {
                if (e.velocityY > 0 && e.y + e.height - e.velocityY <= p.y) {
                    e.y = p.y - e.height; e.velocityY = 0; e.grounded = true;
                }
            }
        });
    }
}
