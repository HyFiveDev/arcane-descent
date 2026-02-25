export class Physics {
    static checkCollision(r1, r2) {
        return r1.x < r2.x + r2.width && r1.x + r1.width > r2.x && r1.y < r2.y + r2.height && r1.y + r1.height > r2.y;
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
