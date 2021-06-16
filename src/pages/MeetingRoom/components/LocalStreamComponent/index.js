
import React, {useEffect, useState} from 'react'
import { useSelector } from 'react-redux';
import Video from '../Video'
import './style.scss'
import meetingRoomSelectors from '../../MeetingRoom.Selector'
import WrapperLoading from '../../../../components/Loading/WrapperLoading';
function LocalStreamComponent({localStream, shareScrean}) {
  const isHostUser = useSelector(meetingRoomSelectors.selectIsHostUser)
  const [myStream, setMyStream] = useState(null)

  // useEffect(() => {
  //   let init = async () => {
  //     if(localStream && !shareScream){
  //       try {
  //         let tempStream = localStream
  //         if(localStream.getVideoTracks){
  //           let videoTrack = tempStream.getVideoTracks()[0]
  //           let constraints = {
  //             video: {
  //               width:  { exact: 240 }, 
  //               height: { exact: 120 }
  //             }
  //           }
  //           await videoTrack.applyConstraints(constraints.video).then(async () => {
  //             tempStream.addTrack(videoTrack)
  //             setMyStream(tempStream)
  //           }).catch(e => console.log(e))
  //         }
  //       } catch (error) {
  //         console.log(error)
  //       }
  //     }
  //   }
  //   init()
  // }, [localStream])
  // if(!myStream)
  //   return null

  // if(myStream && myStream.getVideoTracks()[0].getConstraints().width.exact === 1280){
    
  // }
  // if(!localStream){
  //   return <WrapperLoading type={"bars"} color={"black"} />
  // }
  
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
        !isHostUser ?
        localStream && `${localStream.getVideoTracks()[0].getConstraints().width.exact} : ${localStream.getVideoTracks()[0].getConstraints().height.exact}`:
        localStream && `${localStream.getVideoTracks()[0].getConstraints().width.ideal} : ${localStream.getVideoTracks()[0].getConstraints().height.ideal}
        ${localStream.getVideoTracks()[0].getConstraints().frameRate.ideal}`
      }
    </div> */}
    </div>
  )
}
export default LocalStreamComponent
// export default React.memo(LocalStreamComponent)

