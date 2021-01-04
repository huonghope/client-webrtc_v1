import Immutable from "immutable"
import EventBus from "../events/EventBus"
//Types
// import ToolStore, {
// 	POINTER, PEN, LINE, ELLIPSE, RECT
// } from './ToolStore';
//Mapping Tool
import ToolStore, {
  //선택, 테스트, 그리기, 지우기
  SELECT,
  TEXT,
  DRAW,
  ERASER,

  //선
  LINE_THINK,
  LINE_MEDIUM,
  LINE_BOLD,
  LINE_DASH,

  //도형
  FIGURE_REC_LINE,
  FIGURE_REC_FILL,
  FIGURE_ELLIPSE_LINE,
  FIGURE_ELLIPSE_FILL,
  FIGURE_TRIANGLE_LINE,
  FIGURE_TRIANGLE_FILL
} from "./ToolStore"
//그리기
import Draw from "../shapes/Draw"
import Eraser from "../shapes/Eraser"

//선
import LineThink from "../shapes/LineThink"
import LineMedium from "../shapes/LineMedium"
import LineBold from "../shapes/LineBold"
import LineDash from "../shapes/LineDash"

//도형
import FigureRecLine from "../shapes/FigureRecLine"
import FigureRecFill from "../shapes/FigureRecFill"
import FigureEllipseLine from "../shapes/FigureEllipseLine"
import FigureEllipseFill from "../shapes/FigureEllipseFill"
import FigureTriangleLine from "../shapes/FigureTriangleLine"
import FigureTriangleFill from "../shapes/FigureTriangleFill"

// import Pen from '../shapes/Pen';
// import Rect from '../shapes/Rect';
// import Ellipse from '../shapes/Ellipse';

import { pointInsideRect, getShapeRect } from "./Utils"

// export const SELECT = 'Select'
// export const DRAW = 'Draw'
// export const MOVE = 'Move'
// export const RESIZE = 'Resize'

const mapTools = {}
mapTools[DRAW] = Draw
mapTools[ERASER] = Eraser

mapTools[LINE_THINK] = LineThink
mapTools[LINE_MEDIUM] = LineMedium
mapTools[LINE_BOLD] = LineBold
mapTools[LINE_DASH] = LineDash

mapTools[FIGURE_REC_LINE] = FigureRecLine
mapTools[FIGURE_REC_FILL] = FigureRecFill
mapTools[FIGURE_ELLIPSE_LINE] = FigureEllipseLine
mapTools[FIGURE_ELLIPSE_FILL] = FigureEllipseFill
mapTools[FIGURE_TRIANGLE_LINE] = FigureTriangleLine
mapTools[FIGURE_TRIANGLE_FILL] = FigureTriangleFill

class Store {
  constructor() {
    this.id = "whiteBoardStore"
    EventBus.on(EventBus.START_PATH, this.startPath.bind(this))
    EventBus.on(EventBus.MOVE_PATH, this.movePath.bind(this))
    EventBus.on(EventBus.END_PATH, this.endPath.bind(this))
    EventBus.on(EventBus.UNDO, this.undo.bind(this))
    EventBus.on(EventBus.REDO, this.redo.bind(this))
    EventBus.on(EventBus.PICK_VERSION, this.pickVersion.bind(this))
    EventBus.on(EventBus.MOVE, this.move.bind(this))

    this.data = {
      shapes: Immutable.List.of(),
      selected: [],
      mouseTracker: null
    }
    this.history = [this.data.shapes]
    this.historyIndex = -1
    this.tool = Draw
    this.color = "black"

    ToolStore.subscribe(() => {
      const tool = ToolStore.tool
      this.toolType = tool
      this.tool = mapTools[tool] || null
      this.color = ToolStore.color
    })
  }
  subscribe(cb) {
    EventBus.on(this.id, cb)
  }
  emitChanges() {
    EventBus.emit(this.id)
  }
  startPath(event, position) {
    this.data.mouseTracker = {
      class: this.tool,
      type: this.toolType,
      path: [position],
      color: this.color
    }
    if (this.toolType === SELECT) {
      this.selectShape(position)
    }
    this.emitChanges()
  }
  movePath(event, position) {
    if (this.data.mouseTracker) {
      this.data.mouseTracker.path.push(position)
      this.emitChanges()
    }
  }
  endPath(event, position) {
    if (this.data.mouseTracker) {
      this.data.mouseTracker.path.push(position)
      if (this.toolType === SELECT) {
        this.addVersion()
      } else if (this.data.mouseTracker.class) {
        this.addShapeToCanvas(this.data.mouseTracker)
      }
      this.data.mouseTracker = null
      this.emitChanges()
    }
  }
  addShapeToCanvas(shape) {
    this.data.shapes = this.data.shapes.push(shape)
    this.data.mouseTracker = null
    this.addVersion()
  }
  selectShape(position) {
    this.data.shapes = this.data.shapes.map(shape => {
      if (pointInsideRect(position, getShapeRect(shape))) {
        return { ...shape, selected: true }
      } else {
        return { ...shape, selected: false }
      }
    })
  }
  addVersion() {
    this._catHistory()
    this.history.push(this.data.shapes)
    this.historyIndex = -1
  }

  undo() {
    if (this.history.length > 0) {
      if (this.historyIndex === -1) this.historyIndex = this.history.length - 1
      this.pickVersion(null, this.historyIndex - 1)
    }
  }
  _catHistory() {
    if (this.historyIndex >= 0) {
      this.history.splice(
        this.historyIndex + 1,
        this.history.length - this.historyIndex - 1
      )
    }
  }
  pickVersion(event, index) {
    if (this.history && this.history[index]) {
      this.historyIndex = index
      let shapes = this.history[index]
      this.data.shapes = shapes
      this.emitChanges()
    }
  }
  move(event, { shape, move }) {
    this.data.shapes = this.data.shapes.map(s => {
      if (shape === s) {
        return {
          ...s,
          path: s.path.map(({ x, y }) => ({
            x: x + move.x,
            y: y + move.y
          }))
        }
      } else {
        return s
      }
    })
  }
  redo() {}
}

export default new Store()
