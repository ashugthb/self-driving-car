class Car {
    constructor(x, y, width, height) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height

        this.speed = 0
        this.acceleration = 0.08
        this.maxSpeed = 6
        this.angle = 0
        this.friction = 0.002
        this.sensor = new Sensors(this)
        this.controls = new Controls()
    }
    update(roadBorders) {
        this.#move()
        this.sensor.update(roadBorders)
    }

    #cratePolygon() {
        const points = []
    }
    #move() {
        if (this.controls.forward) {
            this.speed += this.acceleration
        }
        if (this.controls.backward) {
            this.speed -= this.acceleration
        }

        if (this.speed > 0) {
            this.speed -= this.friction
        } else if (this.speed < 0) {
            this.speed += this.friction
        }

        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed
        }
        if (this.speed < -this.maxSpeed) {
            this.speed = -this.maxSpeed
        }

        if (Math.abs(this.speed) < this.friction) {
            this.speed = 0
        }

        if (this.speed != 0) {
            let flip = this.speed > 0 ? 1 : -1
            if (this.controls.left) {
                this.angle += 0.03 * flip
            }
            if (this.controls.right) {
                this.angle -= 0.03 * flip
            }
        }

        this.x -= Math.sin(this.angle) * this.speed
        this.y -= Math.cos(this.angle) * this.speed
    }
    draw(ctx) {
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(-this.angle)

        ctx.beginPath()
        ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height)

        ctx.fill()
        ctx.restore()
        this.sensor.draw(ctx)
    }
}
