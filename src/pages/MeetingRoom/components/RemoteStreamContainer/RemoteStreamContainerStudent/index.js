import React, { Component, useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import Video from '../../Video'
import CountTime from '../../../../../components/CountTime'
import './style.scss'
import { getLectureInfo, postTestConcentration, getRequestQuestionByUser, getRequestLecOutByUser } from '../RemoteStreamContainer.Service'
import CountDownTime from '../../../../../components/CountDownTime'
import getSocket from '../../../../rootSocket'
import headingControllerSocket from '../../HeadingController/HeadingController.Socket'
import remoteStreamContainerAction from '../RemoteStreamContainer.Action'
import remoteStreamSelector from '../RemoteStreamContainer.Selector'
import moment from 'moment'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Icon from '../../../../../constants/icons'
class RemoteStreamContainerStudent extends Component {
  constructor(props) {
    super(props)

    this.state = {
      rVideos: [], //연결된 peer의 Videos
      remoteStream: null,  //연결된 peer의 stream

      currentRequest: {}, //요청이 하나만 있어함

      loading: true,
      resize: false,
    }
  }

  componentDidMount() {
    if (this.props.remoteStreams.length !== 0) {
      const fetchVideos = async () => {
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
    //허락하는 경우에는 mic를 추가하기 위해서 VideoItem는 다시 render
    getSocket().on("alert-user-process-req-question", data => {
      if (data) {
        // this.props.dispatch(headingControllerAction.handleChangeMicState())
        const time = moment().format('DD/MM/YYYYHH:mm:ss')
        const { remoteStream } = this.state
        let video = <VideoItem
          videoStream={remoteStream}
          req_question_status={data}
          time={time}
        />
        this.setState({ rVideos: video })
      } else {
        const time = moment().format('DD/MM/YYYYHH:mm:ss')
        const { remoteStream } = this.state
        let video = <VideoItem
          videoStream={remoteStream}
          time={time}
        />
        this.setState({ rVideos: video })
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
      this.setState({ rVideos: video })
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
      this.setState({ rVideos: video })
    })

    const UserRoomId = () => {
      return JSON.parse(window.localStorage.getItem("usr_id"))
    }
    /**
     * @desc: 해당하는 유저의 최신한 요청정보를 받아서 체크함
     * @requestQuestion : ...
     * @requestLecOut : time화면을 출력함
     * @note : 요청이 하나만 있어야함
     */
    const fetchData = async () => {
      let params = {
        userRoomId: UserRoomId()
      }

      let requestTemp = {};
      const resQuestion = await getRequestQuestionByUser(params)
      const resLecOut = await getRequestLecOutByUser(params)
      const { data: reqQuestionData } = resQuestion
      const { data: reqLecOutData } = resLecOut

      //!그냥 component state 저장하거나 아니면 store저장할 필요함?
      //요청이 없거나 아예 끝나는 경우에는
      if(reqQuestionData !== null && reqQuestionData.req_status !== "0" && reqQuestionData.end_time === null){
          requestTemp = {
            userId: reqQuestionData.user_idx,
            type: "request_question",
            remoteId: reqQuestionData.socket_id,
            status: reqQuestionData.req_status,
            reqInfo: reqQuestionData
          }
      }
      if(reqLecOutData !== null && reqLecOutData.req_status !== "0" && reqLecOutData.end_time === null){
        requestTemp = {
          userId: reqLecOutData.user_idx,
          type: "request_lecOut",
          remoteId: reqLecOutData.socket_id,
          status: reqLecOutData.req_status,
          reqInfo: reqLecOutData
        }
      }

      this.props.dispatch(remoteStreamContainerAction.saveCurrentRequest(requestTemp))
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
      const fetchVideos = async () => {
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
        <WrapperLoading className="loading" style={{ background: 'black' }}>
          <div style={{ transform: `translateY(${-50}%)`, textAlign: 'center' }}>
            <img src={Icon.TimeImage} style={{ width: "140px", height: "140px" }} alt = "waiting-img"/>
            <p style={{ textAlign: 'center', color: 'white' }}>환경에 따라<br />다소 시간이 걸릴 수 있습니다.</p>
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
            {rVideos}
          </div>
        </div>
      </div>
    )
  }
}

//set default
const SetVideo = (remoteStream, props) => {
  return new Promise((resolve, rej) => {
    const { userRequest } = props
    let _rVideo
    //요청하고 있음
    if(userRequest){
      const { type, status } = userRequest
      let requestValue = false
      let req_question_status = false
      let req_lecOut_status = false
      //!status 확인할 필요함
      if(status === 'waiting'){ requestValue = true}else{
        req_question_status = type === 'request_question' ? status : false
        req_lecOut_status = type === 'request_lecOut' ? status : false
      }
      let startTime = null
      if(type === 'request_lecOut'){
        startTime = moment(userRequest.reqInfo.start_time).format('DD/MM/YYYYHH:mm:ss')
      }else{
        //! 어떻게 처리함
      }

      //음성질문이 하고 있는 요청
      _rVideo = <VideoItem
          videoStream={remoteStream}
          // request={requestValue}
          req_question_status={req_question_status}
          req_lecOut_status={req_lecOut_status}
          type={type}
          startTime={startTime}
        />
    }else{  
      //요청이 없는 경우에는
      _rVideo = <VideoItem
        videoStream={remoteStream}
      />
    }

    resolve({
      rVideos: _rVideo,
    })
  })
}
//! 이미 추가해넣었음
const VideoItem = ({ videoStream, time, req_question_status, req_lecOut_status, startTime, test_concentration_status, test_concentration_number }) => {

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
      status: false,
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
        //자리비움 요청을 학생 화면
        reqLecOutStatus &&
        <div className="wrapper-request wrapper-request-lecOut">
          <div>
            <h3>자리비움 중</h3>
            <CountTime startTime = {startTime}  />
            <button onClick={() => handleCancelLecOut()}>복귀하기</button>
          </div>
        </div>
      }
      {
        reqQuestionStatus && <WrapperMicComponent />
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
const WrapperMicComponent = () => {
  return (
    <div className="wrapper-request-mic">
      <div>
        <div>
          <img src={Icon.lecMicOnIcon} alt="mic-on" srcset="" />
        </div>
      </div>
    </div>
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
const mapStateToProps = state => ({
  userRequest: remoteStreamSelector.getUserRequest(state)
})

function mapDispatchToProps(dispatch) {
  let actions = bindActionCreators({ RemoteStreamContainerStudent });
  return { ...actions, dispatch };
}

export default connect(mapStateToProps, mapDispatchToProps)(RemoteStreamContainerStudent);