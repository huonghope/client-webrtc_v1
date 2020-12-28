import React, { useEffect, useState } from "react"
import Icon from "../../../../../constants/icons"
import { useDispatch, useSelector } from 'react-redux';
import './style.scss'
import headingControllerSocket from '../HeadingController.Socket'
import getSocket from "../../../../rootSocket";
import headingControllerAction from '../HeadingController.Action'

function HeadingControllerStudent({handleOutRoom}) {
  
  const [requestQuestionSended, setRequestQuestionSended] = useState(false)
  const [requestQuestionDoing, setRequestQuestionDoing] = useState(false)
  const [requestLecOutSended, setRequestLecOutSended] = useState(false)
  const [requestLecOutDoing, setRequestLecOutDoing] = useState(false)


  const dispatch = useDispatch();

  useEffect(() => {
    getSocket().on("alert-user-process-req-question", data => {
        if(data){
          dispatch(headingControllerAction.handleChangeMicState())
        }
        setRequestQuestionSended(false)
        setRequestQuestionDoing(data)
    })
    getSocket().on("alert-user-process-req-lecOut", data => {
      setRequestLecOutSended(false)
      setRequestLecOutDoing(data)
    })
  }, [])
  const UserRoomId = () => {
    return JSON.parse(window.localStorage.getItem("usr_id"))
  }


  //Cancel 이벤트를 처리해야함
  //state에서 따라서 처리필요함
  const handleRequestQuestion = () => {
    //!처음에
    //아직 요청하지 않고 하고 있는 상태가 아님
    if(!requestQuestionSended && !requestQuestionDoing){
      const payload = {
        status : true,
        userRoomId: UserRoomId()
      }
      setRequestQuestionSended(true)
      headingControllerSocket.emitUserRequestQuestion(payload);
    }else if(requestQuestionDoing){ //!sending -2전체를 클릭하면 취소
        const payload = {
          status : false,
          userRoomId: UserRoomId()
        }
        setRequestQuestionSended(false)
        setRequestQuestionDoing(false)
        headingControllerSocket.emitUserCancelRequestQuestion(payload);
    }else if(requestQuestionSended){
      const payload = {
        status : false,
        userRoomId: UserRoomId()
      }
      setRequestQuestionSended(!requestQuestionSended)
      headingControllerSocket.emitUserCancelRequestQuestion(payload);
    }
    
  }


  //Cancel 이벤트를 처리해야함
  const handleRequestLecOut = () => {
     //!처음에
    //아직 요청하지 않고 하고 있는 상태가 아님
    if(!requestLecOutSended && !requestLecOutDoing){
      const payload = {
        status : true,
        userRoomId: UserRoomId()
      }
      setRequestLecOutSended(true)
      headingControllerSocket.emitUserRequestLecOut(payload);
    }else if(requestLecOutDoing){ //!sending -2전체를 클릭하면 취소
        const payload = {
          status : false,
          userRoomId: UserRoomId()
        }
        setRequestLecOutSended(false)
        setRequestLecOutDoing(false)
        headingControllerSocket.emitUserCancelRequestLecOut(payload);
    }else if(requestLecOutSended){
      const payload = {
        status : false,
        userRoomId: UserRoomId()
      }
      setRequestLecOutSended(!requestLecOutSended)
      headingControllerSocket.emitUserCancelRequestLecOut(payload);
    }
  }


  const StyleButtonRequestQuestion = requestQuestionSended ? {backgroundColor: "white", color: "black"} : requestQuestionDoing ? {backgroundColor: "yellow", color: "black"} : {}
  const TextButtonRequestQuestion = requestQuestionSended ? "음성질문 요청중/취소..." : requestQuestionDoing ? "음성질문 취소" : "음성질문 요청"
  const StyleButtonRequestLecOut = requestLecOutSended ? {backgroundColor: "white", color: "black"} : requestLecOutDoing ? {backgroundColor: "yellow", color: "black"} : {}
  const TextButtonRequestLecOut = requestLecOutSended ? "자리비움 요청중/취소..." : requestLecOutDoing ? "자리비움 취소" : "자리비움 요청"


  //!버튼 상태를 확인할 필요함
  return <div className="heading-stream__controller">
    <div className="heading-container__small">
      <div className="heading-col">
        <ul>
          <li><img onClick={() => handleOutRoom()}  src={Icon.lecOutIcon} /></li>
        </ul>
      </div>
      <div className="heading-col">
        <ul>
          <li className="request-task">
            <button onClick={() => handleRequestQuestion()} style={StyleButtonRequestQuestion} >
              {TextButtonRequestQuestion}
            </button>
          </li>
          <li className="request-task">
            <button onClick={() => handleRequestLecOut()} style={StyleButtonRequestLecOut}>
              {TextButtonRequestLecOut}
            </button>
          </li>
        </ul>
      </div>
      <div className="heading-col">
        <ul>
          <li><p> 수학 강의 </p></li>
        </ul>
      </div>
    </div>
  </div>
}


export default HeadingControllerStudent
