import React from 'react';
import '../style.scss'
import TextareaAutosize from 'react-autosize-textarea'
export default class Text extends React.Component {
prepareData(){
  let rec={  
    x: this.props.path[0].x ,
    y: this.props.path[0].y,
    width: this.props.path[this.props.path.length - 1].x - this.props.path[0].x,
    height: this.props.path[this.props.path.length - 1].y - this.props.path[0].y
    };
  return rec;
}
  constructor(props){
    super(props);
    // 현재 text 및 focused 상태
    this.state={
        text:'',
        isFocused: true,
    };
    //text 변경 EventHandler 선언
    this.handleChangeText= this.handleChangeText.bind(this);
  }
  // handleChangeText 메소드
  handleChangeText(event){
    this.setState({
      text:event.target.value
    });
  }
  //handleFocus 매소드
 handleFocus=()=> this.setState({isFocused: false})
  render(){
    let rec=this.prepareData();
    return(
        <svg  background="#FFFFFF">
          <foreignObject x={rec.x} y={rec.y} width={rec.width} height="100%" >
            <TextareaAutosize
                    value={this.state.text}
                    onChange={this.handleChangeText} 
                    placeholder="입력하세요..."
                    onFocus={this.handleFocus}    
                    //추가적인 inline-styling 
                    style={{
                    borderStyle: "dotted",
                    borderColor: this.state.isFocused? "white" : "white",
                    background: this.state.isFocused? '#FFFFFF': '#FFFFFF',
                    padding: this.state.isFocused? '13px': '15px',
                    textAlign:'left',
                    fontFamily:'Noto',
                    fontSize:'20px',
                    fontColor: this.state.isFocused? 'black':'black',
                    caretColor:'red',
                    resize:this.state.isFocused ? 'none' : 'none',
                    minWidth: this.state.isFocused? '100%': '100%',
                    minHeight: this.state.isFocused? '50%': '50%',
                    maxWidth: this.state.isFocused ? '100%': '100%',
                    maxHeight: this.state.isFocused ? '100%': '100%',
                }} />    
          </foreignObject>
        </svg>        
     );
  }
}