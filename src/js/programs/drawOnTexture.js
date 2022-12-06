import {createShaderProgram} from "../graphics/shaders.js";
import {vertexShader} from "../shaders/unwrapUVs.js";
import {
    getBufferInfoArray,
    getModelMatrix,
    getOrthoProjectionMatrix,
    getVertexAttributes,
    old_getFPSCameraMatrix
} from "../graphics/transform.js";
import {vertexShader as simpVert} from "../shaders/simple.js"
import {loadModelFromURL} from "../graphics/model-loader.js";
import {glDrawType} from "../config.js";
import {planeFragmentShader} from "../shaders/draw.js";
import {createRGBATexture, createRGBATextureBuffer} from "../graphics/textures.js";

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

function duplicateTexture(texture, bindFramebuffer = false) {
    if (bindFramebuffer) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, texture.buffer);
    }
    gl.bindTexture(gl.TEXTURE_2D, texture.copy);
    gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, texture.width, texture.height, 0);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

const createDrawableShader = (fragmentShader) => {
    return createShaderProgram([vertexShader, fragmentShader]);
}

const createDrawableTexture = (width, height) => {
    const drawableTexture = createRGBATexture(width, height);
    drawableTexture.buffer = createRGBATextureBuffer(drawableTexture);
    drawableTexture.copy = createRGBATexture(width, height);
    return drawableTexture;
}

const renderTexture = (texture, shader = null, uniforms = null) => {
    if (planeBuffers) {
        if (!shader) {
            shader = planeProgram;
        }
        gl.useProgram(shader.program);
        let planeUniforms = {
            modelMatrix: m4.multiply(getModelMatrix(planeModel, [0, 1, 2], [0, 0, 0], 0.5), planeModel[0].modelMatrix),
            cameraMatrix,
            projectionMatrix: projectionMatrix,
            tex: texture,
            ...uniforms
        }
        planeBuffers.forEach((b, i) => {
            twgl.setUniforms(shader, planeUniforms);
            twgl.setBuffersAndAttributes(gl, shader, b);
            twgl.drawBufferInfo(gl, b, glDrawType);
        })
    }
}

let flip = false;

const drawOnTexture = (texture, program, renderBuffers, color, toScreen = false) => {
    if (!toScreen) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, texture.buffer);
        gl.viewport(0, 0, texture.width, texture.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT);
    } else {
        // lower quadrant
        gl.viewport(0, 0, gl.canvas.width/2 - 20, gl.canvas.height/2 - 20);
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.colorMask(true, true, true, true);

    renderTexture(texture.copy, planeProgram, {screenDraw: toScreen ? 1 : 0});

    let uniforms = {
        projectionMatrix,
        cameraMatrix,
        drawColor: color,
        screenDraw: toScreen ? 1 : 0,
        offsetCoords: [0, 0, 0],
        uvScale: 1,
        unwrapSlider: 1
    }


    gl.useProgram(program.program);
    renderBuffers(program, uniforms);

    gl.disable(gl.BLEND);
    if (!toScreen) {
        duplicateTexture(texture, !toScreen);
    }
    if (!toScreen) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}


export {createDrawableTexture, createDrawableShader, drawOnTexture, renderTexture};