import {loadModelFromURL} from "../graphics/model-loader.js";
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


let kyogre = await loadModelFromURL("./obj/Port Mackerel/portmackeral.obj", "obj");
let program = createShaderProgram([vectorShader, fragmentShader]);


const baseUniforms = {
    projectionMatrix: getProjectionMatrix(40, 1.5, 100),
    cameraMatrix: getCameraMatrix([30, 20, 30], [0, 0, 0])
};
const getUniforms = (cameraPosition, cameraRotation, rotation) => {
    return {
        modelMatrix: getModelMatrix(kyogre, [0, 0, 0], [0, 0, 0], 2),
        projectionMatrix: baseUniforms.projectionMatrix,
        cameraMatrix: getFPSCameraMatrix(cameraPosition, cameraRotation)
    };
};

const {getPosition, getRotation} = getFPSController([0, 15, 60]);

let buffer = getBufferInfoArray(getVertexAttributes(kyogre));

const animate = () => {
    gl.useProgram(program.program);
    twgl.setUniforms(program, getUniforms(getPosition(), getRotation()));
    buffer.forEach((b) => {
        twgl.setBuffersAndAttributes(gl, program, b);
        twgl.drawBufferInfo(gl, b, glDrawType);
    })
};

const setup = async () => {
    backfaceCulling();
}

export {setup, animate};
