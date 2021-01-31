import React, { useEffect, useState } from 'react'
import Icon from '../../../../constants/icons'
import './style.scss'
// import './style2.scss'
import moment from "moment"
import chatComponentSocket from './ChatComponent.Socket'
import chatComponentService from './ChatComponent.Service'
import chatSelector from './ChatComponent.Selector'
import getSocket from '../../../rootSocket'

import roomSelector from '../../MeetingRoom.Selector'
import remoteStreamContainerSelector from '../RemoteStreamContainer/RemoteStreamContainer.Selector'
import remoteStreamContainer from '../RemoteStreamContainer/RemoteStreamContainer.Socket'
import { useDispatch, useSelector } from 'react-redux'
import chatAction from './ChatComponent.Action'
import { isMobile } from 'react-device-detect';
moment.locale('ko')
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

function ChatComponent(props) {

  const [disableChatInput, setDisableChatInput] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  // const [user, setUser] = useState({ uid: 0 })
  const [boxedListUser, setBoxedListUser] = useState(false)
  // const [listUser, setListUser] = useState([])

  const isHostUser = useSelector(roomSelector.selectIsHostUser)
  const listUser = useSelector(remoteStreamContainerSelector.getListUser)
  // const listDisableChatUser = useSelector(chatSelector.selectDisableChatUser)

  const [disableChatUser, setDisableChatUser] = useState([])
  const [allDisable, setAllDisable] = useState(false)

  const dispatch = useDispatch()

  //!나중에 추가함
  const [imageZoom, setImageZoom] = useState(false)
  const [selectedImage, setSelectedImage] = useState("")


  const scrollToBottom = () => {
    const chat = document.getElementById("chatList")
    if(chat)
      chat.scrollTop = chat.scrollHeight
  }

  useEffect(() => {
    let fetchData = async () => {
      let params = {
        userRoomId: userRoomId()
      }
      const listMessage = await chatComponentService.getListMessageByUserId(params)

      setMessages(listMessage.data)
    }
    fetchData()
  }, [])

  // useEffect(() => {
  //   console.log(listDisableChatUser)
  //   const filter = listDisableChatUser.filter(item => item.status === false)
  //   filter.map(item => setDisableChatUser([...disableChatUser, {user_idx : item.userId}]))
  //   console.log(filter)

  // },[listDisableChatUser])

  useEffect(() => {
    scrollToBottom()
  }, [props])

  useEffect(() => {
    //요청하고 있는거 알려줌
    if(getSocket() != null){
      getSocket().on("alert-all-request-message", data => {
        let newMessage = data
        setMessages(prevState => [...prevState, newMessage])
        scrollToBottom()
      })
      getSocket().on("alert-host-test-concentration-fail", data => {
        let newMessage = data
        setMessages(prevState => [...prevState, newMessage])
        scrollToBottom()
      })
      getSocket().on("alert-user-warning", data => {
        let newMessage = data
        setMessages(prevState => [...prevState, newMessage])
        scrollToBottom()
      })
      getSocket().on("alert_user_disable_chat", data => {
        let newMessage = data
        setMessages(prevState => [...prevState, newMessage])
        scrollToBottom()
      })
      getSocket().on("res-sent-message", data => {
        let newMessage = data
        console.log(data)
        setMessages(prevState => [...prevState, newMessage])
        scrollToBottom()
      })
      getSocket().on("res-sent-files", data => {
        console.log(data)
        let newMessage = data
        setMessages(prevState => [...prevState, newMessage])
        scrollToBottom()
      })
    }
  }, [])

  useEffect(() => {
    if(getSocket() != null){
      getSocket().on("action_user_disable_chat", data => {
        setDisableChatInput(!disableChatInput)
        dispatch(chatAction.chattingStateChange(disableChatInput))
      })
    }
  })

  // const sendMessage = msg => {
  //   props.sendMessage(msg)
  //   scrollToBottom()
  // }

  const getToken = () => {
    const { userInfoToken } = JSON.parse(window.localStorage.getItem("asauth"))
    return userInfoToken
  }
  const userRoomId = () => {
    return JSON.parse(window.localStorage.getItem("usr_id"))
  }
  const handleSubmit = event => {
    if (message === "") return
    event.preventDefault()

    let payload = {
      type: "text",
      message: {
        sender: { uid: getToken().userId },
        data: { text: message }
      }
    }
    chatComponentSocket.emitSentMessage(payload)
    setMessage("")
    scrollToBottom()
  }
  const handleSelectImage = (url) => {
    setSelectedImage(url)
    setImageZoom(true)
  }
  /**
   * 각 메시지유형에 따라 맞는 출려형태를 매핑함
   * @param {*} userType 
   * @param {*} data 
   */
  const renderMessage = (userType, data) => {
    const { type } = data
    let msgDiv
    switch (type) {
      case "text":
        msgDiv = MessageComponent(userType, data)
        break;
      case "request_question":
      case "request_lecOut":
        msgDiv = RequestComponent(isHostUser, userType, data)
        break;
      case "file":
        msgDiv = FileComponent(userType, data)
        break;
      case "text-alert":
        msgDiv = AlertTextComponent(userType, data)
        break;
      case "test-concentration-fail":
      case "disable-chat":
      case "user-warning":
        msgDiv = WarningMessComponent(userType, data)
        break;
      case "image-message":
        msgDiv = ImageComponent(userType, data, handleSelectImage)
        break;
      default: //!Error
        // msgDiv = ImageComponent(userType, data)
        break;
    }

    return <li className={userType}>{msgDiv}</li>
  }


  //파일 업데이트
  const handleValueFile = e => {
    // const { name, size, type } = e.target.files[0];
    let params = {
      userRoomId: userRoomId()
    }
    const { size } = e.target.files[0]
    if ((size / 1000000) < 100) {
      let data = new FormData()
      data.append("file", e.target.files[0])
      data.append("params", JSON.stringify(params))
      chatComponentService.upFile(data)
    } else {
      alert("파일 공유 용량제한이 100MB이하 입니다.")
    }
  }

  //파일을 업데이트
  const handleClickUpFile = () => {
    if(!disableChatInput){
      const upFile = document.createElement("input")
      upFile.setAttribute("type", "file")
      upFile.setAttribute("name", "file")
      upFile.setAttribute("style", "display: none")
      document.body.appendChild(upFile)
      upFile.click()
      upFile.onchange = handleValueFile
    }else{
      alert("채팅 금지되어 있는 상태입니다.")
    }
  }

  //카메라클릭하여 이미지 업데이트
  const handleClickCameraOn = () => {
      const upImage = document.createElement("input")
      upImage.setAttribute("type", "file")
      upImage.setAttribute("name", "file")
      upImage.setAttribute("accept", "image/*")
      upImage.setAttribute("style", "display: none")
      document.body.appendChild(upImage)
      upImage.click()
      upImage.onchange = handleValueFile
  }

  //유저별로 채팅금지
  const handleOffChatForUser = (user_idx, socketId, status) => {
    const tempDisableChatUser = disableChatUser
    //있는지 없는지 확인하여 추가함
    let filter = tempDisableChatUser.find((e) => e.user_idx === user_idx)
    if (filter) {
      filter = tempDisableChatUser.filter((e) => e.user_idx !== user_idx)
      setDisableChatUser(filter)
    } else {
      setDisableChatUser([...disableChatUser, { user_idx }])
    }

    setBoxedListUser(!boxedListUser)
    let payload = {
      status: status,
      remoteSocketId: socketId,
      userId: user_idx
    }
    dispatch(chatAction.disableChatUser(payload))
    chatComponentSocket.emitDisableUserChat(payload)
  }

  const handleOffChatAllUser = () => {
    let payload = {
      remoteSocketId: "all"
    }
    setAllDisable(!allDisable)
    setBoxedListUser(!boxedListUser)
    if(allDisable){
      let tempUser = [{ user_idx : '0'}] //trick
      setDisableChatUser(tempUser)
    }else{
      setDisableChatUser(listUser)
    }
    dispatch(chatAction.disableAllChatting(true))
    chatComponentSocket.emitDisableUserChat(payload)
  }

  const showEnlargedImage = (data) => {
    return (<img
      src={data}
      style={{
        backgroundColor: 'black',
        position: 'relative',
        zIndex: 100,
        display: 'block',
        cursor: 'pointer',
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: 20,
        borderRadius: 20,
      }}
      alt="up-img"
      onClick={() => setImageZoom(false)}
    />)
  }
  const handleSetBoxedListUser = () =>{
    if(listUser.length !== 0)
    {
      setBoxedListUser(!boxedListUser)
    }
  }

  return (
    <div className="chat__component">
      {imageZoom && showEnlargedImage(selectedImage)}
      <div className="chat-content">
        <ul className="chat-rows" id="chatList">
          {messages.map((data, idx) => (
            <div key={idx}>
              {
                  getToken().userId === data.sender.uid
                  ? renderMessage("self", data)
                  : renderMessage("other", data)
              }
            </div>
          ))}
        </ul>
      </div>
      <div className="chat-tasks">
        <ul>
          {
            props.isMainRoom ?
              <>
                {
                  isMobile ?
                    <li><img onClick={() => handleClickCameraOn()} src={Icon.chatCameraOnIcon} alt="click-camera"/></li> :
                    <li><img onClick={() => handleClickUpFile()} src={Icon.chatFileIcon} alt="click-up" /></li>
                }
                <li className="chatting-hidden"><img onClick={() => handleSetBoxedListUser()} src={Icon.chatTalkOffIcon} alt="list-user"/>
                  {
                    boxedListUser &&
                    <div className="list-user-chat">
                      {listUser.length !== 0 && (
                        <ul>
                          <li onClick={() => handleOffChatAllUser()}> 1. 전체
                            {  allDisable && <span>X</span> }
                          </li>
                          {listUser.map((user, idx) => (
                            <li onClick={() => handleOffChatForUser(
                              user.user_idx, 
                              user.socket_id, 
                              disableChatUser.find(e => e.user_idx === user.user_idx) ? true : false)} key={idx}>
                              {idx + 2}. {user.user_name}
                              {
                                disableChatUser.find(e => e.user_idx === user.user_idx) &&
                                <span>X</span>
                              }
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  }
                </li>
              </> :
              <>
                <li><img disabled={disableChatInput} onClick={() => handleClickUpFile()} src={Icon.chatFileIcon} alt="up-file" /></li>
              </>
          }
        </ul>
      </div>
      <div className="chat-form">
        <form onSubmit={handleSubmit} className="form-container" style={disableChatInput ? {background : "#D7CEDC"  } : {}}>
          <input
            className="b"
            type="text"
            placeholder={
              disableChatInput ? "채팅 금지 상태입니다 ..." : "채팅 ..."
            }
            onChange={(event) => setMessage(event.target.value)}
            value={message}
            readOnly={disableChatInput}
            style={disableChatInput ? {background : "#D7CEDC"  } : {}}
            />
          <button disabled={disableChatInput}>전송</button>
        </form>
      </div>
    </div>
  )
}
/**
 * 
 * @param {*} type : 자기또는 다름 유저 
 * @param {*} message : message 데이터
 */
//!나중에 
const MessageComponent = (type, resData) => {
  const { data, sender } = resData;
  return (
    <div className="msg-type">
      <div className="msg-type__message">
        <p>{data.message}</p>
      </div>
      <div className="msg-type__info">
        {
          type === "other" && <span className="msg-type__name">{sender.username}</span>
        }
        <span className="msg-type__time">{moment(data.timestamp).format("LT")}</span>
      </div>
    </div>
  )
}

const FileComponent = (type, resData) => {
  const { data, sender } = resData
  const handleDownload = path => {
    const url = path
    const link = document.createElement("a")
    link.setAttribute("href", `${process.env.REACT_APP_SERVER_API}/${url}`)
    link.setAttribute("download", "") //! 안 됨
    link.setAttribute("target", "_blank")
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  return (
    <div className="file-type">
      {/* <div className="file-type__info">
            <span className="file-type__name">{message.sender.username}</span>
            <span className="file-type__time">{moment(message.data.time).format("LT")}</span>
          </div> */}
      <div className="file-type__message">
        <p className="file-type__name">{data.file.originalname}</p>
        {/* <p>요효기간 ~ <span>2020.09.30</span></p> */}
        <p className="file-type__size">
          용량 : <span>{(data.file.size / 1000).toFixed(2)} KB</span>
        </p>
        <button
          className="file-type__btn"
          onClick={() => handleDownload(data.file.fileHash)}
        >
          다운로드
            </button>
      </div>
      {/** 어떤 보내는 사람 */}
      <div className="file-type__info">
        {
          type === "other" && <span className="msg-type__name">{sender.username}</span>
        }
        <span className="msg-type__time">{moment(data.timestamp).format("LT")}</span>
      </div>
    </div>
  )
}
const AlertTextComponent = (type, message) => {
  let msgDiv;
  const { data } = message
  const messageInfo = message.sender.username + " " + data.text
  msgDiv = (
    <div className="msg-request">
      <div className="msg-request__heading">
        <p>{messageInfo}</p>
        <span>{moment(message.data.time).format("LT")}</span>
      </div>
    </div>
  )
  return msgDiv
}

const RequestComponent = (isHostUser, type, resData) => {

  const { type: requestType, sender, data } = resData
  let msgDiv
  const userRoomId = () => {
    return JSON.parse(window.localStorage.getItem("usr_id"))
  }
  const handleActionRequestUser = (userId, method, type) => {
    const payload = {
      type: type,
      status: method,
      userId: userId,
      userRoomId: userRoomId(),
    }
    remoteStreamContainer.emitProcessRequestUser(payload)
  }
  if (isHostUser) {
    const messageInfo = requestType === "request_question" ? `${sender.username} 학생이 질문을 요청하였습니다.` : `${sender.username} 학생이 자리비움을 요청하였습니다.`
    // const requestType = message.data.text === "질문 요청" ? "question" : "lecOut"
    msgDiv = (
      <div className="msg-request">
        <div className="msg-request__heading">
          <p>{messageInfo}</p>
          <span>{moment(data.timestamp).format("LT")}</span>
        </div>
        {
          isMobile &&
          <div className="msg-request__button mobile">
            <button onClick={() => handleActionRequestUser(sender.uid, "accept", requestType)}> 수락 </button>
            <button onClick={() => handleActionRequestUser(sender.uid, "reject", requestType)}> 취소 </button>
          </div>
        }
      </div>
    )
  } else {
    const messageInfo = requestType === "request_question" ? `음성질문을 요청하였습니다.` : `자리비움을 요청하였습니다.`;
    msgDiv = (
      <div className="msg-request">
        <div className="msg-request__heading">
          <div className="msg-request__content">
            <p>{messageInfo}</p>
            {/* <img src={Icon.smallLoading} alt="loading" /> */}
            <span>{moment(data.timestamp).format("LT")}</span>
          </div>
        </div>
      </div>
    )
  }
  return msgDiv;
}

const WarningMessComponent = (type, resData) => {
  let { type: requestType, sender, data } = resData
  let footerText = " 메시지 전송되었습니다"
  switch (requestType.trim()) {
    case "test-concentration-fail":
      footerText = "집중테스트 실패합니다."
      break;
    case "disable-chat":
      footerText = "채팅 금지/허용 되었습니다."
      break;
    case "user-warning":
      footerText = "경고 받았습니다."
      break;
    default:
      break;
  }
  const messageInfo = sender.username + " " + footerText;
  let msgDiv = (
    <div className="msg-request">
      <div className="msg-request__heading">
        <div className="msg-request__warning">
          <p>{messageInfo}</p>
          <span>{moment(data.timestamp).format("LT")}</span>
        </div>
      </div>
    </div>
  )
  return msgDiv
}

//일반 구현을 안 됨
const ImageComponent = (type, resData, handleSelectImage) => {

  //!나중에 추가함
  // const [imageZoom, setImageZoom] = useState(false)
  // const [selectedImage, setSelectedImage] = useState("")

  let msgDiv = (
    <div className="msg-row">
      <p>{resData.sender.username}</p>
      <img
        onClick={() => {
          // setImageZoom(true)
          handleSelectImage(resData.data)
        }}
        className="img-message"
        style={{
          width: 200,
          // height: 100
          cursor: "pointer"
        }}
        alt="update img"
        src={resData.data}
      />
    </div>
  )

  return msgDiv
}

export default ChatComponent

