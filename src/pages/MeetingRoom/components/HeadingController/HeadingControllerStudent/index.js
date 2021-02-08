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

function HeadingControllerStudent({ handleOutRoom, handleWindowSize }) {

  const [requestQuestionSended, setRequestQuestionSended] = useState(false)
  const [requestQuestionDoing, setRequestQuestionDoing] = useState(false)
  const [requestLecOutSended, setRequestLecOutSended] = useState(false)
  const [requestLecOutDoing, setRequestLecOutDoing] = useState(false)
  const [windowSize, setWindowSize] = useState(false)

  const isHostUser = useSelector(roomSelector.selectIsHostUser)
  const lectureInfo = useSelector(remoteStreamContainerSelector.getLectureInfo)
  const request = useSelector(remoteStreamContainerSelector.getUserRequest)
  const dispatch = useDispatch();


  const [isBtnRequestQuestion, setIsBtnRequestQuestion] = useState(false)
  const [isBtnRequestLecOut, setIsBtnRequestLecOut] = useState(false)


  //!이거 왜?
  useEffect(() => {
    if (!isHostUser) {
      dispatch(headingControllerAction.handleChangeMicState(false))
    }
  }, [isHostUser])

  //!limit re-render ???
  /**
   * @request : store에 다가 저장하는 요청의 정보를 받아서 HeadingController 버튼의 상태를 변경
   * @status : 
   * - 'waiting'를 요청을 보내고 있음
   * - 1 && end_time === null: 해당하는 요청을 끝남
   * 
   */
  useEffect(() => {
    //요청을 상태를 확인하기
    if (request && request.status !== "0") {
      const { type, status, reqInfo } = request
      if (type === 'request_question') {
        if (status === 'waiting') { //요청을 기다리고 있음
          const payload = {
            status: "waiting",
            userRoomId: UserRoomId()
          }
          setRequestQuestionSended(true)
          headingControllerSocket.emitUserRequestQuestion(payload);
        } else if (status === '1' && reqInfo.end_time === null) { //요청을 진행하고 있는데, 끝나지 않음
          console.log("질문요청 진행하고 있음")
          setRequestQuestionSended(false)
          setRequestQuestionDoing(true)
        }
      } else if (type === 'request_lecOut') {
        if (status === 'waiting') { //요청을 기다리고 있음
          const payload = {
            status: 'waiting',
            userRoomId: UserRoomId()
          }
          setRequestLecOutSended(true)
          headingControllerSocket.emitUserRequestLecOut(payload);
        } else if (status === '1' && reqInfo.end_time === null) { //요청을 진행하고 있는데, 끝나지 않음
          setRequestLecOutSended(false)
          setRequestLecOutDoing(true)
        }
      }
    }
  }, [request])

  //상태 확인 할 필요함
  useEffect(() => {
    //여기 확인
    getSocket().on("alert-user-process-req-question", data => {  
      dispatch(headingControllerAction.handleChangeMicState(data))
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
    if (!windowSize) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.fullscreenElement !== null)
        document.exitFullscreen();
    }
    handleWindowSize()
  }
  //Cancel 이벤트를 처리해야함
  //state에서 따라서 처리필요함
  const handleRequestQuestion = () => {
    if(requestLecOutSended || requestLecOutDoing){
      alert("자리비움 요청하고 있습니다!!!");
      return;
    }

    setIsBtnRequestQuestion(true)
    setTimeout(() => setIsBtnRequestQuestion(false), 1000);
    //!처음에
    //아직 요청하지 않고 하고 있는 상태가 아님
    if(!requestQuestionSended && !requestQuestionDoing){ //요청을 보냈음
      const payload = {
        status : true,
        userRoomId: UserRoomId()
      }
      setRequestQuestionSended(true)
      headingControllerSocket.emitUserRequestQuestion(payload);
    }else if(requestQuestionDoing){ // 하다가 최소함
        const payload = {
          status : false,
          userRoomId: UserRoomId(),
        }
        setRequestQuestionSended(false)
        setRequestQuestionDoing(false)
        headingControllerSocket.emitUserCancelRequestQuestion(payload);
        dispatch(headingControllerAction.handleChangeMicState(false))
    }else if(requestQuestionSended){ //요청하다가 죄송함
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

    if (requestQuestionSended || requestQuestionDoing) {
      alert("음성 질문 요청하고 있습니다!!!");
      return;
    }

    setIsBtnRequestLecOut(true)
    setTimeout(() => setIsBtnRequestLecOut(false), 1000);
    //!처음에
    //아직 요청하지 않고 하고 있는 상태가 아님
    if (!requestLecOutSended && !requestLecOutDoing) {
      const payload = {
        status: 'waiting',
        userRoomId: UserRoomId()
      }
      setRequestLecOutSended(true)
      headingControllerSocket.emitUserRequestLecOut(payload);
    } else if (requestLecOutDoing) { //!sending -2전체를 클릭하면 취소
      const payload = {
        status: false,
        userRoomId: UserRoomId()
      }
      setRequestLecOutSended(false)
      setRequestLecOutDoing(false)
      headingControllerSocket.emitUserCancelRequestLecOut(payload);
    } else if (requestLecOutSended) {
      const payload = {
        status: false,
        userRoomId: UserRoomId()
      }
      setRequestLecOutSended(!requestLecOutSended)
      headingControllerSocket.emitUserCancelRequestLecOut(payload);
    }
  }
  // const StyleButtonRequestQuestion = requestQuestionSended ? {backgroundColor: "white", color: "black"} : requestQuestionDoing ? {backgroundColor: "yellow", color: "black"} : {}
  const TextButtonRequestQuestion = requestQuestionSended ? "음성질문 요청중/취소..." : requestQuestionDoing ? "음성질문 끝내기" : "음성질문 요청"
  // const StyleButtonRequestLecOut = requestLecOutSended ? {backgroundColor: "white", color: "black"} : requestLecOutDoing ? {backgroundColor: "yellow", color: "black"} : {}
  const TextButtonRequestLecOut = requestLecOutSended ? "자리비움 요청중/취소..." : requestLecOutDoing ? "자리비움 취소" : "자리비움 요청"

  //!버튼 상태를 확인할 필요함

  return <div className="heading-stream__controller">
    <div className="heading-container__small">
      <div className="heading-col">
        <ul>
          <li><img onClick={() => handleOutRoom()} src={Icon.lecOutIcon} alt="lec-out" />
            <span>나가기</span>
          </li>
          <li><img onClick={() => handleChangeWindowSize()} src={windowSize ? Icon.lecWindowSmallIcon : Icon.lecWindowBigIcon} alt="window-size" />
            <span>{windowSize ? "창모드" : "전체화면"}</span>
          </li>
        </ul>
      </div>
      <div className="heading-col">
        <ul>
          <li className="request-task">
            <Button buttonSize="btn--medium" buttonStyle="btn--click btn--primary" onClick={() => handleRequestQuestion()} disabled={isBtnRequestQuestion}  >
              {TextButtonRequestQuestion}
            </Button>
          </li>
          <li className="request-task">
            <Button buttonSize="btn--medium" buttonStyle="btn--click btn--primary" onClick={() => handleRequestLecOut()} disabled={isBtnRequestLecOut}>
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
