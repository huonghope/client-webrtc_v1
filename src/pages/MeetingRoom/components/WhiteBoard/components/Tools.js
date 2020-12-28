import React, { useEffect, useRef, useState } from "react"
import EventBus from "../events/EventBus"
import ToolStore, {
  // POINTER, PEN, LINE, ELLIPSE, RECT,
  //not level
  SELECT,
  TEXT,
  DRAW,
  ERASER,
  LINE,
  LINE_THINK,
  LINE_MEDIUM,
  LINE_BOLD,
  LINE_DASH,
  FIGURE,
  FIGURE_REC_LINE,
  FIGURE_ELLIPSE_LINE,
  FIGURE_TRIANGLE_LINE,
  FIGURE_REC_FILL,
  FIGURE_ELLIPSE_FILL,
  FIGURE_TRIANGLE_FILL,
  COLOR,
  COLOR_WHITE,
  COLOR_SUNGLOW,
  COLOR_RED,
  COLOR_PURPLE,
  COLOR_BLUE,
  COLOR_ROYAl_BLUE,
  COLOR_SHAMROCK,
  COLOR_BLACK,
  RESET,
  RESET_CANCEL,
  DEL,
  DEL_ALL,
  DEL_MY,
  DEL_OTHER,
  //have level
  CHECK,
  CHECK_ARROW,
  CHECK_CHECK,
  CHECK_X,
  CHECK_START,
  CHECK_HEART,
  CHECK_QUESTION,
  TAG,
  SAVE,
  BOARD_HIDDEN
} from "../constants/ToolStore"
import { saveSvgAsPng } from "save-svg-as-png"
import Icon from "../../../../../constants/icons"
import ColorPicker from "./ColorPicker"
import moment from "moment"
import "./tools.scss"

export default function Tools() {
  const [tools, setTools] = useState([
    {
      id: SELECT,
      label: Icon.selectIcon,
      type: "select",
      child: [],
      text: "선택"
    },
    { id: TEXT, label: Icon.textIcon, type: "text", child: [], text: "텍스트" },
    {
      id: DRAW,
      label: Icon.drawIcon,
      type: "draw",
      child: [],
      text: "그리기",
      selected: true
    },
    {
      id: ERASER,
      label: Icon.eraserIcon,
      type: "eraser",
      child: [],
      text: "지우개"
    },
    {
      id: LINE,
      label: Icon.lineIcon,
      type: "line",
      child: [
        { id: LINE_THINK, label: Icon.lineThinkIcon, type: "link-think" },
        { id: LINE_MEDIUM, label: Icon.lineMediumIcon, type: "link-medium" },
        { id: LINE_BOLD, label: Icon.lineBoldIcon, type: "link-bold" },
        { id: LINE_DASH, label: Icon.lineDashIcon, type: "link-dash" }
      ],
      text: "선"
    },
    {
      id: FIGURE,
      label: Icon.figureIcon,
      type: "figure",
      child: [
        {
          id: FIGURE_REC_LINE,
          label: Icon.figureRecLineIcon,
          type: "figure-rec-line"
        },
        {
          id: FIGURE_ELLIPSE_LINE,
          label: Icon.ellipseLineIcon,
          type: "figure-ellipse-line"
        },
        {
          id: FIGURE_TRIANGLE_LINE,
          label: Icon.triangleLineIcon,
          type: "figure-triangle-line"
        },
        {
          id: FIGURE_REC_FILL,
          label: Icon.figureRecFillIcon,
          type: "figure-rec-fill"
        },
        {
          id: FIGURE_ELLIPSE_FILL,
          label: Icon.ellipseFillIcon,
          type: "figure-ellipse-fill"
        },
        {
          id: FIGURE_TRIANGLE_FILL,
          label: Icon.triangleFillIcon,
          type: "figure-triangle-fill"
        }
      ],
      text: "도형"
    },
    {
      id: COLOR,
      label: Icon.colorIcon,
      type: "color",
      child: [
        { id: COLOR_WHITE, label: "#ffffff", type: "color-white" },
        { id: COLOR_SUNGLOW, label: "#ffbd32", type: "color-sunglow" },
        { id: COLOR_RED, label: "#fb1d1d", type: "color-red" },
        { id: COLOR_PURPLE, label: "#f153ff", type: "color-purple" },
        { id: COLOR_BLUE, label: "#3ec0ff", type: "color-blue" },
        { id: COLOR_ROYAl_BLUE, label: "#3f65e0", type: "color-royal-blue" },
        { id: COLOR_SHAMROCK, label: "#3ac084", type: "color-shamrock" },
        { id: COLOR_BLACK, label: "#000000", type: "color-black" }
      ],
      text: "색상"
    },
    {
      id: RESET,
      label: Icon.resetIcon,
      type: "reset",
      child: [],
      text: "실행취소"
    },
    {
      id: RESET_CANCEL,
      label: Icon.resetCancelIcon,
      type: "reset-cancel",
      child: [],
      text: "재실행"
    },
    {
      id: DEL,
      label: Icon.delIcon,
      type: "del",
      child: [
        // {
        //   id: DEL_ALL,
        //   label: Icon.lineIcon,
        //   type: "del-all",
        //   text: "모두 지우기"
        // },
        // {
        //   id: DEL_MY,
        //   label: Icon.lineIcon,
        //   type: "del-my",
        //   text: "내 도로잉 지우기"
        // },
        // {
        //   id: DEL_OTHER,
        //   label: Icon.lineIcon,
        //   type: "del-other",
        //   text: "학생 도로잉 지우기"
        // }
      ],
      text: "지우기"
    },
    // {
    //   id: CHECK,
    //   label: Icon.checkIcon,
    //   type: "check",
    //   child: [
    //     { id: CHECK_ARROW, label: Icon.checkArrowIcon, type: "check-arrow" },
    //     { id: CHECK_CHECK, label: Icon.checkCheckIcon, type: "check-check" },
    //     { id: CHECK_X, label: Icon.checkXIcon, type: "check-x" },
    //     { id: CHECK_START, label: Icon.checkStartIcon, type: "check-start" },
    //     { id: CHECK_HEART, label: Icon.checkHeartIcon, type: "check-heart" },
    //     {
    //       id: CHECK_QUESTION,
    //       label: Icon.checkQuestionIcon,
    //       type: "check-question"
    //     }
    //   ],
    //   text: "스탬프"
    // },
    // { id: TAG, label: Icon.tagIcon, type: "tag", child: [], text: "태그" },
    { id: SAVE, label: Icon.saveIcon, type: "save", child: [], text: "저장" },
    {
      id: BOARD_HIDDEN,
      label: Icon.boardHidden,
      type: "board-hidden",
      child: [],
      text: "숨기기"
    }
  ])

  useEffect(() => {
    localStorage.setItem("history", 0)
    ToolStore.subscribe(() => {
      const _tools = tools.map(tool => ({
        ...tool,
        selected: ToolStore.tool === tool.id
      }))
      setTools(_tools)
    })
  }, [])

  const handleSaveAs = () => {
    const fnCurrentTime = () => {
      var _now = new Date()
      var year = _now.getFullYear()
      var month = _now.getMonth() + 1
      var date = _now.getDate()
      var hour = _now.getHours()
      var minutes = _now.getMinutes()
      var seconds = _now.getSeconds()
      if (10 > date) date = "0" + date
      if (10 > _now.getMinutes()) minutes = "0" + minutes
      return (
        date + "" + month + "" + year + "" + hour + "" + minutes + "" + seconds
      )
    }
    saveSvgAsPng(
      document.getElementById("whiteBoard"),
      `${fnCurrentTime()}.png`, {backgroundColor: "#f5f5f5"}
    )
  }

  var prevConunt = useRef(Number(localStorage.getItem("history")) - 2)

  useEffect(() => {
    prevConunt.current = Number(localStorage.getItem("history")) - 1
  }, [localStorage.getItem("history")])

  const handleClickTool = (type, index, key) => {
    //Save Event
    if (type === "Save") {
      handleSaveAs()
      return
    }

    //툴이 숨기는 기능
    if (type === "Board_hidden") {
      setHidden(!hidden)
    }

    // //재실행
    // if (type === "Reset") {
    //   console.log(prevConunt)
    //   if (prevConunt.current >= 0) {
    //     prevConunt.current--
    //     EventBus.emit(EventBus.PICK_VERSION, Number(prevConunt.current))
    //   } else {
    //   }
    // }


//전체 지우기
    if(type==='Del')
    {
      prevConunt.current=0;
      EventBus.emit(EventBus.PICK_VERSION, Number(prevConunt.current));
    }

       //재실행
       if( type === 'Reset'){
        console.log(prevConunt)
        if(prevConunt.current >= 0){
          prevConunt.current--;
          EventBus.emit(EventBus.PICK_VERSION, Number(prevConunt.current));
        }
        else{
  
        }
      }
  
      //실행 취소
      if( type === 'Reset_cancel'){
        prevConunt.current++;
        console.log(prevConunt)
        EventBus.emit(EventBus.PICK_VERSION, Number(prevConunt.current));
      }

    // //실행 취소
    // if (type === "Reset-cancel") {
    //   prevConunt.current++
    //   console.log(prevConunt)
    //   EventBus.emit(EventBus.PICK_VERSION, Number(prevConunt.current))
    // }

    if(type==="")

    //Color Change Event
    if (type === "Color") {
      const filter = tools.filter(tool => tool.id === type)[0]
      const { child } = filter
      const tool = child[index]
      EventBus.emit(EventBus.COLOR_CHANGE, tool.label)
      return
    }

    const filter = tools.filter(tool => tool.id === type)[0]
    if (filter.child.length !== 0) {
      //Click Parent Event - default 첫번쨰요소
      if (key) {
        EventBus.emit(EventBus.TOOL_CHANGE, filter.child[0].id)
      } else {
        const { child } = filter
        const tool = child[index]
        EventBus.emit(EventBus.TOOL_CHANGE, tool.id)
      }
    } else {
      EventBus.emit(EventBus.TOOL_CHANGE, tools[index].id)
    }
  }
  const [hidden, setHidden] = useState(false)
  return (
    <div className="tools-list">
      <div className={hidden ? "hidden" : "full"}>
        {tools.length !== 0 && hidden ? (
          <div>
            <button
              className={"tool-parent"}
              onClick={() => setHidden(!hidden)}
            >
              <img src={Icon.boardDisplay} />
              <p>보기</p>
            </button>
          </div>
        ) : (
            tools.map((tool, idx) => (
              <ToolWrapperCom
                index={idx}
                tool={tool}
                hidden={hidden}
                handleClickTool={handleClickTool}
              />
            ))
          )}
      </div>
    </div>
  )
}

const ToolWrapperCom = ({ tool, handleClickTool, index }) => {
  const [display, setDisplay] = useState(false)
  const handleOnClick = () => {
    if (tool.child.length !== 0) {
      handleClickTool(tool.id, index, "parent")
      setDisplay(!display)
    } else {
      handleClickTool(tool.id, index)
      setDisplay(!display)
    }
  }
  return (
    <div className="tool">
      <button
        className={tool.selected ? "tool-parent selected" : "tool-parent"}
        onClick={() => handleOnClick()}
      >
        <img src={tool.label} />
        <p>{tool.text}</p>
      </button>
      {display && tool.child.length !== 0 && (
        <div className={`tool-childs ${tool.type}`}>
          {tool.type === "del"
            ? tool.child.map((child, idx) => (
              <p
                onClick={() => {
                  handleClickTool(tool.id, idx)
                  setDisplay(!display)
                }}
              >
                {child.text}
              </p>
            ))
            : tool.type === "color"
              ? tool.child.map((child, idx) => (
                <button
                  onClick={() => {
                    handleClickTool(tool.id, idx)
                    setDisplay(!display)
                  }}
                  style={
                    child.label === "#000000"
                      ? { borderColor: "white", background: child.label }
                      : { background: child.label }
                  }
                ></button>
              ))
              : tool.child.map((child, idx) => (
                <button
                  onClick={() => {
                    handleClickTool(tool.id, idx)
                    setDisplay(!display)
                  }}
                >
                  <img src={child.label} />
                </button>
              ))}
        </div>
      )}
    </div>
  )
}
