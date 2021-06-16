import { Suspense } from "react"
import { Provider } from "react-redux"
import { configStore, getHistory } from "./store/config"
import { ConnectedRouter } from "connected-react-router"
import "./index.scss"

import Loading from "./components/Loading"
import RoutesComponent from "./routes/RoutesComponent"

const store = configStore()

function App() {
  return (
    <div className="web-rtc">
      <Suspense fallback={<Loading type={"bars"} color={"white"} />}>
        <Provider store={store}>
          <ConnectedRouter history={getHistory()}>
            <RoutesComponent />
          </ConnectedRouter>
        </Provider>
      </Suspense>
    </div>
  )
}

export default App
