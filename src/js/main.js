import {deg2rad, hex2rgb} from "./utils.js";
import {bgColor} from "./config.js";
import {initGraphics} from "./graphics/basic.js";

const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

initGraphics(gl);

console.log(deg2rad(80));
