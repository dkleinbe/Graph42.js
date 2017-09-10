/*
var _ = require('lodash');

function Movie(_node) {
  _.extend(this, _node.properties);

  if (this.id) {
    this.id = this.id.toNumber();
  }
  if (this.duration) {
    this.duration = this.duration.toNumber();
  }
}
*/
'use strict';
var _ = require('lodash');
export default class MyMovie {
	constructor(_node) {

		console.log('MyMovie::construtor');
		this.title = 'THE TITLE';
		_.extend(this, _node.properties);
	}
	wxc() {
		console.log('MyMovie::wxc');
	}
}

//module.exports = Movie;