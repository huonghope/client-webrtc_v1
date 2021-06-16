import React from "react"
import ReactLoading from "react-loading"
import styled from "styled-components"

function WrapperLoading({type, color}) {
  return (
      <Wrapper>
          <ReactLoading type={type} color={color} height={'10%'} width={'5%'} />
      </Wrapper>
  )
}
const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`
export default WrapperLoading
