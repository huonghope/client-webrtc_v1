import React, { useEffect, useState } from "react"
import Icon from "../../../../../constants/icons"
import { useDispatch, useSelector } from 'react-redux';
import './style.scss'
import '../style.scss'
import headingControllerSocket from '../HeadingController.Socket'
import getSocket from "../../../../rootSocket";
import headingControllerAction from '../HeadingController.Action'
import roomSelector from '../../../MeetingRoom.Selector';
import remoteStreamContainerSelector from '../../RemoteStreamContainer/RemoteStreamContainer.Selector'
import { Button } from "../../../../../components/Button";

function HeadingControllerStudent({handleOutRoom, handleWindowSize}) {
  
  const [requestQuestionSended, setRequestQuestionSended] = useState(false)
  const [requestQuestionDoing, setRequestQuestionDoing] = useState(false)
  const [requestLecOutSended, setRequestLecOutSended] = useState(false)
  const [requestLecOutDoing, setRequestLecOutDoing] = useState(false)
  const [windowSize, setWindowSize] = useState(false)

  const isHostUser = useSelector(roomSelector.selectIsHostUser)
  const lectureInfo = useSelector(remoteStreamContainerSelector.getLectureInfo)
  const dispatch = useDispatch();


  const [isBtnRequestQuestion, setIsBtnRequestQuestion] = useState(false)
  const [isBtnRequestLecOut, setIsBtnRequestLecOut] = useState(false)
  
  useEffect(() => {

    if(!isHostUser){
      dispatch(headingControllerAction.handleChangeMicState())
    }
  },[isHostUser])


  //상태 확인 할 필요함
  useEffect(() => {
    getSocket().on("alert-user-process-req-question", data => {
        dispatch(headingControllerAction.handleChangeMicState())
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

  const handleChangeWindowSize = () => {
    setWindowSize(!windowSize)
    if(!windowSize){
      document.documentElement.requestFullscreen();
    } else{
      if(document.fullscreenElement !== null)
          document.exitFullscreen();
    }
    handleWindowSize()
  }

  //Cancel 이벤트를 처리해야함
  //state에서 따라서 처리필요함
  const handleRequestQuestion = () => {
    setIsBtnRequestQuestion(true)
    setTimeout(() => setIsBtnRequestQuestion(false), 1000);
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
        dispatch(headingControllerAction.handleChangeMicState())
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
    setIsBtnRequestLecOut(true)
    setTimeout(() => setIsBtnRequestLecOut(false), 1000);
    
     //!처음에
    //아직 요청하지 않고 하고 있는 상태가 아님
    if(!requestLecOutSended && !requestLecOutDoing){
      const payload = {
        status : 'waiting',
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
  const TextButtonRequestQuestion = requestQuestionSended ? "음성질문 요청중/취소..." : requestQuestionDoing ? "음성질문 끝내기" : "음성질문 요청"
  const StyleButtonRequestLecOut = requestLecOutSended ? {backgroundColor: "white", color: "black"} : requestLecOutDoing ? {backgroundColor: "yellow", color: "black"} : {}
  const TextButtonRequestLecOut = requestLecOutSended ? "자리비움 요청중/취소..." : requestLecOutDoing ? "자리비움 취소" : "자리비움 요청"

  //!버튼 상태를 확인할 필요함

  console.log(StyleButtonRequestQuestion)
  return <div className="heading-stream__controller">
    <div className="heading-container__small">
      <div className="heading-col">
        <ul>
          <li><img onClick={() => handleOutRoom()}  src={Icon.lecOutIcon} />
            <span>나가기</span>
          </li>
          <li><img onClick={() => handleChangeWindowSize()} src={windowSize ? Icon.lecWindowSmallIcon : Icon.lecWindowBigIcon} /> 
            <span>{ windowSize ? "창모드" : "전체화면"}</span>
          </li>
        </ul>
      </div>
      <div className="heading-col">
        <ul>
          <li className="request-task">
            <Button buttonSize="btn--medium" buttonStyle="btn--click btn--primary" onClick={() => handleRequestQuestion()} style={StyleButtonRequestQuestion} disabled={isBtnRequestQuestion}  >
              {TextButtonRequestQuestion}
            </Button>
          </li>
          <li className="request-task">
            <Button buttonSize="btn--medium" buttonStyle="btn--click btn--primary" onClick={() => handleRequestLecOut()} style={StyleButtonRequestLecOut} disabled={isBtnRequestLecOut}>
              {TextButtonRequestLecOut}
            </Button>
          </li>
        </ul>
      </div>
      <div className="heading-col">
        <ul>
          <li><p>{JSON.parse(localStorage.getItem("asauth")).userInfoToken.userName} / </p></li>
          <li><p className="course-name">{lectureInfo ? lectureInfo.lecture_nm : ""}</p></li>
        </ul>
      </div>
    </div>
  </div>
}


export default HeadingControllerStudent
