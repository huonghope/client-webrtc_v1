import React, { Component, useEffect, useState } from "react"
import { connect, useSelector } from "react-redux"
import { bindActionCreators } from "redux"
import headingControllerSelector from '../HeadingController/HeadingController.Selector'
import chatComponentSelector from '../ChatComponent/ChatComponent.Selector'
import roomSelector from '../../MeetingRoom.Selector'
import Icon from "../../../../constants/icons"
import getSocket from "../../../rootSocket"
import remoteStreamSelector from "../RemoteStreamContainer/RemoteStreamContainer.Selector"
import './style.scss'

class Video extends Component {
  constructor(props) {
    super(props)
    this.state = {
      mic: true,
      camera: true,
      videoVisible: true,
      chat: true,
      loading: true
    }
  }

  //처음에 한번만 했음 - 보인인 경우에는 this.props.videoStream를 전달을 안 되어서 거의 의미가 없음
  //Remote Stream를 이용함 - Left에서 Stream를 존재해서 전달하니까 바로반응
  componentDidMount() {
    if (this.props.videoStream) {
      this.video.srcObject = this.props.videoStream
    }
    getSocket().on("alert-user-mute-mic-all", data => {
      if (!this.props.isHostUser && this.props.videoStream) {
        this.mutemic(data.data)
      }
    })
    
    //학생화면 
    if(this.props.offMic){
      this.setState({
        mic: false
      })
    }
    const video = document.querySelector('video');
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');
  }

  //보인 Stream를 먼저 Render - Stream를 전달함 하지만 this.props.videoStream 아직 값이 없음
  //그후에 다른 사람의 Stream를 Render
  //전단해주는 Stream는 값이 있을떄
  componentWillReceiveProps(nextProps) {
    if (nextProps.videoStream && nextProps.videoStream !== this.props.videoStream) {
      this.video.srcObject = nextProps.videoStream
      if (!this.props.isHostUser && nextProps.videoStream) {
        this.mutemic(false)
        const { request } = nextProps
        if(request && request.status === "1" && request.type.includes("request_question") && request.reqInfo.end_time === null){
          this.mutemic(true)
        }
      }
    }
    //자기 음성을 끄기
    if (this.props.localStream && nextProps.micState !== this.props.micState && nextProps.videoStream) {
      this.mutemic(nextProps.micState)
    }

    //자기 카메라 끄기
    if (this.props.localStream  && nextProps.camState !== this.props.camState && nextProps.videoStream ) {
      this.mutecamera(nextProps.camState)
    }
    //
    if(!this.props.localStream && this.props.disableChatUser !== nextProps.disableChatUser){
      const { disableChatUser } = nextProps
      let filter = disableChatUser.find(item => item.userId === this.props.userInfo.user_idx)
      if(filter){
        const { status } = filter;
        this.setState({
          chat: status
        })
      }
    }    

    //전체 mic를 off할떄 아이콘를 수정함
    if(!this.props.localStream && this.props.muteAllStudent !== nextProps.muteAllStudent){
      this.setState({
        mic: nextProps.muteAllStudent
      })
    }

    //전체학생이 채팅이 disable
    if(!this.props.localStream && this.props.disableAllChat !== nextProps.disableAllChat){
      this.setState({
        chat: !nextProps.disableAllChat
      })
    }

    //강사인 경우에는 요청한 유저으 리스트를 찾아서 해당하는 유저의 아이콘를 수정
    if(!this.props.localStream && this.props.listUserRequest !== nextProps.listUserRequest){
      const { listUserRequest } = nextProps
      let filter = listUserRequest.find(item => (item.type === 'request_question') && (item.userId === this.props.userInfo.user_idx) && (item.status === true))
      if(!filter){
        this.setState({
          mic: false
        })
      }else{
        this.setState({
          mic: true
        })
      }
    }
  }
  //음성 끄기
  mutemic = (e = null) => {
    try {
      const stream = this.video.srcObject.getTracks().filter(track => track.kind === "audio")
      if(stream.length !== 0){
        if(this.props.localStream){
          if(e !== null){
            this.setState(prevState => {
              if (stream) stream[0].enabled = e
              return { mic: e }
            })
          }
        }
      }
    } catch (error) {
      console.log(error)
      // alert("현재 접속한 컴퓨터에서 Audio 지원하지 않습니다")
    }
  }

  //카메라 끄기
  mutecamera = (e = null) => {
    try {
      const stream = this.video.srcObject.getTracks().filter(track => track.kind === "video")
      if(stream.length !== 0){
        if(e !== null){
          this.setState(prevState => {
            if (stream) stream[0].enabled = e
            return { camera: e }
          })
        }
      }
    } catch (error) {
      console.log(error)
      // alert("현재 접속한 컴퓨터에서 Audio 지원하지 않습니다")
    }
  }

  render() {
    const { mic, camera, chat } = this.state;
    const  { socketId , videoType, videoStream} = this.props;
    return (
      <>
        <video
          id="local"
          muted={this.props.muted}
          autoPlay
          style={{
            visibility: this.state.videoVisible ? "visible" : "hidden",
            ...this.props.videoStyles
          }}
          ref={ref => {
            this.video = ref
          }}
        ></video>
        {
          this.props.videoType === 'remoteVideo' &&
            <VideoComponent 
              mic={mic}
              camera={camera}
              chat={chat}
              socketId={socketId}
              videoType={videoType}
              videoStream={videoStream}
            />
        }
      </>
    )
  }
}
const VideoComponent = ({mic, camera, chat, socketId, videoType, videoStream}) => {


  const [sendBitRate, setSendBitRate] = useState(0);
  const [receiverBitRate, setReceiverBitRate] = useState(0);
  const peerConnections = useSelector(roomSelector.selectPeerConnections);

  // 해당 유저의 연결 상태를 출력함
  useEffect(() => {
    let interval = null;
    let lastResultReceiver;
    let lastResultSender;
    let monitorTime = 1;
    interval = window.setInterval(function() {
      const peerConnection = peerConnections[socketId];
      if (peerConnection) {
        const {connectionState, iceConnectionState, iceGatheringState} = peerConnection;
        if (connectionState === 'connected' && iceConnectionState === 'connected' && iceGatheringState === 'complete') {
          let receiversVideo = peerConnection.getReceivers()[1];
          let senderVideo = peerConnection.getSenders()[1];

          if (receiversVideo === undefined || senderVideo === undefined) {
            receiversVideo = peerConnection.getReceivers()[0];
            senderVideo = peerConnection.getSenders()[0];
          }
          // console.log(peerConnection.getReceivers()[0]);
          // console.log(peerConnection.getSenders());
          try {
            senderVideo.getStats(null).then((stats) => {
              stats.forEach((report) => {
                let bytes;
                if (report.type === 'outbound-rtp') {
                  if (report.isRemote) {
                    return;
                  }
                  if (lastResultSender && lastResultSender.has(report.id)) {
                    bytes = report.bytesSent;
                    let currentKbps = ((8 * (bytes - lastResultSender.get(report.id).bytesSent)) / 1000 ) / monitorTime;
                    // console.log('bytes ================', lastResultSender.get(report.id).bytesSent);
                    let currentMbps = (currentKbps / 1000).toFixed(2);
                    // console.log(lastResultSender.get(report.id).bytesSent);
                    let bitrate = currentMbps >= 1 ? `${currentMbps}Mbps` : `${currentKbps}Kpbs`;
                    setSendBitRate(bitrate);
                  }
                }
              });
              lastResultSender = stats;
            });

            receiversVideo.getStats(null).then((stats) => {
              let bytes;
              stats.forEach((report) => {
                if (report.type === 'inbound-rtp') {
                  if (report.isRemote) {
                    return;
                  }
                  if (lastResultReceiver && lastResultReceiver.has(report.id)) {
                    bytes = report.bytesReceived;
                    // console.log(bytes);
                    let currentKbps = ((8 * (bytes - lastResultReceiver.get(report.id).bytesReceived)) / 1000 ) / monitorTime;
                    let currentMbps = (currentKbps / 1000).toFixed(2);
                    let bitrate = currentMbps >= 1 ? `${currentMbps}Mbps` : `${currentKbps}Kpbs`;
                    setReceiverBitRate(bitrate);
                  }
                }
              });
              lastResultReceiver = stats;
            });
          } catch (error) {
          }
        }
      }
    }, monitorTime * 1000);

    return () => clearInterval(interval);
  }, [peerConnections, socketId]);

  return (
    <>
        {
          videoType === 'remoteVideo' &&
          <div className="stream-info">
            <ul className="stream-info_devices">
              <li>
                <img src={camera && Icon.lecCamOnIcon} alt="camera"/>
              </li>
              <li>
                <img src={mic ? Icon.lecMicOnIcon : Icon.lecMicOffIcon} alt="mic"/>
              </li>
              <li>
                <img src={chat ? Icon.chatWTalkOnIcon : Icon.chatWTalkOffIcon} alt="chat-status"/>
              </li>
            </ul>
            <ul className="stream-info_bitrate">
                <li >
                  <p>S <i className="fa fa-arrow-up"/> {sendBitRate}</p>
                </li>
                <li>
                  <p>R <i className="fa fa-arrow-down"/> {receiverBitRate}</p>
                </li>
                <li><p>W:H {videoStream && `${videoStream.getVideoTracks()[0].getSettings().width} : ${videoStream.getVideoTracks()[0].getSettings().height}`}</p></li>
                <li>
                  {/* <p>{videoStream && `${videoStream.getVideoTracks()[0].getConstraints().width.exact} : ${videoStream.getVideoTracks()[0].getConstraints().height.exact}`}</p> */}
                </li>
            </ul>
          </div>
        }
      </>
  )
}

const mapStateToProps = state => ({
  //local stream 상태를 제어한변수
  muteAllStudent: headingControllerSelector.getLocalMuteAllStudent(state),
  micState: headingControllerSelector.getLocalStreamMicState(state),
  camState: headingControllerSelector.getLocalStreamCamState(state),

  //Host인지 구분한 변수
  isHostUser: roomSelector.selectIsHostUser(state),

  //요청유저 리스트
  listUserRequest: remoteStreamSelector.getListUserRequest(state),

  //채팅상태를 구분한 변수
  disableAllChat: chatComponentSelector.selectDisableAllChat(state),
  disableChatUser: chatComponentSelector.selectDisableChatUser(state),

  //user request
  request: remoteStreamSelector.getUserRequest(state),

  //peerConnections
  peerConnections : roomSelector.selectPeerConnections(state)
})


function mapDispatchToProps(dispatch) {
  let actions = bindActionCreators({ Video });
  return { ...actions, dispatch };
}
export default connect(mapStateToProps, mapDispatchToProps)(Video);
