import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Video from '../Video'
import './style.scss'

import meetingRoomSelectors from '../../MeetingRoom.Selector'

import headingController from '../HeadingController/HeadingController.Selector'

function LocalStreamComponent({localStream}) {
  const dispatch = useDispatch();
  const localStreamState = useSelector(meetingRoomSelectors.getLocalStream);
  const localStreamSoundState = useSelector(headingController.getLocalStreamSoundState)
  const localStreamMicState = useSelector(headingController.getLocalStreamMicState)
  const localStreamCamState = useSelector(headingController.getLocalStreamCamState)

  // useEffect(() => {
  //   console.log("change", localStreamSoundState)
  // }, [localStreamSoundState])
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
      localMicMute={localStreamMicState}
      localVideoMute={localStreamCamState}
      videoStream={localStream}
      showMuteControls={true}
      isMainRoom={"hello"} //!수정필요함
      autoPlay
      muted //local default true
    ></Video>
    </div>
  )
}



export default LocalStreamComponent

