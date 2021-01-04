import React from "react"
import "./style.scss"

import Tools from "./components/Tools"
import WhiteBoard from "./components/WhiteBoard"
import History from "./components/History"

function WhiteBoardContainer(props) {
  return (
    <div className="paint-wrapper">
      <div className="paint-wrapper__board">
        <WhiteBoard />
      </div>
      <div className="paint-wrapper__tools">
        <Tools />
      </div>
      {/* <History /> */}
    </div>
  )
}

export default WhiteBoardContainer
