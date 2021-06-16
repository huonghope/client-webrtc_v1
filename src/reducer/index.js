import { combineReducers } from "redux"
import { connectRouter } from "connected-react-router"
import auth from "../features/AuthFeature/reducer"
import user from "../features/UserFeature/reducer"
import room from "../pages/MeetingRoom/MeetingRoom.Reducer"
import localStream from '../pages/MeetingRoom/components/HeadingController/HeadingController.Reducer'
import remoteStream from '../pages/MeetingRoom/components/RemoteStreamContainer/RemoteStreamContainer.Reducer'
import chat from '../pages/MeetingRoom/components/ChatComponent/ChatComponent.Reducer'
// import userReducer from './userReducer'
// import roomReducer from './roomReducer'
//add all redux
export default history =>
    combineReducers({
    router: connectRouter(history),
    auth,
    user,
    localStream,
    remoteStream,
    room,
    chat,
})
