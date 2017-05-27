import React, { Component } from 'react';

export default class Spinner extends Component {
  render() {
    return(
      <div className="circle" style={{width: this.props.size, height: this.props.size, borderColor: this.props.color, borderWidth: this.props.borderWidth}}>
          {this.props.children}
      </div>
    );
  }
}
