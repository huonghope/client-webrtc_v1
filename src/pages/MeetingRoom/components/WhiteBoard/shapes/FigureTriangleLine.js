import React from 'react';
export default class FigureTriangleLine extends React.Component { 
  prepareData() {
    
    let d = [

       
      // `M${this.props.path[0].x  }  ${this.props.path[0].y}`,

      // // "M5,100 L70,5 L135,100 z" USE for the triangle
      // `L${this.props.path[this.props.path.length-1].x } ${this.props.path[this.props.path.length -1].x}`,

      // `H${this.props.path[this.props.path.length-1].x } ${this.props.path[0].y}`,

      


      
     


      // // Right Angle 

      
      // `M${this.props.path[0].x}   ${this.props.path[0].y}`,
      // // "M5,100 L70,5 L135,100 z" USE for the triangle
      
      // `L${this.props.path[this.props.path.length-1].x } ${this.props.path[this.props.path.length-1].y}`,
      
      // `H${this.props.path[0].y } ${ this.props.path[this.props.path.length-1].x/2 - this.props.path[this.props.path.length-1].y/4}` ,

      
     

// //new one
      // `M${this.props.path[0].x}   ${this.props.path[0].y}`,
      // // "M5,100 L70,5 L135,100 z" USE for the triangle
      // `L${this.props.path[this.props.path.length-1].x/2 } ${this.props.path[this.props.path.length-1].y/2 }`,
      // `L${this.props.path[0].x/2 } ${ this.props.path[0].y}` ,
      // `H${this.props.path[0].x} ${ this.props.path[0].x/2}` ,
      // `H${this.props.path[0].x} ${ this.props.path[0].x/2}` ,

      //still working on
      //     `M${this.props.path[0].x}   ${this.props.path[0].x}`,
      // // "M5,100 L70,5 L135,100 z" USE for the triangle
      // `L${this.props.path[0].x } ${ this.props.path[0].y}` ,
      // `H${this.props.path[0].x} ${ this.props.path[0].y}` ,
      
      

      //삼각형 3번쨰 코드
      

      //   `M${this.props.path[0].x}   ${this.props.path[0].y}`,
      // // "M5,100 L70,5 L135,100 z" USE for the triangle
      // `L${this.props.path[this.props.path.length-1].x/2 } ${this.props.path[this.props.path.length-1].y }`,
      // `H${this.props.path[this.props.path.length-1].x/4 } ${ this.props.path[0].x/2}` ,

     

      //BEST!!!
      // `M${this.props.path[0].x }   ${this.props.path[0].y}`,
      // // "M5,100 L70,5 L135,100 z" USE for the triangle
      // `L${this.props.path[this.props.path.length-1].x  } ${this.props.path[this.props.path.length-1].y}`,
      // `L${this.props.path[0].x/2  } ${ this.props.path[0].y }` ,
      // `H${this.props.path[0].x} ${ this.props.path[0].x/2}`,




    //doing now
      `M ${(this.props.path[0].x) }   ${(this.props.path[0].y)}`,
      // `H ${(this.props.path[0].x) } ${this.props.path[0].x}`,
      // "M5,100 L70,5 L135,100 z" USE for the triangle
      `L ${(this.props.path[this.props.path.length-1].x) } ${(this.props.path[this.props.path.length-1].y)}`,
      `L ${(this.props.path[this.props.path.length-1].x)  } ${(this.props.path[this.props.path.length-1].y)}`,
      `L ${(this.props.path[0].x/2)  } ${(this.props.path[this.props.path.length-1].y)}`,
      
      
      


     

      // `M${this.props.path[0].x }   ${this.props.path[0].y}`,
      // // "M5,100 L70,5 L135,100 z" USE for the triangle
      // `L${this.props.path[this.props.path.length-1].x  } ${this.props.path[this.props.path.length-1].y}`,
      // `L${this.props.path[0].x/2  } ${ this.props.path[this.props.path.length-1].y }` ,
      // `H${this.props.path[0].x} ${ this.props.path[this.props.path.length-1].x}`,
      // `L${this.props.path[0].x/2  } ${ this.props.path[this.props.path.length-1].y }` ,
     
      
      
    
  



      
       //Equilateral triangle 가장 맞는 코드
      // `M${this.props.path[0].x}  ${this.props.path[0].y}`,

      // // "M5,100 L70,5 L135,100 z" USE for the triangle
      // `L${this.props.path[this.props.path.length-1].x }  ${this.props.path[this.props.path.length-1].y}`,

      // `H${this.props.path[0].x*2} ${ this.props.path[0].y/2}`,     

     
    ];

    //doing now
 let e=[
  `M ${(this.props.path[0].x) } ${(this.props.path[0].y)}`,
  // `H ${(this.props.path[0].x) } ${this.props.path[0].x}`,
  // "M5,100 L70,5 L135,100 z" USE for the triangle
  `L ${(this.props.path[0].x/2) } ${(this.props.path[this.props.path.length-1].y)}`,
  `L ${(this.props.path[this.props.path.length-1].x) } ${(this.props.path[this.props.path.length-1].y)}`,
  `L ${(this.props.path[0].x/2) } ${(this.props.path[this.props.path.length-1].y)}`,

  //`L ${(this.props.path[0].y*2) } ${this.props.path[0].X*2}`,
  ]
    return e.concat(d).join(" ")    
  
  }

  render(){
    let d= this.prepareData();
    return (<path d={d} 
    x={this.props.path[0].x}
    y={this.props.path[0].y}
    stroke="black"
    strokeWidth="1"
    fill="none" />);  
    
  }


}