import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { configStore } from '../../store/config';
import Loading from '../../components/Loading/WrapperLoading'
import './style.scss'
import adapter from 'webrtc-adapter'
import getSocket from '../rootSocket'
import meetingRoomAction from '../MeetingRoom/MeetingRoom.Action'
import { useDispatch } from 'react-redux';
function Landing(props) {

  const [audioInput, setAudioInput] = useState(null);
  const [isAudioInput, setIsAudioInput] = useState(false);

  const [audioOutput, setAudioOutput] = useState(null);
  const [isAudioOutput, setIsAudioOutput] = useState(false)

  const [videoInput, setVideoInput] = useState({ value: '', text: '' });
  const [isVideo, setIsVideo] = useState(false)

  const [localStream, setLocalStream] = useState(null);
  const [loading, setLoading] = useState(true);

  const [listAudioInput, setListAudioInput] = useState([]);
  const [listAudioOutput, setListAudioOutput] = useState([]);
  const [listVideoInput, setListVideoInput] = useState([]);


  const dispatch = useDispatch()
  function gotDevices(deviceInfos) {
    for (let i = 0; i !== deviceInfos.length; ++i) {
      const deviceInfo = deviceInfos[i];
      if (deviceInfo.kind === 'audioinput') {
        const option = {
          value: deviceInfo.deviceId,
          text: deviceInfo.label || `microphone`
        }
        setAudioInput(true)
        setListAudioInput(listAudioInput => [...listAudioInput, option])
        setAudioInput(option)
      } else if (deviceInfo.kind === 'audiooutput') {
        const option = {
          value: deviceInfo.deviceId,
          text: deviceInfo.label || `speaker`
        }
        setIsAudioOutput(true)
        setAudioOutput(true)
        setListAudioOutput(listAudioOutput => [...listAudioOutput, option])
      } else if (deviceInfo.kind === 'videoinput') {
        const option = {
          value: deviceInfo.deviceId,
          text: deviceInfo.label || `camera`
        }
        setIsVideo(true)
        setListVideoInput(listVideoInput => [...listVideoInput, option])
        setVideoInput(option)
      } else {
        console.log('Some other kind of source/device: ', deviceInfo);
      }
    }
  }

  function handleError(error) {
    console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
  }

  async function getStream(deviceId = null) {
    if (window.stream) {
      window.stream.getTracks().forEach(track => {
        track.stop();
      });
    }
    let constraints;
    if (deviceId) {
      constraints = {
        video: { deviceId: { exact: deviceId } }
      };
    } else {
      constraints = {
        video: { deviceId: videoInput.value ? { exact: videoInput.value } : undefined }
      };
    }
    const stream = await navigator.mediaDevices.getUserMedia(constraints).catch(e => handleError(e))
    dispatch(meetingRoomAction.doCreateLocalStream(stream))
    setLocalStream(stream)
    setLoading(false)
  }

  function init() {
    if (window.stream) {
      window.stream.getTracks().forEach(track => {
        track.stop();
      });
    }
    navigator.mediaDevices.enumerateDevices().then(gotDevices).then(getStream).catch(handleError);
  }

  const handleChangeVideo = (deviceId) => {
    setLoading(true)
    const deviceTemp = listVideoInput.filter(dev => dev.value === deviceId)[0]
    setVideoInput(deviceTemp)
    getStream(deviceTemp.value)
  }

  const handleJoin = () => {
    if(!isVideo){
      alert('카메라 허락하지 않음 또는 찾지 못합니다')
      return;
    }else{
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
      dispatch(meetingRoomAction.setHostUser({ isHostUser: userRole}));
    })
  }, [])

  return (
    <div className="landing-page">
      <div>
        <div class="select">
          <label for="audioSource">Audio input source: </label>
          <select id="audioSource" onChange={(e) => setAudioInput(e.target.value)}>
            {
              listAudioInput.map((audio) => (
                <option value={audio.value}>{audio.text}</option>
              ))
            }
          </select>
        </div>

        <div class="select">
          <label for="audioOutput">Audio output destination: </label>
          <select id="audioOutput" onChange={(e) => setAudioOutput(e.target.value)}>
            {
              listAudioOutput.map((audio) => (
                <option value={audio.value}>{audio.text}</option>
              ))
            }
          </select>
        </div>

        <div class="select">
          <label for="videoSource">Video source: </label>
          <select id="videoSource" value={videoInput.value} onChange={(e) => handleChangeVideo(e.target.value)}>
            {
              listVideoInput.map((audio) => (
                <option value={audio.value}>{audio.text}</option>
              ))
            }
          </select>
        </div>
        <div className="local-video">
          {
            loading ?
              <Loading className="loading" color={"black"} style={{ background: 'black' }} /> :
              <Video stream={localStream} />
          }
        </div>
      </div>
      <div className="landing-page__join">
          <button onClick={() => handleJoin()}>참여</button>
          <button onClick={()=> window.close()} >취소</button>
      </div>
    </div>
  )
}

const Video = ({ stream }) => {
  const localVideo = React.createRef();
  useEffect(() => {
    localVideo.current.srcObject = stream;
  }, [stream, localVideo]);
  return (
    <video style={{ height: 500, width: 500 }} ref={localVideo} autoPlay />
  );
};
Landing.propTypes = {

}

export default Landing

