import {computeModelExtent, loadModelFromURL} from "../graphics/model-loader.js";
import {createShaderProgram} from "../graphics/shaders.js";
import {fragmentShader, vectorShader} from "../shaders/simple.js";
import {fragmentShader as textureFragShader} from "../shaders/texture.js";
import {
    getBufferInfoArray,
    getCameraMatrix, getFPSCameraMatrix,
    getModelMatrix,
    getProjectionMatrix,
    getVertexAttributes
} from "../graphics/transform.js";
import {glDrawType} from "../config.js";
import {getFPSController} from "./fpsController.js";
import {deg2rad} from "../utils.js";
import {backfaceCulling} from "../graphics/glOptions.js";


let model;
let program = createShaderProgram([vectorShader, textureFragShader]);


const baseUniforms = {
    projectionMatrix: getProjectionMatrix(50, 1, 100),
    cameraMatrix: getCameraMatrix([30, 20, 30], [0, 0, 0])
};

const getSceneUniforms = (cameraPosition, cameraRotation) => {
    let extents = computeModelExtent(model);
    let modelMatrix = getModelMatrix(model, [0, 0, 0], [0, 0, 0], 70 / extents.dia);
    const uniforms = {
        projectionMatrix: baseUniforms.projectionMatrix,
        cameraMatrix: getFPSCameraMatrix(cameraPosition, cameraRotation)
    };
    return (objectMatrix, texture) => {
        return {
            ...uniforms,
            modelMatrix: m4.multiply(modelMatrix, objectMatrix),
            tex: texture
        };
    };
}

const {getPosition, getRotation} = getFPSController([0, 10, 0], [-90, 90, 0], 0.2);

let buffer;

const animate = () => {
    gl.useProgram(program.program);
    let getUniforms = getSceneUniforms(getPosition(), getRotation())
    buffer.forEach((b, i) => {
        twgl.setUniforms(program, getUniforms(model[i].modelMatrix, model[i].texture));
        twgl.setBuffersAndAttributes(gl, program, b);
        twgl.drawBufferInfo(gl, b, glDrawType);
    })
};

const setup = async () => {
    model = await loadModelFromURL("./gltf/portmackerel.glb");
    console.log(model);
    buffer = getBufferInfoArray(getVertexAttributes(model));
    backfaceCulling();
}

export {setup, animate};
