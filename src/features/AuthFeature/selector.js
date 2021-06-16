import { createSelector } from "reselect";

const selectRaw = state => state.auth;

// select loading
const selectInitLoading = createSelector(
    [selectRaw],
    auth => auth.initLoading
);

const selectSignInLoading = createSelector(
    [selectRaw],
    auth => auth.signinLoading
);

// select errors
const selectSignInError = createSelector([selectRaw], 
    auth => auth.signInError
);

const selectors = {
    selectInitLoading,
    selectSignInLoading,
    selectSignInError,
};

export default selectors;
