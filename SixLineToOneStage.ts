const w : number = window.innerWidth, h : number = window.innerHeight
const nodes : number = 5
const lines : number = 6
const STROKE_FACTOR : number = 60
const SIZE_FACTOR : number = 3
const DELAY : number = 30
class SixLineToOneStage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    renderer : Renderer = new Renderer()

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#BDBDBD'
        this.context.fillRect(0, 0, w, h)
        this.renderer.render(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.renderer.handleTap(() => {
                this.render()
            })
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
const divideScale : Function = (scale : number, i : number, n : number) => Math.min(1/n, Math.max(0, scale - i * 1/n)) * n

const getDeg : Function = (o : number, s : number, scale : number) : number => o + (s - o) * scale

class SLONode {
    prev : SLONode
    next : SLONode
    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new SLONode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        const gap : number = w / (nodes + 1)
        const sc1 : number = divideScale(this.state.scale, 0, 2)
        const sc2 : number = divideScale(this.state.scale, 1, 2)
        const size : number = gap / SIZE_FACTOR
        const deg : number = 2 * Math.PI / (lines)
        context.lineWidth = Math.min(w, h) / STROKE_FACTOR
        context.lineCap = 'round'
        context.strokeStyle = '#01579B'
        context.save()
        context.translate(gap * (this.i + 1), h/2)
        for (var i = 0; i < lines; i++) {
            const sc : number = divideScale(sc1, i, lines)
            const currDeg : number = getDeg(deg * i, 2 * Math.PI, sc2)
            context.save()
            context.rotate(currDeg)
            context.beginPath()
            context.moveTo(0, 0)
            context.lineTo(size * sc, 0)
            context.stroke()
            context.restore()
        }
        context.restore()
        if (this.prev) {
            this.prev.draw(context)
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : SLONode {
        var curr : SLONode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class SixLineToOne {
    curr : SLONode = new SLONode(0)

    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () =>{
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}

class Renderer {
    slo : SixLineToOne = new SixLineToOne()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.slo.draw(context)
    }

    handleTap(cb : Function) {
        this.slo.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.slo.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}
