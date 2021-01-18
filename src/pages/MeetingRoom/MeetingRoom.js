import React, { Component } from 'react'
import { bindActionCreators } from "redux"
import { connect } from 'react-redux'


import "./style.scss"
import Alert from "../../components/Alert"
import getSocket from "../rootSocket"
import meetingRoomSocket from './MeetingRoom.Socket'
import meetingRoomAction from "./MeetingRoom.Action"
import ReactLoading from 'react-loading'
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

import RecordRTCPromisesHandler from 'recordrtc'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect';
import adapter from 'webrtc-adapter'
import FFmpeg from "@ffmpeg/ffmpeg"
// const ffmpeg = require("ffmpeg.js/ffmpeg-mp4.js")


class MeetingRoom extends Component {
  constructor(props) {
    super(props)

    this.videoRef = React.createRef()

    this.state = {
      localStream: null,

      remoteStreams: [],
      peerConnections: {},

      mediaRecorder: null,

      pc_config: {
        "iceServers": [
          {
            urls : 'stun:stun.l.google.com:19302',
            username: "webrtc",
          },
        ]
      },

      sdpConstraints: {
        mandatory: {
          OfferToReceiveAudio: true,
          OfferToReceiveVideo: true
        }
      },
      // sdpConstraints: {
      //   offerToReceiveAudio: 0,
      //   offerToReceiveVideo: 1
      // },

      isMainRoom: false,

      recordedBlobs: [],
      disconnected: false,

      fullScream: false,
      paintScream: false,
      enableRecord: false,
      windowSize: false,
      loading: true,
    }

    this.recordVideo = null;
  }

  // //로컬의 Stream는 출력함
  // //!기계를 체크할 필요함
  getLocalStream = () => {
    const constraints = {
      audio: true,
      video: true,
    }
    //!refactory해야함
    const handleSuccess = stream => {
      const videoTracks = stream.getVideoTracks()
      console.log(`Using video device: ${videoTracks[0].label}`)
      this.props.dispatch(meetingRoomAction.whoIsOnline())
      this.setState({
        loading: false,
        localStream: stream,
      })
    }

    const handleError = error => {
      if (error) {
        console.log("카메라를 찾을 수 없습니다.")
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
              console.log(deviceInfo.label)
            } else if (deviceInfo.kind === "videoinput") {
              console.log(deviceInfo.label)
            } else {
              console.log("Found another kind of device: ", deviceInfo);
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

  // getLocalStream = () => {
  //   const constraints = {
  //     audio: true,
  //     video: true,
  //     options: {
  //       mirror: true,
  //     }
  //   };
  //   const handleSuccess = async (stream) => {
  //     // const video = document.querySelector("video");
  //     const videoTracks = stream.getVideoTracks();
  //     // console.log("Got stream with constraints:", constraints);
  //     console.log(`Using video device: ${videoTracks[0].label}`);

  //     this.setState({
  //       localStream: stream,
  //     });
  //     this.props.dispatch(meetingRoomAction.whoIsOnline())
  //     // window.stream = stream; // make variable available to browser console
  //     // video.srcObject = stream;
  //     // await this.sleep(500)
  //   };

  //   const handleError = (error) => {
  //     if (error.name === "ConstraintNotSatisfiedError") {
  //       const v = constraints.video;
  //       console.log(
  //         `The resolution ${v.width.exact}x${v.height.exact} px is not supported by your device.`
  //       );
  //     } else if (error.name === "PermissionDeniedError") {
  //       console.log(
  //         "Permissions have not been granted to use your camera and " +
  //         "microphone, you need to allow the page access to your devices in " +
  //         "order for the demo to work."
  //       );
  //     }
  //     console.log(`getUserMedia error: ${error.name}`, error);
  //   };

  //   async function init(e) {
  //     try {
  //       await navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);
  //     } catch (e) {
  //       handleError(e);
  //     }
  //   }
  //   init();
  // };
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

  componentDidMount() {
    getSocket().on("user-role", data => {
      const { userRole } = data
      console.log("i am ", userRole)
      this.props.dispatch(meetingRoomAction.setHostUser({ isHostUser: userRole }))
      this.setState({
        isMainRoom: userRole,
      })
    })

    // console.log("adapete", adapter.browserDetails.browser)
    window.onunload = window.onbeforeunload = function () {
      getSocket.close()
    }
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
    })

    getSocket().on("peer-disconnected", data => {
      try {
        if(this.state.peerConnections[data.socketID]){
          this.state.peerConnections[data.socketID].close()
          const rVideo = this.state.remoteStreams.filter(
            stream => stream.id === data.socketID
          )
          rVideo && this.stopTracks(rVideo[0].stream)
          const remoteStreams = this.state.remoteStreams.filter(
            stream => stream.id !== data.socketID
          )
          this.setState(prevState => {
            return {
              remoteStreams,
              loading: false,
            }
          })
        }
      } catch (error) {
        console.log(error)
      }
    })

    //!Create Local Peer
    //!pc1
    getSocket().on("online-peer", socketID => {
      // 1. Create new pc
      this.createPeerConnection(socketID, pc => {
        // 2. Create Offer
        if (pc) {
          pc.createOffer(this.state.sdpConstraints).then(sdp => {
            pc.setLocalDescription(sdp)
            meetingRoomSocket.sendToPeer("offer", sdp, {
              local: getSocket().id,
              remote: socketID
            })
          }).then(() => {

          }).catch((error) => console.log('Failed to set session description: ' + error.toString()))
        }
      })
    })

    //!pc2
    getSocket().on("offer", data => {
      try {
        this.createPeerConnection(data.socketID, pc => {
          try {
            try {
              if(this.state.localStream)              
                pc.addStream(this.state.localStream)
            } catch (error) {
              console.log("Add Stream Error", error)
            }

            pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(
              () => {
                // 2. Create Answer
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
        // insert b= after c= line.
        sdp = sdp.replace(/c=IN (.*)\r\n/, 'c=IN $1\r\nb=' + modifier + ':' + bandwidth + '\r\n');
      } else {
        sdp = sdp.replace(new RegExp('b=' + modifier + ':.*\r\n'), 'b=' + modifier + ':' + bandwidth + '\r\n');
      }
      return sdp;
    }

    //! pc1 setRemote
    getSocket().on("answer", data => {
      const pc = this.state.peerConnections[data.socketID];
      // console.log(data.sdp)
      pc.setRemoteDescription(
        new RTCSessionDescription(data.sdp)
      ).then(() => { });
    })
    getSocket().on("candidate", data => {
      const pc = this.state.peerConnections[data.socketID];

      if (pc) pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    })
  }
  handleOutRoom = () => {
    const { remoteStreams, isMainRoom } = this.state
    if (isMainRoom) {
      if (remoteStreams.length !== 0) {
        Alert({
          title: "수업을 종료하시겠습니까?",
          content: `핵생이 남아있는 경우, 모도 퇴장됩니다.`,
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

    // if(!this.state.fullScream && !this.state.paintScream){
    //   console.log('1')
    // }
    // else if(this.state.fullScream && !this.state.paintScream){
    //   console.log('2')
      
    //   this.setState({
    //     fullScream: !this.state.fullScream
    //   })
    // }
    // else if(!this.state.fullScream && this.state.paintScream){
    //   console.log('2')

    //   this.setState({
    //       fullScream: !this.state.fullScream
    //     })
    // }
    // else {
    //   this.setState({
    //       fullScream: !this.state.fullScream
    //     })
    // }

  }
  handleScreenMode = () => {
    try {
      navigator.mediaDevices
        .getDisplayMedia({
          video: {
            cursor: "always"
          },
          audio: true
        })
        .then(stream => {
          this.setState({
            localStreamTemp: this.state.localStream,
            localStream: stream
          })

          const { peerConnections, shareScream } = this.state
          let videoTrack = stream.getVideoTracks()[0]
          Object.values(peerConnections).forEach(pc => {
            var sender = pc.getSenders().find(function (s) {
              return s.track.kind === videoTrack.kind
            })
            this.setState({
              shareScream: !shareScream
            })
            sender.replaceTrack(videoTrack)
          })
          //화면 공유 중지
          const { localStreamTemp } = this.state
          videoTrack.onended = () => {
            let videoTrack = localStreamTemp.getVideoTracks()[0]
            Object.values(peerConnections).forEach(pc => {
              var sender = pc.getSenders().find(function (s) {
                return s.track.kind === videoTrack.kind
              })
              sender.replaceTrack(videoTrack)
            })
            this.setState({
              localStream: localStreamTemp,
              shareScream: false
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
    // this.HeadingController.handleWindowSize();
  }
  handleDataAvailable = event => {
    if (event.data && event.data.size > 0) {
      this.setState({
        recordedBlobs: [...this.state.recordedBlobs, event.data]
      })
    }
  }

  //!로컬 stream 작동하지 않으면 안됨
  //!localStream 체크할 필요함
  //!로컬 stream 작동하지 않으면 안됨
  //!localStream 체크할 필요함
  handleScreamRecording = () => {
    const { createFFmpeg, fetchFile } = FFmpeg
    const ffmpeg = createFFmpeg({ log: true })
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
        mediaRecorder = new MediaRecorder(localRecord.srcObject)
      } catch (e) {
        console.error("Exception while creating MediaRecorder:", e)
        return
      }
      mediaRecorder.ondataavailable = e => chunks.push(e.data)
      mediaRecorder.onstop = async () => {
        const blob = new Uint8Array(await new Blob(chunks).arrayBuffer())

        let currentDay = moment().format("l").replace("/", "_")
        const name = "record.webm"
        await ffmpeg.load()
        ffmpeg.FS("writeFile", name, await fetchFile(blob))
        await ffmpeg.run("-i", name, "output.mp4")
        const data = ffmpeg.FS("readFile", "output.mp4")
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = URL.createObjectURL(
          new Blob([data.buffer], { type: "video/mp4" })
        )
        a.download = `${currentDay}.mp4`
        document.body.appendChild(a)
        a.click()
        setTimeout(() => {
          document.body.removeChild(a)
          window.URL.revokeObjectURL(a.href)
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
    } = this.state
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
        console.log(error)
      }
    }
    // console.log(isMobile)
    if (isMobile) {
      return (
        <div className="chat-component-mobile">
          <ChatComponent
            remoteStreams={remoteStreams}
          />
        </div>
      )
    }

    //! setState 확인필요함
    if (loading) {
      return (
        <WrapperLoading>
          <ReactLoading type="spin" color="#000" />
        </WrapperLoading>

      )
    }

    const windowSize = !fullScream ? "85%" : "100%"
    return (
      <div className="meeting-room">
        <div className="left-content" id="left-content-id" style={{ width: windowSize }}>
          <div className="heading-controller">
            {
              isMainRoom ?
                <HeadingController
                  handleOutRoom={this.handleOutRoom}
                  handleWindowSize={this.handleWindowSize}
                  handleScreenMode={this.handleScreenMode}
                  handleWhiteBoard={this.handleWhiteBoard}
                  handleScreamRecording={this.handleScreamRecording}
                /> :
                <HeadingControllerStudent
                  handleOutRoom={this.handleOutRoom}
                  handleWindowSize={this.handleWindowSize}
                />
            }
          </div>
          <div className="remote-stream">
            {
              paintScream ? (
                <WhiteBoard />
              ) :
                (
                  isMainRoom ?
                    <RemoteStreamContainer
                      paintScream={!paintScream}
                      remoteStreams={remoteStreams}
                    />
                    :
                    <RemoteStreamContainerStudent
                      remoteStreams={remoteStreams}
                    />
                )
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
                />
              </div>
            </div>
          )
        }
      </div>
    )
  }
}
const WrapperLoading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
`

const mapStateToProps = state => ({
  // listUser: remoteStreamSelector.getListUser(state)
})


function mapDispatchToProps(dispatch) {
  let actions = bindActionCreators({ MeetingRoom });
  return { ...actions, dispatch };
}

export default connect(mapStateToProps, mapDispatchToProps)(MeetingRoom);