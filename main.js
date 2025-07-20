const carCanvas = document.getElementById('carCanvas')
const networkCanvas = document.getElementById('networkCanvas')

networkCanvas.width = 0
carCanvas.width = 700

const carCtx = carCanvas.getContext('2d')
const networkCtx = networkCanvas.getContext('2d')

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9)
const car = new Car(road.getLaneCenter(1), 100, 30, 50, 'AI')

function createTraffic() {
    const t = [
        new Car(road.getLaneCenter(1), -300, 30, 40, 'DUMMY', 2),
        new Car(road.getLaneCenter(1), -400, 80, 40, 'DUMMY', 2),
    ]

    for (let i = 0; i < 50; i++) {
        const newy = Math.random() * 5000 - 5000
        const newlane = Math.floor(Math.random() * 5)
        const maxspeed = Math.random() * 2
        const newcar = new Car(
            road.getLaneCenter(newlane),
            newy,
            30,
            50,
            'DUMMY',
            maxspeed
        )
        t.push(newcar)
    }
    return t
}

let traffic = createTraffic()

const qDiv = document.getElementById('qValues')
const episodeDiv = document.getElementById('episodeInfo')
const startBtn = document.getElementById('startBtn')
let running = false
let frame = 0
let episode = 0
const MAX_FRAMES = 1000
startBtn.onclick = () => {
    if (!running) {
        running = true
        animate()
    }
}

function resetEpisode() {
    traffic = createTraffic()
    car.reset(road.getLaneCenter(1), 100)
    car.brain.endEpisode()
    frame = 0
    episode++
}

function animate() {
    frame++
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, [])
    }
    car.update(road.borders, traffic)

    carCanvas.height = window.innerHeight
    networkCanvas.height = window.innerHeight
    carCtx.save()
    carCtx.translate(0, -car.y + carCanvas.height * 0.7)
    road.draw(carCtx)

    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx, 'blue')
    }

    car.draw(carCtx, 'green')

    if (car.brain) {
        const state = car.brain.getState(car.sensor.readings, car.angle)
        const q = car.brain.getQValues(state)
        qDiv.textContent = Object.entries(q)
            .map(([a, v]) => `${a}: ${v.toFixed(2)}`)
            .join(' | ')
        episodeDiv.textContent = `Episode: ${episode}  Epsilon: ${car.brain.epsilon.toFixed(2)}`
    }

    if (car.damaged || frame >= MAX_FRAMES) {
        resetEpisode()
    }

    requestAnimationFrame(animate)
}
