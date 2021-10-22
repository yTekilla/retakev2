import React, { Component } from "react"

export default class MyReactCompoennt extends Component {
  // eslint-disable-next-line no-useless-constructor
  constructor(props) {
    super(props)
    this.btnref = React.createRef()
  }
  

  focus(){
    
  }
  render() {

   
    return (
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
      <a className="highlightable">
        <slot></slot>
      </a>
    )
  }
}
