const carCanvas = document.getElementById('carCanvas')
const networkCanvas = document.getElementById('networkCanvas')

networkCanvas.width = 0
carCanvas.width = 700

const carCtx = carCanvas.getContext('2d')
const networkCtx = networkCanvas.getContext('2d')

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9)
const car = new Car(road.getLaneCenter(1), 100, 30, 50, 'KEYS')
const traffic = [
    new Car(road.getLaneCenter(1), -300, 30, 40, 'DUMMY', 2),
    new Car(road.getLaneCenter(1), -400, 80, 40, 'DUMMY', 2),
]

for (let i = 0; i < 50; i++) {
    let newy = Math.random() * 5000 - 5000
    let newlane = Math.floor(Math.random() * 5)
    let maxspeed = Math.random() * 2
    let newcar = new Car(
        road.getLaneCenter(newlane),
        newy,
        30,
        50,
        'DUMMY',
        maxspeed
    )
    traffic.push(newcar)
}

animate()
function animate() {
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

    requestAnimationFrame(animate)
}
