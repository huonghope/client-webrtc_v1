import React, { useState, useEffect } from "react"

function CountTime(props) {
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(1)

  useEffect(() => {
    const timer = setInterval(() => {
      if (seconds === 60) {
        setSeconds(0)
        setMinutes(minutes + 1)
      } else setSeconds(seconds + 1)
    }, 1000)
    // clearing interval
    return () => clearInterval(timer) //! 꼭 필요함
  })

  return (
    <h1>
      {minutes < 10 ? `0${minutes}` : minutes} : {seconds < 10 ? `0${seconds}` : seconds }
    </h1>
  )
}
export default CountTime
