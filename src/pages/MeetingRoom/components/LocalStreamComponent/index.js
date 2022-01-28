import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import Video from "../Video"
import "./style.scss"
import meetingRoomSelectors from "../../MeetingRoom.Selector"
import getSocket from "../../../rootSocket"
import WrapperLoading from "../../../../components/Loading/WrapperLoading"
import userSelectors from "../../../../features/UserFeature/selector"
import headingControllerSelector from "../HeadingController/HeadingController.Selector"

function LocalStreamComponent({ localStream, shareScrean }) {
  const isHostUser = useSelector(meetingRoomSelectors.selectIsHostUser)
  const micState = useSelector(headingControllerSelector.getLocalStreamMicState)
  return (
    <div className="local-stream__component">
      <Video
        videoType="localVideo"
        videoStyles={{
          width: "100%",
          height: "100%"
        }}
        frameStyle={{
          height: "100%",
          borderRadius: 5,
          backgroundColor: "black"
        }}
        // localMicMute={localStreamMicState}
        // localVideoMute={localStreamCamState}
        localStream={true}
        videoStream={localStream}
        isMainRoom={isHostUser} //!수정필요함
        autoPlay
        muted //local default true
      ></Video>
      {/* <div>
        {
          isHostUser &&
            localStream &&
            `${
              localStream.getVideoTracks()[0].getConstraints().width.ideal
            } : ${
              localStream.getVideoTracks()[0].getConstraints().height.ideal
            }`
          // :
          // localStream && `${localStream.getVideoTracks()[0].getConstraints().width.exact} : ${localStream.getVideoTracks()[0].getConstraints().height.exact}`
        }
      </div> */}
      <SoundMeter
            className="local-sound-meter"
            stream={localStream}
            startMeasuring={micState}
          />
    </div>
  )
}

function SoundMeter({ startMeasuring, stream }) {

  window.audioMeterTmp = 0
  const [audioMeter, setAudioMeter] = useState(0)
  const currentUser = useSelector(userSelectors.selectCurrentUser)
  const roomReconrdInfo = true
  let interval = null
  
  useEffect(() => {
    let speakingFlag = false
    let speakingFlagSend = false
    interval = setInterval(() => {
      let audioMeterTemp = window.audioMeterTmp.toFixed(2) * 25
      let data = {
        userId: currentUser && currentUser.user_idx,
        remoteSocketId: getSocket().id
      }
      if (audioMeterTemp >= 0.5 && !speakingFlagSend) {
        speakingFlagSend = true
        speakingFlag = false
        if (roomReconrdInfo !== null) {
          data.recordInfo = roomReconrdInfo
        }
        data.status = true

        // calculation time
        const currentTime = new Date();
        var datestring = ("0" + currentTime.getDate()).slice(-2) + "-" + 
        ("0"+(currentTime.getMonth()+1)).slice(-2) + "-" +
        currentTime.getFullYear() + " " + 
        ("0" + currentTime.getHours()).slice(-2) + ":" + 
        ("0" + currentTime.getMinutes()).slice(-2) + ":" + 
        ("0" + currentTime.getSeconds()).slice(-2) + ":" + 
        ("0" + currentTime.getMilliseconds());

        getSocket().emit("alert-speaking", data)
      } else if (audioMeterTemp <= 0.5 && !speakingFlag) {
        speakingFlag = true
        speakingFlagSend = false

        data.status = false
        getSocket().emit("alert-speaking", data)
      }
      setAudioMeter(audioMeterTemp)
    }, 200)

    return () => clearInterval(interval)
  }, [roomReconrdInfo])

  useEffect(() => {
    // Reference:
    // https://github.com/webrtc/samples/blob/gh-pages/src/content/getusermedia/volume/js/soundmeter.js
    // const shareStream = new MediaStream([audio.getTracks()[0], stream.getTracks()[0]]);
    try {
      let audioStream = new MediaStream()
      audioStream.addTrack(stream.getAudioTracks()[0])

      let context = new AudioContext()
      let script = context.createScriptProcessor(2048, 1, 1)
      let mic = context.createMediaStreamSource(audioStream)
      mic.connect(script)
      script.connect(context.destination)

      script.onaudioprocess = event => {
        const input = event.inputBuffer.getChannelData(0)
        let sum = 0.0
        for (let i = 0; i < input.length; ++i) {
          sum += Math.pow(input[i], 2)
        }
        window.audioMeterTmp = Math.sqrt(sum / input.length)
      }
    } catch (e) {
      console.error(e)
    }
  }, [stream])

  if(!startMeasuring || !stream) return null;
  return (
    <div>
      <meter
        className={
          startMeasuring
            ? "sound-meter sound-meter-on"
            : "sound-meter sound-meter-off"
        }
        high="0.25"
        max="1"
        value={startMeasuring ? audioMeter : ""}
      />
    </div>
  )
}
export default LocalStreamComponent
