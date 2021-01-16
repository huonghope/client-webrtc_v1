import React, { Component } from "react"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import headingControllerSelector from '../HeadingController/HeadingController.Selector'
import chatComponentSelector from '../ChatComponent/ChatComponent.Selector'
import roomSelector from '../../MeetingRoom.Selector'
import Icon from "../../../../constants/icons"
import getSocket from "../../../rootSocket"
import authReducer from "../../../../features/AuthFeature/reducer"
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

    getSocket().on("alert-user-mute-mic", data => {
      if (!this.props.isHostUser && this.props.videoStream) {
        console.log("모든 학생 음성", data.data)
        this.mutemic(data.data)
        // this.video.srcObject = this.props.videoStream
        // this.video.srcObject = this.props.videoStream
      }
    })
  }

  //보인 Stream를 먼저 Render - Stream를 전달함 하지만 this.props.videoStream 아직 값이 없음
  //그후에 다른 사람의 Stream를 Render
  // 전단해주는 Stream는 값이 있을떄
  componentWillReceiveProps(nextProps) {
    if (nextProps.videoStream && nextProps.videoStream !== this.props.videoStream) {
      this.video.srcObject = nextProps.videoStream
      if (!this.props.isHostUser && nextProps.videoStream) {
        console.log("일반유저라 음성 끄기")
        this.mutemic(false)
      }
    }

    //자기 음성을 끄기
    if (this.props.localStream && nextProps.micState !== this.props.micState && nextProps.videoStream) {
      console.log("음성상태 변화 props this", nextProps.micState)
      this.mutemic(nextProps.micState)
    }

    //자기 카메라 끄기
    if (this.props.localStream  && nextProps.camState !== this.props.camState && nextProps.videoStream ) {
      console.log("카메로상태 변화", nextProps.camState)
      this.mutecamera(nextProps.camState)
    }
  }

  //음성 끄기
  mutemic = (e = null) => {
    try {
      const stream = this.video.srcObject.getTracks().filter(track => track.kind === "audio")
      if(stream.length !== 0){
        console.log("변화정상")
        if(e !== null){
          console.log("변화 값은", e)
          this.setState(prevState => {
            if (stream) stream[0].enabled = e
            return { mic: e }
          })
        }
        // else{
        //   this.setState(prevState => {
        //     if (stream) stream[0].enabled = !prevState.mic
        //     return { mic: !prevState.mic }
        //   })
        // }
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
          console.log(e)
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
    const muteControls =  this.props.micStateChange !== undefined ?
    <div className="stream-info">
      <ul>
        <li>
          <img src={Icon.lecCamOnIcon} />
        </li>
        <li>
          <img src={this.props.micStateChange ? Icon.lecMicOffIcon : Icon.lecMicOnIcon} />
        </li>
        <li>
          <img src={this.props.disableAllChat ? Icon.chatTalkOffIcon : Icon.chatTalkOnIcon} />
        </li>
      </ul>
    </div>
    :
    this.props.viewStateMicAndCam && (
        <div className="stream-info">
          <ul>
            <li>
              <img src={Icon.lecCamOnIcon} />
            </li>
            <li>
              <img src={this.props.req_question_status ? Icon.lecMicOnIcon : Icon.lecMicOffIcon} />
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
  //local stream 상태를 제어한변수
  micState: headingControllerSelector.getLocalStreamMicState(state),
  camState: headingControllerSelector.getLocalStreamCamState(state),

  //Host인지 구분한 변수
  isHostUser: roomSelector.selectIsHostUser(state),

  //채팅상태를 구분한 변수
  disableAllChat: chatComponentSelector.selectDisableAllChat(state)
})


function mapDispatchToProps(dispatch) {
  let actions = bindActionCreators({ Video });
  return { ...actions, dispatch };
}
export default connect(mapStateToProps, mapDispatchToProps)(Video);
