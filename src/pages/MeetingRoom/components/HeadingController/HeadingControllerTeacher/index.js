import React, {useState,useEffect } from "react"
import Icon from "../../../../../constants/icons"
import './style.scss'
import '../style.scss'
import { useDispatch, useSelector } from 'react-redux';
// import meetingRoomSelectors from '../../../MeetingRoom.Selector'
import CountTime from "../../../../../components/CountTime";

import headingControllerAction from '../HeadingController.Action'
import headingControllerSocket from '../HeadingController.Socket'
import roomSelector from '../../../MeetingRoom.Selector';

function HeadingController({handleOutRoom, handleWindowSize, handleScreenMode,handleScreenModeMain,handleStopSharingScreen, handleWhiteBoard, handleScreamRecording}) {

  const dispatch = useDispatch();

  const [stateMicAllStudent, setStateMicAllStudent] = useState(false)
  const [micState, setMicState] = useState(false)
  const [camState, setCamState] = useState(false)
  const [recording, setRecording] = useState(false)
  const [windowSize, setWindowSize] = useState(false)
  const [paintScream, setPaintScream] = useState(false)

  const [whiteBoard, setWhiteBoard] = useState(false)
  const [sharingStream, setSharingStream] = useState(false)

  const shareScreen = useSelector(roomSelector.selectShareScreen)

  const handleChangeWindowSize = (e = null) => {
    if(!windowSize){
      setWindowSize(!windowSize)
      setTimeout(() => {
        document.documentElement.requestFullscreen();
      }, 300);
    } else{
      setWindowSize(!windowSize)
      if(document.fullscreenElement !== null)
          document.exitFullscreen();
    }
    handleWindowSize()
  }

  useEffect(() => {
    setWhiteBoard(shareScreen)
    setSharingStream(shareScreen)
  }, [shareScreen])
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
  const handleWhiteBoardClick = () => {
    if(!paintScream){
      //화이트보드 ON
      setPaintScream(!paintScream)
      handleWhiteBoard()
      // handleWindowSize()
      // handleChangeWindowSize()
      handleScreenMode()
    } else{
      //화이트보드 OFF
        setWhiteBoard(!whiteBoard)
        setPaintScream(!paintScream)
        handleWhiteBoard()
      }
  }

  const handleClickShareScreen = () => {
    if(sharingStream){
      handleStopSharingScreen()
    }else{
      setWhiteBoard(!whiteBoard)
    }
  }
  
  return <div className="heading-stream__controller">
    <div className={windowSize ? "heading-container__big" : "heading-container__small"}>
      <div className="heading-col">
        <ul>
          <li>
            <img onClick={() => handleOutRoom()}  src={Icon.lecOutIcon} alt="out" />
            <span>나가기</span>
          </li>
          <li>
            <img onClick={() => handleChangeWindowSize()} src={windowSize ? Icon.lecWindowSmallIcon : Icon.lecWindowBigIcon} alt="change-win-size"/> 
            <span>{windowSize ? "창모드" : "전체화면"}</span>  
          </li>
        </ul>
      </div>
      <div className="heading-col">
        <ul>
          <li>
            <img onClick={() => handleStateMicAllStudent()} src={stateMicAllStudent ? Icon.lecStudentSoundOnIcon : Icon.lecStudentSoundOffIcon} alt="all-mic-student" />
            <span>전체 학생 마이크</span>
          </li>
          <li>
            <img onClick={() => handleMicState()} src={micState ? Icon.lecMicOffIcon : Icon.lecMicOnIcon}  alt="my-mic" />
            <span>내마이크</span>
          </li>
          <li>
            <img onClick={() => handleCamState()} src={camState ? Icon.lecCamOffIcon : Icon.lecCamOnIcon} alt="mycam"/>
            <span>내 웹캡</span>
          </li>
          <li>
            <img onClick={() => handleRecording()} src={recording ? Icon.lecPauseIcon : Icon.lecRecodingIcon } alt="record"/>
            <span>{recording ? "녹화중" : "녹화"}</span>
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
          {/* <li>
            <img onClick={() => handleWhiteBoardClick()} src={Icon.lecScreenWhiteBoard} alt="board" />
            <span>화이트보드</span>
          </li> */}
          <li className="btn-white">
            <img  onClick={() => handleClickShareScreen()} src={sharingStream ? Icon.chatWTalkOffIcon :  Icon.lecScreenShare}  alt="share-scream"/>
            <span style ={sharingStream ? {color: "red"} : {}}>{sharingStream ? "화면 공유 중지" : "화면공유" }</span>
            {
            whiteBoard && !sharingStream &&
            <div className="wrapper-white">
              <ul>
                <li onClick={() => { 
                  handleScreenModeMain(); 
                }}>
                  <img src={Icon.lecScreenShare}  alt="share-screen"/>
                  <span>화면공유</span>
                </li>
                <li onClick={() => { 
                  handleWhiteBoardClick();
                }} >
                  <img src={Icon.lecScreenWhiteBoard} alt="board"/>
                  <span>화이트보드</span>
                </li>
              </ul>
            </div>
            } 
          </li>
        </ul>
      </div>
    </div>
  </div>
}


export default HeadingController
