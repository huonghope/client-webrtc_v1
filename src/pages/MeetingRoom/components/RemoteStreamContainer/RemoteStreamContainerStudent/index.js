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
import headingControllerAction from '../../HeadingController/HeadingController.Action'
import moment from 'moment'
import { set } from 'immutable'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Icon from '../../../../../constants/icons'

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
        // this.props.dispatch(headingControllerAction.handleChangeMicState())
      }
    })

    //자리비움 요청의 상태를 알림
    getSocket().on("alert-user-process-req-lecOut", data => {
      const time = moment().format('DD/MM/YYYYHH:mm:ss')
      const { remoteStream } = this.state
      let video = <VideoItem 
        videoStream={remoteStream}
        req_lecOut_status={data}
        time={time}
      />
      this.setState({ rVideos : video})
    })

    //집중테스트
    getSocket().on("alert-user-test-concentration", data => {
      const time = moment().format('DD/MM/YYYYHH:mm:ss')
      const { remoteStream } = this.state
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
    // clearInterval(intervalTime)
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
  render() {
    const { loading, rVideos } = this.state
    if (loading) {
      return (
        <WrapperLoading className="loading" style={{background: 'black'}}>
          <div style={{transform: `translateY(${-50}%)`}}>
            <img src={Icon.TimeImage} style={{width: "140px", height: "140px"}} />
            <p style={{textAlign: 'center', color: 'white'}}>학생의 입장을<br/> 
            기다리고 있습니다.</p>
          </div>
        </WrapperLoading>
      )
    }

    //비율기간이 맞춤
    let height = document.getElementById("video-body") ? document.getElementById("video-body").getBoundingClientRect().height : null;
    if (!height) {
      height = document.getElementById("left-content-id") ? document.getElementById("left-content-id").getBoundingClientRect().height : null
    }
    // let width = (height * 4) / 3
    return (
      <div className="remote-stream__container">
        <div className="single-video">
          {/* <div className="single-video__body" id="video-body" style={{ width }}> */}
          <div className="single-video__body" id="video-body">
            { rVideos }
          </div>
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
const VideoItem = ({ videoStream, time, req_question_status, req_lecOut_status, test_concentration_status, test_concentration_number }) => {

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

  const videoMuted = (rVideo) => {
    const muteTrack = rVideo.getVideoTracks()[0]
    const isSelectedVideo = rVideo.id === this.state.selectedVideo.stream.id
    console.log("aaa")
    if (isSelectedVideo) {
      this.setState({
        videoVisible: !muteTrack.muted
      })
    }
  }
  return (
    <>
      <Video
        videoStream={videoStream.stream}
      />
      {
        //자리비움 요청을 학생 화면
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
        //집중도 테스트
        testConcentration && 
        <InputTestConcentration
          testNumber={test_concentration_number}
          handleCorrectInput={() => handleCorrectInput()}
          handleDownAllTime={() => handleDownAllTime()}
        /> 
      }
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