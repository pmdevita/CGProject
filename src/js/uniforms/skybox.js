import {createShaderProgram} from "../graphics/shaders.js";
import {fragmentShader as skyboxFragShader, vertexShader as skyboxVertShader} from "../shaders/skybox.js";
import {deg2rad} from "../utils.js";
import {getCameraMatrix, getFPSCameraMatrix, rotationToVector} from "../graphics/transform.js";

const skyboxProgram = createShaderProgram([skyboxVertShader, skyboxFragShader]);

const skyboxBuffer = twgl.createBufferInfoFromArrays(gl, {
    position: {
        numComponents: 2,
        data: [-1, -1, 1, -1, 1, 1, 1, 1, -1, 1, -1, -1]
    }
})

// Call this to receive the render() function
const getSceneUniforms = (cubemap, projectionMatrix) => {

    return (gl, cameraRotation) => {
        let cameraMatrix = getCameraMatrix(v3.subtract([0,0,0], rotationToVector(cameraRotation)), [0,0,0]);
        let invProjectionMatrix = m4.multiply(m4.inverse(projectionMatrix), m4.inverse(cameraMatrix));
        let uniforms = {
            cubemap,
            invProjectionMatrix,
            cameraPosition: rotationToVector(cameraRotation),
        };
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.DEPTH_TEST);
        gl.useProgram(skyboxProgram.program);
        twgl.setUniforms(skyboxProgram, uniforms);
        twgl.setBuffersAndAttributes(gl, skyboxProgram, skyboxBuffer);
        twgl.drawBufferInfo(gl, skyboxBuffer);
        // gl.enable(gl.BLEND);
        // gl.blendFunc(gl.SRC_COLOR, gl.ONE_MINUS_SRC_COLOR);
    }
}

export {getSceneUniforms};