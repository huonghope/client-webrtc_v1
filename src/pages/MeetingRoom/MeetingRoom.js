import React, { Component } from 'react'
import { bindActionCreators } from "redux"
import { connect } from 'react-redux'


import "./style.scss"
import Alert from "../../components/Alert"
import getSocket from "../rootSocket"
import meetingRoomSocket from './MeetingRoom.Socket'
import meetingRoomAction from "./MeetingRoom.Action"
//import component
import HeadingController from './components/HeadingController/HeadingControllerTeacher'
import RemoteStreamContainer from './components/RemoteStreamContainer/RemoteStreamContainerTeacher'
import RemoteStreamContainerStudent from './components/RemoteStreamContainer/RemoteStreamContainerStudent'
import LocalStreamComponent from './components/LocalStreamComponent'
import ChatComponent from './components/ChatComponent'
import WhiteBoard from './components/WhiteBoard'

import moment from 'moment'
import meetingRoomSelect from './MeetingRoom.Selector'
import HeadingControllerStudent from './components/HeadingController/HeadingControllerStudent/index'

import adapter from 'webrtc-adapter'
import WrapperLoading from '../../components/Loading/WrapperLoading'
import userAction from '../../features/UserFeature/actions'
import userSelect from '../../features/UserFeature/selector'
import services from '../../features/UserFeature/service'
import ysFixWebmDuration from 'fix-webm-duration'
// const ffmpeg = require("ffmpeg.js/ffmpeg-mp4.js")

class MeetingRoom extends Component {
  constructor(props) {
    super(props)

    this.videoRef = React.createRef()

    this.state = {
      localStream: null,

      remoteStreams: [],
      remoteStreamsTemp: [],
      peerConnections: {},

      mediaRecorder: null,
      sdpData: null,

      pc_config: {
        "iceServers": [
          // {
          //   urls: 'stun:stun.l.google.com:19302',
          //   username: "webrtc",
          // },
          {url:'stun:stun01.sipphone.com'},
          {url:'stun:stun.ekiga.net'},
          {url:'stun:stun.fwdnet.net'},
          {url:'stun:stun.ideasip.com'},
          {url:'stun:stun.iptel.org'},
          {url:'stun:stun.rixtelecom.se'},
          {url:'stun:stun.schlund.de'},
          {url:'stun:stun.l.google.com:19302'},
          {url:'stun:stun1.l.google.com:19302'},
          {url:'stun:stun2.l.google.com:19302'},
          {url:'stun:stun3.l.google.com:19302'},
          {url:'stun:stun4.l.google.com:19302'},
          {url:'stun:stunserver.org'},
          {url:'stun:stun.softjoys.com'},
          {url:'stun:stun.voiparound.com'},
          {url:'stun:stun.voipbuster.com'},
          {url:'stun:stun.voipstunt.com'},
          {url:'stun:stun.voxgratia.org'},
          {url:'stun:stun.xten.com'},
          {
            url: 'turn:numb.viagenie.ca',
            credential: 'muazkh',
            username: 'webrtc@live.com'
          },
          {
            url: 'turn:192.158.29.39:3478?transport=udp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
          },
          {
            url: 'turn:192.158.29.39:3478?transport=tcp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
          }
        ]
      },

      sdpConstraints: {
        mandatory: {
          OfferToReceiveAudio: true,
          OfferToReceiveVideo: true
        }
      },

      isMainRoom: false,

      recordedBlobs: [],
      shareScream: null,
      shareScreamForWhiteBoard: false,
      disconnected: false,

      fullScream: false,
      paintScream: false,
      enableRecord: false,
      windowSize: false,

      loading: true,
      startTime: null,
      errorDevice: false,
    }

    this.recordVideo = null;
  }

  // //로컬의 Stream는 출력함
  // //!기계를 체크할 필요함
  getLocalStream = () => {
    const constraints = {
      audio: true,
      video: true
    }
    //!refactory해야함
    const handleSuccess = stream => {
      // const videoTracks = stream.getVideoTracks()
      this.props.dispatch(meetingRoomAction.whoIsOnline())
      // if(this.props.localStream){
      //   this.setState({
      //     loading: false,
      //     localStream: this.props.localStream,
      //   })
      // }else{
      this.setState({
        loading: false,
        localStream: stream,
      })
      // }
    }

    const handleError = error => {
      if (error) {
        console.log("카메라를 찾을 수 없습니다.")
        this.setState({
          errorDevice: true
        })
        // window.location.reload();
      }
      if (error.name === "ConstraintNotSatisfiedError") {
        const v = constraints.video
        console.log(
          `The resolution ${v.width.exact}x${v.height.exact} px is not supported by your device.`
        )
      } else if (error.name === "PermissionDeniedError") {
        console.log(
          "Permissions have not been granted to use your camera and " +
          "microphone, you need to allow the page access to your devices in " +
          "order for the demo to work."
        )
      }
      console.log(`getUserMedia error: ${error.name}`, error)
    }

    //Check list devices
    async function init(e) {
      try {
        const gotDevices = (deviceInfos) => {
          for (let i = 0; i !== deviceInfos.length; ++i) {
            const deviceInfo = deviceInfos[i];
            if (deviceInfo.kind === "audioinput") {
              // console.log(deviceInfo.label)
            } else if (deviceInfo.kind === "videoinput") {
              console.log("video input", deviceInfo.label)
            } else {
              // console.log("Found another kind of device: ", deviceInfo);
            }
          }
        }
        const getStream = async () => {
          const stream = await navigator.mediaDevices.getUserMedia(constraints).catch(e => handleError(e))
          handleSuccess(stream)
        }

        navigator.mediaDevices
          .enumerateDevices()
          .then(gotDevices)
          .then(getStream)
          .catch(handleError);
      } catch (e) {
        console.log(e)
        handleError(e)
      }
    }
    init()
  }

  sleep = async (ms) => {
    return new Promise((r) => setTimeout(() => r(), ms));
  }
  //!PeerConnection 
  createPeerConnection = (socketID, callback) => {
    try {
      let pc = new RTCPeerConnection(this.state.pc_config)

      const peerConnections = {
        ...this.state.peerConnections,
        [socketID]: pc
      }
      this.setState({
        peerConnections
      })
      pc.onicecandidate = e => {
        if (e.candidate) {
          meetingRoomSocket.sendToPeer("candidate", e.candidate, {
            local: getSocket().id,
            remote: socketID
          })
        }
      }

      pc.oniceconnectionstatechange = e => { }

      pc.ontrack = e => {
        let _remoteStream = null
        let remoteStreams = this.state.remoteStreams
        let remoteVideo = {}

        // 1. check if stream already exists in remoteStreams
        const rVideos = this.state.remoteStreams.filter(stream => stream.id === socketID)
        // 2. if it does exist then add track
        if (rVideos.length) {
          _remoteStream = rVideos[0].stream
          _remoteStream.addTrack(e.track, _remoteStream)

          remoteVideo = {
            ...rVideos[0],
            stream: _remoteStream
            // isHost: this.state.isMainRoom
          }
          remoteStreams = this.state.remoteStreams.map(_remoteVideo => {
            return (
              (_remoteVideo.id === remoteVideo.id && remoteVideo) || _remoteVideo
            )
          })
        } else {
          // 3. if not, then create new stream and add track
          _remoteStream = new MediaStream()
          _remoteStream.addTrack(e.track, _remoteStream)

          remoteVideo = {
            id: socketID,
            name: socketID,
            stream: _remoteStream
          }
          remoteStreams = [...this.state.remoteStreams, remoteVideo]
        }

        this.setState(prevState => {
          return {
            remoteStreams,
            loading: false
          }
        })
      }
      pc.close = () => {
        console.log("pc closed")
      }

      if (this.state.localStream)
        this.state.localStream.getTracks().forEach(track => {
          pc.addTrack(track, this.state.localStream)
        })
      callback(pc)
    } catch (e) {
      console.log("Something went wrong! pc not created!!", e)
      callback(null)
    }
  }

  componentDidUpdate() {
    // var loadScript = function (src) {
    //   var tag = document.createElement('script');
    //   tag.async = false;
    //   tag.src = src;
    //   var body = document.getElementsByTagName('body')[0];
    //   body.appendChild(tag);
    // }
    // loadScript("https://webrtc.github.io/adapter/adapter-latest.js");
  }
  componentDidMount() {
    this.props.dispatch(userAction.getCurrent())
    let fetchCurrentUser = async () => {
      const response = await services.getCurrent()
      const { data } = response
      this.props.dispatch(meetingRoomAction.setHostUser({ isHostUser: data.user_tp === 'T' || data.user_tp === 'I' }))
      this.setState({
        isMainRoom: data.user_tp === 'T' || data.user_tp === 'I'
      })
    }

    fetchCurrentUser()

    getSocket().emit("join-room")
    getSocket().on("user-role", data => {
      const { userRole } = data
      this.props.dispatch(meetingRoomAction.setHostUser({ isHostUser: userRole }))
      this.setState({
        isMainRoom: userRole,
      })
    })

    // window.onunload = window.onbeforeunload = function () {
    //   getSocket.close()
    // }
    //! Redux 저장할 필요없나?
    /************** Peer connect */
    getSocket().on("connection-success", data => {
      this.getLocalStream()
      this.setState({
        // status: status,
        // isMainRoom: isHost,
        messages: data.messages,
        localMicMute: this.state.isMainRoom ? false : true,
        loading: false,
      })
      // const { peerCount } = data
      // if(peerCount >= 3){
      //   const { sdpData } = this.state;
      //   if(sdpData != null){
      //     let tempSdpData = sdpData
      //     tempSdpData.sdp.sdp = tempSdpData.sdp.sdp.replace(/m=video (.*)\r\nc=IN (.*)\r\n/, 'm=video $1\r\nc=IN $2\r\nb=AS:20000\r\n');
      //     const pc = this.state.peerConnections[data.socketID];
  
      //     console.log("change", tempSdpData)
      //     pc.setRemoteDescription(
      //       new RTCSessionDescription(tempSdpData.sdp)
      //     ).then(() => {});
      //   }
      // }
      // window.location.reload();
    })
    getSocket().on("peer-disconnected", data => {
      try {
        if (this.state.peerConnections[data.socketID]) {
          this.state.peerConnections[data.socketID].close()
          const rVideo = this.state.remoteStreams.filter(
            stream => stream.id === data.socketID
          )
          // rVideo && this.stopTracks(rVideo[0].stream)
          if (rVideo) {
            this.stopTracks(rVideo[0].stream)
          }
          const remoteStreams = this.state.remoteStreams.filter(
            stream => stream.id !== data.socketID
          )
          this.setState(prevState => {
            return {
              remoteStreams,
              loading: false,
            }
          })
          const { isMainRoom } = this.state
          const randInt = (min, max) => Math.floor(min + Math.random() * (max - min + 1));
          const timeLoad = randInt(3,7)
          console.log(timeLoad)
          if (!isMainRoom) {
            //2500s 후에 새로고침
            setTimeout(() => {
              window.location.href = window.location.href
            }, 1000 * timeLoad);
          }
        }
      } catch (error) {
        console.log(error)
      }
    })
    /**
     * 새로 PC가 들어갔으면 처리하는 이벤트
     * 서버에서 받은 Socket_ID를 연결함
     * 동시 2PC를 실행함
     */
    getSocket().on("online-peer", socketID => {
      this.createPeerConnection(socketID, pc => {
        if (pc) {
          pc.createOffer(this.state.sdpConstraints).then(sdp => {
            pc.setLocalDescription(sdp)
            meetingRoomSocket.sendToPeer("offer", sdp, {
              local: getSocket().id,
              remote: socketID
            })
          }).then(() => { })
            .catch((error) => console.log('Failed to set session description: ' + error.toString()))
        }
      })
    })

    /**
     * B PC부터 보내는 sdp 정보를 A PC에서 받아서 처리하는 이벤트  
     */
    getSocket().on("offer", data => {
      try {
        this.createPeerConnection(data.socketID, pc => {
          try {
            try {
              if (this.state.localStream)
                pc.addStream(this.state.localStream)
            } catch (error) {
              console.log("Add Stream Error", error)
            }
            // 강사화면부터 학생화면을 sdp를 얼마나 주고싶으면 설정
            // data.sdp.sdp = data.sdp.sdp.replace(/c=IN (.*)\r\n/, 'c=IN $1\r\nb=' + 'AS' + ':' + '15' + '\r\n');
            pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(
              () => {
                pc.createAnswer(this.state.sdpConstraints).then((sdp) => {
                  pc.setLocalDescription(sdp);
                  meetingRoomSocket.sendToPeer("answer", sdp, {
                    local: getSocket().id,
                    remote: data.socketID,
                  });
                });
              }
            );

          } catch (error) {
            window.location.reload();
          }
        })
      } catch (error) {
        console.log(error)
      }
    })
    const updateBandwidthRestriction = async (sdp, bandwidth) => {
      let modifier = 'AS';
      if (adapter.browserDetails.browser === 'firefox') {
        bandwidth = (bandwidth >>> 0) * 1000;
        modifier = 'TIAS';
      }
      if (sdp.indexOf('b=' + modifier + ':') === -1) {
        sdp = sdp.replace(/c=IN (.*)\r\n/, 'c=IN $1\r\nb=' + modifier + ':' + bandwidth + '\r\n');
      } else {
        sdp = sdp.replace(new RegExp('b=' + modifier + ':.*\r\n'), 'b=' + modifier + ':' + bandwidth + '\r\n');
      }
      return sdp;
    }
    // getSocket().on("count-peer", data => {
    //   console.log(data)
    //   if(data === 2){
    //     data.sdp.sdp = data.sdp.sdp.replace(/m=video (.*)\r\nc=IN (.*)\r\n/, 'm=video $1\r\nc=IN $2\r\nb=AS:15\r\n');
    //     const pc = this.state.peerConnections[data.socketID];
    //     pc.setRemoteDescription(
    //       new RTCSessionDescription(data.sdp)
    //     ).then(() => {});
    //   }
    // })

    /**
     * A부터 받은 answer를 B PC에서 처리하는 이벤트
     * Audio 및 Video를 B PC에서 원하는 sdp값을 설정해서 A PC를 전달해줌
     */
    getSocket().on("answer", data => {
      let pc = null
      // this.setState({ sdpData: data})
      // data.sdp.sdp = data.sdp.sdp.replace(/m=video (.*)\r\nc=IN (.*)\r\n/, 'm=video $1\r\nc=IN $2\r\nb=AS:10000\r\n');
      // pc = this.state.peerConnections[data.socketID];
      
      this.setState({ sdpData: data})
      data.sdp.sdp = data.sdp.sdp.replace(/m=video (.*)\r\nc=IN (.*)\r\n/, 'm=video $1\r\nc=IN $2\r\nb=AS:15\r\n');

      pc = this.state.peerConnections[data.socketID];
      pc.setRemoteDescription(
        new RTCSessionDescription(data.sdp)
      ).then(() => {});
    })

    getSocket().on("candidate", data => {
      const pc = this.state.peerConnections[data.socketID];
      if (pc) pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    })
  }

  //!다른 학생도 나가는 건가?
  handleOutRoom = () => {
    const { remoteStreams, isMainRoom } = this.state
    if (isMainRoom) {
      if (remoteStreams.length !== 0) {
        Alert({
          title: "수업을 종료하시겠습니까?",
          content: `학생이 남아있는 경우, 모두 퇴장됩니다.`,
          handleClickAccept: () => {
            this.setState({
              disconnected: true
            })
          },
          handleClickReject: () => { }
        })
      } else {
        Alert({
          title: "수업을 종료하시겠습니까?",
          handleClickAccept: () => {
            this.setState({
              disconnected: true
            })
          },
          handleClickReject: () => { }
        })
      }
    } else {
      Alert({
        title: "수업을 종료하시겠습니까?",
        handleClickAccept: () => {
          this.setState({
            disconnected: true
          })
        },
        handleClickReject: () => { }
      })
    }
  }

  stopTracks = (stream) => {
    stream.getTracks().forEach(track => track.stop())
  }

  handleWindowSize = () => {
    this.setState({
      fullScream: !this.state.fullScream
    })
  }
  //!들어갈 사람이 만끝 sleep 시간을 더 길어야되지 않을까?
  //!여기 remoteStream는 null 하면 안됨
  //화면공유의 화이브보드
  /**
   *  화면공유할때 연결되어 있는 stream를 숨김 
   */
  handleScreenMode = async () => {
    try {
      navigator.mediaDevices
        .getDisplayMedia({
          video: {
            cursor: "always",
          },
          audio: true,
        })
        .then(stream => {
          const { peerConnections, shareScreamForWhiteBoard } = this.state
          let videoTrack = stream.getVideoTracks()[0]
          Object.values(peerConnections).forEach(async pc => {
            var sender = pc.getSenders().find(function (s) {
              return s.track.kind === videoTrack.kind
            })
            sender.replaceTrack(videoTrack)
            //!들어가는사람개수만큼 시간이 조절할 필요함
            await this.sleep(1500)
          })

          this.setState({
            localStreamTemp: this.state.localStream,
            // remoteStreamsTemp: this.state.remoteStreams,
            localStream: stream,
            // remoteStreams: [],
            shareScreamForWhiteBoard: !shareScreamForWhiteBoard
          })

          //화면 공유 중지
          const { localStreamTemp } = this.state
          videoTrack.onended = () => {
            let videoTrack = localStreamTemp.getVideoTracks()[0]
            Object.values(peerConnections).forEach(async pc => {
              var sender = pc.getSenders().find(function (s) {
                return s.track.kind === videoTrack.kind
              })
              sender.replaceTrack(videoTrack)
              //!들어가는사람개수만큼 시간이 조절할 필요함
               await this.sleep(1500)
            })
            this.setState({
              // remoteStreams: this.state.remoteStreamsTemp,
              localStream: localStreamTemp,
              shareScreamForWhiteBoard: !shareScreamForWhiteBoard
            })
          }
        })
    } catch (err) {
      console.error("Error: " + err)
    }
  }
  //화면공유 이벤트
  handleScreenModeMain = async () => {
    try {
      navigator.mediaDevices
        .getDisplayMedia({
          video: {
            cursor: "always",
          },
          audio: true,
        })
        .then(stream => {

          const { peerConnections, shareScream } = this.state
          let videoTrack = stream.getVideoTracks()[0]
          Object.values(peerConnections).forEach(async pc => {
            var sender = pc.getSenders().find(function (s) {
              return s.track.kind === videoTrack.kind
            })
            sender.replaceTrack(videoTrack)
            //!들어가는사람개수만큼 시간이 조절할 필요함
            await this.sleep(1500)
          })
          
          this.setState({
            localStreamTemp: this.state.localStream,
            localStream: stream,
            shareScream: !shareScream
          })

          //화면 공유 중지
          const { localStreamTemp } = this.state
          videoTrack.onended = () => {
            let videoTrack = localStreamTemp.getVideoTracks()[0]
            Object.values(peerConnections).forEach(async pc => {
                var sender = pc.getSenders().find(function (s) {
                  return s.track.kind === videoTrack.kind
                  }
                )
                sender.replaceTrack(videoTrack)
                //!들어가는사람개수만큼 시간이 조절할 필요함
               await this.sleep(1500)
            })
            this.setState({
              localStream: localStreamTemp,
              shareScream: !shareScream
            })
          }
        })
    } catch (err) {
      console.error("Error: " + err)
    }
  }

  handleWhiteBoard = () => {
    this.setState({
      paintScream: !this.state.paintScream
    })
  }

  // handleDataAvailable = event => {
  //   if (event.data && event.data.size > 0) {
  //     this.setState({
  //       recordedBlobs: [...this.state.recordedBlobs, event.data]
  //     })
  //   }
  // }
  handleDataAvailable = event => {
    if (event.data && event.data.size > 0) {
      this.setState(prevState => ({
        recordedBlobs: [...prevState.recordedBlobs, event.data]
      }))
    }
  }
  handleDataAvailable = event => {
    if (event.data && event.data.size > 0) {
      this.setState({
        recordedBlobs: [event.data]
      })
    }
  }
  handleScreamRecording = () => {
    // const { createFFmpeg, fetchFile } = FFmpeg
    // const ffmpeg = createFFmpeg({ log: true })
    const localRecord = document.getElementById("local")
    const chunks = []

    const { enableRecord } = this.state
    if (!enableRecord) {
      let options = { mimeType: "video/webm;codecs=vp9,opus" }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.error(`${options.mimeType} is not supported`)
        options = { mimeType: "video/webm;codecs=vp8,opus" }
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          console.error(`${options.mimeType} is not supported`)
          options = { mimeType: "video/webm" }
          if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            console.error(`${options.mimeType} is not supported`)
            options = { mimeType: "" }
          }
        }
      }

      let mediaRecorder
      try {
        mediaRecorder = new MediaRecorder(this.state.localStream, options)
      } catch (e) {
        console.error("Exception while creating MediaRecorder:", e)
        return
      }

      mediaRecorder.ondataavailable = this.handleDataAvailable
      mediaRecorder.onstop = () => {
        const { recordedBlobs } = this.state
        const blob = new Blob(recordedBlobs, { type: "video/webm" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url

        let currentDay = moment().format('l').replace("/", "_") +"_"+ moment().format('LTS').replace(":", "_").replace("PM", "").replace("AM", "");
        a.download = `${currentDay}.webm`
        document.body.appendChild(a)
        a.click()
        setTimeout(() => {
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)
        }, 100)
      }
      mediaRecorder.start()
      console.log("MediaRecorder started", mediaRecorder)

      this.setState({
        mediaRecorder,
        enableRecord: !this.state.enableRecord
      })
    } else {
      const { mediaRecorder } = this.state
      mediaRecorder.stop()
      this.setState({
        enableRecord: !this.state.enableRecord
      })
    }
  }
  handleDataAvailable = event => {
    if (event.data && event.data.size > 0) {
      this.setState(prevState => ({
        recordedBlobs: [...prevState.recordedBlobs , event.data]
      }))
    }
  }
  render() {
    const {
      disconnected,
      localStream,
      peerConnections,
      remoteStreams,
      isMainRoom,
      fullScream,
      paintScream,
      loading,
      errorDevice,
      shareScreamForWhiteBoard
    } = this.state
    
    if(errorDevice){
      console.log("카메라를 찾지 못합니다. 새로고침을 한번 하세요.")
      // return;
    }

    if (disconnected) {
      try {
        // disconnect socket
        getSocket().close()
        // stop local audio & video tracks
        this.stopTracks(localStream)

        // stop all remote audio & video tracks
        remoteStreams.forEach(rVideo => this.stopTracks(rVideo.stream))

        peerConnections &&
          Object.values(peerConnections).forEach(pc => pc.close())
        this.props.history.push("/")
        window.close();
      } catch (error) {
        window.close();
      }
    }
    const windowSize = !fullScream ? "85%" : "100%"

    return (
      <div className="meeting-room">
        {/* <button onClick={() => {
          const { localStream } = this.state
          let videoTrack = localStream.getVideoTracks()[0]
          videoTrack.stop();
        }}>Hello</button> */}
        <div className="left-content" id="left-content-id" style={{ width: windowSize }}>
          <div className="heading-controller" style={{ background: 'black' }}>
            {

              !loading ?
                isMainRoom ?
                  <HeadingController
                    handleOutRoom={this.handleOutRoom}
                    handleWindowSize={this.handleWindowSize}
                    handleScreenMode={this.handleScreenMode}
                    handleWhiteBoard={this.handleWhiteBoard}
                    handleScreamRecording={this.handleScreamRecording}
                    handleScreenModeMain={this.handleScreenModeMain}
                  /> :
                  <HeadingControllerStudent
                    handleOutRoom={this.handleOutRoom}
                    handleWindowSize={this.handleWindowSize}
                  />
                : <WrapperLoading type={"bars"} color={"black"} />
            }
          </div>
          <div className="remote-stream">
            {
              !loading ?
                paintScream ?  
                <WhiteBoard />
                 :
                isMainRoom ?
                  <RemoteStreamContainer
                    paintScream={!paintScream}
                    remoteStreams={remoteStreams}
                  />
                  :
                  <RemoteStreamContainerStudent
                    remoteStreams={remoteStreams}
                  />
                : <WrapperLoading type={"bars"} color={"black"} />
            }
          </div>
        </div>
        {
          !fullScream && (
            <div className="right-content">
              <div className="local-stream">
                <LocalStreamComponent
                  localStream={localStream}
                />
              </div>
              <div className="chat-component">
                <ChatComponent
                  remoteStreams={remoteStreams}
                  isMainRoom={isMainRoom}
                />
              </div>
            </div>
          )
        }
      </div>
    )
  }
}

const mapStateToProps = state => ({
  isHostUser: meetingRoomSelect.selectIsHostUser(state),
  localStream: meetingRoomSelect.getLocalStream(state),
  currentUser: userSelect.selectCurrentUser(state)
})


function mapDispatchToProps(dispatch) {
  let actions = bindActionCreators({ MeetingRoom });
  return { ...actions, dispatch };
}

export default connect(mapStateToProps, mapDispatchToProps)(MeetingRoom);