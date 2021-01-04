import React from 'react';
import '../style.scss'
export default class Text extends React.Component {
  prepareData() {
    let rec = {
      x: this.props.path[0].x,
      y: this.props.path[0].y,

      width: this.props.path[this.props.path.length - 1].x - this.props.path[0].x,
      height: this.props.path[this.props.path.length - 1].y - this.props.path[0].y
    };
    return rec;

  }
  //Text Code
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      isFocused: true,
      isOpened: true,
      size: {}
    };
    this.handleChangeText = this.handleChangeText.bind(this);
  }

  handleChangeText(newText) {
    this.setState({
      text: newText
    });
  }
  //onFocusd일 때 style{}
  handleFocus = () => this.setState({ isFocused: false })

  render() {
    let rec = this.prepareData();
    return (
      <svg >
        <foreignObject x={rec.x} y={rec.y} width={rec.width} height={rec.height} color="#000000">
          <textarea
            onChange={this.handleChangeText}
            placeholder="입력하세요..."
            onFocus={this.handleFocus}
            onKeyDown={this.onKeyDown}


            //추가적인 CSS styling 
            style={{
              border: this.state.isFocused ? '#f5f5f5' : '#f5f5f5',
              background: this.state.isFocused ? "none" : ' #f5f5f5',
              padding: this.state.isFocused ? '13px' : '15px',
              textAlign: 'left',
              fontFamily: 'Arial',
              fontSize: '20px',
              color: '#000000',
              // fontColor: '#000000',
              // overflow: this.state.isFocused ? 'none': 'visible',
              resize: this.state.isFocused ? 'both' : 'none',
              minWidth: this.state.isFocused ? '100%' : '100%',
              minHeight: this.state.isFocused ? '100%' : '100%',
              maxWidth: this.state.isFocused ? '100%' : '100%',
              maxHeight: this.state.isFocused ? '100%' : '100%',
            }} />
        </foreignObject>
      </svg>
    );
  }
}