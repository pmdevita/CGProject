import {deg2rad} from "./utils.js";
import {initGraphics} from "./graphics/basic.js";

// Setup commonly used vars and utilities as globals
window.m4 = twgl.m4;
window.v3 = twgl.v3;
window.canvas = document.getElementById("canvas");
window.gl = canvas.getContext("webgl2");

initGraphics(gl);

console.log(deg2rad(80));
console.log(gl.getSupportedExtensions());
