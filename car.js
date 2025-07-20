class Car {
    constructor(x, y, width, height, controlType, maxSpeed = 3) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height

        this.speed = 0
        this.acceleration = 0.08

        this.maxSpeed = maxSpeed

        this.angle = 0
        this.friction = 0.002
        this.damaged = false

        this.useBrain = controlType == 'AI'

        if (controlType != 'DUMMY') {
            this.sensor = new Sensors(this)
        }

        if (this.useBrain) {
            const featureCount = this.sensor.rayCount + 3
            this.brain = new RLBrain(
                ['forward', 'left', 'right', 'backward'],
                featureCount
            )
            this.lastState = null
            this.lastAction = null
        }

        this.controls = new Controls(controlType)
    }
    reset(x, y) {
        this.x = x
        this.y = y
        this.speed = 0
        this.angle = 0
        this.damaged = false
        this.lastState = null
        this.lastAction = null
    }

    update(roadBorders, traffic) {
        if (!this.damaged) {
            if (this.sensor) {
                this.sensor.update(roadBorders, traffic)
            }

            if (this.useBrain) {
                const state = this.brain.getState(
                    this.sensor.readings,
                    this.angle
                )
                const action = this.brain.chooseAction(state)
                this.#applyAction(action)
                this.lastState = state
                this.lastAction = action
            }

            this.#move()
            this.polygon = this.#cratePolygon()
            this.damaged = this.#assessDamage(roadBorders, traffic)

            if (this.sensor) {
                this.sensor.update(roadBorders, traffic)
            }

            if (this.useBrain && this.lastState && this.lastAction) {
                const nextState = this.brain.getState(
                    this.sensor.readings,
                    this.angle
                )
                let reward = this.damaged ? -1 : 0.1
                if (this.sensor && this.sensor.readings.length > 0) {
                    const avgDist =
                        this.sensor.readings.reduce(
                            (sum, r) => sum + (r ? 1 - r.offset : 1),
                            0
                        ) / this.sensor.readings.length
                    reward += avgDist * 0.1
                }
                reward += (this.speed / this.maxSpeed) * 0.2
                reward -= Math.abs(this.angle) * 0.1
                this.brain.update(
                    this.lastState,
                    this.lastAction,
                    reward,
                    nextState
                )
            }
        } else {
            // training loop will reset the car
        }
    }

    #applyAction(action) {
        this.controls.forward = false
        this.controls.left = false
        this.controls.right = false
        this.controls.backward = false
        switch (action) {
            case 'forward':
                this.controls.forward = true
                break
            case 'left':
                this.controls.left = true
                this.controls.forward = true
                break
            case 'right':
                this.controls.right = true
                this.controls.forward = true
                break
            case 'backward':
                this.controls.backward = true
                break
        }
    }
    #assessDamage(roadBorders, traffic) {
        for (let i = 0; i < roadBorders.length; i++) {
            if (polyIntersect(this.polygon, roadBorders[i])) {
                return true
            }
        }
        for (let i = 0; i < traffic.length; i++) {
            if (polyIntersect(this.polygon, traffic[i].polygon)) {
                return true
            }
        }
    }
    #cratePolygon() {
        const points = []
        const rad = Math.hypot(this.width, this.height) / 2
        const alpha = Math.atan2(this.width, this.height)

        points.push({
            x: this.x - Math.sin(this.angle - alpha) * rad,
            y: this.y - Math.cos(this.angle - alpha) * rad,
        })

        points.push({
            x: this.x - Math.sin(this.angle + alpha) * rad,
            y: this.y - Math.cos(this.angle + alpha) * rad,
        })
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad,
        })
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad,
        })
        return points
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
    draw(ctx, color) {
        if (this.damaged) {
            ctx.fillStyle = 'red'
        } else {
            ctx.fillStyle = color
        }
        ctx.beginPath()

        ctx.moveTo(this.polygon[0].x, this.polygon[0].y)

        for (let i = 1; i < this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y)
        }
        ctx.fill()
        if (this.sensor) this.sensor.draw(ctx)
    }
}
