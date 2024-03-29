import React, { Component } from 'react'
import { bindActionCreators } from "redux"
import { connect } from 'react-redux'

//import fuction
import "./style.scss"
import Alert from "../../components/Alert"
import getSocket from "../rootSocket"
import meetingRoomSocket from './MeetingRoom.Socket'
import meetingRoomAction from "./MeetingRoom.Action"
import meetingRoomSelect from './MeetingRoom.Selector'
import { setTimeRoomWithTime } from './MeetingRoom.Service'
import userAction from '../../features/UserFeature/actions'
import userSelect from '../../features/UserFeature/selector'
import services from '../../features/UserFeature/service'

//import component
import HeadingController from './components/HeadingController/HeadingControllerTeacher'
import RemoteStreamContainer from './components/RemoteStreamContainer/RemoteStreamContainerTeacher'
import RemoteStreamContainerStudent from './components/RemoteStreamContainer/RemoteStreamContainerStudent'
import LocalStreamComponent from './components/LocalStreamComponent'
import ChatComponent from './components/ChatComponent'
import WhiteBoard from './components/WhiteBoard'
import WrapperLoading from '../../components/Loading/WrapperLoading'
import HeadingControllerStudent from './components/HeadingController/HeadingControllerStudent/index'
import AlertTime from '../../components/AlertTimeRoom';


//import package
import moment from 'moment'

import adapter from 'webrtc-adapter'
import ysFixWebmDuration from 'fix-webm-duration'
import { withOrientationChange, isMobile } from 'react-device-detect'
import { configSocket } from "../../pages/rootSocket";

class MeetingRoom extends Component {
  constructor(props) {
    super(props)

    this.videoRef = React.createRef()

    this.state = {
      localStream: null,

      remoteStreams: [],
      remoteStreamsTemp: [],
      peerConnections: {},
      peerConnectSDP: [],
      remoteStreamTest: this.getEmptyMediaStream(),

      mediaRecorder: null,
      sdpData: null,
      peerCount: 0,

      pc_config: {
        'iceServers': [
          {url: 'stun:stun01.sipphone.com'},
          {url: 'stun:stun.ekiga.net'},
          {url: 'stun:stun.fwdnet.net'},
          {url: 'stun:stun.ideasip.com'},
          {url: 'stun:stun.iptel.org'},
          {url: 'stun:stun.rixtelecom.se'},
          {url: 'stun:stun.schlund.de'},
          {url: 'stun:stun.l.google.com:19302'},
          {url: 'stun:stun1.l.google.com:19302'},
          {url: 'stun:stun2.l.google.com:19302'},
          {url: 'stun:stun3.l.google.com:19302'},
          {url: 'stun:stun4.l.google.com:19302'},
          {url: 'stun:stunserver.org'},
          {url: 'stun:stun.softjoys.com'},
          {url: 'stun:stun.voiparound.com'},
          {url: 'stun:stun.voipbuster.com'},
          {url: 'stun:stun.voipstunt.com'},
          {url: 'stun:stun.voxgratia.org'},
          {url: 'stun:stun.xten.com'},
          {
            url: 'turn:lpturn.eny.li:5000?transport=tcp',
            credential: 'plass12345',
            username: 'plass',
          },
          {
            url: 'turn:lpturn.eny.li:5000?transport=udp',
            credential: 'plass12345',
            username: 'plass',
          },
        ],
      },

      sdpConstraints: {
        mandatory: {
          OfferToReceiveAudio: true,
          OfferToReceiveVideo: true
        }
      },


      device: 'computer',
      orientation: 'desktop',

      isMainRoom: false,

      recordedBlobs: [],
      shareScreen: false,
      shareScreemForWhiteBoard: false,
      disconnected: false,

      fullScreen: false,
      paintScreen: false,
      enableRecord: false,
      windowSize: false,

      loading: true,
      startTime: null,
      errorDevice: false,
    }

    this.recordVideo = null;
  }
  //!기계를 체크할 필요함
  getLocalStream = async () => {
    const { peerCount } = this.state
    //!refactory해야함
    const handleSuccess = stream => {
      this.props.dispatch(meetingRoomAction.whoIsOnline())
      this.setState({
        loading: false,
        localStream: stream,
      })
    }

    const handleError = error => {
      alert("카메라를 찾을 수 없습니다.")
      if (error) {
        console.log("카메라를 찾을 수 없습니다.", error)
        this.setState({
          errorDevice: true
        })
      }
      if (error.name === "ConstraintNotSatisfiedError") {
        // console.log(`The resolution is not supported by your device.`)
      } else if (error.name === "PermissionDeniedError") {
        // console.log(
        //   "Permissions have not been granted to use your camera and " +
        //   "microphone, you need to allow the page access to your devices in " +
        //   "order for the demo to work."
        // )
      }
      // console.log(`getUserMedia error: ${error.name}`, error)
    }

    //Check list devices
    async function init(e) {
      try {
        const setDevices = {
          video: false,
          audio: false,
        }
        const gotDevices = (deviceInfos) => {
          for (let i = 0; i !== deviceInfos.length; ++i) {
            const deviceInfo = deviceInfos[i];
            if (deviceInfo.kind === "audioinput") {
              setDevices.audio = true;
            } else if (deviceInfo.kind === "videoinput") {
              setDevices.video = true;
            }
          }
        }

        const getStream = async () => {
          const response = await services.getCurrent()
          const { data } = response

          let constraints = {}

          let audioAvailable = null
          let videoAvailable = null

          await navigator.mediaDevices.getUserMedia({ audio: true })
            .then(() => audioAvailable = true)
            .catch(() => audioAvailable = false)

          await navigator.mediaDevices.getUserMedia({ video: true })
            .then(() => videoAvailable = true)
            .catch(() => videoAvailable = false)

          /**
           * 강사의 화면 해상도: 1280 * 720 (HD)
           */
          if (data.user_tp === 'T' || data.user_tp === 'I') {
            if (!audioAvailable) {
              constraints.audio = false
            } else {
              constraints.audio = {
                sampleRate: 44000,
                sampleSize: 16,
                chanelCount: 2,
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
              }
            }
            if (!videoAvailable) {
              constraints.video = false
            } else {
              let videoId = localStorage.getItem('videoId')
              constraints.video = {
                frameRate: {
                  min: 10, ideal: 15, max: 20
                },
                width: {
                  min: 480,
                  ideal: 1280,
                  exact: 1280,
                  max: 1280
                },
                height: {
                  min: 240,
                  ideal: 720,
                  exact: 720,
                  max: 720
                },
                deviceId: videoId ? videoId : null
              }
            }
            await navigator.mediaDevices.getUserMedia(constraints).then(stream => {
              handleSuccess(stream)
            }).catch(async e => {
              if (videoAvailable) {
                let constraints = {
                  video: true,
                  audio: true
                }
                console.log("해당 카메라가 해상도를 도달하지 못합니다.")
                let stream = await navigator.mediaDevices.getUserMedia(constraints)
                handleSuccess(stream)
              } else {
                handleError(e)
              }
            })
          /**
           * 학생: 
           * 4명 이하: 640 * 480 (VGA)
           * 15명 이하: 320 * 240 (QVGA)
           * 15 이상: 160 * 120 (QQVGA)
           */
        } else {
          if (!audioAvailable) {
          constraints.audio = false
        } else {
          constraints.audio = {
            sampleSize: 8,
            echoCancellation: false
          }
        }

        if (!videoAvailable) {
          //카메라가 없으면 
          const audioStream = await navigator.mediaDevices.getUserMedia(constraints).catch(e => handleError(e))
          let canvasStream = document.createElement("canvas").captureStream()
          if (audioStream) {
            let audioTrack = audioStream.getTracks().filter(function (track) {
              return track.kind === 'audio'
            })[0];
            canvasStream.addTrack(audioTrack);
          }
          handleSuccess(canvasStream)
        } else {
          let videoId = localStorage.getItem('videoId')
          if (0 <= peerCount && peerCount <= 5) {
            // console.log("4명 들어갔으때", peerCount)
            constraints.video = {
              frameRate: 20,
              width: {
                min: 640,
                ideal: 1280,
                exact: 1280,
                max: 1280
              },
              height: {
                min: 480,
                ideal: 720,
                exact: 480,
                max: 720
              },
              deviceId: videoId ? videoId : null
            }
          } else if (6 <= peerCount && peerCount <= 16) {
            // console.log("5명 ~ 15명까지  들어갔으때", peerCount)
            constraints.video = {
              frameRate: 15,
              width: { exact: 320 },
              height: { exact: 240 },
              deviceId: videoId ? videoId : null
            }
          } else {
            // console.log("15 이상", peerCount)
            constraints.video = {
              frameRate: 15,
              width: { exact: 240 },
              height: { exact: 120 },
              deviceId: videoId ? videoId : null
            }
          }

          await navigator.mediaDevices.getUserMedia(constraints).then(stream => {
            handleSuccess(stream)
          }).catch(async e => {
            console.log(e,'stream create failure')
            if (videoAvailable) {
              let constraints = {
                video: true,
                audio: true
              }
              let stream = await navigator.mediaDevices.getUserMedia(constraints)
              handleSuccess(stream)
            } else {
              handleError(e)
            }
          })
        }
      }
        }
    navigator.mediaDevices
      .enumerateDevices()
      .then(gotDevices)
      .then(getStream)
      .catch(handleError);
  } catch(e) {
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

    this.props.dispatch(meetingRoomAction.handleSetPeerConnections(peerConnections));
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

      const rVideos = this.state.remoteStreams.filter(stream => stream.id === socketID)
      if (rVideos.length) {
        _remoteStream = rVideos[0].stream
        _remoteStream.addTrack(e.track, _remoteStream)

        remoteVideo = {
          ...rVideos[0],
          stream: _remoteStream
        }
        remoteStreams = this.state.remoteStreams.map(_remoteVideo => {
          return (
            (_remoteVideo.id === remoteVideo.id && remoteVideo) || _remoteVideo
          )
        })
      } else {
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
    }

    if (this.state.localStream) {
      this.state.localStream.getTracks().forEach(track => {
        const { localStream } = this.state
        try {
          pc.addTrack(track, localStream)
        } catch (error) {
          // console.log(error)              
        }
      })
    }
    callback(pc)
  } catch (e) {
    // console.log("Something went wrong! pc not created!!", e)
    callback(null)
  }
}
componentDidMount() {
  this.detect()
  this.detectListener = window.addEventListener("resize", this.detect)
  this.props.dispatch(userAction.getCurrent())
  let fetchCurrentUser = async () => {
    const response = await services.getCurrent()
    const { data } = response;
    let isHostUser = false;
    if(data.user_tp === 'T' || data.user_tp === 'I'){
      isHostUser = true;
      const params = {
        userRoomId: JSON.parse(window.localStorage.getItem("usr_id")),
      };
      const response = await setTimeRoomWithTime(params);
      const {message, result} = response;
      if (!result) {
        alert(message);
        window.location.href = 'http://just-link.us/';
      }
    }
    this.props.dispatch(meetingRoomAction.setHostUser({isHostUser}))
    this.setState({
      isMainRoom: isHostUser
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

  //! Redux 저장할 필요없나?
  /************** Peer connect */
  getSocket().on("connection-success", data => {
    this.setState({
      messages: data.messages,
      localMicMute: this.state.isMainRoom ? false : true,
      loading: false,
      peerCount: data.peerCount
    })
    this.getLocalStream()
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
        const timeLoad = randInt(3, 7)
        if (!isMainRoom) {
          setTimeout(() => {
            window.location.href = window.location.href
          }, 1000 * timeLoad);
        }
      }
    } catch (error) {
      // console.log(error)
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
            if (this.state.localStream) {
              const { localStream } = this.state
              pc.addStream(localStream)
            }
          } catch (error) {
            console.log("Add Stream Error", error)
          }
          // 강사화면부터 학생화면을 sdp를 얼마나 주고싶으면 설정
          data.sdp.sdp = data.sdp.sdp.replace(/m=video (.*)\r\nc=IN (.*)\r\n/, 'm=video $1\r\nc=IN $2\r\nb=AS:2000\r\n');
          data.sdp.sdp = data.sdp.sdp.replace(/m=audio (.*)\r\nc=IN (.*)\r\n/, 'm=audio $1\r\nc=IN $2\r\nb=AS:2000\r\n');
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
          // window.location.reload();
        }
      })
    } catch (error) {
      console.log(error)
    }
  })
  /**
   * A부터 받은 answer를 B PC에서 처리하는 이벤트
   * Audio 및 Video를 B PC에서 원하는 sdp값을 설정해서 A PC를 전달해줌
   * 
   */
  getSocket().on("answer", data => {
    let pc = null
    this.setState({ sdpData: data })
    data.sdp.sdp = data.sdp.sdp.replace(/m=video (.*)\r\nc=IN (.*)\r\n/, 'm=video $1\r\nc=IN $2\r\nb=AS:500\r\n');
    data.sdp.sdp = data.sdp.sdp.replace(/m=audio (.*)\r\nc=IN (.*)\r\n/, 'm=audio $1\r\nc=IN $2\r\nb=AS:2000\r\n');
    pc = this.state.peerConnections[data.socketID];
    pc.setRemoteDescription(
      new RTCSessionDescription(data.sdp)
    ).then(() => { });
  })

  //학생화면의 해상도를 조절하는 이벤트
  getSocket().on("alert-edit-stream", async ({ levelConstraints }) => {
    const { localStream, peerConnections } = this.state
    if (localStream) {
      let localStreamTemp = localStream
      let videoTrack = localStream.getVideoTracks()[0];
      let constraints = {}
      if (levelConstraints === "VGA") {
        // console.log("4명 들어갔으때", levelConstraints)
        constraints.video = {
          // frameRate: 15,
          width: { exact: 640 },
          height: { exact: 480 }
        }
      } else if (levelConstraints === "QVGA") {
        // console.log("5명 ~ 15명까지  들어갔으때", levelConstraints)
        constraints.video = {
          // frameRate: 15,
          width: { exact: 320 },
          height: { exact: 240 }
        }
      } else if (levelConstraints === "QQVGA") {
        // console.log("15 이상", levelConstraints)
        constraints.video = {
          // frameRate: 15,
          width: { exact: 240 },
          height: { exact: 120 }
        }
      }

      if (constraints.video.width.exact === videoTrack.getConstraints().width.exact &&
        constraints.video.height.exact === videoTrack.getConstraints().height.exact) {
        return;
      }

      await videoTrack.applyConstraints(constraints.video).then(() => {
        Object.values(peerConnections).forEach(async pc => {
          var sender = pc.getSenders().find(function (s) {
            return s.track.kind === videoTrack.kind
          })

          localStreamTemp.addTrack(videoTrack)
          this.setState({ localStream: localStreamTemp })
          sender.replaceTrack(videoTrack)
          // await this.sleep(1000 * sleepTime)
        })
      }).catch(function (reason) {
        window.location.href = window.location.href
        console.log(reason)
      });
    }
  })
  getSocket().on("alert-share-screen", async ({ shareScreen, peerCount }) => {
    const { sdpData, peerConnections } = this.state;
    let pc = null
    let data = sdpData

    if (shareScreen && sdpData) {
      //화면 공유했을때
      data.sdp.sdp = data.sdp.sdp.replace(/m=video (.*)\r\nc=IN (.*)\r\nb=AS:.*\r\n/, 'm=video $1\r\nc=IN $2\r\n'); //remove
      if (0 <= peerCount && peerCount <= 10) {
        data.sdp.sdp = data.sdp.sdp.replace(/m=video (.*)\r\nc=IN (.*)\r\n/, 'm=video $1\r\nc=IN $2\r\nb=AS:500\r\n'); //update
      } else if (11 <= peerCount && peerCount <= 20) {
        data.sdp.sdp = data.sdp.sdp.replace(/m=video (.*)\r\nc=IN (.*)\r\n/, 'm=video $1\r\nc=IN $2\r\nb=AS:400\r\n');
      } else {
        data.sdp.sdp = data.sdp.sdp.replace(/m=video (.*)\r\nc=IN (.*)\r\n/, 'm=video $1\r\nc=IN $2\r\nb=AS:200\r\n');
      }
      // console.log("down sdp", data);
      pc = peerConnections[sdpData.socketID];
      if (pc) {
        pc.createOffer().then(offer => pc.setLocalDescription(offer))
          .then(() => {
            pc.setRemoteDescription(
              new RTCSessionDescription(data.sdp)
            ).then(() => { }).catch(e => console.log(e));
          })
      }
    } else {
      //화면공유 취소
      pc = peerConnections[sdpData.socketID];
      data.sdp.sdp = data.sdp.sdp.replace(/m=video (.*)\r\nc=IN (.*)\r\nb=AS:.*\r\n/, 'm=video $1\r\nc=IN $2\r\n'); //remove
      data.sdp.sdp = data.sdp.sdp.replace(/m=video (.*)\r\nc=IN (.*)\r\n/, 'm=video $1\r\nc=IN $2\r\nb=AS:750\r\n'); //update
      if (pc) {
        pc.createOffer().then(offer => pc.setLocalDescription(offer))
          .then(() => {
            pc.setRemoteDescription(
              new RTCSessionDescription(data.sdp)
            ).then(() => { }).catch(e => console.log(e));
          })
      }
    }
  })

  getSocket().on("candidate", data => {
    const pc = this.state.peerConnections[data.socketID];
    if (pc) pc.addIceCandidate(new RTCIceCandidate(data.candidate));
  })
  getSocket().on('alert-time-room', (data) => {
    const {level, time} = data;
    if (level === 1 || level === 2) {
      AlertTime({type: 'fix-time', time: time});
    } else if (level === 3) {
      AlertTime({type: 'count-time', handleDownAllTime: () => {
        window.location.href = 'http://just-link.us/';
        return null;
      }});
    } else if (level === 4) {
      window.location.href = 'http://just-link.us/';
      return null;
    }
  });
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
    fullScreen: !this.state.fullScreen
  })
}

calSleepTime = (peerCount) => {
  if (0 <= peerCount && peerCount <= 5) {
    return 0.5
  }
  else if (6 <= peerCount && peerCount <= 10) {
    return 1
  }
  else if (11 <= peerCount && peerCount <= 20) {
    return 1.5
  }
  else {
    return 2
  }
}

//화면공유의 화이브보드
/**
 *  화면공유할때 연결되어 있는 stream를 숨김 
 */
handleScreenMode = () => {
  try {
    let videoConstraints = {
      video: {
        cursor: "always",
        frameRate: 30,
        width: 1280,
        height: 720,
        logicalSurface: true,
      },
      audio: true,
    };
    navigator.mediaDevices
      .getDisplayMedia(videoConstraints)
      .then(async stream => {

        const { localStream, peerConnections, shareScreenForWhiteBoard, peerCount, shareScreen } = this.state
        const sleepTime = this.calSleepTime(Number(peerCount))

        meetingRoomSocket.sendToPeer("share-screen", true);
        getSocket().emit("edit-stream", false)
        this.props.dispatch(meetingRoomAction.shareScreen(true))

        let videoTrack = stream.getVideoTracks()[0]
        Object.values(peerConnections).forEach(async pc => {
          var sender = pc.getSenders().find(function (s) {
            return s.track.kind === videoTrack.kind
          })
          sender.replaceTrack(videoTrack)
          await this.sleep(1000 * sleepTime)
        })

        this.setState({
          localStreamTemp: localStream,
          localStream: stream,
          shareScreen: !shareScreen,
          shareScreenForWhiteBoard: !shareScreenForWhiteBoard
        })

        //화면 공유 중지
        const { localStreamTemp } = this.state
        videoTrack.onended = () => {
          this.props.dispatch(meetingRoomAction.shareScreen(false))

          let videoTrack = localStreamTemp.getVideoTracks()[0]
          Object.values(peerConnections).forEach(async pc => {
            var sender = pc.getSenders().find(function (s) {
              return s.track.kind === videoTrack.kind
            })
            sender.replaceTrack(videoTrack)
            await this.sleep(1000 * sleepTime)
          })
          meetingRoomSocket.sendToPeer("share-screen", false);
          getSocket().emit("edit-stream", false)
          this.setState({
            localStream: localStreamTemp,
            shareScreen: !shareScreen,
            shareScreenForWhiteBoard: !shareScreenForWhiteBoard
          })
        }
      })
  } catch (err) {
    console.error("Error: " + err)
  }
}

//화면공유 이벤트
//video parameters: width, height, frameRate, aspecRatio
handleScreenModeMain = async () => {
  try {
    //!TODO check paramater
    let videoConstraints = {
      video: {
        cursor: "always",
        frameRate: 30,
        logicalSurface: true,
        width: 1280,
        height: 720
      },
      audio: true,
    };
    navigator.mediaDevices.getDisplayMedia(videoConstraints)
      .then(async stream => {
        const { peerConnections, shareScreen, peerCount, localStream } = this.state
        if (shareScreen) {
          alert("다른 화면을 공유하고 있습니다. 공유한 화면을 중지하세요.")
          return;
        }
        meetingRoomSocket.sendToPeer("share-screen", true);
        meetingRoomSocket.sendToPeer("edit-stream", true)
        this.props.dispatch(meetingRoomAction.shareScreen(true))

        const sleepTime = this.calSleepTime(Number(peerCount))
        let videoTrack = stream.getVideoTracks()[0]
        // let constraints = {
        //   video: {
        //     frameRate: 15,
        //     logicalSurface: true,
        //     width: 1280,
        //     height: 720 
        //   }
        // }
        // await videoTrack.applyConstraints(constraints.video).then(async () => {}).catch(e => console.log("화면 공유할때 constraints 적용이 안됨", e))

        Object.values(peerConnections).forEach(async pc => {
          var sender = pc.getSenders().find(function (s) {
            return s.track.kind === videoTrack.kind
          })
          sender.replaceTrack(videoTrack)
          await this.sleep(1000 * sleepTime)
        })

        this.setState({
          localStreamTemp: localStream,
          localStream: stream,
          shareScreen: true,
        })

        //화면 공유 중지
        //!해상도 확인할 필요함
        const { localStreamTemp } = this.state
        videoTrack.onended = () => {
          this.props.dispatch(meetingRoomAction.shareScreen(false))
          let videoTrack = localStreamTemp.getVideoTracks()[0]
          Object.values(peerConnections).forEach(async pc => {
            var sender = pc.getSenders().find(function (s) {
              return s.track.kind === videoTrack.kind
            }
            )
            sender.replaceTrack(videoTrack)
            await this.sleep(1000 * sleepTime)
          })
          meetingRoomSocket.sendToPeer("share-screen", false);
          meetingRoomSocket.sendToPeer("edit-stream", false)
          this.setState({
            localStream: localStreamTemp,
            shareScreen: false,
          })
        }
      })
  } catch (err) {
    console.error("Error: " + err)
  }
}
handleStopSharingScreen = () => {
  if (!this.state.shareScreen) {
    alert('공유되는 화면이 없습니다.')
    return;
  }
  this.props.dispatch(meetingRoomAction.shareScreen(false))
  const { peerConnections, peerCount, localStream, localStreamTemp } = this.state
  const sleepTime = this.calSleepTime(Number(peerCount))
  let videoTrack = localStreamTemp.getVideoTracks()[0]
  Object.values(peerConnections).forEach(async pc => {
    let sender = pc.getSenders().find(function (s) {
      return s.track.kind === videoTrack.kind
    }
    )
    sender.replaceTrack(videoTrack)
    await this.sleep(1000 * sleepTime)
  })
  localStream.getVideoTracks().forEach((track) => {
    track.stop();
  });
  meetingRoomSocket.sendToPeer("share-scream", false);
  meetingRoomSocket.sendToPeer("edit-stream", false)
  this.setState({
    localStream: localStreamTemp,
    shareScreen: false,
  })
}

handleWhiteBoard = () => {
  this.setState({
    paintScreen: !this.state.paintScreen
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
componentWillUnmount() {
  this.setState({
    disconnected: true
  })
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

      let currentDay = moment().format('l').replace("/", "_") + "_" + moment().format('LTS').replace(":", "_").replace("PM", "").replace("AM", "");
      a.download = `${currentDay}.webm`
      document.body.appendChild(a)
      this.setState({
        recordedBlobs: []
      })
      a.click()
      setTimeout(() => {
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }, 100)
    }
    mediaRecorder.start()
    // console.log("MediaRecorder started", mediaRecorder)
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
      recordedBlobs: [...prevState.recordedBlobs, event.data]
    }))
  }
}
getEmptyMediaStream = () => {
  return document.createElement("canvas").captureStream()
}

detect = () => {
  if (navigator.maxTouchPoints > 1) {
    var iOS = navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
    if (!iOS) {
      this.setState({
        device: !!navigator.maxTouchPoints ? 'mobile' : 'computer',
        orientation: !navigator.maxTouchPoints ? 'desktop' : !window.screen.orientation.angle ? 'portrait' : 'landscape'
      })
    } else {
      var mql = window.matchMedia("(orientation: portrait)");
      if (mql.matches) {
        this.setState({
          orientation: "portrait"
        })
      } else {
        this.setState({
          orientation: "landscape"
        })
      }
    }
  }
}

render() {
  const {
    disconnected,
    localStream,
    peerConnections,
    remoteStreams,
    isMainRoom,
    fullScreen,
    paintScreen,
    loading,
    errorDevice,
    shareScreen,
    orientation
  } = this.state
  if (errorDevice) {
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
  return (
    <div className={`meeting-room ${isMobile ? `mobile-${orientation === 'landscape' ? 'landscape' : 'portrait'}` : ''}`}>
      <div className="left-content" id="left-content-id">
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
                  handleStopSharingScreen={this.handleStopSharingScreen}
                  shareScreen={shareScreen}
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
              isMainRoom ?
                paintScreen ?
                  <>
                    <WhiteBoard />
                    <RemoteStreamContainer
                      paintScreen={paintScreen}
                      remoteStreams={remoteStreams}
                    />
                  </>
                  :
                  <RemoteStreamContainer
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
        !fullScreen && (
          <div className="right-content">
            <div className="local-stream">
              <LocalStreamComponent
                localStream={localStream}
                shareScreen={shareScreen}
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