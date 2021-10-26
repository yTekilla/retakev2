/* eslint-disable no-native-reassign */

import React, {  KeyboardEvent,createRef } from "react";

import { Div } from './styles';

type value = {
    string: "",
};
export class CodeEntry extends React.Component<value>{
    btnRef: any;
    value: any;
    emiter: any;
    nextRef: any;
    focusText: any;
    

    constructor(props: value | Readonly<value>) {
        super(props);
        this.btnRef = createRef<HTMLInputElement>();
        this.value = String;
        
       

}

 getFocus() {
    document.getElementById("focus")?.focus();
}
    mounted() {
        const keys = Object.keys(this.btnRef);
        this.value.split("").array.forEach((digit: any, idx: any) => {
            (keys[idx] as any).value = digit;
            
        });
        for ( const key of keys) {
                  (key as any).addEventListener("focus", () => {
                      document.body.classList.add("in-input");
                  })
                  (key as any).addEventListener("blur", () => {
                      document.body.classList.remove("in-input");
                  })
        }
    }
  nextCharacter(ev: KeyboardEvent){

    const tgt: HTMLInputElement =  ev.target as HTMLInputElement;
    const next = tgt.getAttribute("data-next");
    
   
     // Vai para o próximo
    if(tgt.value.length > 0 && next) {
     (next as any)// Possível correção
    
     
    }
    //const total = Object.keys(this).map(x => ( x as any).value).join("");
    //this.emiter.emit("input",total);

  }


  maybePreviousCharacter(ev: KeyboardEvent) {
      const tgt: HTMLInputElement = ev.target as HTMLInputElement;

      // Se for backspace e estiver vazio, volta pro anterior
      if(ev.which === 8) {
          const prev = tgt.getAttribute("data-prev");
          if(!prev) return;


          (prev as any).value = "";
          (prev as any) // Possível correção

          return;
      }
      // Se já existir valor, não aceita outro
      if(tgt.value.length && ev.which !== 8) {
          ev.preventDefault();
      }
      


  }
    render(){
        return(
            
            <Div>
        <input id ="focus"type="number" ref="d0" data-next="d1" onKeyUp={this.nextCharacter} onKeyDown={this.maybePreviousCharacter} placeholder="0"></input>
        <input id ="focus" type="number" ref="d1" data-next="d2" data-prev="d0" onKeyUp={this.nextCharacter} onKeyDown={this.maybePreviousCharacter} placeholder="0"></input>
        <input id ="focus" type="number" ref="d2" data-next="d3" data-prev="d1" onKeyUp={this.nextCharacter} onKeyDown={this.maybePreviousCharacter} placeholder="0"></input>
        <input id ="focus" type="number" ref="d3" data-next="d4" data-prev="d2" onKeyUp={this.nextCharacter} onKeyDown={this.maybePreviousCharacter} placeholder="0"></input>
        <input id ="focus" type="number" ref="d4" data-next="d5" data-prev="d3" onKeyUp={this.nextCharacter} onKeyDown={this.maybePreviousCharacter} placeholder="0"></input>
        <input id ="focus" type="number" ref="d5" data-prev="d4" onKeyUp={this.nextCharacter} onKeyDown={this.maybePreviousCharacter} placeholder="0"></input>
            </Div>
            
        )
    }
    
    
    
    
}
export default CodeEntry;