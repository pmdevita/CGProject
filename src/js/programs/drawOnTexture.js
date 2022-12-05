import {createShaderProgram} from "../graphics/shaders.js";
import {vertexShader} from "../shaders/unwrapUVs.js";
import {
    getBufferInfoArray, getModelMatrix,
    getOrthoProjectionMatrix, getVertexAttributes,
    old_getFPSCameraMatrix
} from "../graphics/transform.js";
import {vertexShader as simpVert, fragmentShader as simpFrag} from "../shaders/simple.js"
import {loadModelFromURL} from "../graphics/model-loader.js";
import {glDrawType} from "../config.js";
import {planeFragmentShader} from "../shaders/draw.js";

const projectionMatrix = getOrthoProjectionMatrix(1, 1, 1,10);
// const projectionMatrix = getOrthoProjectionMatrix(10, 10, 1,500);

// const cameraMatrix = old_getFPSCameraMatrix([-2, -1, -2], [Math.PI/2, 0, 0]); // walss


const cameraMatrix = old_getFPSCameraMatrix([0, -1, 0], [Math.PI/2, 0, 0]); // walss
// const cameraMatrix = old_getFPSCameraMatrix([0, -1, 1], [Math.PI/2, Math.PI/2, 0]);
// const cameraMatrix = old_getFPSCameraMatrix([1, -1, 1], [Math.PI/2, Math.PI, 0]);
// const cameraMatrix = old_getFPSCameraMatrix([1, -1, 0], [Math.PI/2, -Math.PI/2, 0]);

//Math.PI/2
// const cameraMatrix = old_getFPSCameraMatrix([0, 1, 1], [-Math.PI/2, 0, 0]);
// const cameraMatrix = old_getFPSCameraMatrix([1, 1, 1], [-Math.PI/2, Math.PI/2, 0]);
// const cameraMatrix = old_getFPSCameraMatrix([1, 1, 0], [-Math.PI/2, Math.PI, 0]);
// const cameraMatrix = old_getFPSCameraMatrix([0, 1, 0], [-Math.PI/2, -Math.PI/2, 0]);

let planeModel;
let planeBuffers

loadModelFromURL("./gltf/plane.glb").then(m => {
    planeModel = m;
    planeBuffers = getBufferInfoArray(getVertexAttributes(planeModel));
});

const planeProgram = createShaderProgram([simpVert, planeFragmentShader]);

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

function duplicateTexture(texture, bindFramebuffer = false) {
    if (bindFramebuffer) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, texture.buffer);
    }
    gl.bindTexture(gl.TEXTURE_2D, texture.copy);
    gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, texture.width, texture.height, 0);
    gl.bindTexture(gl.TEXTURE_2D, null);
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
    drawableTexture.copy = createDrawingTexture(width, height);
    return drawableTexture;
}

const renderPlane = (texture) => {
    if (planeBuffers) {
        gl.useProgram(planeProgram.program);
        let planeUniforms = {
            modelMatrix: m4.multiply(getModelMatrix(planeModel, [0, 1, 2], [0, 0, 0], 0.5), planeModel[0].modelMatrix),
            cameraMatrix,
            projectionMatrix: projectionMatrix,
            tex: texture.copy
            // tex: planeModel[0].texture
        }
        planeBuffers.forEach((b, i) => {
            twgl.setUniforms(planeProgram, planeUniforms);
            twgl.setBuffersAndAttributes(gl, planeProgram, b);
            twgl.drawBufferInfo(gl, b, glDrawType);
        })
    }
}

let flip = false;

const drawOnTexture = (texture, program, renderBuffers, toScreen = false) => {
    if (!toScreen) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, texture.buffer);
    }
    gl.viewport(0, 0, texture.width, texture.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.colorMask(true, true, true, true);

    renderPlane(texture);

    let uniforms = {
        projectionMatrix,
        cameraMatrix
    }


    gl.useProgram(program.program);
    renderBuffers(program, uniforms);

    // gl.clearColor(0, .5, 0, 0);
    // gl.clear(gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT);
    duplicateTexture(texture, !toScreen);
    if (!toScreen) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}


export {createDrawableTexture, createDrawableShader, drawOnTexture};