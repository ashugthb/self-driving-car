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
            // this.brain = new NeuralNetwork([
            //     this.sensor.rayCount,
            //     10,
            //     20,
            //     10,
            //     4,
            // ])
        }

        this.controls = new Controls(controlType)
    }
    update(roadBorders, traffic) {
        if (!this.damaged) {
            this.#move()
            this.polygon = this.#cratePolygon()

            this.damaged = this.#assessDamage(roadBorders, traffic)
            if (this.sensor) {
                this.sensor.update(roadBorders, traffic)
                const offset = this.sensor.readings.map((s) =>
                    s == null ? 0 : 1 - s.offset
                )
                console.log(this.sensor.readings)
                console.log(this.controls)

                for (let i = 0; i < this.sensor.readings.length; i++) {
                    if (this.sensor.readings[i] != null) {
                        if (i < 9 / 2) {
                            if (this.sensor.readings[i].offset < 0.9) {
                                this.controls.right = true
                                this.controls.left = false
                            } else {
                                this.controls.right = false
                                this.controls.left = false
                            }
                        } else if (i > 9 / 2) {
                            if (this.sensor.readings[i].offset < 0.6) {
                                this.controls.left = true
                                this.controls.right = false
                            } else {
                                this.controls.left = false
                                this.controls.right = false
                            }
                        } else {
                            if (this.sensor.readings[i / 2].offset < 0.6) {
                                this.controls.right = true
                                this.controls.left = false
                            } else {
                                this.controls.right = false
                                this.controls.left = false
                            }
                        }
                    }
                    this.controls.forward = true
                }
                // const outputs = NeuralNetwork.feedForward(offset, this.brain)
                // console.log(outputs)
                // if (this.useBrain) {
                //     this.controls.forward = outputs[0]
                //     this.controls.left = outputs[1]
                //     this.controls.right = outputs[2]
                //     this.controls.backward = outputs[3]
                // }
            }
        } else {
            setTimeout(() => {
                window.location.reload()
            }, 1000)
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
