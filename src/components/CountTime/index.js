import React, { useState, useEffect } from "react"
import moment from 'moment'

function CountTime({startTime}) {
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(1)
  
  useEffect(() => {
    if(startTime){
      const currentTime = moment().format('DD/MM/YYYYHH:mm:ss')
      let diffTime = moment.utc(moment(currentTime, "DD/MM/YYYYHH:mm:ss").diff(moment(startTime, "DD/MM/YYYYHH:mm:ss"))).format("HH:mm:ss")
      let diffTimeSplit = diffTime.split(":")
      setMinutes(Number(diffTimeSplit[1]))
      setSeconds(Number(diffTimeSplit[2]))
    }
  }, [])
  
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
