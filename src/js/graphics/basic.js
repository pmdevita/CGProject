import {hex2rgb} from "../utils.js";
import {bgColor} from "../config.js";

function initGraphics(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(...hex2rgb(bgColor), 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

export {initGraphics};