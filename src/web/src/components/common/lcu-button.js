/* eslint-disable no-unused-vars */

import { type } from 'os';
import { ButtonType } from './export';
import React, 
{ 
  Component,
  Button,
  Prop
 } from 'react';
import Styles from 'styles.css';





export default class LCUButton extends React {
 

  
    render() {
        return (
            <button
        className="className + ' ' + type"
        click="!disabled || $emit('click')"
        disabled="disabled"
      >
       
        <div className="button-border"></div>
        <slot></slot>
      </button>
    
        );
        
    }
  }

