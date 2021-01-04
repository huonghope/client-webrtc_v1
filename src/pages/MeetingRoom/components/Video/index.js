import React, { Component } from "react"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import headingControllerSelector from '../HeadingController/HeadingController.Selector'
import chatComponentSelector from '../ChatComponent/ChatComponent.Selector'
import roomSelector from '../../MeetingRoom.Selector'
import Icon from "../../../../constants/icons"
class Video extends Component {
  constructor(props) {
    super(props)
    this.state = {
      mic: true,
      camera: true,
      // currentStream: new MediaStream(),
      // videoTrack: false,
      videoVisible: true,
      chat: true
    }
  }

  //처음에 한번만 했음 - 보인인 경우에는 this.props.videoStream를 전달을 안 되어서 거의 의미가 없음
  //Remote Stream를 이용함 - Left에서 Stream를 존재해서 전달하니까 바로반응
  componentDidMount() {
    if (this.props.videoStream) {
      this.video.srcObject = this.props.videoStream
    }
  }

  //보인 Stream를 먼저 Render - Stream를 전달함 하지만 this.props.videoStream 아직 값이 없음
  //그후에 다른 사람의 Stream를 Render
  // 전단해주는 Stream는 값이 있을떄
  componentWillReceiveProps(nextProps) {
    if (
      nextProps.videoStream &&
      nextProps.videoStream !== this.props.videoStream
    ) {
      this.video.srcObject = nextProps.videoStream
      if(!this.props.isHostUser && nextProps.videoStream){
        this.mutemic()
      }

      // const { isMainRoom, showMuteControls } = this.props

      // //Default Host방이 아니고, 보인 Stream라고, video-stream전달 완료
      // if (!isMainRoom && showMuteControls && nextProps.videoStream) {
      //   this.mutemic()
      // }
    }
    if(nextProps.micState !== this.props.micState && nextProps.videoStream){
      this.mutemic()
    }

    // console.log(this.props.videoStream)

    //!HOST유저를 처음에는 mic는 default on
    //Mic 기능 제어함
    // if (
    //   this.props.isMainRoom &&
    //   this.props.showMuteControls &&
    //   this.props.localMicMute !== nextProps.localMicMute
    // ) {
    //   this.mutemic()
    // }
    // //Camera 기능 제어함
    if (
      this.props.isMainRoom &&
      this.props.showMuteControls &&
      this.props.localVideoMute !== nextProps.localVideoMute
    ) {
      this.mutecamera()
    }

    // //!USER mic control
    // //Mic 기능 제어함
    // if (
    //   !this.props.isMainRoom &&
    //   this.props.showMuteControls &&
    //   this.props.flagControl !== nextProps.flagControl &&
    //   this.props.localMicMute !== nextProps.localMicMute
    // ) {
    //   this.mutemic()
    // }
    // //Camera 기능 제어함
    // if (
    //   !this.props.isMainRoom &&
    //   this.props.showMuteControls &&
    //   this.props.flagControl !== nextProps.flagControl &&
    //   this.props.localVideoMute !== nextProps.localVideoMute
    // ) {
    //   this.mutecamera()
    // }

    // // This is done only once when we receive a video track
    // const videoTrack =
    //   nextProps.videoStream && nextProps.videoStream.getVideoTracks()
    // if (
    //   this.props.videoType === "remoteVideo" &&
    //   videoTrack &&
    //   videoTrack.length
    // ) {
    //   videoTrack[0].onmute = () => {
    //     // alert('muted')
    //     this.setState({
    //       videoVisible: false
    //     })
    //     // this.props.videoMuted(nextProps.videoStream)
    //   }

    //   videoTrack[0].onunmute = () => {
    //     this.setState({
    //       videoVisible: true
    //     })
    //     // this.props.videoMuted(nextProps.videoStream)
    //   }
    // }

    // const audioTrack =
    //   nextProps.videoStream && nextProps.videoStream.getAudioTracks()
    // if (
    //   this.props.videoType === "remoteVideo" &&
    //   audioTrack &&
    //   audioTrack.length
    // ) {
    //   audioTrack[0].onmute = () => {
    //     // this.setState({
    //     //   videoVisible: false,
    //     // })
    //     // this.props.videoMuted(nextProps.videoStream)
    //   }
    // }
  }

  mutemic = e => {
    try {
      const stream = this.video.srcObject.getTracks().filter(track => track.kind === "audio")
      if (stream.length !== 0)
        this.setState(prevState => {
          if (stream) stream[0].enabled = !prevState.mic
          return { mic: !prevState.mic }
        })
    } catch (error) {
      console.log(error)
      alert("현재 접속한 컴퓨터에서 Audio 지원하지 않습니다")
    }
  }

  mutecamera = e => {
    try {
      const stream = this.video.srcObject
        .getTracks()
        .filter(track => track.kind === "video")
      if (stream.length !== 0)
        this.setState(prevState => {
          if (stream) stream[0].enabled = !prevState.camera
          return { camera: !prevState.camera }
        })
    } catch (error) {
      console.log(error)
      alert("현재 접속한 컴퓨터에서 Audio 지원하지 않습니다")
    }
  }

  render() {
    const muteControls = !this.props.showMuteControls &&
      this.props.viewStateMicAndCam && (
        <div className="stream-info">
            <ul>
              <li>
                <img src={Icon.lecCamOnIcon} />
              </li>
              <li>
                <img src={this.props.req_question_status ? Icon.lecMicOnIcon : Icon.lecMicOffIcon}  />
              </li>
              <li>
                <img src={this.props.disableAllChat ? Icon.chatTalkOffIcon : Icon.chatTalkOnIcon} />
              </li>
          </ul>
        </div>
      )
    return (
      <>
        <video
          id="local"
          muted={this.props.muted} //자기 muted 안 듣음
          autoPlay
          style={{
            visibility: this.state.videoVisible ? "visible" : "hidden",
            ...this.props.videoStyles
          }}
          ref={ref => {
            this.video = ref
          }}
        ></video>
        {muteControls}
      </>
    )
  }
}

const mapStateToProps = state => ({
  micState: headingControllerSelector.getLocalStreamMicState(state),
  isHostUser: roomSelector.selectIsHostUser(state),
  disableAllChat: chatComponentSelector.selectDisableAllChat(state)
})


function mapDispatchToProps(dispatch) {
  let actions = bindActionCreators({ Video });
  return { ...actions, dispatch };
}
export default connect(mapStateToProps, mapDispatchToProps)(Video);
