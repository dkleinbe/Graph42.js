/** @module WheelMenu */
"use strict";

require('../../node_modules/wheelnav/js/dist/wheelnav.min.js');

export class CreatingNodeWheelMenu {
	/**
	 *Creates an instance of CreatingNodeWheelMenu.
	 * @param {*} divWheel
	 * @param {*} fsm
	 * @param {*} point
	 * @param {*} transform
	 * @memberof CreatingNodeWheelMenu
	 */
	constructor(divWheel, fsm, point, transform) {
		this._fsm = fsm
		this._divWheel = divWheel

		this._divWheel.style.visibility = "visible"
		this._divWheel.style.left = (point[0]) + "px";
		this._divWheel.style.top = (point[1]) + "px";
		this._divWheel.style.transform = "translate(" + transform.x + "px," + transform.y + "px) scale(" + transform.k + ")";
		// set CSS transformation origine
		let ori = "-" + point[0] + "px " + "-" + point[1] + "px";
		this._divWheel.style.transformOrigin = ori;
		// create wheel menu
		this._wheel = new wheelnav("divWheel");
		this._wheel.createWheel(["Exit", "Movie", "Person"]);
		// add menu items trigger
		this._wheel.navItems.forEach((i, index) => {
			if (index === 0) {
				this._wheel.navItems[0].navTitle.mouseup(() => { this._fsm.evaluate("exit_menu"); });
				return
			}

			i.navTitle.mouseup(() => { this._fsm.evaluate("item_selected", i.title) })

			console.log("Item: ", i.title, index) 			
		});
	}

	hideMenu() {
		this._wheel.removeWheel()
		this._divWheel.style.visibility = "hidden"
	}
}
