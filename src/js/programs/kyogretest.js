import {getQuadBufferInfo, loadModelFromURL} from "../graphics/model-loader.js";
import {createShaderProgram} from "../graphics/shaders.js";
import {fragmentShader as simpleFrag, vertexShader as simpleVert} from "../shaders/simple.js";
import {
    getBufferInfoArray,
    getCameraMatrix, getFPSCameraMatrix,
    getModelMatrix,
    getProjectionMatrix,
    getVertexAttributes
} from "../graphics/transform.js";
import {glDrawType} from "../config.js";
import {getFPSController} from "./fpsController.js";
import {backfaceCulling} from "../graphics/glOptions.js";
import {getTexture} from "../graphics/textures.js";
import {fragmentShader as textureFragShader, vertexShader} from "../shaders/texture.js";


let kyogre;
let program = createShaderProgram([simpleVert, simpleFrag]);
let quadProgram = createShaderProgram([simpleVert, simpleFrag]);

let textureURLs = [
    "./obj/kyogre/pm0382_00_00_BodyA_col.png",
    "./obj/kyogre/pm0382_00_00_BodyA_col.png",
    "./obj/kyogre/pm0382_00_00_BodyC_col.png",
    "./obj/kyogre/pm0382_00_00_BodyB_col.png",
    "./obj/kyogre/pm0382_00_00_Eye_col.png",
    "./obj/kyogre/pm0382_00_00_BodyC_col.png",
    "./obj/kyogre/pm0382_00_00_BodyC_col.png"
];
let textures;

const baseUniforms = {
    projectionMatrix: getProjectionMatrix(50, 1, 400),
    cameraMatrix: getFPSCameraMatrix([60, 40, 30], [0, 0, 0]),
};

const getSceneUniforms = (cameraPosition, cameraRotation, rotation, position, scale) => {
    const uniforms = {
        modelMatrix: getModelMatrix(kyogre, position, [0, rotation, 0], scale),
        projectionMatrix: baseUniforms.projectionMatrix,
        cameraMatrix: getFPSCameraMatrix(cameraPosition, cameraRotation)
    };
    return (texture) => {
        return {
            ...uniforms,
            tex: texture
        };
    };
}


const {getPosition, getRotation} = getFPSController([0, 0, 80], [0, 0, 0], 0.2);

let rotation = 20;
let buffer;
let quadBuffer = getQuadBufferInfo();
console.log(quadBuffer)

const setup = async () => {
    backfaceCulling();
    textures = await Promise.all(textureURLs.map(getTexture));
    console.log(textureURLs, textures);
    kyogre = await loadModelFromURL("./obj/kyogre/kyogre.obj", "obj");
    buffer = getBufferInfoArray(getVertexAttributes(kyogre), textures);
}

const animate = () => {
    gl.useProgram(program.program);
    let getUniforms = getSceneUniforms(getPosition(), getRotation(), rotation, [0, 0, 0], 1/8);
    buffer.forEach((b, i) => {
        twgl.setUniforms(program, getUniforms(b.texture));
        twgl.setBuffersAndAttributes(gl, program, b);
        twgl.drawBufferInfo(gl, b, glDrawType);
    })
    getUniforms = getSceneUniforms(getPosition(), getRotation(), 0, [0, -5, 0], 2);

    gl.useProgram(quadProgram.program);
    twgl.setUniforms(quadProgram, getUniforms(null));
    twgl.setBuffersAndAttributes(gl, quadProgram, quadBuffer);
    twgl.drawBufferInfo(gl, quadBuffer, glDrawType);

    // rotation++;
    if (rotation > 359) {
        rotation = 0;
    }
};

export {setup, animate};
