const privateRoutes = [
  {
    path: "/meetting/open",
    exact: true,
    loader: () => import("../pages/MeetingRoom/MeetingRoom"),
    menu: false,
    label: "강좌 미팅",
    permissionRequired: null,
    icon: "home"
  }
]

const publicRoutes = [
  {
    path: "/",
    exact: true,
    loader: () => import("../pages/CreateRoom")
  },
  {
    path: "/meeting",
    exact: true,
    loader: () => import("../pages/LandingPage")
  }
]

const authRoutes = [
  // {
  //   path: "/createroom",
  //   exact: true,
  //   loader: () => import("../pages/CreateRoom")
  // }
]

const errorRoutes = [
  {
    path: "/401",
    exact: true,
    loader: () => import("../components/Error/Error401Page")
  },
  // {
  //   path: "/403",
  //   exact: true,
  //   loader: () => import("../components/Error/Error404Page")
  // },
  // {
  //   path: "/404",
  //   exact: true,
  //   loader: () => import("../components/Error/Error404Page")
  // },
  // {
  //   path: "/500",
  //   exact: true,
  //   loader: () => import("../components/Error/Error404Page")
  // }
]

export default {
  privateRoutes,
  publicRoutes,
  authRoutes,
  errorRoutes
}
