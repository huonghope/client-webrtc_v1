import React from "react"

//!class Name
export default class LineThink extends React.Component {
  prepareData() {
    let d = [
      `M ${this.props.path[0].x} ${this.props.path[0].y}`,
      `L ${this.props.path[this.props.path.length - 1].x} ${
        this.props.path[this.props.path.length - 1].y
      }`
    ]

    return d.join(" ")
  }

  render() {
    let d = this.prepareData()
    return <path d={d} stroke={this.props.color} strokeWidth={1} fill="none" />
  }
}
