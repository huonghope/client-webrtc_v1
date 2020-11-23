import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

function CountDownTime(props) {
    const [seconds, setSeconds ] =  useState(10);
    useEffect(()=>{
        let timer = setInterval(() => {
            if(seconds === 0){
                clearInterval(timer)
            }else{
                setSeconds(seconds - 1)
            }
        }, 1000)
        return ()=> {
            clearInterval(timer);
        };
    });
    return (
        <div style={{color: 'blue'}}>
            {seconds} 초
        </div>
    )
}

export default CountDownTime

