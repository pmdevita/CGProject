import {loadModelFromURL} from "../graphics/model-loader.js";
import {createShaderProgram} from "../graphics/shaders.js";
import {fragmentShader, vectorShader} from "../shaders/simple.js";
import {
    getBufferInfoArray,
    getCameraMatrix,
    getModelMatrix,
    getProjectionMatrix,
    getVertexAttributes
} from "../graphics/transform.js";
import {glDrawType} from "../config.js";


let kyogre = await loadModelFromURL("./obj/kyogre/kyogre.obj", "obj");
let program = createShaderProgram([vectorShader, fragmentShader]);


const baseUniforms = {
    projectionMatrix: getProjectionMatrix(40, 2, 100),
    cameraMatrix: getCameraMatrix([30, 20, 30], [0, 0, 0])
};
const getUniforms = (rotation) => {
    return {
        modelMatrix: getModelMatrix(kyogre, [0,0,0], [0,rotation,0], 1/8),
        projectionMatrix: baseUniforms.projectionMatrix,
        cameraMatrix: baseUniforms.cameraMatrix
    };
};

let rotation = 20;

const animate = () => {
    gl.useProgram(program.program);
    twgl.setUniforms(program, getUniforms(rotation));
    let buffer = getBufferInfoArray(getVertexAttributes(kyogre));
    buffer.forEach((b) => {
        twgl.setBuffersAndAttributes(gl, program, b);
        twgl.drawBufferInfo(gl, b, glDrawType);
    })
    rotation++;
    if (rotation > 359) {
        rotation = 0;
    }
};

export {animate};