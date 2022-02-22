<h1 align="center" style="display: block; font-size: 2.5em; font-weight: bold; margin-block-start: 1em; margin-block-end: 1em;">
<a name="logo" href="#">
  <img align="center" src="./docs/imgs/main-page.png" alt="PLASS ProblemBank Home" style="width:80%;height:80%;filter:drop-shadow(10px 10px 3px black);"/></a>
  <br><br><strong>웹RTC 기반으로 1:N 화상 미팅</strong>
</h1>

![Latest release](https://img.shields.io/github/v/release/DonggukPLASS-Lab/project-client?style=for-the-badge)

---
## 소개[![](./docs/imgs/pin.svg)](#introduction)
**프로젝트 관리 페이이지 클라이언트**라는 프로젝트는 동국대학교 PLASS 연구실 연구원들이 개발하는 프로젝트입니다.

---

## 목차[![](./docs/imgs/pin.svg)](#table-of-contents)
1. [개발 환경](#개발-환경)
2. [실행 방법](#실행-방법)
3. [기능 명세서](#기능-명세서)
4. [개발 멤버](#개발-멤버)

---

## 개발 환경[![](./docs/imgs/pin.svg)](#dev-env)
- [Node.js](https://nodejs.org/)
- [React.js](https://reactjs.org/)

## 실행 방법[![](./docs/imgs/pin.svg)](#install)
```bash

# Clone this repository
git clone `` 

# Go into the repository
cd client-webrtc

# Install dependencies
npm start

# .env create env file
REACT_APP_SERVER_API=https://
REACT_APP_SERVER_SOCKET=https://

# Run the app
$ npm start
```
> 💡 정상적으로 올리는지 확인: `open https://localhost:3005` 명령어를 사용하여 웹브라우저로 접속함 <br>
> 💡 Docker 빌드: `docker build . -t project-client:1.1`

---

## 기능 명세서[![](./docs/imgs/pin.svg)](#feature)
#### 웹RTC 동작 방식 
</br>
<div align="center">
  <img align="center" src="./docs/imgs/web-rtc.png" alt="Join Page" style="width:70%;height:70%;filter: drop-shadow(10px 10px 3px black);"/>
</div>
</br>

#### 입장 페이지
LMS부터 유저가 설정페이지를 먼저 접근하며 이 페이지에서 유저가 원하는 카메라를 설정할 수 있다. "참여 요청"이라는 버튼을 클릭 시 바로 입장한다.
</br>
<div align="center"  style="display: flex; justify-content: space-between;">
  <img align="center" src="./docs/imgs/lms-direct.png" alt="Join Page" style="width:50%;height:90%;filter: drop-shadow(10px 10px 3px black);"/>
  <img align="center" src="./docs/imgs/join-page.png" alt="Join Page" style="width:47%;height:90%;filter: drop-shadow(10px 10px 3px black);"/>
</div>
</br>

#### 프로젝트 목록
유저가 "프로젝트 생성"이라는 버튼을 클릭 시 프로젝트 생성 페이지를 노출되어서 유저가 프로젝트에 대한 기존 정보를 입력하게 된다. 프로젝트 정보를 입력한 다음에 프로젝트를 생성한다.

#### 호스트 출력 화면
호스트 화면에서 가가기, 전체화면 또는 전체 학생 마이크, 내마이크 설정, 화면공유 기능 제공한다.
</br>
<div align="center" style="display: flex; justify-content: space-between;">
  <img align="center" src="./docs/imgs/request.png" alt="Request page" style="width:50%;height:90%;filter: drop-shadow(10px 10px 3px black);"/>
  <img align="center" src="./docs/imgs/host-page.png" alt="Host page" style="width:47%;height:90%;filter: drop-shadow(10px 10px 3px black);"/>
</div>



#### 게스트 출력 화면
게스트 화면에서 가가기, 전체화면 또는 음성질문 요청, 자리비움 요청 기능 제공한다.
</br>
<div align="center">
  <img align="center" src="./docs/imgs/guest-page.png" alt="Guest page" style="width:90%;height:90%;filter: drop-shadow(10px 10px 3px black);"/>
</div>
</br>

#### 재팅 부분
모든 참여자들이 메시시 채팅 및 파일 업데이트 가능한다.
</br>
<div align="center" style="display: flex; justify-content: space-between;">
  <img align="center" src="./docs/imgs/chat-diagram.png" alt="Chat page" style="width:50%;height:90%;filter: drop-shadow(10px 10px 3px black);"/>
  <img align="center" src="./docs/imgs/chat-com.png" alt="Chat page" style="width:47%;height:90%;filter: drop-shadow(10px 10px 3px black);"/>
</div>
</br>

## 개발 멤버[![](./docs/imgs/pin.svg)](#member)
- 동국대학교 PLASS 연구실 연구원

<h1 align="center" style="display: block; font-size: 2.5em; font-weight: bold; margin-block-start: 1em; margin-block-end: 1em;">
END
</h1>