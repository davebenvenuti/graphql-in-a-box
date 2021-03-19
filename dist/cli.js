"use strict";

var _commander = require("commander");

var _package = _interopRequireDefault(require("../package.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var version = _package["default"].version;
var program = new _commander.Command();
program.usage('').parse();
var options = program.opts(); // None of these yet

var remainingArgs = program.args;