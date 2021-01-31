import { isAuthenticated } from "./permissionChecker"
import React, { useEffect } from "react"
import { Redirect, Route } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import userAction from "../features/UserFeature/actions"
import userSelectors from "../features/UserFeature/selector"
import { configSocket } from "../pages/rootSocket"

const PrivateRoute = ({ component: Component, ...rest }) => {
  const currentUser = useSelector(userSelectors.selectCurrentUser)
  const dispatch = useDispatch()

  useEffect(() => {
    if (isAuthenticated()) {
      const config = async() => {
        await configSocket()
      }
      config();
    }
    if (!currentUser && isAuthenticated()) {
      dispatch(userAction.getCurrent())
    }
  })
  return (
    <Route
      {...rest}
      render={props =>
        !isAuthenticated() ? (
          <Redirect
            to={{
              pathname: "/",
              state: { from: props.location }
            }}
          />
        ) : (
          <Component {...props} />
        )
      }
    />
  )
}

export default PrivateRoute
