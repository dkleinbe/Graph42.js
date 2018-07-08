/** @module WheelMenu */
"use strict";

require('../../node_modules/wheelnav/js/dist/wheelnav.min.js');

export class CreatingNodeWheelMenu {
	/**
	 *Creates an instance of CreatingNodeWheelMenu.
	 * @param {*} divWheel
	 * @param {*} menuItems
	 * @param {*} fsm
	 * @param {*} point
	 * @param {*} transform
	 * @memberof CreatingNodeWheelMenu
	 */
	constructor(divWheel, menuItems, fsm, point, transform) {
		this._fsm = fsm
		this._divWheel = divWheel

		let size = 200;
		let wheelPoint = []
		wheelPoint[0] = point[0] - size / 2
		wheelPoint[1] = point[1] - size / 2

		this._divWheel.style.opacity = 1
		this._divWheel.style.visibility = "visible"
		this._divWheel.style.height = size + "px"
		this._divWheel.style.width = size + "px"
		this._divWheel.style.left = (wheelPoint[0]) + "px";
		this._divWheel.style.top = (wheelPoint[1]) + "px";
		this._divWheel.style.transform = "translate(" + transform.x + "px," + transform.y + "px) scale(" + transform.k + ")";
		// set CSS transformation origine
		let ori = "-" + wheelPoint[0] + "px " + "-" + wheelPoint[1] + "px";
		this._divWheel.style.transformOrigin = ori;
		// add listener to displqy transition
		this.hideMenuEndTransition = this.hideMenuEndTransition.bind(this)
		this._divWheel.addEventListener("transitionend", this.hideMenuEndTransition, false)
		// create wheel menu
		this._wheel = new wheelnav("divWheel");
		this._wheel.wheelradius = size
		// create wheel whith list of items
		this._wheel.createWheel(["Exit"].concat(menuItems))
		// add menu items trigger
		this._wheel.navItems.forEach((i, index) => {
			if (index === 0) {
				this._wheel.navItems[0].navTitle.mouseup(() => { this._fsm.evaluate("exit_menu"); });
				this._wheel.navItems[0].navSlice.mouseup(() => { this._fsm.evaluate("exit_menu"); });
				return
			}

			i.navTitle.mouseup(() => { this._fsm.evaluate("item_selected", i.title) })
			i.navSlice.mouseup(() => { this._fsm.evaluate("item_selected", i.title) })
			console.log("Item: ", i.title, index) 			
		});
	}
	/**
	 * Hide wheel menu (visibility = hidden)
	 *
	 * @memberof CreatingNodeWheelMenu
	 */
	hideMenu() {
		
		this._divWheel.style.opacity = 0
		
		// this._wheel.removeWheel()
	}
	/**
	 * Removes wheel at end of transition
	 *
	 * @param {*} ev
	 * @memberof CreatingNodeWheelMenu
	 */
	hideMenuEndTransition(ev) { 
 
		if (ev.propertyName === 'opacity' && this._divWheel.style.opacity === "0") {
			console.log("end transition")
			// remove wheel and hide div
			this._wheel.removeWheel()
			this._divWheel.style.visibility = "hidden"
			// remove event handler
			this._divWheel.removeEventListener("transitionend", this.hideMenuEndTransition, false)
		}

	} 
}

