var TILE_SIZE = 40;
const ROOM_TEMPLATES = [
    // Sala 1
    {
        platforms: [
            { x: 0, y: 14, w: 30, h: 1 }, 
            { x: 0, y: 0, w: 14, h: 1 }, { x: 14, y: -4, w: 16, h: 1 },
            { x: 0, y: 0, w: 1, h: 15 }, { x: 29, y: -3, w: 1, h: 18 },
            { x: 8, y: 11, w: 5, h: 1 }, { x: 15, y: 10, w: 7, h: 1 },
            { x: 14, y: -3, w: 1, h: 8 }, { x: 15, y: 4, w: 4, h: 1 }, { x: 20, y: 4, w: 9, h: 1 }
        ],
        ladders: [{ x: 19, y: 4, w: 1, h: 6 }],
        enemies: [{ type: 'Orc', x: 23, y: 3 }],
        doors: [{ x: 29, y: 11, w: 1, h: 3, side: 'right' }],
        spawn: { x: 4, y: 13 }
    },
    // Sala 2
    {
        platforms: [
            { x: 0, y: 10, w: 18, h: 5 }, { x: 18, y: 14, w: 12, h: 1 },
            { x: 0, y: 0, w: 30, h: 1 }, { x: 0, y: 0, w: 1, h: 15 }, { x: 29, y: 0, w: 1, h: 15 },
            { x: 8, y: 7, w: 6, h: 3 }, { x: 17, y: 4, w: 6, h: 1 }, { x: 23, y: 10, w: 4, h: 1 },
        ],
        ladders: [{ x: 20, y: 1, w: 1, h: 3 }],
        enemies: [
            { type: 'Soldier', x: 5, y: 9 }, { type: 'Orc', x: 10, y: 6 },
            { type: 'Soldier', x: 12, y: 6 }, { type: 'Soldier', x: 18, y: 9 },
            { type: 'Orc', x: 24, y: 9 }, { type: 'Orc', x: 20, y: 13 },
            { type: 'Soldier', x: 25, y: 13 }, { type: 'Soldier', x: 18, y: 3 },
        ],
        doors: [
            { x: 0, y: 7, w: 1, h: 3, side: 'left' },
            { x: 20, y: 0, w: 3, h: 1, side: 'top' },
            { x: 29, y: 5, w: 1, h: 3, side: 'right' }
        ],
        spawn: { x: 2, y: 9 }
    },
    // Sala 3
    {
        platforms: [
            { x: 0, y: 14, w: 30, h: 1 }, { x: 0, y: 0, w: 30, h: 1 },
            { x: 0, y: 0, w: 1, h: 15 }, { x: 29, y: 0, w: 1, h: 15 },
            { x: 1, y: 5, w: 5, h: 1 }, { x: 6, y: 10, w: 6, h: 1 },
            { x: 19, y: 5, w: 8, h: 1 }, { x: 20, y: 11, w: 3, h: 1 },
        ],
        ladders: [],
        enemies: [
            { type: 'Soldier', x: 2, y: 4 }, { type: 'Soldier', x: 4, y: 4 },
            { type: 'Soldier', x: 7, y: 9 }, { type: 'Soldier', x: 10, y: 9 },
            { type: 'Soldier', x: 20, y: 4 }, { type: 'Soldier', x: 25, y: 4 },
            { type: 'Soldier', x: 21, y: 10 }, { type: 'Soldier', x: 26, y: 13 },
        ],
        doors: [
            { x: 0, y: 2, w: 1, h: 3, side: 'left' },
            { x: 12, y: 14, w: 3, h: 1, side: 'bottom' }
        ],
        spawn: { x: 4, y: 13 }
    },
    // Sala 4
    {
        platforms: [
            { x: 0, y: 14, w: 30, h: 1 }, { x: 0, y: 0, w: 30, h: 1 },
            { x: 0, y: 0, w: 1, h: 15 }, { x: 29, y: 0, w: 1, h: 15 },
            { x: 6, y: 8, w: 1, h: 2 },
        ],
        ladders: [],
        enemies: [
            { type: 'Phoenix', x: 6, y: 7 }, { type: 'Soldier', x: 10, y: 13 },
            { type: 'Soldier', x: 15, y: 13 }, { type: 'Orc', x: 18, y: 13 },
            { type: 'Orc', x: 22, y: 13 },
        ],
        doors: [
            { x: 0, y: 10, w: 1, h: 4, side: 'left' },
            { x: 29, y: 10, w: 1, h: 4, side: 'right' }
        ],
        spawn: { x: 3, y: 13 }
    },
    // Sala 5: Corredor do Chefe (Índice 4)
    {
        isSpecial: true,
        name: 'BossCorridor',
        platforms: [
            { x: 0, y: 14, w: 30, h: 1 }, { x: 0, y: 0, w: 30, h: 1 },
        ],
        ladders: [],
        enemies: [],
        doors: [
            { x: 0, y: 11, w: 1, h: 3, side: 'left' },
            { x: 29, y: 11, w: 1, h: 3, side: 'right' }
        ],
        spawn: { x: 2, y: 13 },
        bgRects: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26].map(x => ({ x, y: 9, w: 1, h: 3 }))
    },
    // Sala 6: Sala do Chefe (Índice 5)
    {
        isSpecial: true,
        name: 'BossRoom',
        platforms: [
            { x: 0, y: 14, w: 30, h: 1 }, { x: 0, y: 0, w: 30, h: 1 },
            { x: 0, y: 0, w: 1, h: 11 }, { x: 29, y: 0, w: 1, h: 15 },
            { x: 22, y: 8, w: 8, h: 7 }, // Pedestal do chefe
            { x: 1, y: 4, w: 2, h: 1 }, { x: 7, y: 6, w: 7, h: 1 },
            { x: 17, y: 10, w: 3, h: 1 }, { x: 7, y: 11, w: 3, h: 1 },
        ],
        ladders: [],
        enemies: [
            { type: 'Soldier', x: 2, y: 3 }, { type: 'Soldier', x: 9, y: 5 },
            { type: 'Soldier', x: 12, y: 5 }, { type: 'Soldier', x: 18, y: 9 },
            { type: 'Soldier', x: 8, y: 10 }, { type: 'Soldier', x: 15, y: 13 },
            { type: 'Dragon', x: 24, y: 4 }
        ],
        doors: [
            { x: 0, y: 11, w: 1, h: 3, side: 'left' }
        ],
        spawn: { x: 2, y: 13 }
    }
];

class RoomManager {
    static generateRoom(index = -1, offsetX = 0, offsetY = 0, requiredSide = null) {
        let template;
        if (index !== -1) {
            template = ROOM_TEMPLATES[index];
        } else {
            // Filtrar templates que possuem uma porta do lado oposto ao que precisamos
            let oppositeSide = '';
            if (requiredSide === 'right') oppositeSide = 'left';
            if (requiredSide === 'left') oppositeSide = 'right';
            if (requiredSide === 'top') oppositeSide = 'bottom';
            if (requiredSide === 'bottom') oppositeSide = 'top';

            const validTemplates = ROOM_TEMPLATES.filter(t =>
                !t.isSpecial && t.doors.some(d => d.side === oppositeSide)
            );
            template = validTemplates[Math.floor(Math.random() * validTemplates.length)];
        }

        const platforms = [];
        template.platforms.forEach(p => {
            const px = p.x * TILE_SIZE + offsetX;
            const py = p.y * TILE_SIZE + offsetY;
            const pw = p.w * TILE_SIZE;
            const ph = p.h * TILE_SIZE;

            let segments = [{ x: px, y: py, w: pw, h: ph }];

            template.doors.forEach(d => {
                const dx = d.x * TILE_SIZE + offsetX;
                const dy = d.y * TILE_SIZE + offsetY;
                const dw = d.w * TILE_SIZE;
                const dh = d.h * TILE_SIZE;

                let nextSegments = [];
                segments.forEach(s => {
                    // Se não há sobreposição, mantém o segmento
                    if (!(s.x < dx + dw && s.x + s.w > dx && s.y < dy + dh && s.y + s.h > dy)) {
                        nextSegments.push(s);
                        return;
                    }

                    // Se há sobreposição, divide o segmento em partes que NÃO sobrepõem a porta
                    // Parte no Topo
                    if (dy > s.y) nextSegments.push({ x: s.x, y: s.y, w: s.w, h: dy - s.y });
                    // Parte na Base
                    if (dy + dh < s.y + s.h) nextSegments.push({ x: s.x, y: dy + dh, w: s.w, h: (s.y + s.h) - (dy + dh) });
                    // Parte na Esquerda
                    if (dx > s.x) nextSegments.push({ x: s.x, y: Math.max(s.y, dy), w: dx - s.x, h: Math.min(s.y + s.h, dy + dh) - Math.max(s.y, dy) });
                    // Parte na Direita
                    if (dx + dw < s.x + s.w) nextSegments.push({ x: dx + dw, y: Math.max(s.y, dy), w: (s.x + s.w) - (dx + dw), h: Math.min(s.y + s.h, dy + dh) - Math.max(s.y, dy) });
                });
                segments = nextSegments;
            });

            segments.forEach(s => platforms.push({ x: s.x, y: s.y, width: s.w, height: s.h }));
        });

        const ladders = template.ladders.map(l => ({
            x: l.x * TILE_SIZE + offsetX,
            y: l.y * TILE_SIZE + offsetY,
            width: l.w * TILE_SIZE,
            height: l.h * TILE_SIZE
        }));

        const doors = template.doors.map(d => {
            let dx = d.x * TILE_SIZE + offsetX;
            let dy = d.y * TILE_SIZE + offsetY;
            let dw = d.w * TILE_SIZE;
            let dh = d.h * TILE_SIZE;

            if (d.x === 0) dw += 20;
            else if (d.x >= 29) { dx -= 20; dw += 20; }
            if (d.y === 0) dh += 20;
            else if (d.y >= 14) { dy -= 20; dh += 20; }

            return { x: dx, y: dy, width: dw, height: dh, side: d.side, originalX: d.x, originalY: d.y };
        });

        const enemies = template.enemies.map(e => {
            const ex = e.x * TILE_SIZE + offsetX;
            const ey = e.y * TILE_SIZE + offsetY;
            if (e.type === 'Orc') return new Orc(ex, ey);
            if (e.type === 'Soldier') return new Soldier(ex, ey);
            if (e.type === 'Dragon') return new DragonBoss(ex, ey);
            if (e.type === 'Phoenix') return new Phoenix(ex, ey);
            return null;
        }).filter(e => e !== null);

        return {
            platforms,
            ladders,
            doors,
            enemies,
            spawn: { x: template.spawn.x * TILE_SIZE + offsetX, y: template.spawn.y * TILE_SIZE + offsetY },
            width: 30 * TILE_SIZE,
            height: 15 * TILE_SIZE,
            template: template,
            bgRects: (template.bgRects || []).map(r => ({
                x: r.x * TILE_SIZE + offsetX,
                y: r.y * TILE_SIZE + offsetY,
                w: r.w * TILE_SIZE,
                h: r.h * TILE_SIZE
            }))
        };
    }
}
