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
import {backfaceCulling} from "../graphics/glOptions.js";
import {getTexture} from "../graphics/textures.js";
import {fragmentShader as textureFragShader} from "../shaders/texture.js";


let kyogre;
let program = createShaderProgram([vectorShader, textureFragShader]);

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
    projectionMatrix: getProjectionMatrix(40, 1.5, 100),
    cameraMatrix: getCameraMatrix([30, 20, 30], [0, 0, 0]),
};

const getSceneUniforms = (cameraPosition, cameraRotation, rotation) => {
    const uniforms = {
        modelMatrix: getModelMatrix(kyogre, [0, 0, 0], [0, rotation, 0], 1 / 8),
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


const {getPosition, getRotation} = getFPSController([0, 15, 60]);

let rotation = 20;
let buffer;

const setup = async () => {
    backfaceCulling();
    textures = textureURLs.map(url => {
        return getTexture(url)
    });
    kyogre = await loadModelFromURL("./obj/kyogre/kyogre.obj", "obj");
    buffer = getBufferInfoArray(getVertexAttributes(kyogre), textures);
}

const animate = () => {
    gl.useProgram(program.program);
    let getUniforms = getSceneUniforms(getPosition(), getRotation(), rotation);
    buffer.forEach((b, i) => {
        twgl.setUniforms(program, getUniforms(b.texture));
        twgl.setBuffersAndAttributes(gl, program, b);
        twgl.drawBufferInfo(gl, b, glDrawType);
    })
    rotation++;
    if (rotation > 359) {
        rotation = 0;
    }
};

export {setup, animate};
