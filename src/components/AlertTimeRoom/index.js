import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import {render} from 'react-dom';
import './style.scss';
import Icon from '../../constants/icons';
import CountDownTime from '../CountDownTime';

function AlertTime({type, time, handleDownAllTime}) {
  const modal = (
    <WrapperAlert>
      <div className="container-alert-time">
        <i className="clear-icon" onClick={(e) => closeEvent(e)}>
        <Icon.close />
        </i>
        {
          type==='fix-time' ?
          <h3 className="container-alert-time__title">종료 {time}분전 입니다</h3> :
          <div>
            종료 시간
            <CountDownTime handleDownAllTime={handleDownAllTime} />
          </div>
        }
      </div>
    </WrapperAlert>
  );

  const divContainer = document.createElement('div');
  document.body.appendChild(divContainer);

  function closeEvent(e) {
    divContainer.removeEventListener('keydown', closeEvent);
    removeDom();
  }
  function removeDom() {
    document.body.removeChild(divContainer);
  }
  render(modal, divContainer);
}
const WrapperAlert = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
`;
export default AlertTime;
