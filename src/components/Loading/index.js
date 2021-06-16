import React from "react"
import ReactLoading from "react-loading"
import styled from "styled-components"

function Loading({ type, color }) {
  return (
    <Wrapper>
      <ReactLoading type={type} color={color} height={"10%"} width={"5%"} />
    </Wrapper>
  )
}
const Wrapper = styled.div`
  background: #1c2022;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`

export default Loading
