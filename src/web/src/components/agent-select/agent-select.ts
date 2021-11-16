import React, { Component } from "react";
import Root, { Result } from "../root/root";
import { ddragon, mapBackground } from "../../constants";

import Timer from "./timer";
import MembersClass from "./members2";
import PlayerSettings from "./player-settings";
import PlayerPicker from "./player-picker";
import AgentPicker from "./agent-picker";
import Bench from "./bench";

import MagicBackground from "../../static/magic-background.png"



export interface AgentSelectMember{
    playerType: string;
    cellId: number;
    agentId: number;
    agentPickIntent: number;
    displayName: string;
    playerId: number;

    isFriendly: boolean;
}

export interface AgentSelectAction{
    id: number;
    actorCellId: number;
    agentId: number;
    completed: number;
    type: "pick";

}
// A 'turn' is simply an array of actions that happen at the same time.
// In blind pick, this is all the players picking. In draft pick, every
// turn only contains a single action (since no players pick at the same time).
type AgentSelectTurn = AgentSelectAction[];

export interface AgentSelectTimer {
    phase: "PICKING" | "GAME_STARTING";
    isInfinite: boolean;
    adjustedTimeLeftPhase: number;
}

export interface AgentSelectState {
    localPlayerCellId: number;
    localPlayer: AgentSelectMember;

    myTeam: AgentSelectMember[];
    theirTeam: AgentSelectMember[];

    benchEnable:true;
    benchAgentId: number;
    timer: AgentSelectTimer;
}
export interface GameflowState {
    map: { id: number};
    gameData: {
        queue: {
            gameMode: string;
            
        }
    }
}
new Component({
    components:{
        timer: Timer,
        members: MembersClass,
        playerSettings: PlayerSettings,
        playerPicker: PlayerPicker,
        agentPicker: AgentPicker,
        bench: Bench 
    }
})

export default class AgentSelect {
    $root!: Root;
    gameflowState: GameflowState | undefined;
    state: AgentSelectState | null = null;

    // São usados para player/agent id -> data.
    agentDetails: { [id: number]: { id: string; key: string; name: string; }; } | undefined;
    playerDetails: { [id: number]: { id: string; key: string; name: string; }; } | undefined;
    
    /// Informação para o agent picker.
    pickingAgent = false;


    mounted(){
        this.loadStatic("agent.json").then(map => {
            //map para { id:data }
            const details: any ={};
            Object.keys(map.data).forEach(x => details[+map.data[x].key] = map.data[x]);
            this.agentDetails = details;
        })
        this.loadStatic("player.json").then(map => {
             const details: any = {};
            Object.keys(map.data).forEach(x => details[+map.data[x].key] = map.data[x]);
            this.playerDetails = details;
        })
        // Start observing agent select
        this.$root.observe("/val-agent-select/v1/session", this.handleAgentSelect.bind(this));

        

      
    }
     /**
     * Handles a change to the champion select and updates the state appropriately.
     * Note: this cannot be an arrow function for various changes. See the lobby component for more info.
     */
    handleAgentSelect = async function(this: AgentSelect, result: Result) {
        if(result.status !== 200) {
            this.state = null;
            return;
        }

        const newState: AgentSelectState = result.content;
        newState.localPlayer = newState.myTeam.filter(x => x.cellId === newState.localPlayerCellId)[0];

        // For everyone on our team, request their summoner name.
        await Promise.all(newState.myTeam.map(async mem => {
         // mem.displayName = ( this.agentDetails[mem.agentId] || { name: "Unknown" }).name;         
          

          const summ = (await this.$root.request("/val/match/v1/players/" + mem.playerId)).content
          mem.displayName = summ.displayName;
          mem.isFriendly = true;
        }));
        // Give enemy summoners obfuscated names, if we don't know their names
        newState.theirTeam.forEach((mem, idx) => {
            mem.displayName = "Jogador" + (idx + 1);
            mem.isFriendly = true;
        });

        // If we weren't in champ select before, fetch some data.
        if(!this.state) {
             // Gameflow, which contains information about the map and gamemode we are queued up for.
             this.$root.request("val/match/v1/matches/matchId}").then(x => {
                 x.status === 200 && (this.gameflowState = x.content as GameflowState)
             });             
        }


       const oldAction = this.state ? this.getActions(this.state.localPlayer) : undefined;
       this.state = newState;

       const newAction = this.getActions(this.state.localPlayer);
       // If we didn't have an action and have one now, or if the actions differ in id, present the champion picker.
       if((!oldAction && newAction) || (newAction && oldAction && oldAction.id !== newAction.id)) {
           this.pickingAgent = true;
       }
    };
  /**
     * @returns the map background for the current queue
     */
   get background(): string {
    if (!this.gameflowState) return "background-image: url(" + MagicBackground + ")";
    return mapBackground(this.gameflowState.map.id) as string;
}
/**
 * @returns the member associated with the specified cellId
 */
getMember(cellId: number): AgentSelectMember {
    if(!this.state) throw new Error("Não deveria acontecer.");
    return this.state.myTeam.filter(x => x.cellId === cellId)[0] || this.state.theirTeam.filter(x => x.cellId === cellId)[0];
}

    public loadStatic(filename: string): Promise<any> {
        return new Promise(resolve => {
            const req = new XMLHttpRequest();
            req.onreadystatechange = () => {
                if(req.status !== 200 || !req.responseText || req.readyState !== 4) return;
                const map = JSON.parse(req.responseText);
                resolve(map);
            };
            req.open("GET", "https://developer.riotgames.com/apis#val-content-v1" + ddragon() + "/data/en_US/" + filename, true);
        req.send();
        })

    }
}