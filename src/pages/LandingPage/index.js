import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { configStore } from '../../store/config';

function Landing(props) {

  const [audioInput, setAudioInput] = useState(null);
  const [audioOutput, setAudioOutput] = useState(null);
  const [videoInput, setVideoInput] = useState(null);

  const [localStream, setLocalStream] = useState(null);


  const [listAudioInput, setListAudioInput] = useState([]);
  const [listAudioOutput, setListAudioOutput] = useState([]);
  const [listVideoInput, setListVideoInput] = useState([]);

  function gotDevices(deviceInfos) {
    console.log(deviceInfos.length)
    for (let i = 0; i !== deviceInfos.length; ++i) {
      const deviceInfo = deviceInfos[i];
      if (deviceInfo.kind === 'audioinput') {
        const option = {
          value: deviceInfo.deviceId,
          text: deviceInfo.label || `microphone`
        }
        setListAudioInput(listAudioInput => [...listAudioInput, option])
        setAudioInput(option)
      } else if (deviceInfo.kind === 'audiooutput') {
        const option = {
          value: deviceInfo.deviceId,
          text: deviceInfo.label || `speaker`
        }
        setListAudioOutput(listAudioOutput => [...listAudioOutput, option])
      } else if (deviceInfo.kind === 'videoinput') {
        const option = {
          value: deviceInfo.deviceId,
          text: deviceInfo.label || `camera`
        }
        setListVideoInput(listVideoInput => [...listVideoInput, option])
        !videoInput && setVideoInput(option) 
      } else {
        console.log('Some other kind of source/device: ', deviceInfo);
      }
    }
  }
  // Attach audio output device to video element using device/sink ID.
  function attachSinkId(element, sinkId) {
    if (typeof element.sinkId !== 'undefined') {
      element.setSinkId(sinkId)
        .then(() => {
          console.log(`Success, audio output device attached: ${sinkId}`);
        })
        .catch(error => {
          let errorMessage = error;
          if (error.name === 'SecurityError') {
            errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
          }
          console.error(errorMessage);
          // Jump back to first output device in the list as it's the default.
          // audioOutputSelect.selectedIndex = 0;
        });
    } else {
      console.warn('Browser does not support output device selection.');
    }
  }

  function handleError(error) {
    console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
  }

  async function getStream() {
    if (window.stream) {
      window.stream.getTracks().forEach(track => {
        track.stop();
      });
    }
    const constraints = {
      // audio: { deviceId: audioInput ? { exact: audioInput.value } : undefined },
      video: { deviceId: videoInput ? { exact: videoInput.value } : undefined }
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints).catch(e => handleError(e))
    console.log(stream)
    setLocalStream(stream)
  }
  function init() {
    if (window.stream) {
      window.stream.getTracks().forEach(track => {
        track.stop();
      });
    }
    navigator.mediaDevices.enumerateDevices().then(gotDevices).then(getStream).catch(handleError);
  }
  const handleChangeVideo = (device) => 
  { 
    const deviceTemp = listVideoInput.find(device => device.value.includes(device.value))
    console.log(device)
    setVideoInput(deviceTemp)
    getStream()
  }
  useEffect(() => {
    init()
  }, [])
  return (
    <div>
      <p>Get available audio, video sources and audio output devices from <code>mediaDevices.enumerateDevices()</code>
        then set the source for <code>getUserMedia()</code> using a <code>deviceId</code> constraint.</p>

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
        <select id="videoSource" value={videoInput} onChange={(e) => handleChangeVideo(e.target.value)}>
          {
            listVideoInput.map((audio) => (
              <option value={audio}>{audio.text}</option>
            ))
          }
        </select>
      </div>
      <Video stream={localStream} />
    </div>
  )
}

const Video = ({ stream }) => {
  const localVideo = React.createRef();
  console.log(stream)
  useEffect(() => {
    if (localVideo.current) localVideo.current.srcObject = stream;
  }, [stream, localVideo]);

  return (
    <video style={{ height: 500, width: 500 }} ref={localVideo} autoPlay />
  );
};
Landing.propTypes = {

}

export default Landing

