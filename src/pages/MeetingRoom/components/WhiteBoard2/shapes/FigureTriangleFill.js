import React from 'react';
export default class FigureRecLine extends React.Component { 
  prepareData() {
    
    let d = [
    
      `M${this.props.path[0].x }   ${this.props.path[0].y}`,
      // "M5,100 L70,5 L135,100 z" USE for the triangle
      `L${this.props.path[this.props.path.length-1].x  } ${this.props.path[this.props.path.length-1].y}`,
      `L${this.props.path[0].x/2  } ${ this.props.path[0].y }` ,
      `H${this.props.path[0].x} ${ this.props.path[0].x}`,
     
    ];
  

    return d;

  }

  render(){
    let d= this.prepareData();
    return (<path d={d} 
    stroke="black"
    strokeWidth="1"
    fill={this.props.color}/>);  
    
  }


}