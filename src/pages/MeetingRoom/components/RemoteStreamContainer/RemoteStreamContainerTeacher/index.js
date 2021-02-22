import React, { Component, useState, useEffect } from 'react'
import { connect, useDispatch, useSelector } from 'react-redux'
import { bindActionCreators } from "redux"
import styled from 'styled-components'
import moment from "moment"
import './style.scss'
import { getInformationRoom, getLectureInfo, getWarningInfo, getRequestQuestion, getRequestLecOut } from '../RemoteStreamContainer.Service'
import remoteStreamContainer from '../RemoteStreamContainer.Socket'
import remoteStreamContainerAction from '../RemoteStreamContainer.Action'
import remoteStreamSelector from '../RemoteStreamContainer.Selector'

import chatComponentSocket from '../../ChatComponent/ChatComponent.Socket'
import chatAction from '../../ChatComponent/ChatComponent.Action'

import headingControllerAction from '../../HeadingController/HeadingController.Action'

import getSocket from "../../../../rootSocket"
import Icon from '../../../../../constants/icons'
import Video from '../../Video'
import CountTime from '../../../../../components/CountTime'
import Alert from "../../../../../components/Alert"
import { Button } from '../../../../../components/Button'

let intervalTime = "";
class RemoteStreamContainer extends Component {
  constructor(props) {
    super(props)

    this.state = {
      rVideos: [],
      listDescRemotes: [], //전체 유저의 리스트
      // @template
      // listUserRequest: [{
      //   userId: null,
      //   type: null,
      //   remoteId: null,
      //   state: null,
      //   reqInfo: null
      // }], 
      
    
      loading: true,
    }
  }
  /**
   * 먼저 API를 보내서 해당하는 방의 들어갈 사람을 체크함
   * Host누군이지를 체크하면서 Video를 출력함
   */
  componentDidMount() {
    /**
     * all 
     * 학생은 음성 질문요청, 자리비움 요청 등을 보낼떄 강사화면에서 알림
     * 이에는 요청한 학생들이 리스트를 저장함
     * @listDescRemotes 연결되어 있는 peer 리스트
     * @listUserRequest 요청한 유저 리스트
     * @data 서버부터 남겨준 데이터
     * @data.remoteSocketId: 요청한 학생 socket id
     * @data.status: 요청한 상태
     * @data.reqInfo: 요청한 디테일 정보
     * @data.type: 요청타입
     * @NOTE: 일단 각 요청타일 똑같이 구현했음
     */
    
    /**
     * 자리비룸요청 이벤트 처리함
     * @status
     * - waiting: 보내고 있음
     * - false: 취소:
     * 
     */
    getSocket().on("alert-host-lecOut", data => {
      const { listDescRemotes } = this.state;
      const { remoteSocketId, status, reqInfo, type } = data;
      const { listUserRequest } = this.props
      // console.log(listUserRequest)
      //요청한 유저 및 기본 요청하던 유저의 Video를 수정
      let _rVideos = listDescRemotes.map((rVideo, idx) => {
        let video = RenderVideoForRequest(listUserRequest, rVideo, data);
        return video
      })
      let valueRequest = {
        userId: reqInfo.user_idx,
        type: type,
        remoteId: remoteSocketId,
        status: status,
        reqInfo: reqInfo
      }
      //해당하는 요청을 state 및 store에 다가 저장함
      let isExistsRequest = listUserRequest.find(e => e.userId === reqInfo.user_idx)
      
      //현재유저는 요청 했으면 새로 요청을 수정함 또는 있는데 취소(status = false) => 제거함
      if(isExistsRequest){
        let filter = status ? listUserRequest.map(e => e.userId === reqInfo.user_idx ? valueRequest : e) :
        listUserRequest.filter(e => e.userId !== reqInfo.user_idx)
        this.setState({
          rVideos: _rVideos,
          // listUserRequest: filter
        })
        //store에서 저장함
        this.props.dispatch(remoteStreamContainerAction.saveListUserRequest(filter))
      }else{
        //없는 경우에는 요청 리스트에 집어넣움
        let filter = [...listUserRequest, valueRequest];
        this.setState({
          rVideos: _rVideos,
        })
        //store에서 저장함
        this.props.dispatch(remoteStreamContainerAction.saveListUserRequest(filter))
      }
    })

    /**
     * 자리비룸요청 이벤트 처리함
     */
    getSocket().on("alert-host-question", data => {
      const { listDescRemotes } = this.state;
      const { remoteSocketId, status, reqInfo, type } = data;
      const { listUserRequest } = this.props
      // console.log(listUserRequest)
      //요청한 유저의 Video를 수정
      let _rVideos = listDescRemotes.map((rVideo, idx) => {
        let video = RenderVideoForRequest(listUserRequest, rVideo, data);
        return video
      })

      let valueRequest = {
        userId: reqInfo.user_idx,
        type: type,
        remoteId: remoteSocketId,
        status: status,
        reqInfo: reqInfo
      }
  
      //해당하는 요청을 state 및 store에 다가 저장함
      let isExistsRequest = listUserRequest.find(e => e.userId === reqInfo.user_idx)

      //현재유저는 요청 했으면 새로 요청을 수정함
      if(isExistsRequest){
        let filter = status ? listUserRequest.map(e => e.userId === reqInfo.user_idx ? valueRequest : e) :
        listUserRequest.filter(e => e.userId !== reqInfo.user_idx)
        this.setState({
          rVideos: _rVideos,
        })
        //store에서 저장함
        this.props.dispatch(remoteStreamContainerAction.saveListUserRequest(filter))
      }else{
        //없는 경우에는 요청 리스트에 집어넣움
        let filter = [...listUserRequest, valueRequest];
        this.setState({
          rVideos: _rVideos,
        })
        //store에서 저장함
        this.props.dispatch(remoteStreamContainerAction.saveListUserRequest(filter))
      }
    })

    //강사는 유저의 요청을 처리한 다음에 화면을 어떻게 출력함
    getSocket().on("alert-host-process-req-question", data => {
      const { listDescRemotes } = this.state;
      const { remoteSocketId, type, reqInfo, status } = data;
      const { listUserRequest } = this.props
      // console.log(listUserRequest)
      //수락한 경우에는 강사화면을 re-render
      if (status) {
        let _rVideos = listDescRemotes.map((rVideo, idx) => {
            let video = RenderVideoAfterProcessReq(listUserRequest, rVideo, data)
            return video
        })

        let valueRequest = {
          userId: reqInfo.user_idx,
          type: type,
          remoteId: remoteSocketId,
          status: status,
          reqInfo: reqInfo
        }
         //! 확인할 필요함
        this.setState({
          rVideos: _rVideos,
        })
        let filter = listUserRequest.map(e => e.userId === reqInfo.user_idx ? valueRequest : e)
        this.props.dispatch(remoteStreamContainerAction.saveListUserRequest(filter))
      }else{
        //거절하는 경우에는 user_request에서 지움
        let filter = listUserRequest.filter(item => item.userId !== reqInfo.user_idx)
        this.props.dispatch(remoteStreamContainerAction.saveListUserRequest(filter))
      }
    })

    //강사는 유저의 요청을 처리한 다음에 화면을 어떻게 출력함
    getSocket().on("alert-host-process-req-lecOut", data => {
      const { listDescRemotes } = this.state;
      const { remoteSocketId, type, reqInfo, status } = data;
      const { listUserRequest } = this.props
      // console.log(listUserRequest)
      //수락한 경우에는
      if (status) {
        //해당하는 요청을 video를 찾아서 수정함
        let _rVideos = listDescRemotes.map((rVideo, idx) => {
            let video = RenderVideoAfterProcessReq(listUserRequest, rVideo, data)
            return video
        })
        //요청 정보를 업데이터
        let valueRequest = {
          userId: reqInfo.user_idx,
          type: type,
          remoteId: remoteSocketId,
          status: status,
          reqInfo: reqInfo
        }

        //요청 정보를 store 및 state 집어넣음
        //! 확인할 필요함
        this.setState({
          rVideos: _rVideos,
        })
        let filter = listUserRequest.map(e => e.userId === reqInfo.user_idx ? valueRequest : e)
        this.props.dispatch(remoteStreamContainerAction.saveListUserRequest(filter))
      }else{
        //거절하는 경우에는 user_request에서 지움
        let filter = listUserRequest.filter(item => item.userId !== reqInfo.user_idx)
        this.props.dispatch(remoteStreamContainerAction.saveListUserRequest(filter))
      }
    })

    //음성이 진행하고 있는 학생이 어떻게 함
    getSocket().on("alert-user-mute-mic-all", data => {
      const { data : status } = data;
      this.props.dispatch(headingControllerAction.handleStateMicAllStudent(status))
    })

    const UserRoomId = () => {
      return JSON.parse(window.localStorage.getItem("usr_id"))
    }
    const fetchData = async () => {
      let params = {
        userRoomId: UserRoomId()
      }

      setTimeout(async() => {
        //해당하는룸의 요청을 리스트 받음
        const resQuestion = await getRequestQuestion(params)
        const resLecOut = await getRequestLecOut(params)
        const { data : resQuestionData  } = resQuestion
        const { data : resLecOutData } = resLecOut
        let listRequestTemp = []
        resQuestionData.map((item, idx) => {
          if(item.req_status !== "0" && item.end_time === null){
            let valueRequest = {
              userId: item.user_idx,
              type: "request_question",
              remoteId: item.socket_id,
              status: item.req_status,
              reqInfo: item
            }
            listRequestTemp.push(valueRequest)
          }
          return true
        })
        resLecOutData.map((item,idx) => {
          if(item.req_status !== "0" && item.end_time === null){
            let valueRequest = {
              userId: item.user_idx,
              type: "request_lecOut",
              remoteId: item.socket_id,
              status: item.req_status,
              reqInfo: item
            }
            listRequestTemp.push(valueRequest)
          }
          return true
        })
        //!체크함
        // console.log(listRequestTemp)
        this.props.dispatch(remoteStreamContainerAction.saveListUserRequest(listRequestTemp))
      }, 1000);
      


      //해당하는룸의 강좌의 정보를 받아서 집중도 테스트값을 설정
      const resp = await getLectureInfo(params)
      this.props.dispatch(remoteStreamContainerAction.saveLectureInfo(resp))
      const { test_gap_time } = resp.data
      intervalTime = setInterval(() => {
        var min = 1,
          max = 8;
        var rand = Math.floor(Math.random() * (max - min + 1) + min);
        let payload = {
          number: rand
        }
        remoteStreamContainer.emitTestConcentration(payload)
      }, 1000 * 60 * Number(test_gap_time));
    }
    fetchData()
    if (this.props.remoteStreams.length !== 0) {
      const { remoteStreams } = this.props
      const fetchVideos = async () => {
        const { rVideos, filterRemote } = await SetVideos(remoteStreams, this.props)
        this.setState({
          rVideos: rVideos,
          listDescRemotes: filterRemote,
          loading: false
        })
      }
      fetchVideos();
    }
  }
  componentWillUnmount() {
    clearInterval(intervalTime)
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.remoteStreams !== nextProps.remoteStreams
    ) {
      //!요청한 학생 체크할 필요한가?
      const fetchVideos = async () => {
        const { rVideos, filterRemote } = await SetVideos(nextProps.remoteStreams, this.props)
        this.setState({
          rVideos: rVideos,
          listDescRemotes: filterRemote,
          loading: false
        })
      }
      fetchVideos();
    }
  }
  handleResize = () => {
    this.setState({ resize: !this.state.resize })
  };

  render() {
    const { loading } = this.state
    const { paintScream } = this.props
    if (loading) {
      return (
        <WrapperLoading className="loading" style={{background: 'black'}}>
          <div style={{transform: `translateY(${-50}%)`}}>
            <img src={Icon.WaitImage} style={{width: "140px", height: "140px"}} alt = "waiting"/>
            <p style={{textAlign: 'center', color: 'white'}}>학생의 입장을<br/> 
            기다리고 있습니다.</p>
          </div>
        </WrapperLoading>
      )
    }
    return (
      <div className="remote-stream__container" style={paintScream ? {display: "none"} : {}}>
        <div className="list-videos">
          <div className={`video-${this.state.rVideos.length}`}>
            {this.state.rVideos}
          </div>
        </div>
      </div>
    )
  }
}
//Video개별 Component
//!rVideo.id = socket.id
const VideoItem = ({ rVideo, userInfo, request, type, time, req_question_status, req_lecOut_status, startTime }) => {
  const [req, setReq] = useState()
  const [reqQuestionStatus, setReqQuestionStatus] = useState()
  const [reqLecOutStatus, setLecOutStatus] = useState()

  //!체크필요함
  useEffect(() => {
    setReqQuestionStatus(req_question_status)
    setLecOutStatus(req_lecOut_status)
    setReq(request)
  }, [time])

  const UserRoomId = () => {
    return JSON.parse(window.localStorage.getItem("usr_id"))
  }

  //!정보를 저장할필요함
  const handleClickReject = () => {
    setReq(false)
    const payload = {
      type: type,
      status: "reject",
      userId: userInfo.user_idx,
      userRoomId: UserRoomId(),
      remoteSocketId: rVideo.id
    }
    remoteStreamContainer.emitProcessRequestUser(payload)
    if (reqQuestionStatus) {
      setReqQuestionStatus(!reqQuestionStatus)
    }
  }

  const handleClickAccept = () => {
    setReq(false)
    const payload = {
      type: type,
      status: "accept",
      userId: userInfo.user_idx,
      userRoomId: UserRoomId(),
      remoteSocketId: rVideo.id
    }
    remoteStreamContainer.emitProcessRequestUser(payload)
  }

  return (
    <div className="video-item">
      <Video
        offMic={true}
        videoType="remoteVideo"
        videoStream={rVideo.stream}
        req_question_status={req_question_status}
        userInfo={userInfo}
      />
      <div className="btn-wrapper" style={req ? { display: "none" } : {}} >
        <WrapperTaskVideo
          userInfo={userInfo}
          socketId={rVideo.id}
        //handleClickWarning={() => handleClickWarning(rVideo.name)}
        //handleDisableChatting={() => handleDisableChatting(rVideo.name)}
        />
      </div>
      {
        req &&
        <div className="wrapper-request">
          <WrapperUserRequest
            type={type}
            userInfo={userInfo}
            handleClickAccept={() => handleClickAccept()}
            handleClickReject={() => handleClickReject()}
          />
        </div>
      }
      {
        reqQuestionStatus &&
        <div className="wrapper-request">
          <div>
            <h3>음성질문 중</h3><br/>
            <Button buttonStyle="btn--primary" onClick={() => handleClickReject()}> 음성질문 취소</Button>
          </div>
        </div>
      }
      {
        reqLecOutStatus &&
        <div className="wrapper-request">
          <div>
            <h3>자리비움 중</h3>
            <CountTime startTime = {startTime} />
          </div>
        </div>
      }
    </div>
  )
}
const sleep = async (ms) => {
  return new Promise((r) => setTimeout(() => r(), ms));
}
//socket_id 또는 유저의 id로 구분하면 좋을까??
//처음에 들어갈때 
const SetVideos =  (remoteStreams, props) => {
  // const dispatch = useDispatch();
  return new Promise((resolve, rej) => {
    //!두개 값을 이렇게 하면 될것같음
    let usr_id = localStorage.getItem("usr_id")
    let data = window.localStorage.getItem("asauth")
    let { userId } = JSON.parse(data).userInfoToken
    let params = { usr_id, userId }

    getInformationRoom(params).then(res => {
      const { data } = res
      //!여기서 유저인지 강사인지 구분해야됨
      //!fist for 강사 또는 
      let listUser = data
      
      //현재 연결되어 있는 Stream는 다시 체크할 필요함
      //연결되어있는 학생만 화면video 생성함
      listUser = listUser.filter(user => {
        let isExists = remoteStreams.filter(remoteStream => remoteStream.id === user.socket_id)
        if(isExists.length !== 0){
          return true;
        } 
        return false;
      })

      props.dispatch(remoteStreamContainerAction.saveListUser(listUser))
      let _filterRemote = remoteStreams.filter(rVideo => listUser.find(({ socket_id }) => rVideo.id === socket_id) && rVideo)
      let _rVideos = _filterRemote.map((rVideo, index) => {
        const _videoTrack = rVideo.stream.getTracks().filter(track => track.kind === "video")
        let [infoStreamBySocketId] = listUser.filter(element => element.socket_id === rVideo.name)
        _filterRemote[index].userInfo = infoStreamBySocketId
        
        /**
         * @desc: 연결되어있는 리스트중에서 요청한 학생이 있는지 없는지 체크함
         * @requestQuestion : 질문이 요청하고 있으면 socket를 통해서 해당하는 학생이 음성질문 요청을 허락
         * @requestLecOut : 자리비움 요청하고 있으면 time를 출력함
         * @status : waiting: 요청을 보내고있음, 1: 요청을 허락했음, 0: 요청을 취소했음
         * @start_time : 시작하는 시간
         * @end_time : 끝나는 시간
         */
        const { listUserRequest } = props
        let isExistsRequest = listUserRequest.find(e => e.userId === rVideo.userInfo.user_idx
        && e.status !== "0"
        && e.reqInfo.end_time === null) //요청이 없는 사람
        let video = null  

        //해당하는 학생이 요청하고 있고 끝나지 않는 경우에는
        if (isExistsRequest) { 
          const { type } = isExistsRequest
          const {  status } = isExistsRequest
          let requestValue = false
          let req_question_status = false
          let req_lecOut_status = false
          let startTime = null
          
          /**
           * @desc : 요청을 보내고 있는 경우에는 어떤 요청했는지 판단해서 화면을 출력함 
           * - 그렇지 않으면 어떤 요청을 진행하고 있는지 체크함
           */
          if (status === 'waiting') { //요청이 보내고 있음
            requestValue = true
          } else {
            //요청을 진행하고 있음
            req_question_status = type === 'request_question' ? status : false
            req_lecOut_status = type === 'request_lecOut' ? status : false
            if(type.includes('request_lecOut')){
              startTime = moment(isExistsRequest.reqInfo.start_time).format('DD/MM/YYYYHH:mm:ss')
            }else{
              const UserRoomId = () => {
                return JSON.parse(window.localStorage.getItem("usr_id"))
              }
              if(status){
                const payload = {
                  type: type,
                  status: "accept",
                  userId: isExistsRequest.userId,
                  userRoomId: UserRoomId(),
                  remoteSocketId: rVideo.name
                }
                remoteStreamContainer.emitProcessRequestUser(payload)
              }
            }
          }

          //음성질문이 하고 있는 요청
          video = _videoTrack ? (
            <VideoItem
              rVideo={rVideo}
              userInfo={rVideo.userInfo}
              request={requestValue}
              req_question_status={req_question_status}
              req_lecOut_status={req_lecOut_status}
              type={type}
              startTime={startTime}
            />) : <img src={Icon.boardWarning} alt="warning" />
        } else{
          //!요청이 없는 학생인 경우에는
          video = _videoTrack ? (
            <VideoItem
              rVideo={rVideo}
              userInfo={infoStreamBySocketId}
            />
          ) : <img src={Icon.boardWarning} alt= "warning"></img>
        }
        // sleep(500);
        return video
      })

      resolve({
        rVideos: _rVideos,
        filterRemote: _filterRemote,
      })
    })
  })
}

const RenderVideoAfterProcessReq = (listUserRequest, rVideo, data) => {
  const time = moment().format('DD/MM/YYYYHH:mm:ss')
  const { remoteSocketId, status, reqInfo, type } = data;
  let video = null;
  // let currentRequestUser = rVideo.name === remoteSocketId; //요청한 학생
  let currentRequestUser = rVideo.userInfo.user_idx === reqInfo.user_idx; 
  const _videoTrack = rVideo.stream.getTracks().filter(track => track.kind === "video")
  if(currentRequestUser){
    video = _videoTrack ? (<VideoItem
      rVideo={rVideo}
      userInfo={rVideo.userInfo}
      req_question_status={type === 'request_question' ? status : false}
      req_lecOut_status={type === 'request_lecOut' ? status : false}
      time={time}
      type={type}
    />) : <img src={Icon.boardWarning} alt="warning" />
  }else{
    let isExistsRequest = listUserRequest.find(e => Number(e.userId) === Number(rVideo.userInfo.user_idx)) //요청이 없는 사람
    if (!isExistsRequest) { //!요청이 없는 경우에는
      video = _videoTrack ? (
        <VideoItem
          rVideo={rVideo}
          userInfo={rVideo.userInfo}
          time={time}
        />) : <img src={Icon.boardWarning} alt="warning" />
    } else { //!요청이 있는 경우에는
      const { type } = isExistsRequest
      const {  status : otherUserStatus } = isExistsRequest
      let requestValue = false
      let req_question_status = false
      let req_lecOut_status = false
      if (otherUserStatus === 'waiting') { //요청이 보내고 있음
        requestValue = true
      } else {
        //요청을 진행하고 있음
        req_question_status = type === 'request_question' ? otherUserStatus : false
        req_lecOut_status = type === 'request_lecOut' ? otherUserStatus : false
      }
      //음성질문이 하고 있는 요청
      video = _videoTrack ? (
        <VideoItem
          rVideo={rVideo}
          userInfo={rVideo.userInfo}
          request={requestValue}
          req_question_status={req_question_status}
          req_lecOut_status={req_lecOut_status}
          type={type}
          time={time}
        />) : <img src={Icon.boardWarning} alt="warning" />
    }
  }
  return video
}

//!re-render 시 확인 필요함
//!remoteId 아님 유저 아이디 비교함
//remoteSocketId를 비교를 제대로 잘 암
const RenderVideoForRequest = (listUserRequest, rVideo, data) => {

  const time = moment().format('DD/MM/YYYYHH:mm:ss')
  const { remoteSocketId, status, reqInfo, type } = data;
  let video = null;
  // let currentRequestUser = rVideo.name === remoteSocketId; //요청한 학생
  let currentRequestUser = rVideo.userInfo.user_idx === reqInfo.user_idx; //요청한 학생
  const _videoTrack = rVideo.stream.getTracks().filter(track => track.kind === "video")

  if (currentRequestUser) {
    //요청하고 있는학생
    let requestValue = (rVideo.userInfo.user_idx === reqInfo.user_idx) ? ((status === 'waiting') ? true : false) : false; //요청한 상태
    video = _videoTrack ? (
      <VideoItem
        rVideo={rVideo}
        userInfo={rVideo.userInfo}
        request={requestValue}
        time={time}
        type={type}
      />
    ) : <img src={Icon.boardWarning} alt="warning" />
  } else { 
    //반대되는 학생
    let isExistsRequest = listUserRequest.find(e => Number(e.userId) === Number(rVideo.userInfo.user_idx)) //요청이 없는 사람
    if (!isExistsRequest) { //!아무 요청이 없는 학생
      video = _videoTrack ? (
        <VideoItem
          rVideo={rVideo}
          userInfo={rVideo.userInfo}
          time={time}
        />) : <img src={Icon.boardWarning} alt="warning"/>
    } else { //!요청이 있는 학생
      const { type } = isExistsRequest
      const { status : otherUserStatus } = isExistsRequest

      let requestValue = false
      let req_question_status = false
      let req_lecOut_status = false
      //허락하면 수정필요함
      if (otherUserStatus === 'waiting') { //요청이 보내고 있음
        requestValue = true
      } else {
        //요청을 진행하고 있음
        req_question_status = type === 'request_question' ? otherUserStatus : false
        req_lecOut_status = type === 'request_lecOut' ? otherUserStatus : false
      }
      //음성질문이 하고 있는 요청
      video = _videoTrack ? (
        <VideoItem
          rVideo={rVideo}
          userInfo={rVideo.userInfo}
          request={requestValue}
          req_question_status={req_question_status}
          req_lecOut_status={req_lecOut_status}
          type={type}
          time={time}
        />) : <img src={Icon.boardWarning} alt="warning" />
    }
  }
  return video
}


//요청이 있으면 Videos component 다시
const WrapperUserRequest = ({ type, userInfo, handleClickAccept, handleClickReject }) => {
  let convertType = type === "request_question" ? "음성질문" : "자리비움";
  const lectureInfo = useSelector(remoteStreamSelector.getListUserRequest)

  // const UserRoomId = () => {
  //   return JSON.parse(window.localStorage.getItem("usr_id"))
  // }
  const tryCatchHandleClickAccept = () => {
    if(type === "request_question"){
      let filter = lectureInfo.find((e) => e.type === 'request_question' && e.reqInfo.req_status === "1" && e.reqInfo.end_time === null)
      if(filter){
        Alert({
          title: "다른 학셍이 음성질문하고 있으니, 다른 학생 음성질문 취소하세요.",
          // btnAccept: "동의하기",
          // btnReject: "거절하기",
          // handleClickAccept: () => {
          //   alert("개발 중")
          //   // handleClickAccept();
          //   // const payload = {
          //   //   type: type,
          //   //   status: "reject",
          //   //   userId: filter.reqInfo.user_idx,
          //   //   userRoomId: UserRoomId(),
          //   //   remoteSocketId: undefined
          //   // }
          //   // remoteStreamContainer.emitProcessRequestUser(payload)
          // },
          // handleClickReject: () => { }
        })
      }else{
        handleClickAccept();
      }
    }else{
      handleClickAccept();
    }
  }
  return (
    <div>
      <p className="wrapper-request__name">{userInfo.user_name}</p>
      <p className="wrapper-request__type"><span>{convertType}</span> 요청</p>
      <div className="wrapper-request__btn">
        <Button  buttonStyle="btn--click btn--request" buttonSize="btn--medium" onClick={() => handleClickReject()}>거절</Button>{"  "}
        <Button  buttonStyle="btn--click btn--request" buttonSize="btn--medium" onClick={() => tryCatchHandleClickAccept()}>수락</Button>
      </div>
    </div>
  )
}

//!경고데이터 저장할 필요함
//!일단 여기서 socket만 적용함
//!경우할때
const WrapperTaskVideo = ({ userInfo, socketId }) => {
  const [chatDefault, setChatDefault] = useState(true)
  const [countWarning, setCountWarning] = useState(0)

  const dispatch = useDispatch()
  const handleClickWarning = () => {
    let usr_id = localStorage.getItem("usr_id")
    let payload = {
      userId: userInfo.user_idx,
      remoteSocketId: socketId,
      userRoomId: usr_id
    }
    setCountWarning(countWarning + 1)
    remoteStreamContainer.emitHostWarning(payload)
  }
  const handleDisableChatting = () => {
    let payload = {
      status: !chatDefault,
      remoteSocketId: socketId,
      userId: userInfo.user_idx
    }
    setChatDefault(!chatDefault)
    dispatch(chatAction.disableChatUser(payload))
    chatComponentSocket.emitDisableUserChat(payload)
  }
  useEffect(() => {
    (async() => { 
      let params = {
        userId: userInfo.user_idx,
        userRoomId: localStorage.getItem("usr_id")
      }
      const response = await getWarningInfo(params)
      const { data } = response
      setCountWarning(data.length)
    })()
  }, [])
  return (
    <div>
      <h1>{userInfo.user_name}</h1>
      <div className="btn-list">
        <Button buttonStyle="btn--click" buttonSize="btn--medium" onClick={() => handleClickWarning()}>
          경고 {countWarning !== 0 ? `(${countWarning})` : null}
        </Button>{"  "}
        <Button buttonStyle="btn--click" buttonSize="btn--medium"  onClick={() => handleDisableChatting()}>
          채팅금지
        </Button>
      </div>
    </div>
  )
}


const mapStateToProps = state => ({
  listUser: remoteStreamSelector.getListUser(state),
  listUserRequest: remoteStreamSelector.getListUserRequest(state)
})


function mapDispatchToProps(dispatch) {
  let actions = bindActionCreators({ RemoteStreamContainer });
  return { ...actions, dispatch };
}

const WrapperLoading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`
export default connect(mapStateToProps, mapDispatchToProps)(RemoteStreamContainer);
// export default