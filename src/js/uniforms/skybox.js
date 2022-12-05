import {createShaderProgram} from "../graphics/shaders.js";
import {fragmentShader as skyboxFragShader, vertexShader as skyboxVertShader} from "../shaders/skybox.js";
import {getCameraMatrix, rotationToVector} from "../graphics/transform.js";

const skyboxProgram = createShaderProgram([skyboxVertShader, skyboxFragShader]);

const skyboxBuffer = twgl.createBufferInfoFromArrays(gl, {
    position: {
        numComponents: 2,
        data: [-1, -1, 1, -1, 1, 1, 1, 1, -1, 1, -1, -1]
    }
})

// Call this to receive the render() function
const createSkyBox = (cubemap, projectionMatrix) => {
    return (cameraRotation) => {
        let cameraMatrix = getCameraMatrix(rotationToVector(cameraRotation), [0,0,0]);
        let invProjectionMatrix = m4.multiply(m4.inverse(cameraMatrix), m4.inverse(projectionMatrix));
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
    }
}

export {createSkyBox};