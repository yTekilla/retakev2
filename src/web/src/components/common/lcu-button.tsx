/* eslint-disable no-unused-vars */



import React from 'react';
import { EventEmitter } from "stream";



export type ButtonType ="normal" | "confirm" | "deny";

export default class LCUButton {
 
 
default: false | undefined;
disabled: boolean | undefined;
type : ButtonType | undefined;
emitter = new EventEmitter();

    render() {
        return (
            <button
        className="className + ' ' + type"
        onClick={() => !this.disabled || this.emitter.emit('click')}
        disabled={true}
      >
       
        <div className="button-border"></div>
        <slot></slot>
      </button>
    
        );
        
    }
    
  }

