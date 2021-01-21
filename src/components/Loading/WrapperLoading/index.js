import React from "react"
import ReactLoading from "react-loading"
import styled from "styled-components"

function Loading({ type, color }) {
  return (
    <div>
      <ReactLoading type={type} color={color} height={"10%"} width={"5%"} />
    </div>
  )
}

export default Loading
