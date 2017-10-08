'use strict';

var _ = require('lodash');
import * as state from "@steelbreeze/state";

export class GraphEditorSM {
	constructor(owner) {
		this._owner = owner;
		this._model = new state.StateMachine("GraphEditorSM");
	}
	init() {
		//Region Region1;
		//
		// states
		//
		// state
		this._stateIdle = new state.State("Idle", this._model);

		// initial state
		this._stateInitial = new state.PseudoState("Initial", this._model, state.PseudoStateKind.Initial);

		// state
		this._stateDummy = new state.State("Dummy", this._model);
		//
		// transitions
		//
		this._stateIdle.to(this._stateIdle).when((fsm, msg) => msg === "mouseup").effect((fsm, msg) => { this._owner.addNode(); });

		this._stateInitial.to(this._stateIdle);

		this._stateIdle.to(this._stateDummy).when((fsm, msg) => msg === "mouseover_node");
					
		//
		// create the a state machine instance
		//
		this._fsm = new state.JSONInstance("FSM");
		this._model.initialise(this._fsm);
		return this._fsm;
	} 
	/**
	**/
	evaluate(...args) {
		this._model.evaluate(this._fsm, ...args);
	}
}
