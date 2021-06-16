import React from "react"
import styled from "styled-components"
import { render } from "react-dom"
import "./style.scss"

function Notice({title, content, contentMore}) {

  setTimeout(function(){
    closeEvent()
  }, 3 * 1000);

  const modal = (
    <WrapperAlert>
      <div className="container-notice">
        <i className="clear-icon" onClick={e => closeEvent(e)}>
          X
        </i>
        <h3 className="container-notice__title">{title}</h3>
        <h5 className="container-notice__content">{content}</h5>
        <h5 className="container-notice__content">{contentMore}</h5>
      </div>
    </WrapperAlert>
  )
  const divContainer = document.createElement("div")
  document.body.appendChild(divContainer)

  function closeEvent(e) {
    divContainer.removeEventListener("keydown", closeEvent)
    removeDom()
  }
  function removeDom() {
    document.body.removeChild(divContainer)
  }
  render(modal, divContainer)
}
const WrapperAlert = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
`
export default Notice
