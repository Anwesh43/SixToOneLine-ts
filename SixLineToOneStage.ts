const w : number = window.innerWidth, h : number = window.innerHeight
const nodes : number = 5
const lines : number = 6
const STROKE_FACTOR : number = 60
const SIZE_FACTOR : number = 3
const DELAY : number = 30
class SixLineToOneStage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#BDBDBD'
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : SixLineToOneStage = new SixLineToOneStage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

const getScaleFactor : Function = (scale : number) : number => {
    return Math.floor(scale / 0.51)
}

const updateScale : Function = (scale : number, dir : number) : number => {
    const k : number = getScaleFactor(scale)
    return ((1 - k) / lines + k) * dir * 0.05
}
class State {
    prevScale : number = 0
    dir : number = 0
    scale : number = 0

    update(cb : Function) {
        const k : number = updateScale(this.scale, this.dir)
        this.scale += k
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {
    animated : boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}
