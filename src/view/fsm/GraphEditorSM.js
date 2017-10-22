'use strict';

var _ = require('lodash');
import * as state from "@steelbreeze/state";
/**
	FSM ****
**/
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
		// state: <ConnectNode>
		this._stateConnectNode = new state.State("ConnectNode", this._model);
		this._stateConnectNode.entry((fsm, msg, ...args) => { this._owner.highlightNode(...args); });
		this._stateConnectNode.exit((fsm, msg, ...args) => { this._owner.unHighlightNode(...args); });

		// initial state: <Initial>
		this._stateInitial = new state.PseudoState("Initial", this._model, state.PseudoStateKind.Initial);

		// state: <DraggingNode>
		this._stateDraggingNode = new state.State("DraggingNode", this._model);
		this._stateDraggingNode.entry((fsm, msg, ...args) => { this._owner.dragged(...args); });

		// state: <NodeDesignated>
		this._stateNodeDesignated = new state.State("NodeDesignated", this._model);

		// state: <DraggingLink>
		this._stateDraggingLink = new state.State("DraggingLink", this._model);

		// state: <Idle>
		this._stateIdle = new state.State("Idle", this._model);

		// state: <NodeSelected>
		this._stateNodeSelected = new state.State("NodeSelected", this._model);
		this._stateNodeSelected.entry((fsm, msg, ...args) => { this._owner.selectNode(...args); });
		//
		// transitions
		//
		this._stateDraggingLink.to(this._stateIdle)
			.when((fsm, msg) => { return (((msg === "drag_node_ended")) ); })
			;

		this._stateNodeDesignated.to(this._stateIdle)
			.when((fsm, msg) => { return (((msg === "mouseleave_node")) ); })
			.effect((fsm, msg, ...args) => { this._owner.unHighlightNode(...args); });

		this._stateDraggingNode.to(this._stateDraggingNode)
			.when((fsm, msg) => { return (((msg === "dragged")) ); })
			;

		this._stateNodeSelected.to(this._stateDraggingLink)
			.when((fsm, msg) => { return (((msg === "drag_node_started")) ); })
			;

		this._stateDraggingLink.to(this._stateConnectNode)
			.when((fsm, msg) => { return (((msg === "mouseover_node")) ); })
			;

		this._stateIdle.to(this._stateIdle)
			.when((fsm, msg) => { return (((msg === "mouseup")) && (this._owner.isShiftDown() == false)); })
			.effect((fsm, msg, ...args) => { this._owner.unselectAll(...args); });

		this._stateConnectNode.to(this._stateIdle)
			.when((fsm, msg) => { return (((msg === "drag_node_ended")) ); })
			.effect((fsm, msg, ...args) => { this._owner.addRelation(...args); });

		this._stateNodeSelected.to(this._stateIdle)
			.when((fsm, msg) => { return (((msg === "mouseleave_node")) ); })
			;

		this._stateIdle.to(this._stateIdle)
			.when((fsm, msg) => { return (((msg === "mouseup")) && (this._owner.isShiftDown())); })
			.effect((fsm, msg, ...args) => { this._owner.addNode(...args); });

		this._stateNodeDesignated.to(this._stateNodeSelected)
			.when((fsm, msg) => { return (((msg === "click")) ); })
			;

		this._stateNodeDesignated.to(this._stateDraggingNode)
			.when((fsm, msg) => { return (((msg === "drag_node_started")) ); })
			.effect((fsm, msg, ...args) => { this._owner.dragstarted(...args); });

		this._stateIdle.to(this._stateNodeDesignated)
			.when((fsm, msg) => { return (((msg === "mouseover_node")) ); })
			.effect((fsm, msg, ...args) => { this._owner.highlightNode(...args); });

		this._stateNodeSelected.to(this._stateNodeSelected)
			.when((fsm, msg) => { return (((msg === "dblclick")) ); })
			.effect((fsm, msg, ...args) => { this._owner.unPinNode(...args); });

		this._stateInitial.to(this._stateIdle)
			
			;

		this._stateDraggingNode.to(this._stateNodeDesignated)
			.when((fsm, msg) => { return (((msg === "drag_node_ended")) ); })
			.effect((fsm, msg, ...args) => { this._owner.dragended(...args); });

		this._stateConnectNode.to(this._stateDraggingLink)
			.when((fsm, msg) => { return (((msg === "mouseleave_node")) ); })
			;
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
