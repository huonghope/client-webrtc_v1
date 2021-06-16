import EventBus from "../events/EventBus"

// export const POINTER = 'Pointer'
// export const PEN ='Pen'
// export const LINE ='Line'
// export const ELLIPSE = 'Ellipse'
// export const RECT = 'Rect'

export const SELECT = "Select"
export const TEXT = "Text"
export const DRAW = "Draw"
export const ERASER = "Eraser"

export const LINE = "Line"
export const LINE_THINK = "Line_think"
export const LINE_MEDIUM = "Line_medium"
export const LINE_BOLD = "Line_bold"
export const LINE_DASH = "Line_dash"

export const FIGURE = "Figure"
export const FIGURE_REC_LINE = "Figure_rec_line"
export const FIGURE_ELLIPSE_LINE = "Figure_ellipse_line"
export const FIGURE_TRIANGLE_LINE = "Figure_triangle_line"
export const FIGURE_REC_FILL = "Figure_rec_fill"
export const FIGURE_ELLIPSE_FILL = "Figure_ellipse_fill"
export const FIGURE_TRIANGLE_FILL = "Figure_triangle_fill"

export const COLOR = "Color"
export const COLOR_WHITE = "Color_white"
export const COLOR_SUNGLOW = "Color_sunglow"
export const COLOR_RED = "Color_red"
export const COLOR_PURPLE = "Color_purple"
export const COLOR_BLUE = "Color_blue"
export const COLOR_ROYAl_BLUE = "Color_royal_blue"
export const COLOR_SHAMROCK = "Color_shamrock"
export const COLOR_BLACK = "Color_black"

export const RESET = "Reset"
export const RESET_CANCEL = "Reset_cancel"

export const DEL = "Del"
export const DEL_ALL = "Del-all"
export const DEL_MY = "Del-my"
export const DEL_OTHER = "Del-other"

export const CHECK = "Check"
export const CHECK_ARROW = "Check_arrow"
export const CHECK_CHECK = "CHECK_check"
export const CHECK_X = "Check_x"
export const CHECK_START = "Check_start"
export const CHECK_HEART = "Check_heart"
export const CHECK_QUESTION = "Check_question"

export const TAG = "Tag"
export const SAVE = "Save"
export const BOARD_HIDDEN = "Board_hidden"
class ToolStore {
  constructor() {
    this.id = "toolStore"
    EventBus.on(EventBus.TOOL_CHANGE, this.toolChange.bind(this))
    EventBus.on(EventBus.COLOR_CHANGE, this.colorChange.bind(this))
    this.tool = DRAW
    this.color = "black"
  }
  subscribe(cb) {
    EventBus.on(this.id, cb)
  }
  emitChanges() {
    EventBus.emit(this.id)
  }
  toolChange(event, tool) {
    this.tool = tool
    this.emitChanges()
  }
  colorChange(event, color) {
    this.color = color
    this.emitChanges()
  }
}

export default new ToolStore()
