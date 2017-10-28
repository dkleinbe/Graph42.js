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
		// state: <DraggingNode>
		this._stateDraggingNode = new state.State("DraggingNode", this._model);
		this._stateDraggingNode.entry((fsm, msg, ...args) => { this._owner.dragged(...args); });

		// state: <DraggingLink>
		this._stateDraggingLink = new state.State("DraggingLink", this._model);

		// state: <TargetNodeSelected>
		this._stateTargetNodeSelected = new state.State("TargetNodeSelected", this._model);
		this._stateTargetNodeSelected.entry((fsm, msg, ...args) => { this._owner.highlightNode(...args); });
		this._stateTargetNodeSelected.exit((fsm, msg, ...args) => { this._owner.unHighlightNode(...args); });

		// state: <HoveringLink>
		this._stateHoveringLink = new state.State("HoveringLink", this._model);

		// initial state: <Initial>
		this._stateInitial = new state.PseudoState("Initial", this._model, state.PseudoStateKind.Initial);

		// state: <Idle>
		this._stateIdle = new state.State("Idle", this._model);

		// state: <HoveringNode>
		this._stateHoveringNode = new state.State("HoveringNode", this._model);
		//
		// transitions
		//
		this._stateTargetNodeSelected.to(this._stateDraggingLink)
			.when((fsm, msg, ...args) => { return (((msg === "mouseleave_node")) ); })
			;

		this._stateIdle.to(this._stateIdle)
			.when((fsm, msg, ...args) => { return (((msg === "mouseup")) && (this._owner.isShiftDown() == false)); })
			.effect((fsm, msg, ...args) => { this._owner.unselectAll(...args); });

		this._stateHoveringNode.to(this._stateHoveringNode)
			.when((fsm, msg, ...args) => { return (((msg === "click")) ); })
			.effect((fsm, msg, ...args) => { this._owner.selectNode(...args); });

		this._stateDraggingNode.to(this._stateDraggingNode)
			.when((fsm, msg, ...args) => { return (((msg === "node_dragged")) ); })
			;

		this._stateHoveringNode.to(this._stateIdle)
			.when((fsm, msg, ...args) => { return (((msg === "mouseleave_node")) ); })
			.effect((fsm, msg, ...args) => { this._owner.unHighlightNode(...args); });

		this._stateTargetNodeSelected.to(this._stateHoveringNode)
			.when((fsm, msg, ...args) => { return (((msg === "drag_node_ended")) ); })
			.effect((fsm, msg, ...args) => { this._owner.addRelation(...args); });

		this._stateDraggingNode.to(this._stateHoveringNode)
			.when((fsm, msg, ...args) => { return (((msg === "drag_node_ended")) && (this._owner.isShiftDown())); })
			.effect((fsm, msg, ...args) => { this._owner.dragged(...args); });

		this._stateDraggingLink.to(this._stateTargetNodeSelected)
			.when((fsm, msg, ...args) => { return (((msg === "mouseover_node")) ); })
			;

		this._stateInitial.to(this._stateIdle)
			
			;

		this._stateIdle.to(this._stateIdle)
			.when((fsm, msg, ...args) => { return (((msg === "mouseup")) && (this._owner.isShiftDown())); })
			.effect((fsm, msg, ...args) => { this._owner.addNode(...args); });

		this._stateHoveringLink.to(this._stateIdle)
			.when((fsm, msg, ...args) => { return (((msg === "mouseleave_link")) ); })
			.effect((fsm, msg, ...args) => { this._owner.unHighlightNode(...args); });

		this._stateHoveringNode.to(this._stateDraggingLink)
			.when((fsm, msg, ...args) => { return (((msg === "node_dragged")) && (this._owner.isSelectedNode(...args) === true)); })
			;

		this._stateHoveringNode.to(this._stateDraggingNode)
			.when((fsm, msg, ...args) => { return (((msg === "node_dragged")) && (this._owner.isSelectedNode(...args) === false)); })
			;

		this._stateDraggingNode.to(this._stateHoveringNode)
			.when((fsm, msg, ...args) => { return (((msg === "drag_node_ended")) && (this._owner.isShiftDown() == false)); })
			.effect((fsm, msg, ...args) => { this._owner.unPinNode(...args); });

		this._stateIdle.to(this._stateHoveringLink)
			.when((fsm, msg, ...args) => { return (((msg === "mouseover_link")) ); })
			.effect((fsm, msg, ...args) => { this._owner.highlightNode(...args); });

		this._stateIdle.to(this._stateHoveringNode)
			.when((fsm, msg, ...args) => { return (((msg === "mouseover_node")) ); })
			.effect((fsm, msg, ...args) => { this._owner.highlightNode(...args); });

		this._stateDraggingLink.to(this._stateIdle)
			.when((fsm, msg, ...args) => { return (((msg === "drag_node_ended")) ); })
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
