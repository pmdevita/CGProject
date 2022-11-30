import {computeModelExtent, loadModelFromURL} from "../graphics/model-loader.js";
import {createShaderProgram} from "../graphics/shaders.js";
import {fragmentShader, vectorShader} from "../shaders/simple.js";
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
let program = createShaderProgram([vectorShader, fragmentShader]);


const baseUniforms = {
    projectionMatrix: getProjectionMatrix(40, 1.5, 100),
    cameraMatrix: getCameraMatrix([30, 20, 30], [0, 0, 0])
};



const getUniforms = (cameraPosition, cameraRotation, objectModelMatrix) => {
    let extents = computeModelExtent(model);
    return {
        modelMatrix: m4.multiply(getModelMatrix(model, [0, 0, 0], [0, 0, 0], 70 / extents.dia), objectModelMatrix),
        projectionMatrix: baseUniforms.projectionMatrix,
        cameraMatrix: getFPSCameraMatrix(cameraPosition, cameraRotation)
    };
};

const {getPosition, getRotation} = getFPSController([0, 10, 0], [-90, 90, 0], 0.2);

let buffer;

const animate = () => {
    gl.useProgram(program.program);
    let pos = getPosition()
    let rot = getRotation();
    buffer.forEach((b, i) => {
        twgl.setUniforms(program, getUniforms(pos, rot, model[i].modelMatrix));
        twgl.setBuffersAndAttributes(gl, program, b);
        twgl.drawBufferInfo(gl, b, glDrawType);
    })
};

const setup = async () => {
    model = await loadModelFromURL("./gltf/portmackerel.gltf");
    buffer = getBufferInfoArray(getVertexAttributes(model));
    backfaceCulling();
}

export {setup, animate};
