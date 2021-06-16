import React from "react"
import "./Button.scss"

const STYLES = ["btn--primary", "btn-outline", "btn--secondary", "btn--click", "btn--request"]

const SIZES = ["btn--medium", "btn--large"]

export const Button = ({
  children,
  type,
  onClick,
  buttonStyle,
  buttonSize,
  disabled
}) => {
  var styleArray = buttonStyle.split(" ");
  let checkButtonStyle = "";
  if(styleArray.length !== 1){
    styleArray.map((style,i) => {
      checkButtonStyle += STYLES.includes(style)
      ? style
      : STYLES[0]//default 
      checkButtonStyle += " ";
      return style
    })
  }else{
    checkButtonStyle = STYLES.includes(buttonStyle)
      ? buttonStyle
      : STYLES[0] //default
  }
  const checkButtonSize = SIZES.includes(buttonSize) ? buttonSize : SIZES[0]
  return (  
      <button
        className={`btn ${checkButtonStyle} ${checkButtonSize} `}
        onClick={onClick}
        type={type}
        disabled={disabled}
      >
        {children}
      </button>
  )
}
