"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadConfig = loadConfig;

var _jsonschema = require("jsonschema");

var _fs = require("fs");

var defaultConfig = {
  workDir: null
};
var schema = {
  workDir: "string"
};

function validate(config) {
  var validator = new _jsonschema.Validator();
  return validator.validate(config, schema);
}

function configFilename() {}

function loadConfig() {}