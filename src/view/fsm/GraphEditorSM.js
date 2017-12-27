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
		// state: <CreateLink>
		this._stateCreateLink = new state.State("CreateLink", this._model);
		this._stateCreateLink.entry((fsm, msg, ...args) => { this._owner.dragLine(...args); });

		// state: <TargetNodeSelected>
		this._stateTargetNodeSelected = new state.State("TargetNodeSelected", this._model);
		this._stateTargetNodeSelected.entry((fsm, msg, ...args) => { this._owner.highlightNode(...args); });
		this._stateTargetNodeSelected.exit((fsm, msg, ...args) => { this._owner.unHighlightNode(...args); });

		// state: <Idle>
		this._stateIdle = new state.State("Idle", this._model);

		// state: <HoveringNode>
		this._stateHoveringNode = new state.State("HoveringNode", this._model);

		// state: <HoveringLink>
		this._stateHoveringLink = new state.State("HoveringLink", this._model);

		// state: <DraggingNode>
		this._stateDraggingNode = new state.State("DraggingNode", this._model);
		this._stateDraggingNode.entry((fsm, msg, ...args) => { this._owner.dragged(...args); });

		// choice state: <IsNodeSelected>
		this._stateIsNodeSelected = new state.PseudoState("IsNodeSelected", this._model, state.PseudoStateKind.Choice);			

		// initial state: <Initial>
		this._stateInitial = new state.PseudoState("Initial", this._model, state.PseudoStateKind.Initial);
		//
		// transitions
		//
		this._stateIdle.to(this._stateHoveringNode)
			.when((fsm, msg, ...args) => { return (((msg === "mouseover_node"))); })
			.effect((fsm, msg, ...args) => { this._owner.highlightNode(...args); });

		this._stateIdle.to(this._stateIdle)
			.when((fsm, msg, ...args) => { return (((msg === "BACKSPACE_KEY"))); })
			.effect((fsm, msg, ...args) => { this._owner.deleteSelection(...args); });

		this._stateDraggingNode.to(this._stateHoveringNode)
			.when((fsm, msg, ...args) => { return (((msg === "drag_node_ended")) && (this._owner.isShiftDown() == true)); })
			.effect((fsm, msg, ...args) => { this._owner.unPinNode(...args); });

		this._stateIdle.to(this._stateIdle)
			.when((fsm, msg, ...args) => { return (((msg === "click")) && (this._owner.isShiftDown() == false)); })
			.effect((fsm, msg, ...args) => { this._owner.unselectAll(...args); });

		this._stateHoveringNode.to(this._stateHoveringNode)
			.when((fsm, msg, ...args) => { return (((msg === "click"))); })
			.effect((fsm, msg, ...args) => { this._owner.selectNode(...args); });

		this._stateDraggingNode.to(this._stateDraggingNode)
			.when((fsm, msg, ...args) => { return (((msg === "node_dragged"))); })
			;

		this._stateHoveringLink.to(this._stateHoveringLink)
			.when((fsm, msg, ...args) => { return (((msg === "click"))); })
			.effect((fsm, msg, ...args) => { this._owner.selectLink(...args); });

		this._stateCreateLink.to(this._stateTargetNodeSelected)
			.when((fsm, msg, ...args) => { return (((msg === "mouseover_node"))); })
			;

		this._stateIdle.to(this._stateIdle)
			.when((fsm, msg, ...args) => { return (((msg === "mouseup")) && (this._owner.isShiftDown())); })
			.effect((fsm, msg, ...args) => { this._owner.addNode(...args); });

		this._stateInitial.to(this._stateIdle)
			
			;

		this._stateDraggingNode.to(this._stateHoveringNode)
			.when((fsm, msg, ...args) => { return (((msg === "drag_node_ended")) && (this._owner.isShiftDown() == false)); })
			.effect((fsm, msg, ...args) => { this._owner.dragended(...args); });

		this._stateIdle.to(this._stateHoveringLink)
			.when((fsm, msg, ...args) => { return (((msg === "mouseover_link"))); })
			.effect((fsm, msg, ...args) => { this._owner.highlightNode(...args); });

		this._stateHoveringLink.to(this._stateIdle)
			.when((fsm, msg, ...args) => { return (((msg === "mouseleave_link"))); })
			.effect((fsm, msg, ...args) => { this._owner.unHighlightNode(...args); });

		this._stateCreateLink.to(this._stateIdle)
			.when((fsm, msg, ...args) => { return (((msg === "drag_node_ended"))); })
			.effect((fsm, msg, ...args) => { this._owner.dragLineVisibility(false); });

		this._stateHoveringNode.to(this._stateIsNodeSelected)
			.when((fsm, msg, ...args) => { return (((msg === "node_dragged"))); })
			;

		this._stateCreateLink.to(this._stateCreateLink)
			.when((fsm, msg, ...args) => { return (((msg === "node_dragged"))); })
			;

		this._stateIsNodeSelected.to(this._stateCreateLink)
			.when((fsm, msg, ...args) => { return ((this._owner.isSelectedNode(...args) === true)); })
			.effect((fsm, msg, ...args) => { this._owner.dragLineVisibility(true); });

		this._stateTargetNodeSelected.to(this._stateCreateLink)
			.when((fsm, msg, ...args) => { return (((msg === "mouseleave_node"))); })
			;

		this._stateHoveringNode.to(this._stateIdle)
			.when((fsm, msg, ...args) => { return (((msg === "mouseleave_node"))); })
			.effect((fsm, msg, ...args) => { this._owner.unHighlightNode(...args); });

		this._stateIsNodeSelected.to(this._stateDraggingNode)
			.when((fsm, msg, ...args) => { return ((this._owner.isSelectedNode(...args) === false)); })
			.effect((fsm, msg, ...args) => { this._owner.dragstarted(...args); });

		this._stateTargetNodeSelected.to(this._stateHoveringNode)
			.when((fsm, msg, ...args) => { return (((msg === "drag_node_ended"))); })
			.effect((fsm, msg, ...args) => { this._owner.addRelation(...args); });
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
