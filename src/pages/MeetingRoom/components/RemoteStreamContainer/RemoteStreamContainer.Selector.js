import { createSelector } from "reselect";

const selectRaw = (state) => state.remoteStream;

const getListUser = createSelector(
    [selectRaw],
    (remoteStream) => remoteStream.listUser
);

const getLectureInfo = createSelector(
  [selectRaw],
  (remoteStream) => remoteStream.lectureInfo
);

const getListUserRequest = createSelector(
  [selectRaw],
  (remoteStream) => remoteStream.listUserRequest
);

const getUserRequest = createSelector(
  [selectRaw],
  (remoteStream) => remoteStream.userRequest
)
const selectors = {
  getListUser,
  getLectureInfo,
  getListUserRequest,
  getUserRequest
};

export default selectors;

