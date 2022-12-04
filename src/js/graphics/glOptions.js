import {hex2rgb} from "../utils.js";
import {bgColor} from "../config.js";
export {initGraphics, clearFrame};

function initGraphics(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(...hex2rgb(bgColor), 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

function clearFrame(gl) {
    gl.clearColor(...hex2rgb(bgColor), 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

const backfaceCulling = () => {
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
}

export {backfaceCulling};
