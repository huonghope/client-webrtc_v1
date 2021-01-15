import React, { Component, useState, useEffect } from 'react'
import { bindActionCreators } from "redux"
import styled from 'styled-components'
import qs from 'query-string'
import Video from '../../Video'
import ReactLoading from 'react-loading'
import { getInformationRoom, getLectureInfo } from '../RemoteStreamContainer.Service'
import remoteStreamContainer from '../RemoteStreamContainer.Socket'
import chatComponentSocket from '../../ChatComponent/ChatComponent.Socket'
import remoteStreamContainerAction from '../RemoteStreamContainer.Action'
import remoteStreamSelector from '../RemoteStreamContainer.Selector'
import getSocket from "../../../../rootSocket"
import Icon from '../../../../../constants/icons'
import moment from "moment"
import './style.scss'
import { connect, useDispatch, useSelector } from 'react-redux'
import CountTime from '../../../../../components/CountTime'
import Alert from "../../../../../components/Alert"

let intervalTime = "";
class RemoteStreamContainer extends Component {
  constructor(props) {
    super(props)

    this.state = {
      rVideos: [],
      listDescRemotes: [], //전체 유저의 리스트
      listUserRequest: [], //요청을 하는 유저의 리스트

      selectedVideo: null,
      videoVisible: false,

      loading: true,
      displayTaskVideo: false
    }
  }
  /**
   * 먼저 API를 보내서 해당하는 방의 들어갈 사람을 체크함
   * Host누군이지를 체크하면서 Video를 출력함
   */

  //! 자리비음 요청을 보냄
  componentDidMount() {
    getSocket().on("alert-host-lecOut", data => {

      const { listDescRemotes, listUserRequest } = this.state;
      const { remoteSocketId, status, reqInfo } = data;
      //요청한 유저의 Video를 수정
      let _rVideos = listDescRemotes.map((rVideo, idx) => {
        const _videoTrack = rVideo.stream.getTracks().filter(track => track.kind === "video")
        let currentRequestUser = rVideo.name === remoteSocketId;
        let requestValue = rVideo.name === remoteSocketId ? status : false;
        const time = moment().format('DD/MM/YYYYHH:mm:ss')
        let video = null;

        //요청하고 있는 학생
        if (currentRequestUser) {
          //요청하고 있는학생
          video = _videoTrack ? (
            <VideoItem
              rVideo={rVideo}
              userInfo={rVideo.userInfo}
              request={requestValue}
              time={time}
              type="request_lecOut"
            />
          ) : <img src={Icon.boardWarning}></img>
        } else { //반대되는 학생
          //!다른학생이 체크함, 요청을하고 있는거나 이미 요청했는지 확인함
          //요청 유저 리스트부터 확인 
          //!존재하면 어떤건지 체크함
          let isExistsRequest = listUserRequest.find(e => Number(e.reqInfo.user_idx) === Number(rVideo.userInfo.user_idx)) //요청이 없는 사람

          if (!isExistsRequest) { //!요청이 없는 경우에는
            video = _videoTrack ? (
              <VideoItem
                rVideo={rVideo}
                userInfo={rVideo.userInfo}
                time={time}
              />) : <img src={Icon.boardWarning}></img>
          } else { //!요청이 있는 경우에는
            const { type } = isExistsRequest
            const { req_status } = isExistsRequest.reqInfo
            let requestValue = false
            let req_question_status = false
            let req_lecOut_status = false

            //허락하면 수정필요함
            if (req_status === 'waiting') { //요청이 보내고 있음
              requestValue = true
            } else {
              //요청을 진행하고 있음
              console.log(type)
              req_question_status = type === 'request_question' ? Number(req_status) : false
              req_lecOut_status = type === 'request_lecOut' ? Number(req_status) : false
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
              />) : <img src={Icon.boardWarning}></img>
          }
        }
        return video
      })
      //!일반 유저를 하나씩 함
      let tempListUserRequest = listUserRequest;
      let filter;

      //요청이 취소하는 경우에는 state에서 제거하
      if (!status) {
        filter = tempListUserRequest.filter(e => e.reqInfo.user_idx !== reqInfo.user_idx)
      } else {
        //!일반 유저를 하나씩 함
        if (tempListUserRequest.length === 0) {
          filter = [{ type: "request_lecOut", reqInfo }]
        } else {
          filter = tempListUserRequest.map(e => e.reqInfo.user_idx === reqInfo.user_idx ? { type: "request_lecOut", reqInfo } : e)
        }
      }
      this.setState({
        rVideos: _rVideos,
        listUserRequest: filter
      })
      this.props.dispatch(remoteStreamContainerAction.saveListUserRequest(filter))
    })

    //! 음성 질문 요청을 보냄
    //! 일단 두개 나눔
    getSocket().on("alert-host-question", data => {
      const { listDescRemotes, listUserRequest } = this.state;
      const { remoteSocketId, status, reqInfo } = data;
      
      //요청한 유저의 Video를 수정
      let _rVideos = listDescRemotes.map((rVideo, idx) => {
        const _videoTrack = rVideo.stream.getTracks().filter(track => track.kind === "video")
        let currentRequestUser = rVideo.name === remoteSocketId;
        let requestValue = rVideo.name === remoteSocketId ? status : false;
        const time = moment().format('DD/MM/YYYYHH:mm:ss')
        let video = null;

        //요청하고 있는 학생
        if (currentRequestUser) {
          //요청하고 있는학생
          video = _videoTrack ? (
            <VideoItem
              rVideo={rVideo}
              userInfo={rVideo.userInfo}
              request={requestValue}
              time={time}
              type="request_question"
            />
          ) : <img src={Icon.boardWarning}></img>
        } else { //반대되는 학생
          //!다른학생이 체크함, 요청을하고 있는거나 이미 요청했는지 확인함
          //요청 유저 리스트부터 확인 
          //!존재하면 어떤건지 체크함
          let isExistsRequest = listUserRequest.find(e => Number(e.reqInfo.user_idx) === Number(rVideo.userInfo.user_idx)) //요청이 없는 사람
          if (!isExistsRequest) { //!요청이 없는 경우에는
            video = _videoTrack ? (
              <VideoItem
                rVideo={rVideo}
                userInfo={rVideo.userInfo}
                time={time}
              />) : <img src={Icon.boardWarning}></img>
          } else { //!요청이 있는 경우에는
            const { type } = isExistsRequest
            const { req_status } = isExistsRequest.reqInfo
            let requestValue = false
            let req_question_status = false
            let req_lecOut_status = false
            if (req_status === 'waiting') { //요청이 보내고 있음
              requestValue = true
            } else {
              //요청을 진행하고 있음
              req_question_status = type === 'request_question' ? Number(req_status) : false
              req_lecOut_status = type === 'request_lecOut' ? Number(req_status) : false
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
              />) : <img src={Icon.boardWarning}></img>
          }
        }
        return video
      })
      //!일반 유저를 하나씩 함
      let tempListUserRequest = listUserRequest;
      let filter;

      //요청이 취소하는 경우에는 state에서 제거하
      if (!status) {
        filter = tempListUserRequest.filter(e => e.reqInfo.user_idx !== reqInfo.user_idx)
      } else {
        //!일반 유저를 하나씩 함
        if (tempListUserRequest.length === 0) {
          filter = [{ type: "request_question", reqInfo }]
        } else {
          filter = tempListUserRequest.map(e => e.reqInfo.user_idx === reqInfo.user_idx ? { type: "request_question", reqInfo } : e)
        }
      }
      this.setState({
        rVideos: _rVideos,
        listUserRequest: filter
      })
      this.props.dispatch(remoteStreamContainerAction.saveListUserRequest(filter))
    })

    //강사는 유저의 요청을 처리한 다음에 화면을 어떻게 출력함
    getSocket().on("alert-host-process-req-question", data => {
      const { listDescRemotes, listUserRequest } = this.state;
      const { remoteSocketId, type, reqInfo } = data;
      const { req_status } = reqInfo
      console.log(remoteSocketId, type, reqInfo)
      //수락한 경우에는
      if (Number(req_status)) {
        const time = moment().format('DD/MM/YYYYHH:mm:ss')
        let _rVideos = listDescRemotes.map((rVideo, idx) => {
          const _videoTrack = rVideo.stream.getTracks().filter(track => track.kind === "video")
          let currentRequestUser = rVideo.name === remoteSocketId;

          let video = null;
          //현재 요청하는 유저를 처리
          if (currentRequestUser) {
            video = _videoTrack ? (<VideoItem
              rVideo={rVideo}
              userInfo={rVideo.userInfo}
              req_question_status={req_status}
              time={time}
              type="request_question"
            />) : <img src={Icon.boardWarning}></img>
          } else { //다른 사람의 요청이 있는지 없는지 확인함
            let isExistsRequest = listUserRequest.find(e => Number(e.reqInfo.user_idx) === Number(rVideo.userInfo.user_idx)) //요청이 없는 사람
            if (!isExistsRequest) { //!요청이 없는 경우에는
              video = _videoTrack ? (
                <VideoItem
                  rVideo={rVideo}
                  userInfo={rVideo.userInfo}
                  time={time}
                />) : <img src={Icon.boardWarning}></img>
            } else { //!요청이 있는 경우에는
              const { type } = isExistsRequest
              const { req_status } = isExistsRequest.reqInfo
              let requestValue = false
              let req_question_status = false
              let req_lecOut_status = false
              if (req_status === 'waiting') { //요청이 보내고 있음
                requestValue = true
              } else {
                //요청을 진행하고 있음
                req_question_status = type === 'request_question' ? Number(req_status) : false
                req_lecOut_status = type === 'request_lecOut' ? Number(req_status) : false
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
                />) : <img src={Icon.boardWarning}></img>
            }
          }
          return video
        })
        this.setState({
          rVideos: _rVideos
        })
      }
      let tempListUserRequest = listUserRequest;
      let filter;

      //요청이 취소하는 경우에는 state에서 제거하
      if (!Number(req_status)) { //거절
        filter = tempListUserRequest.filter(e => e.reqInfo.user_idx !== reqInfo.user_idx)
      } else {
        //!일반 유저를 하나씩 함
        if (tempListUserRequest.length === 0) {
          filter = [{ type: "request_question", reqInfo }]
        } else {
          filter = tempListUserRequest.map(e => e.reqInfo.user_idx === reqInfo.user_idx ? { type: "request_question", reqInfo } : e)
        }
      }
      this.setState({
        listUserRequest: filter
      })
      this.props.dispatch(remoteStreamContainerAction.saveListUserRequest(filter))
    })


    //!오류
    /**
     * @data 받은 데이터
     * @data.data 요청의 정보
     * @data.listUser  현강의 요청을 되어 있는 리스트
     * @data.remoteSocketId
     * @data.type: request_lecOut or request_question
     */
    getSocket().on("alert-host-process-req-lecOut", data => {
      const { listDescRemotes, listUserRequest } = this.state;
      const { remoteSocketId, type, reqInfo, state } = data;
      const { req_status } = reqInfo

      //수락한 경우에는
      if (Number(req_status)) {
        const time = moment().format('DD/MM/YYYYHH:mm:ss')
        let _rVideos = listDescRemotes.map((rVideo, idx) => {
          const _videoTrack = rVideo.stream.getTracks().filter(track => track.kind === "video")
          let currentRequestUser = rVideo.name === remoteSocketId;

          let video = null;
          //현재 요청하는 유저를 처리
          if (currentRequestUser) {
            video = _videoTrack ? (<VideoItem
              rVideo={rVideo}
              userInfo={rVideo.userInfo}
              req_lecOut_status={req_status}
              micStateChange={state}
              time={time}
              type="request_lecOut"
            />) : <img src={Icon.boardWarning}></img>
          } else { //다른 사람의 요청이 있는지 없는지 확인함
            let isExistsRequest = listUserRequest.find(e => Number(e.reqInfo.user_idx) === Number(rVideo.userInfo.user_idx)) //요청이 없는 사람
            if (!isExistsRequest) { //!요청이 없는 경우에는
              video = _videoTrack ? (
                <VideoItem
                  rVideo={rVideo}
                  userInfo={rVideo.userInfo}
                  time={time}
                />) : <img src={Icon.boardWarning}></img>
            } else { //!요청이 있는 경우에는
              const { type } = isExistsRequest
              const { req_status } = isExistsRequest.reqInfo
              let requestValue = false
              let req_question_status = false
              let req_lecOut_status = false
              if (req_status === 'waiting') { //요청이 보내고 있음
                requestValue = true
              } else {
                //요청을 진행하고 있음
                req_question_status = type === 'request_question' ? Number(req_status) : false
                req_lecOut_status = type === 'request_lecOut' ? Number(req_status) : false
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
                />) : <img src={Icon.boardWarning}></img>
            }
          }
          return video
        })
        
        this.setState({
          rVideos: _rVideos
        })
      }
      let tempListUserRequest = listUserRequest;
      let filter;

      console.log(remoteSocketId, type, reqInfo, state)
      //요청이 취소하는 경우에는 state에서 제거하
      if (!Number(req_status)) { //거절
        console.log(remoteSocketId, type, reqInfo, state)
        filter = tempListUserRequest.filter(e => e.reqInfo.user_idx !== reqInfo.user_idx)
      } else {
        //!일반 유저를 하나씩 함
        if (tempListUserRequest.length === 0) {
          filter = [{ type: "request_lecOut", reqInfo }]
        } else {
          filter = tempListUserRequest.map(e => e.reqInfo.user_idx === reqInfo.user_idx ? { type: "request_lecOut", reqInfo } : e)
        }
      }
      this.setState({
        listUserRequest: filter
      })
      this.props.dispatch(remoteStreamContainerAction.saveListUserRequest(filter))
    })

    getSocket().on("alert-user-mute-mic", data => {
      const { data : state } = data;
      const { listDescRemotes, listUserRequest } = this.state;

      //요청한 유저의 Video를 수정
      let _rVideos = listDescRemotes.map((rVideo, idx) => {
        const _videoTrack = rVideo.stream.getTracks().filter(track => track.kind === "video")
        const time = moment().format('DD/MM/YYYYHH:mm:ss')
        let video = null;
          //!다른학생이 체크함, 요청을하고 있는거나 이미 요청했는지 확인함
          //요청 유저 리스트부터 확인 
          //!존재하면 어떤건지 체크함
          let isExistsRequest = listUserRequest.find(e => Number(e.reqInfo.user_idx) === Number(rVideo.userInfo.user_idx)) //요청이 없는 사람
          if (!isExistsRequest) { //!요청이 없는 경우에는
            
            video = _videoTrack ? (
              <VideoItem
                rVideo={rVideo}
                userInfo={rVideo.userInfo}
                micStateChange={state}
                time={time}
              />) : <img src={Icon.boardWarning}></img>

          } else { //!요청이 있는 경우에는
            const { type } = isExistsRequest
            const { req_status } = isExistsRequest.reqInfo
            let requestValue = false
            let req_question_status = false
            let req_lecOut_status = false
            if (req_status === 'waiting') { //요청이 보내고 있음
              requestValue = true
            } else {
              //요청을 진행하고 있음
              req_question_status = type === 'request_question' ? Number(req_status) : false
              req_lecOut_status = type === 'request_lecOut' ? Number(req_status) : false
            }
            //음성질문이 하고 있는 요청
            video = _videoTrack ? (
              <VideoItem
                rVideo={rVideo}
                userInfo={rVideo.userInfo}
                request={requestValue}
                micStateChange={state}
                req_question_status={req_question_status}
                req_lecOut_status={req_lecOut_status}
                type={type}
                time={time}
              />) : <img src={Icon.boardWarning}></img>
          }
        return video
      })
      console.log('aaa')
      this.setState({
        rVideos: _rVideos
      })
    })

    const UserRoomId = () => {
      return JSON.parse(window.localStorage.getItem("usr_id"))
    }
    const fetchData = async () => {
      let params = {
        userroom_id: UserRoomId()
      }
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
      this.props.remoteStreams !== nextProps.remoteStreams ||
      this.props.paintScream !== nextProps.paintScream
    ) {
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
    if (loading) {
      return (
        <WrapperLoading className="loading">
          <ReactLoading type="spin" color="#000" />
        </WrapperLoading>
      )
    }
    return (
      <div className="remote-stream__container">
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
const VideoItem = ({ rVideo, userInfo, request, type, time, req_question_status, req_lecOut_status, micStateChange }) => {
  const [req, setReq] = useState()
  const [reqQuestionStatus, setReqQuestionStatus] = useState()
  const [reqLecOutStatus, setLecOutStatus] = useState()
  //!체크필요함
  useEffect(() => {
    setReqQuestionStatus(req_question_status)
    setLecOutStatus(req_lecOut_status)
    setReq(request)
  }, [time])
  // useEffect(() => {

  //   setReq(request)
  // },[])

  const handleClickWarning = (socketId) => {
    console.log(socketId)
  }

  const handleDisableChatting = (socketId) => {

  }
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
  const videoMuted = (rVideo) => {
    const muteTrack = rVideo.getVideoTracks()[0]
    const isSelectedVideo = rVideo.id === this.state.selectedVideo.stream.id
    if (isSelectedVideo) {
      this.setState({
        videoVisible: !muteTrack.muted
      })
    }
  }

  return (
    <div className="video-item">
      <Video
        viewStateMicAndCam={true}
        videoType="remoteVideo"
        videoStream={rVideo.stream}
        req_question_status={req_question_status}
        micStateChange={micStateChange}
        videoMuted={videoMuted}
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
            <h3>음성질문 중</h3>
            {/* <CountTime /> */}
            <button className="btn-cancel" onClick={() => handleClickReject()}>
              음성질문 취소
              </button>
          </div>
        </div>
      }
      {
        reqLecOutStatus &&
        <div className="wrapper-request">
          <div>
            <h3>자리비움 중</h3>
            <CountTime />
          </div>
        </div>
      }
    </div>
  )
}

//처음에 들어갈때 
const SetVideos = (remoteStreams, props) => {
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
        let video = _videoTrack ? (
          <VideoItem
            rVideo={rVideo}
            userInfo={infoStreamBySocketId}
          />
        ) : <img src={Icon.boardWarning}></img>
        return video
      })

      resolve({
        rVideos: _rVideos,
        filterRemote: _filterRemote,
      })
    })
  })
}

//요청이 있으면 Videos component 다시
const WrapperUserRequest = ({ type, userInfo, handleClickAccept, handleClickReject }) => {
  let convertType = type === "request_question" ? "음성질문" : "자리비움";
  const lectureInfo = useSelector(remoteStreamSelector.getListUserRequest)

  const UserRoomId = () => {
    return JSON.parse(window.localStorage.getItem("usr_id"))
  }
  const tryCatchHandleClickAccept = () => {
    if(type === "request_question"){
      let filter = lectureInfo.find((e) => e.type === 'request_question' && Number(e.reqInfo.req_status) === 1)
      console.log(filter)
      if(filter){
        Alert({
          title: "다른 학셍이 음성질문하고 있으니, 그래도 진행하겠습니까?",
          btnAccept: "동의하기",
          btnReject: "거절하기",
          handleClickAccept: () => {
            alert("개발 중")
            // handleClickAccept();
            // const payload = {
            //   type: type,
            //   status: "reject",
            //   userId: filter.reqInfo.user_idx,
            //   userRoomId: UserRoomId(),
            //   remoteSocketId: undefined
            // }
            // remoteStreamContainer.emitProcessRequestUser(payload)
          },
          handleClickReject: () => { }
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
        <button className="wrapper-request__btn--reject" onClick={() => handleClickReject()}>거절</button>
        <button className="wrapper-request__btn--accept" onClick={() => tryCatchHandleClickAccept()}>수락</button>
      </div>
    </div>
  )
}

//!경고데이터 저장할 필요함
//!일단 여기서 socket만 적용함
//!경우할때
const WrapperTaskVideo = ({ userInfo, socketId }) => {
  const handleClickWarning = () => {
    let usr_id = localStorage.getItem("usr_id")
    let payload = {
      userId: userInfo.user_idx,
      remoteSocketId: socketId,
      userRoomId: usr_id
    }
    remoteStreamContainer.emitHostWarning(payload)
  }
  const handleDisableChatting = () => {
    let payload = {
      remoteSocketId: socketId,
      userId: userInfo.user_idx
    }
    chatComponentSocket.emitDisableUserChat(payload)
  }
  return (
    <div>
      <h1>{userInfo.user_name}</h1>
      <div className="btn-list">
        <button onClick={() => handleClickWarning()}>
          경고
        </button>
        <button onClick={() => handleDisableChatting()}>
          채팅금지
        </button>
      </div>
    </div>
  )
}


const mapStateToProps = state => ({
  listUser: remoteStreamSelector.getListUser(state)
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