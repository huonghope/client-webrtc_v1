import React, { useEffect } from "react"
import "./style.scss"
import { useDispatch, useSelector } from "react-redux"
import Loading from '../../components/Loading'

import actions from '../../features/AuthFeature/action';
import selectors from '../../features/AuthFeature/selector';
import { isMobile } from 'react-device-detect';

import qs from 'query-string'

function CreateRoom(props) {

  const dispatch = useDispatch();
  const signLoading = useSelector(selectors.selectSignInLoading)
  const error = useSelector(selectors.selectSignInError)

  useEffect(() => {
    const query = qs.parse(window.location.search.slice(1));
    const { redirect_key, sl_idx, user_idx } = query   
    if (redirect_key && sl_idx && user_idx) {
      let userInfo = {
        redirect_key,
        sl_idx,
        user_idx,
      }
      localStorage.clear();
      dispatch(actions.doSignIn(userInfo))
      //인증성공
      if(!signLoading && !error){
        let params = {
          lec_idx: sl_idx,
          redirect_key,
          isMobile
        }
        setTimeout(() => {
          // const usr_id = window.localStorage.getItem("usr_id")
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
      <Loading type={"bars"} color={"white"} />
    </div>
    
  )
}

export default CreateRoom
