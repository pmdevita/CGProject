import {createShaderProgram} from "../graphics/shaders.js";
import {vertexShader} from "../shaders/unwrapUVs.js";
import {
    getOrthoProjectionMatrix,
    old_getFPSCameraMatrix
} from "../graphics/transform.js";

const projectionMatrix = getOrthoProjectionMatrix(1, 1, 1,10);
// const projectionMatrix = getOrthoProjectionMatrix(5, 5, 1,10);

// //Math.PI/2
const cameraMatrix = old_getFPSCameraMatrix([0, -1, 0], [Math.PI/2, 0, 0]); // walss
// const cameraMatrix = old_getFPSCameraMatrix([0, -1, 1], [Math.PI/2, Math.PI/2, 0]);
// const cameraMatrix = old_getFPSCameraMatrix([1, -1, 1], [Math.PI/2, Math.PI, 0]);
// const cameraMatrix = old_getFPSCameraMatrix([1, -1, 0], [Math.PI/2, -Math.PI/2, 0]);

//Math.PI/2
// const cameraMatrix = old_getFPSCameraMatrix([0, 1, 1], [-Math.PI/2, 0, 0]);
// const cameraMatrix = old_getFPSCameraMatrix([1, 1, 1], [-Math.PI/2, Math.PI/2, 0]);
// const cameraMatrix = old_getFPSCameraMatrix([1, 1, 0], [-Math.PI/2, Math.PI, 0]);
// const cameraMatrix = old_getFPSCameraMatrix([0, 1, 0], [-Math.PI/2, -Math.PI/2, 0]);


function createDrawingTexture(width, height) {

    const drawingTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, drawingTexture);
    gl.texImage2D(
        gl.TEXTURE_2D,      // target
        0,                  // mip level
        gl.RGBA, // internal format
        width,    // width
        height,   // height
        0,                  // border
        gl.RGBA, // format
        gl.UNSIGNED_BYTE,           // type
        null);              // data
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    drawingTexture.width = width;
    drawingTexture.height = height;
    return drawingTexture;
}

function createDrawingBuffer(depthTexture) {
    const depthFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,       // target
        gl.COLOR_ATTACHMENT0,  // attachment point
        gl.TEXTURE_2D,        // texture target
        depthTexture,         // texture
        0);                   // mip level
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return depthFramebuffer;
}

const createDrawableShader = (fragmentShader) => {
    return createShaderProgram([vertexShader, fragmentShader]);
}

const createDrawableTexture = (width, height) => {
    const drawableTexture = createDrawingTexture(width, height);
    const drawableBuffer = createDrawingBuffer(drawableTexture);
    drawableTexture.buffer = drawableBuffer;
    return drawableTexture;
}


const drawOnTexture = (texture, program, renderBuffers, toScreen = false) => {
    if (!toScreen) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, texture.buffer);
    }
    gl.viewport(0, 0, texture.width, texture.height);
    gl.clearColor(1, .5, .9, 1);
    gl.clear(gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT);
    let uniforms = {
        projectionMatrix,
        cameraMatrix
    }

    gl.useProgram(program.program);
    renderBuffers(program, uniforms);

    // gl.clearColor(0, .5, 0, 0);
    // gl.clear(gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT);
    if (!toScreen) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}


export {createDrawableTexture, createDrawableShader, drawOnTexture};