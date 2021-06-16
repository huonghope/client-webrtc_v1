import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Loading from '../../components/Loading/WrapperLoading'
import './style.scss'
import getSocket from '../rootSocket'
import meetingRoomAction from '../MeetingRoom/MeetingRoom.Action'
import { useDispatch } from 'react-redux';
import { Button } from '../../components/Button';
import services from '../../features/UserFeature/service';
import { isMobile } from 'react-device-detect'

function Landing(props) {

  const [audioInput, setAudioInput] = useState(null);
  const [isAudioInput, setIsAudioInput] = useState(false);

  const [audioOutput, setAudioOutput] = useState(null);
  const [isAudioOutput, setIsAudioOutput] = useState(false)

  const [videoInput, setVideoInput] = useState({ value: '', text: '' });
  const [isVideo, setIsVideo] = useState(false)

  const [localStream, setLocalStream] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingPage, setLoadingPage] = useState(true);

  const [listAudioInput, setListAudioInput] = useState([]);
  const [listAudioOutput, setListAudioOutput] = useState([]);
  const [listVideoInput, setListVideoInput] = useState([]);

  const [userInfo, setUserInfo] = useState({});

  const dispatch = useDispatch()
  function gotDevices(deviceInfos) {
    for (let i = 0; i !== deviceInfos.length; ++i) {
      const deviceInfo = deviceInfos[i];
      if (deviceInfo.kind === 'audioinput') {
        const option = {
          value: deviceInfo.deviceId,
          text: deviceInfo.label || `microphone`
        }
        setIsAudioInput(true)
        setAudioInput(option)
        setListAudioInput(listAudioInput => [...listAudioInput, option])
      } else if (deviceInfo.kind === 'audiooutput') {
        const option = {
          value: deviceInfo.deviceId,
          text: deviceInfo.label || `speaker`
        }
        setIsAudioOutput(true)
        setAudioOutput(option)
        setListAudioOutput(listAudioOutput => [...listAudioOutput, option])
      } else if (deviceInfo.kind === 'videoinput') {
        const option = {
          value: deviceInfo.deviceId,
          text: deviceInfo.label || `camera`
        }
        setIsVideo(true)
        if(!videoInput.value){
          setVideoInput(option)
        }
        setListVideoInput(listVideoInput => [...listVideoInput, option])
      } else {
        // console.log('Some other kind of source/device: ', deviceInfo);
      }
    }
  }

  function handleError(error) {
    // alert(error)
    // console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
  }

  async function getStream(deviceId = null) {
    if (window.stream) {
      window.stream.getTracks().forEach(track => {
        track.stop();
      });
    }
    let constraints;

    //!체크필요함
    var iOS = navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
    if (deviceId) {
      constraints = {
        video: { 
          deviceId: { exact: deviceId },
          facingMode: isMobile ? iOS ? 'environment' : null : null
        },
        audio: true
      };
    } else {
      constraints = {
        video: {
          deviceId: videoInput.value ? { exact: videoInput.value } : undefined,
          facingMode: isMobile ? iOS ? 'environment' : null : null
        },
        audio: true
      };
    }
    const stream = await navigator.mediaDevices.getUserMedia(constraints).catch(e => handleError(e))
    dispatch(meetingRoomAction.doCreateLocalStream(stream))
    setLocalStream(stream)
    setLoading(false)
  }

  async function init() {
    if (window.stream) {
      window.stream.getTracks().forEach(track => {
        track.stop();
      });
    }
    await navigator.mediaDevices.getUserMedia({audio: true, video: true});
    navigator.mediaDevices.enumerateDevices().then(gotDevices).then(getStream).catch(handleError);
  }

  const handleChangeVideo = (deviceId) => {
    setLoading(true)
    const deviceTemp = listVideoInput.filter(dev => dev.value === deviceId)[0]
    setVideoInput(deviceTemp)
    getStream(deviceTemp.value)
  }

  const handleJoin = () => {
    if (!isVideo) {
      alert('카메라 권한이 허용되어 있지 않거나 카메라를 찾을 수 없습니다.')
      return;
    } else {
      let roomInfo = JSON.parse(localStorage.getItem("roomInfo"))
      let asauth = JSON.parse(localStorage.getItem("asauth")).userInfoToken
      props.history.push(`/meeting/open?room=${roomInfo.roomName}&user=${asauth.userId}`);
    }
  }

  useEffect(() => {
    init()
    // dispatch(meetingRoomAction.whoIsOnline())  
    getSocket().on("user-role", data => {
      const { userRole } = data
      dispatch(meetingRoomAction.setHostUser({ isHostUser: userRole }));
    })

    let fetchCurrentUser = async () => {
      const response = await services.getCurrent()
      const { data } = response
      setUserInfo(data);
      setLoadingPage(false)
    }

    const script = document.createElement("script");
    script.src = "https://webrtc.github.io/adapter/adapter-latest.js";
    script.async = true;
    document.body.appendChild(script);

    fetchCurrentUser()
  }, [])

  return (
    <div className="landing-page">
      <div className="landing-page__content">
        <p className="landing-page__title">카메라 설정</p>

        <div className="landing-page__select">
          <select id="videoSource" value={videoInput.value} onChange={(e) => handleChangeVideo(e.target.value)}>
            {
              listVideoInput.map((video) => (
                <option value={video.value}>{video.text}</option>
              ))
            }
          </select>
        </div>

        <div className="landing-page__local-video">
          {
            loading ?
              <Loading className="loading" color={"black"} style={{ background: 'black' }} /> :
              <Video stream={localStream} />
          }
        </div>

        <h2 className="landing-page__text">참여할 준비가 되셨나요?</h2>
        <div className="landing-page__join">
          {
            !loadingPage &&
            <div className="landing-page__user">
              <p><>{userInfo.user_tp === 'T' || userInfo.user_tp === 'I' ? "강사" : "학생"}</>: {userInfo.user_name}</p>
            </div>
          }
          <Button buttonStyle="btn--secondary" buttonSize="btn--medium" onClick={() => window.close()}>참여 취소</Button>
          <Button buttonStyle="btn--primary" buttonSize="btn--medium" onClick={() => handleJoin()}>참여 요청</Button>
        </div>

      </div>
    </div>
  )
}

const Video = ({ stream }) => {
  const localVideo = React.createRef();
  useEffect(() => {
    localVideo.current.srcObject = stream;

    // video 속성값을 설정
    const video = document.querySelector('video');
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');

  }, [stream, localVideo]);
  return (
    <video id="vid" ref={localVideo} muted autoPlay playsinline/>
  );
}

export default Landing

