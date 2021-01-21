import React from "react"
import "./Button.scss"
import { Link } from "react-router-dom"

const STYLES = ["btn--primary", "btn-outline", "btn--secondary"]

const SIZES = ["btn--medium", "btn--large"]

export const Button = ({
  children,
  type,
  onClick,
  buttonStyle,
  buttonSize
}) => {
  const checkButtonStyle = STYLES.includes(buttonStyle)
    ? buttonStyle
    : STYLES[0] //default

  const checkButtonSize = STYLES.includes(buttonSize) ? buttonSize : SIZES[0]

  return (  
      <button
        className={`btn ${checkButtonStyle} ${checkButtonSize} `}
        onClick={onClick}
        type={type}
      >
        {children}
      </button>
  )
}
