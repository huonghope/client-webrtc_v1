import React from "react"
import styled from "styled-components"
import { render } from "react-dom"
import "./style.scss"

function Alert({ title, content, handleClickAccept, handleClickReject, btnAccept = "종료하기", btnReject = "취소" }) {
  const modal = (
    <WrapperAlert>
      <div className="container-alert">
        <i className="clear-icon" onClick={e => closeEvent(e)}>
          X
        </i>
        <h3 className="container-alert__title">{title}</h3>
        <p className="container-alert__content">{content}</p>
        {
          !(handleClickAccept === undefined) &&
          <div className="container-alert__btn">
            <button
              className="container-alert__btn--cancel"
              onClick={() => {
                handleClickReject()
                closeEvent()
              }}
            >
              {btnReject}
            </button>
            <button
              className="container-alert__btn--accept"
              onClick={() => {
                handleClickAccept()
                closeEvent()
              }}
            >
              {btnAccept}
            </button>
          </div>
        }
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
export default Alert
