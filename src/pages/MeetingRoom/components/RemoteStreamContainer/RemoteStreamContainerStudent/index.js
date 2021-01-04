import React, { Component, useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import qs from 'query-string'
import Video from '../../Video'
import Axios from "axios"
import ReactLoading from 'react-loading'
import CountTime from '../../../../../components/CountTime'
import './style.scss'
import { getInformationRoom, getLectureInfo, postTestConcentration } from '../RemoteStreamContainer.Service'
import CountDownTime from '../../../../../components/CountDownTime'
import getSocket from '../../../../rootSocket'
import headingControllerSocket from '../../HeadingController/HeadingController.Socket'
import remoteStreamContainerSocket from '../RemoteStreamContainer.Socket'
import remoteStreamContainerAction from '../RemoteStreamContainer.Action'
import remoteStreamSelector from '../RemoteStreamContainer.Selector'
import moment from 'moment'
import { set } from 'immutable'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

let intervalTime = "";
class RemoteStreamContainerStudent extends Component {
  constructor(props) {
    super(props)

    this.state = {
      rVideos: [],
      remoteStream: null,

      selectedVideo: null,
      videoVisible: false,
      loading: true,

      displayTaskVideo: false,

      resize: false,
      lecOutState: false,
    }
  }

  componentDidMount() {
    
    if (this.props.remoteStreams.length !== 0) {
      const fetchVideos = async() => {
        const { rVideos } = await SetVideo(this.props.remoteStreams[0], this.props)
        this.setState({
          remoteStream: this.props.remoteStreams[0],
          rVideos: rVideos,
          loading: false
        })
      }
      fetchVideos();
    }

    //!!store 저장할 필요함
    window.addEventListener('resize', this.handleResize);
    //질문 요청의 상태를 알람
    getSocket().on("alert-user-process-req-question", data => {
      if(data){
        // const time = moment().format('DD/MM/YYYYHH:mm:ss')
        // const { remoteStream } = this.state
        // let video = <VideoItem 
        //   videoStream={remoteStream}
        //   req_question_status={data}
        //   time={time}
        // />
        // this.setState({ rVideos : video})
      }
    })
    //자리비움 요청의 상태를 알림
    getSocket().on("alert-user-process-req-lecOut", data => {
      const time = moment().format('DD/MM/YYYYHH:mm:ss')

      console.log(data)
      const { remoteStream } = this.state
      let video = <VideoItem 
        videoStream={remoteStream}
        req_lecOut_status={data}
        time={time}
      />
      this.setState({ rVideos : video})
    })

    getSocket().on("alert-user-test-concentration", data => {
      const time = moment().format('DD/MM/YYYYHH:mm:ss')
      const { remoteStream } = this.state
      console.log('집중도 테스트')
      let video = <VideoItem 
        videoStream={remoteStream}
        test_concentration_status={true}
        test_concentration_number={data.number}
        time={time}
      />
      this.setState({ rVideos : video})
    })

    const UserRoomId = () => {
      return JSON.parse(window.localStorage.getItem("usr_id"))
    }
    const fetchData = async() => {
      let params = {
        userroom_id: UserRoomId()
      }
      const resp = await getLectureInfo(params)
      this.props.dispatch(remoteStreamContainerAction.saveLectureInfo(resp))
    }
    fetchData()
  }

  handleResize = () => {
    this.setState({ resize: !this.state.resize })
  };

  componentWillUnmount() {
    window.removeEventListener('resize', () => { })
    clearInterval(intervalTime)
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.remoteStreams !== nextProps.remoteStreams 
      && nextProps.remoteStreams.length !== 0) {
      const fetchVideos = async() => {
        const { rVideos } = await SetVideo(nextProps.remoteStreams[0], this.props)
        this.setState({
          rVideos: rVideos,
          loading: false,
          remoteStream: nextProps.remoteStreams[0]
        })
      }
      fetchVideos();
    }
  }

  videoMuted = rVideo => {
    const muteTrack = rVideo.getVideoTracks()[0]
    const isSelectedVideo = rVideo.id === this.state.selectedVideo.stream.id
    if (isSelectedVideo) {
      this.setState({
        videoVisible: !muteTrack.muted
      })
    }
  }

  switchVideo = _video => {
    const muteTrack = _video.stream.getVideoTracks()[0]
    this.setState({
      selectedVideo: _video,
      videoVisible: !muteTrack.muted
    })
  }
  render() {
    const { loading } = this.state
    if (loading) {
      return (
        <WrapperLoading className="loading">
          <ReactLoading type="spin" color="#000" />
        </WrapperLoading>
      )
    }
    const { testConcentration, outEnable } = this.props
    const { lecOutState } = this.state;

    let height = document.getElementById("video-body") ? document.getElementById("video-body").getBoundingClientRect().height : null;
    if (!height) {
      height = document.getElementById("left-content-id") ? document.getElementById("left-content-id").getBoundingClientRect().height : null
    }
    let width = (height * 4) / 3
    return (
      <div className="remote-stream__container">
        <div className="single-video">
          <div className="single-video__body" id="video-body" style={{ width }}>
            {
              this.state.rVideos
            }
            {/* {
              this.props.remoteStreams.length !== 0 ?
                <VideoItem
                  rVideo={this.state.remoteStream}
                  lecOutEable={lecOutState}
                /> :
                <ReactLoading />
            } */}
          </div>
          {/* <div className="single-video__body">
            <Video
              videoType="previewVideo"
              videoStyles={{
                width: "100%",
                height: "100%",
                visibility: "visible",
                objectFit: "initial"
              }}
              videoStream={
                this.props.remoteStreams.length !== 0 && this.props.remoteStreams[0].stream
              }
            /> */}
          {/* {testConcentration.state ? (
              <InputTestConcentration
                testNumber={testConcentration.number}
                handleCorrectInput={this.props.handleCorrectInput}
                handleDownAllTime={this.props.handleDownAllTime}
              />
            ) : (
                outEnable && (
                  <div className="wrapper-outState">
                    <div>
                      <h3>자리비움 중</h3>
                      <CountTime />
                      <button onClick={() => this.props.handleCancelOut()}>
                        복귀하기
                        </button>
                    </div>
                  </div>
                )
              )} */}
          {/* <div className="single-video__footer">
                <i
                  className="material-icons"
                  onClick={() => this.props.handleUserOutRoom()}
                >
                  input
                </i>
                <div>
                  <button onClick={() => this.props.handleRequestQuestion()}>
                    음성 질문 요청
                  </button>
                  <button onClick={() => this.props.handleRequestGoOut()}>
                    자리 비움 요청
                  </button>
                </div>
                <span>수학 - 제1강 집합</span>
              </div> */}
        </div>
      </div>
    )
  }
}

//set default
const SetVideo = (remoteStream, props)=> {
  return new Promise((resolve, rej) => {
    let _rVideos = <VideoItem 
      videoStream={remoteStream}
    />

    resolve({
      rVideos: _rVideos,
    })
  })

}
//! 이미 추가해넣었음
const VideoItem = ({ videoStream,  req_question_status, time, req_lecOut_status, test_concentration_status, test_concentration_number }) => {

  const [reqQuestionStatus, setReqQuestionStatus] = useState(false)
  const [reqLecOutStatus, setLecOutStatus] = useState(false)
  const [testConcentration, setTestConcentration] = useState(false)

  useEffect(() => {
    setReqQuestionStatus(req_question_status)
    setLecOutStatus(req_lecOut_status)
    setTestConcentration(test_concentration_status)
  }, [time])

  
  const UserRoomId = () => {
    return JSON.parse(window.localStorage.getItem("usr_id"))
  }

  const handleCorrectInput = () => {
    setTestConcentration(!testConcentration)
    let payload = {
      status: true,
      userRoomId: UserRoomId()
    }
    postTestConcentration(payload)
  }
  const handleDownAllTime = () => {
    setTestConcentration(!testConcentration)
    const payload = {
      status: false,
      userRoomId: UserRoomId()
    }
    postTestConcentration(payload)
  }

  const handleCancelLecOut = () => {
    const payload = {
      status : false,
      userRoomId: UserRoomId()
    }
    headingControllerSocket.emitUserCancelRequestLecOut(payload)
    setLecOutStatus(!reqLecOutStatus)
  }
  return (
    <>
      <Video
        videoStream={videoStream.stream}
      />
      {
        reqLecOutStatus &&
        <div className="wrapper-request wrapper-request-lecOut">
            <div>
              <h3>자리비움 중</h3>
              <CountTime />
              <button onClick={() => handleCancelLecOut()}>
                복귀하기
              </button>
            </div>
        </div>
      }
      {
        testConcentration && 
        <InputTestConcentration
          testNumber={test_concentration_number}
          handleCorrectInput={() => handleCorrectInput()}
          handleDownAllTime={() => handleDownAllTime()}
        /> 
      }
      
      {/* 
      //!시간 및 숙자를 세팅 해야됨
      <InputTestConcentration
        testNumber={4}
        handleCorrectInput={() => handleCorrectInput()}
        handleDownAllTime={() => handleDownAllTime()}
      /> */}
    </>
  )
}

const InputTestConcentration = React.memo(
  ({ testNumber, handleCorrectInput, handleDownAllTime }) => {
    const [number, setNumber] = useState()
    const [checkInput, setCheckInput] = useState(false)
    const [displayWrapper, setDisplayWrapper] = useState(true)
    const handleSubmitInput = e => {
      e.preventDefault()
      if (number !== testNumber) setCheckInput(true)
      else {
        setCheckInput(false)
        setDisplayWrapper(false)
        handleCorrectInput()
      }
    }
    //알림
    const handleDownAllTimeCallback = useCallback(() => {
      setDisplayWrapper(false)
      handleDownAllTime()
    })
    if (displayWrapper) {
      return (
        <div className="test-wrapper">
          <div>
            <h2>집중도 테스트</h2>
            <CountDownTime handleDownAllTime={() => handleDownAllTimeCallback()} />
            <h1>{testNumber}</h1>
            <form onSubmit={e => handleSubmitInput(e)}>
              <input
                type="text"
                className="input-number"
                onChange={e => setNumber(Number(e.target.value))}
              />
              {checkInput && <p>올바른 숫자 입력하세요</p>}
            </form>
          </div>
        </div>
      )
    } else return ""
  }
)

const WrapperLoading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`
const mapStateToProps = state => ({})


function mapDispatchToProps(dispatch) {
  let actions = bindActionCreators({ RemoteStreamContainerStudent });
  return { ...actions, dispatch };
}

export default connect(mapStateToProps, mapDispatchToProps)(RemoteStreamContainerStudent);