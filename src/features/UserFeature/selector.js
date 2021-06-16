import { createSelector } from "reselect"

const selectRaw = state => state.user


const selectDataLoading = createSelector([selectRaw], user => user.dataLoading)

const selectErrorMessage = createSelector([selectRaw], user => user.error)

const selectUsers = createSelector([selectRaw], user => user.users)


// const selectCurrentUser = createSelector([selectRaw], user => user.current)
const selectCurrentUser = createSelector([selectRaw], user => user.current)

const selectors = {
  selectDataLoading,
  selectErrorMessage,
  selectUsers,
  selectCurrentUser
}

export default selectors
