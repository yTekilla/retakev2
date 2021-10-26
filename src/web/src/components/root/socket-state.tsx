import React, { Component } from "react";

import ValSocket, { ValSocketState } from "./val-socket";
import CodeEntry, { } from "./code-entry";
import { EventEmitter } from "stream";
import LCUButton from "../common/lcu-button";



let didFirstMount = false;
export class SocketState extends React.Component{

    socket: ValSocket | undefined;
     code = localStorage ? localStorage.getItem("conduitID") || "" : "";
     emitter =  new EventEmitter();
     lcuButton = LCUButton;

    mounted() {
        
         // On our first mount, check if we have a code from the query string. If we do,
        // automatically enter it and try to connect. Only do it on the first mount so if
        // the connection attempt fails, we don't end up automatically connecting again.
            if(!didFirstMount) {
                // eslint-disable-next-line no-restricted-globals
                const match = /\?code(\d+)$/.exec(location.search);
                if(!match) return;

                // Clear the code from the URL in case the user ends up adding it to the homescreen.
                // The code gets saved anyway and this saves us the inconvenience of the user linking it to
                // their homescreen and then getting their code changed.
                window.history.replaceState("", "", window.location.pathname);

                this.code = match[1];
                this.connect();
           
            }
    }

    connect() {
    
        
        if(localStorage) localStorage.setItem("conduitID", this.code);
        this.emitter.emit("connect", this.code)
    }

    get didFailpubKey() {
        return this.socket && this.socket.state === ValSocketState.FAILED_NO_DESKTOP;
    }
    
    get didGetDenied() {
        return this.socket && this.socket.state === ValSocketState.FAILED_DESKTOP_DENY;
    
    }
    get isConnecting() {
        return this.socket && this.socket.state === ValSocketState.CONNECTING;
    }

    get isHandshaking() {
        return this.socket && this.socket.state === ValSocketState.HANDSHAKING;
    }

    render() {
        return (

            <div className="socket-state">
                <template v-if="!socket">
                    <h2>Bem-vindo ao Retake</h2>
                    <p>Entre com o código do computador para começar a controlar o Valorant do seu telefone. 
                        Você pode encontrar o código clicando no ícone do Mimic na barra de tarefas.</p>
                        <CodeEntry string={""} v-model="code"></CodeEntry>
                        <button className="button" disabled={this.code.length !== 6}
                        onClick={() => "connect"}>{LCUButton}Connect</button>
                        

                </template>

            </div>
        )

        
    }

}