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
		// state: <DraggingNode>
		this._stateDraggingNode = new state.State("DraggingNode", this._model);

		// state: <NodeDesignated>
		this._stateNodeDesignated = new state.State("NodeDesignated", this._model);

		// state: <NodeSelected>
		this._stateNodeSelected = new state.State("NodeSelected", this._model);
		this._stateNodeSelected.entry((fsm, msg, ...args) => { this._owner.selectNode(...args); });

		// initial state: <Initial>
		this._stateInitial = new state.PseudoState("Initial", this._model, state.PseudoStateKind.Initial);

		// state: <Idle>
		this._stateIdle = new state.State("Idle", this._model);
		//
		// transitions
		//
		this._stateDraggingNode.to(this._stateNodeDesignated)
			.when((fsm, msg) => { return (((msg === "drag_node_ended")) ); })
			;

		this._stateNodeSelected.to(this._stateIdle)
			.when((fsm, msg) => { return (((msg === "mouseleave_node")) ); })
			;

		this._stateInitial.to(this._stateIdle)
			
			;

		this._stateNodeDesignated.to(this._stateDraggingNode)
			.when((fsm, msg) => { return (((msg === "drag_node_started")) ); })
			;

		this._stateNodeDesignated.to(this._stateNodeSelected)
			.when((fsm, msg) => { return (((msg === "click")) ); })
			;

		this._stateNodeDesignated.to(this._stateIdle)
			.when((fsm, msg) => { return (((msg === "mouseleave_node")) ); })
			.effect((fsm, msg, ...args) => { this._owner.unHighlightNode(...args); });

		this._stateIdle.to(this._stateNodeDesignated)
			.when((fsm, msg) => { return (((msg === "mouseover_node")) ); })
			.effect((fsm, msg, ...args) => { this._owner.highlightNode(...args); });

		this._stateIdle.to(this._stateIdle)
			.when((fsm, msg) => { return (((msg === "mouseup")) && this._owner.isShiftDown()); })
			.effect((fsm, msg, ...args) => { this._owner.addNode(...args); });
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
