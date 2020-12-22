import React, { useEffect, useState } from "react"
import "./style.scss"
import axios from "axios"
import { useDispatch, useSelector } from "react-redux"
import Loading from '../../components/Loading'

import actions from '../../features/AuthFeature/action';
import selectors from '../../features/AuthFeature/selector';

import qs from 'query-string'

function CreateRoom(props) {

  const dispatch = useDispatch();
  const signLoading = useSelector(selectors.selectSigninLoading)
  const error = useSelector(selectors.selectSigninError)

  useEffect(() => {
    const query = qs.parse(window.location.search.slice(1));
    const { redirect_key, sl_idx, user_idx } = query   
    console.log(redirect_key, sl_idx, user_idx)
    if (redirect_key && sl_idx && user_idx) {
      let userInfo = {
        redirect_key,
        sl_idx,
        user_idx
      }
      
      dispatch(actions.doSignin(userInfo))
      //인증성공
      if(!signLoading && !error){
        let params = {
          lec_idx: sl_idx,
          redirect_key
        }
        setTimeout(() => {
          const usr_id = window.localStorage.getItem("usr_id")
          dispatch(actions.createRoom(params))
        }, 1000 * 1);
      }else{
        props.history.push("/")
      }
    }else{
      props.history.push("/401")
    }
  }, [])
  return (
    <div className="create-room">
      <Loading />
    </div>
    
  )
}

export default CreateRoom
