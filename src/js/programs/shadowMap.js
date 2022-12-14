import {createShaderProgram} from "../graphics/shaders.js";
import {fragmentShader, vertexShader} from "../shaders/shadowMap.js";
import {getFPSCameraMatrix} from "../graphics/transform.js";

function createDepthTexture(width = null, height = null) {
    if (width === null || height === null) {
        width = gl.canvas.width;
        height = gl.canvas.height;
    }

    const depthTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, depthTexture);
    gl.texImage2D(
        gl.TEXTURE_2D,      // target
        0,                  // mip level
        gl.DEPTH_COMPONENT32F, // internal format
        width,    // width
        height,   // height
        0,                  // border
        gl.DEPTH_COMPONENT, // format
        gl.FLOAT,           // type
        null);              // data
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    return depthTexture;
}

function createDepthBuffer(depthTexture) {
    const depthFramebuffer = gl.createFramebuffer();
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,       // target
        gl.DEPTH_ATTACHMENT,  // attachment point
        gl.TEXTURE_2D,        // texture target
        depthTexture,         // texture
        0);                   // mip level
    return depthFramebuffer;
}

const shadowMapProgram = createShaderProgram([vertexShader, fragmentShader]);

const getUniforms = (lightPosition, lightMatrix) => {
    return {
        lightPosition,
        viewMatrix: lightMatrix
    }
}

const createShadowMap = (width = null, height = null) => {
    let w, h;
    if (width === null || height === null) {
        w = gl.canvas.width;
        h = gl.canvas.height;
    } else {
        w = width;
        h = height;
    }

    const depthTexture = createDepthTexture(w, h);
    const depthBuffer = createDepthBuffer(depthTexture);

    function renderShadowMap(lightPosition, lightRotation, projectionMatrix, renderBuffers, overrideProgram = null) {
        let p = overrideProgram ? overrideProgram : shadowMapProgram;

        gl.bindFramebuffer(gl.FRAMEBUFFER, depthBuffer);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(p.program);

        // console.log(lightPosition, lightRotation);
        let lightMatrix = getFPSCameraMatrix(lightPosition, lightRotation);

        let uniforms = getUniforms(lightPosition, lightMatrix);
        renderBuffers(p, uniforms);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        return {depthTexture, lightViewMatrix: m4.multiply(projectionMatrix, lightMatrix)};
    }

    return renderShadowMap;
}

export {createShadowMap};

