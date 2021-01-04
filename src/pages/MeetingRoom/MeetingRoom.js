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
import {isMobile} from 'react-device-detect';
import adapter from 'webrtc-adapter'
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
      selectedVideo: null,

      pc_config: {
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302"
          }
        ]
      },

      // sdpConstraints: {
      //   mandatory: {
      //     OfferToReceiveAudio: true,
      //     OfferToReceiveVideo: true
      //   }
      // },
      sdpConstraints: {
        offerToReceiveAudio: 0,
        offerToReceiveVideo: 1
      },

      isMainRoom: false,

      recordedBlobs: [],
      disconnected: false,

      fullScream: false,
      paintScream: false,
      enableRecord: false,
      loading: true,
    }

    this.recordVideo = null;
  }

  //로컬의 Stream는 출력함
  //!기계를 체크할 필요함
  getLocalStream = () => {
    const constraints = {
      audio: true,
      video: true,
      options: {
        mirror: true
      }
    }
    //!refactory해야함
    const handleSuccess = stream => {
      const videoTracks = stream.getVideoTracks()
      console.log(`Using video device: ${videoTracks[0].label}`)
      this.setState({
        localStream: stream,
        loading: false
      })
      this.props.dispatch(meetingRoomAction.whoisOnline())
    }

    const handleError = error => {
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
        const  gotDevices = (deviceInfos) => {
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
        const  getStream = async() => {
          const stream = await navigator.mediaDevices.getUserMedia(constraints).catch(e => handleError(e))
          handleSuccess(stream)
        }

        navigator.mediaDevices
        .enumerateDevices()
        .then(gotDevices)
        .then(getStream)
        .catch(handleError);
      } catch (e) {
        handleError(e)
      }
    }
    init()
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
        const rVideos = this.state.remoteStreams.filter(stream => stream.id === socketID )
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
            // isHost: this.state.isMainRoom
          }
          remoteStreams = [...this.state.remoteStreams, remoteVideo]
        }

        this.setState(prevState => {
          let selectedVideo = prevState.remoteStreams[0] ? prevState.remoteStreams[0] : []
          selectedVideo = selectedVideo.length  ? {} : { selectedVideo: remoteVideo }
          return {
            ...selectedVideo,
            remoteStreams,
            loading: false
          }
        })
      }
      pc.close = () => {
        // alert('GONE')
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
    // console.log("adapete", adapter.browserDetails.browser)
    window.onunload = window.onbeforeunload = function () {
      getSocket.close()
    }
    //! Redux 저장할 필요없나?
    /************** Peer connect */
    getSocket().on("connection-success", data => {
      this.getLocalStream()
      const { isHost } = data

      this.props.dispatch(meetingRoomAction.setHostUser({ isHostUser: isHost }))
      this.setState({
        // status: status,
        isMainRoom: isHost,
        messages: data.messages,
        localMicMute: isHost ? false : true,
        loading: false,
      })
    })
    // getSocket().on("joined-peers", data => {
    //   this.setState({
    //     status:
    //       data.peerCount > 1
    //         ? `Room : ${room}: ${data.peerCount}`
    //         : "기다리는 중.."
    //   })
    // })

    getSocket().on("peer-disconnected", data => {
      try {
        this.state.peerConnections[data.socketID].close()
        const rVideo = this.state.remoteStreams.filter(
          stream => stream.id === data.socketID
        )
        rVideo && this.stopTracks(rVideo[0].stream)

        const remoteStreams = this.state.remoteStreams.filter(
          stream => stream.id !== data.socketID
        )
        this.setState(prevState => {
          const selectedVideo =  prevState.selectedVideo.id === data.socketID && remoteStreams.length ? { selectedVideo: remoteStreams[0] } : null
          return {
            // remoteStream: remoteStreams.length > 0 && remoteStreams[0].stream || null,
            remoteStreams,
            loading: false,
            ...selectedVideo,
          }
        })
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
              pc.addStream(this.state.localStream)
            } catch (error) {
              console.log(this.state.localStream)
              console.log("Add Stream Error", error)
            }
            pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(() => {
                // 2. Create Answer
                pc.createAnswer(this.state.sdpConstraints).then( async sdp => {
                  pc.setLocalDescription(sdp)
                  // console.log("send answer")
                  let tempSdp = await updateBandwidthRestriction(sdp.sdp, 10)
                  let answerSdp = {
                    sdp: tempSdp,
                    type: sdp.type
                  }
                  meetingRoomSocket.sendToPeer("answer", answerSdp, {
                    local: getSocket().id,
                    remote: data.socketID
                  })
                }).catch(e => console.log(e))
              }
            )
          } catch (error) {
            window.location.reload();
          }
        })
      } catch (error) {
        console.log(error)        
      }
    })
    const  updateBandwidthRestriction = async (sdp, bandwidth) => {
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
      const pc = this.state.peerConnections[data.socketID]
      let desc = new RTCSessionDescription({type: data.sdp.type, sdp: data.sdp.sdp})
      pc.setRemoteDescription(desc).then(() => { })
    })
    getSocket().on("candidate", data => {
      const pc = this.state.peerConnections[data.socketID]
      if (pc) pc.addIceCandidate(new RTCIceCandidate(data.candidate))
    })
  }
  handleOutRoom = () => {
    const { remoteStreams } = this.state
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
  }
  handleWindowSize = () => {
    this.setState({
      fullScream: !this.state.fullScream
    })
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
    var videoPreview = document.getElementById('local');
    const { enableRecord, localStream } = this.state

    //! start event
    if (!enableRecord) {
      //!RecordRTC
      this.recordVideo = new RecordRTCPromisesHandler(localStream, {
        type: 'video'
      });

      this.recordVideo.startRecording();
      this.setState({
        enableRecord: !this.state.enableRecord
      })

    } else {
      let tempVideo = this.recordVideo
      this.recordVideo.stopRecording(function(url) {
          alert("영상길이에 따라 시간이 걸립니다.")
          videoPreview.src = url;
          videoPreview.download = 'video.webm';
          
          console.log("this record", tempVideo)
          convertStreams(tempVideo.getBlob());
      });
      this.setState({
            enableRecord: !this.state.enableRecord
      })
      
    }
    
    //! end - event
    var workerPath = 'https://archive.org/download/ffmpeg_asm/ffmpeg_asm.js';
    // if(document.domain == 'localhost') {
    //     workerPath = window.location.href.replace(window.location.href.split('/').pop(), '') + 'ffmpeg_asm.js';
    // }
    const  processInWebWorker = () => {
      console.log("pro in web woker")

      var blob = URL.createObjectURL(new Blob(['importScripts("' + workerPath + '");var now = Date.now;function print(text) {postMessage({"type" : "stdout","data" : text});};onmessage = function(event) {var message = event.data;if (message.type === "command") {var Module = {print: print,printErr: print,files: message.files || [],arguments: message.arguments || [],TOTAL_MEMORY: message.TOTAL_MEMORY || false};postMessage({"type" : "start","data" : Module.arguments.join(" ")});postMessage({"type" : "stdout","data" : "Received command: " +Module.arguments.join(" ") +((Module.TOTAL_MEMORY) ? ".  Processing with " + Module.TOTAL_MEMORY + " bits." : "")});var time = now();var result = ffmpeg_run(Module);var totalTime = now() - time;postMessage({"type" : "stdout","data" : "Finished processing (took " + totalTime + "ms)"});postMessage({"type" : "done","data" : result,"time" : totalTime});}};postMessage({"type" : "ready"});'], {
          type: 'application/javascript'
      }));

      var worker = new Worker(blob);
      URL.revokeObjectURL(blob);
      return worker;
    }

    var worker;
    //!start - convert
    const convertStreams = (videoBlob) => {

      console.log("covert", videoBlob)
      var aab;
      var buffersReady;
      var workerReady;
      var posted;

      var fileReader = new FileReader();
      fileReader.onload = function() {
          aab = this.result;
          postMessage();
      };
      fileReader.readAsArrayBuffer(videoBlob);

      if (!worker) {
          worker = processInWebWorker();
      }

      worker.onmessage = function(event) {
          console.log("on message")
          console.log(event)

          var message = event.data;
          if (message.type == "ready") {
              workerReady = true;
              if (buffersReady)
                  postMessage();
          } else if (message.type == "stdout") {
          } else if (message.type == "start") {
          } else if (message.type == "done") {

              var result = message.data[0];

              var blob = new File([result.data], 'test.mp4', {
                  type: 'video/mp4'
              });


              PostBlob(blob);
          }
      };
      
      var postMessage = function() {
          posted = true;

          worker.postMessage({
              type: 'command',
              arguments: '-i video.webm -c:v mpeg4 -b:v 6400k -strict experimental output.mp4'.split(' '),
              files: [
                  {
                      data: new Uint8Array(aab),
                      name: 'video.webm'
                  }
              ]
          });
      };
    }
      //!end - convert
    const  PostBlob = (blob) => {
      // const blob = new Blob(recordedBlobs, { type: "video/webm" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.type = 'video/mp4; codecs=mpeg4';
      let currentDay = moment().format("l").replace("/", "_")
      a.download = `${currentDay}.mp4`
      document.body.appendChild(a)
      a.click()



      // var video = document.createElement('video');
      // video.controls = true;

      // var source = document.createElement('source');
      // source.src = URL.createObjectURL(blob);
      // source.type = 'video/mp4; codecs=mpeg4';
      // video.appendChild(source);

      // video.download = 'Play mp4 in VLC Player.mp4';

      // var h2 = document.createElement('h2');
      // h2.innerHTML = '<a href="' + source.src + '" target="_blank" download="Play mp4 in VLC Player.mp4" style="font-size:200%;color:red;">Download Converted mp4 and play in VLC player!</a>';
      // h2.style.display = 'block';

      // video.tabIndex = 0;
      // video.focus();
      // video.play();

      // document.querySelector('#record-video').disabled = false;
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
      // disconnect socket
      getSocket().close()
      // stop local audio & video tracks
      this.stopTracks(localStream)

      // stop all remote audio & video tracks
      remoteStreams.forEach(rVideo => this.stopTracks(rVideo.stream))

      const { timeTestConcentrationAPI, isMainRoom } = this.state
      if (isMainRoom) clearInterval(timeTestConcentrationAPI)
      // stop all remote peerconnections
      peerConnections &&
        Object.values(peerConnections).forEach(pc => pc.close())

      this.props.history.push("/meetting")
    }
    // console.log(isMobile)
    if(isMobile){
      return (
        <div className="chat-component-mobile">
          <ChatComponent
            remoteStreams={remoteStreams}
          />
        </div>
      )
    } 

    //! setState 확인필요함
    // if (loading) {
    //   return (
    //     <WrapperLoading>
    //       <ReactLoading type="spin" color="#000" />
    //     </WrapperLoading>
    //   )
    // }

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