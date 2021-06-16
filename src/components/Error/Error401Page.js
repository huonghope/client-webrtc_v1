import React, { useEffect } from "react"
import ErrorWrapper from "./style"

const Error404Page = () => {
  useEffect(() => {
    localStorage.clear()
  }, [])
  return (
    <ErrorWrapper>
      <div className="exception">
        <div className="imgBlock">
          <div
            className="imgEle"
            style={{
              backgroundImage: `https://webartdevelopers.com/blog/wp-content/uploads/2018/09/404-SVG-Animated-Page-Concept.png`
            }}
          />
        </div>
        <div className="content">
          <h1>404</h1>
          <div className="desc">현페이지 로그인을 한 다음에 접속하세요.</div>
          {/* <div className="actions">
            <Link to="/">
              <button type="primary">홈 페이지 다시 돌아가지</button>
            </Link>
          </div> */}
        </div>
      </div>
    </ErrorWrapper>
  )
}

export default Error404Page
