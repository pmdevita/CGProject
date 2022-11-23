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
import {deg2rad, gitLFS} from "../utils.js";
import {backfaceCulling} from "../graphics/glOptions.js";


let kyogre;
let program = createShaderProgram([vectorShader, fragmentShader]);


const baseUniforms = {
    projectionMatrix: getProjectionMatrix(40, 1.5, 100),
    cameraMatrix: getCameraMatrix([30, 20, 30], [0, 0, 0])
};
const getUniforms = (cameraPosition, cameraRotation, rotation) => {
    return {
        modelMatrix: getModelMatrix(kyogre, [0, 0, 0], [0, rotation, 0], 1 / 8),
        projectionMatrix: baseUniforms.projectionMatrix,
        cameraMatrix: getFPSCameraMatrix(cameraPosition, cameraRotation)
    };
};

const {getPosition, getRotation} = getFPSController([0, 15, 60]);

let rotation = 20;
let buffer;

const setup = async () => {
    backfaceCulling();
    kyogre = await loadModelFromURL(gitLFS("./obj/kyogre/kyogre.obj"), "obj");
    buffer = getBufferInfoArray(getVertexAttributes(kyogre));
}

const animate = () => {
    gl.useProgram(program.program);
    twgl.setUniforms(program, getUniforms(getPosition(), getRotation(), rotation));
    buffer.forEach((b) => {
        twgl.setBuffersAndAttributes(gl, program, b);
        twgl.drawBufferInfo(gl, b, glDrawType);
    })
    rotation++;
    if (rotation > 359) {
        rotation = 0;
    }
};

export {setup, animate};
