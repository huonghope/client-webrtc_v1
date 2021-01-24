import React from "react"
import "./Button.scss"
import { Link } from "react-router-dom"

const STYLES = ["btn--primary", "btn-outline", "btn--secondary", "btn--click", "btn--request"]

const SIZES = ["btn--medium", "btn--large"]

export const Button = ({
  children,
  type,
  onClick,
  buttonStyle,
  buttonSize
}) => {
  var styleArray = buttonStyle.split(" ");
  let checkButtonStyle = "";
  if(styleArray.length !== 1){
    styleArray.map(style => {
      checkButtonStyle += STYLES.includes(style)
      ? style
      : STYLES[0]//default 
      checkButtonStyle += " ";
    })
  }else{
    checkButtonStyle = STYLES.includes(buttonStyle)
      ? buttonStyle
      : STYLES[0] //default
  }

  console.log(checkButtonStyle)
  console.log(buttonSize)
  const checkButtonSize = SIZES.includes(buttonSize) ? buttonSize : SIZES[0]
  console.log(checkButtonSize)

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
