import { createSelector } from "reselect";

const selectRaw = (state) => state.room;

const getLocalStream = createSelector(
    [selectRaw],
    (room) => room.localStream
);
const selectIsHostUser = createSelector(
    [selectRaw],
    (room) => room.isHostUser
)
const selectShareScreen = createSelector(
    [selectRaw],
    (room) => room.shareScreen
)
const selectors = {
  getLocalStream,
  selectIsHostUser,
  selectShareScreen
};

export default selectors;