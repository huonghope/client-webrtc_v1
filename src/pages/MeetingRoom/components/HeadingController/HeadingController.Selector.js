import { createSelector } from "reselect";

const selectRaw = (state) => state.localStream;

const getLocalStreamSoundState = createSelector(
    [selectRaw],
    (stream) => stream.soundState
);
const getLocalStreamMicState = createSelector(
    [selectRaw],
    (stream) => stream.micState
);

const getLocalMuteAllStudent = createSelector(
    [selectRaw],
    (stream) => stream.muteAllStudent
)
const getLocalStreamCamState = createSelector(
    [selectRaw],
    (stream) => stream.camState
);

const selectors = {
    getLocalStreamSoundState,
    getLocalStreamMicState,
    getLocalStreamCamState,
    getLocalMuteAllStudent
};

export default selectors;

