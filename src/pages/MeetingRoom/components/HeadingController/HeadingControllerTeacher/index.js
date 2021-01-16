import React, { useState } from "react"
import Icon from "../../../../../constants/icons"
import './style.scss'
import { useDispatch, useSelector } from 'react-redux';
import meetingRoomSelectors from '../../../MeetingRoom.Selector'
import CountTime from "../../../../../components/CountTime";

import headingControllerAction from '../HeadingController.Action'
import headingControllerSocket from '../HeadingController.Socket'

function HeadingController({handleOutRoom, handleWindowSize, handleScreenMode, handleWhiteBoard, handleScreamRecording}) {

  const dispatch = useDispatch();
  const localStreamState = useSelector(meetingRoomSelectors.getLocalStream);

  const [stateMicAllStudent, setStateMicAllStudent] = useState(false)
  const [micState, setMicState] = useState(false)
  const [camState, setCamState] = useState(false)
  const [recording, setRecording] = useState(false)
  const [windowSize, setWindowSize] = useState(false)

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
  const handleStateMicAllStudent = () => {
    setStateMicAllStudent(!stateMicAllStudent)
    // dispatch(headingControllerAction.handleStateMicAllStudent())
    headingControllerSocket.emitHandleStateMicAllStudent(!stateMicAllStudent)
  }
  const handleMicState = () => {
    setMicState(!micState)
    dispatch(headingControllerAction.handleChangeMicState())
  }
  const handleCamState = () => {
    setCamState(!camState)
    dispatch(headingControllerAction.handleChangeCamState())
  }
  const handleRecording = () => {
    setRecording(!recording)
    handleScreamRecording()
  }
  return <div className="heading-stream__controller">
    <div className={windowSize ? "heading-container__big" : "heading-container__small"}>
      <div className="heading-col">
        <ul>
          <li>
            <img onClick={() => handleOutRoom()}  src={Icon.lecOutIcon} />
            <span>나가기</span>
          </li>
          <li>
            <img onClick={() => handleChangeWindowSize()} src={windowSize ? Icon.lecWindowSmallIcon : Icon.lecWindowBigIcon} /> 
            <span>{windowSize ? "창모드" : "전체화면"}</span>  
          </li>
        </ul>
      </div>
      <div className="heading-col">
        <ul>
          <li>
            <img onClick={() => handleStateMicAllStudent()} src={stateMicAllStudent ? Icon.lecStudentSoundOnIcon : Icon.lecStudentSoundOffIcon} />
            <span>전체 학생 마이크</span>
          </li>
          <li>
            <img onClick={() => handleMicState()} src={micState ? Icon.lecMicOffIcon : Icon.lecMicOnIcon}  />
            <span>내마이크</span>
          </li>
          <li>
            <img onClick={() => handleCamState()} src={camState ? Icon.lecCamOffIcon : Icon.lecCamOnIcon} />
            <span>내 웹캡</span>
          </li>
          <li>
            <img onClick={() => handleRecording()} src={recording ? Icon.lecRecodingIcon : Icon.lecRecodingIcon} />
            <span>기록</span>
          </li>
          {
            //!refactory
            recording &&
            <li className="record-time"><CountTime /></li>
          }
        </ul>
      </div>
      <div className="heading-col">
        <ul>
          <li>
            <img onClick={() => handleWhiteBoard()} src={Icon.lecScreenWhiteBoard} />
            <span>화이트보드</span>
          </li>
          <li><img onClick={() => handleScreenMode()} src={Icon.lecScreenShare} />
          <span>화면공유</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
}


export default HeadingController
