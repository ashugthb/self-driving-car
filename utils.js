function lerp(A, B, t) {
    return A + (B - A) * t
}

// Segment 1: From point a = (1, 1) to b = (4, 4)
// Segment 2: From point c = (1, 4) to d = (4, 1)

// Formula for t:
// t = ((x3 - x1) * (y3 - y4) - (y3 - y1) * (x3 - x4))
//      / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4))

// Formula for u:
// u = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2))
//      / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4))

function getIntersection(a, b, c, d) {
    const tTop = (d.x - c.x) * (a.y - c.y) - (d.y - c.y) * (a.x - c.x)
    const bottom = (d.y - c.y) * (b.x - a.x) - (d.x - c.x) * (b.y - a.y)
    const uTop = (c.y - a.y) * (a.x - b.x) - (c.x - a.x) * (a.y - b.y)

    if (bottom != 0) {
        const t = tTop / bottom
        const u = uTop / bottom
        if (t > 0 && t < 1 && u > 0 && u < 1) {
            return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), offset: t }
        }
    }
    return null
}

function polyIntersect(poly1, poly2) {
    for (let i = 0; i < poly1.length; i++) {
        for (let j = 0; j < poly2.length; j++) {
            const touch = getIntersection(
                poly1[i],
                poly1[(i + 1) % poly1.length],
                poly2[j],
                poly2[(j + 1) % poly2.length]
            )
            if (touch) {
                return true
            }
        }
    }
    return false
}
