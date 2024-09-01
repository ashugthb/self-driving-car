const canvas = document.getElementById('myCanvas')

canvas.width = 1000

const ctx = canvas.getContext('2d')
const road = new Road(canvas.width / 2, canvas.width * 0.9)
const car = new Car(road.getLaneCenter(1), 100, 30, 50)
car.draw(ctx)

animate()
function animate() {
    car.update(road.borders)
    canvas.height = window.innerHeight
    ctx.save()
    ctx.translate(
        -car.x * 0.8 + canvas.width * 0.3,
        -car.y + canvas.height * 0.7
    )
    road.draw(ctx)
    car.draw(ctx)
    requestAnimationFrame(animate)
}
