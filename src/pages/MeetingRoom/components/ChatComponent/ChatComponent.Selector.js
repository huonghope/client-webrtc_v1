import { createSelector } from "reselect";

const selectRaw = (state) => state.chat;

const selectCurrentChattingState = createSelector(
    [selectRaw],
    (chat) => chat.chattingState
);

const selectDisableChatUser = createSelector(
    [selectRaw],
    (chat) => chat.disableChatUser
);


const selectDisableAllChat = createSelector(
    [selectRaw],
    (chat) => chat.disableAllChat
)
const selectors = {
    selectCurrentChattingState,
    selectDisableChatUser,
    selectDisableAllChat
};

export default selectors;
