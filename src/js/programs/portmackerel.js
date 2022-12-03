import {computeModelExtent, loadModelFromURL} from "../graphics/model-loader.js";
import {createShaderProgram} from "../graphics/shaders.js";
import {fragmentShader as simpleFrag, vertexShader as simpleVert} from "../shaders/simple.js";
import {fragmentShader as textureFragShader} from "../shaders/texture.js";
import {fragmentShader as texcubeFragShader} from "../shaders/textureCubemap.js";
import {vertexShader as rcvert, fragmentShader as rcfrag} from "../shaders/raycast.js"
import {getSceneUniforms as getSkyboxSceneUniforms} from "../uniforms/skybox.js";
import {
    getBufferInfoArray,
    getCameraMatrix, getFPSCameraMatrix,
    getModelMatrix,
    getProjectionMatrix,
    getVertexAttributes, rotationToVector
} from "../graphics/transform.js";
import {glDrawType} from "../config.js";
import {getFPSController} from "./fpsController.js";
import {deg2rad, hex2rgb} from "../utils.js";
import {backfaceCulling} from "../graphics/glOptions.js";
import {getCubeMapTexture, getTexture} from "../graphics/textures.js";
import {createShadowMap} from "./shadowMap.js";



let model;
let skybox;
let bulb;
let program = createShaderProgram([simpleVert, textureFragShader]);
// let bulbProgram = createShaderProgram([vertexShader, fragmentShader]);


const baseUniforms = {
    projectionMatrix: getProjectionMatrix(50, 1, 100)
};

const getSceneUniforms = (cameraPosition, cameraRotation, position = [0, 0, 0], scale = null, rotation = [0, 0, 0]) => {
    let extents = computeModelExtent(model);
    let modelMatrix = getModelMatrix(model, position, rotation, scale ? scale : 70 / extents.dia);
    const uniforms = {
        projectionMatrix: baseUniforms.projectionMatrix,
        cameraMatrix: getFPSCameraMatrix(cameraPosition, cameraRotation),
        shininess: 0.1,
        ambient: .1,
        K_s: .1,
        cameraVector: v3.normalize(rotationToVector(cameraRotation)),
        cameraPosition: cameraPosition,
        cubemap: skybox,
        lightPosition: [...lightPosition, 0]
    };
    return (objectMatrix, texture, extraUniforms = null) => {
        let u = {
            ...uniforms,
            modelMatrix: m4.multiply(modelMatrix, objectMatrix),
            ...extraUniforms
        };
        if (texture) {
            u["tex"] = texture;
        }
        return u;
    };
}
let renderSkybox;

const {getPosition, getRotation} = getFPSController([23, 32, 32.6], [-45, 45, 0], 0.2);

let buffer;
let bulbBuffer;

let lightPosition = [8, 20, 10];
let lightRotation = [0, 180, 0];
let x = -70;
let renderShadowMap = createShadowMap();

const animateRaycast = () => {
    let getUniforms = getSceneUniforms(getPosition(), getRotation());
    const renderBuffers = (program, extraUniforms) => {
        buffer.forEach((b, i) => {
            let uniforms = getUniforms(model[i].modelMatrix, model[i].texture, extraUniforms);
            twgl.setUniforms(program, uniforms);
            twgl.setBuffersAndAttributes(gl, program, b);
            twgl.drawBufferInfo(gl, b, glDrawType);
        })
    }

    gl.useProgram(program.program);
    renderBuffers(program);
};


const animateShadowMap = () => {
    lightPosition[2] = x;
    let lp = [...lightPosition, 1];
    let getUniforms = getSceneUniforms(getPosition(), getRotation());
    const renderBuffers = (program, extraUniforms) => {
        buffer.forEach((b, i) => {
            let uniforms = getUniforms(model[i].modelMatrix, model[i].texture, extraUniforms);
            twgl.setUniforms(program, uniforms);
            twgl.setBuffersAndAttributes(gl, program, b);
            twgl.drawBufferInfo(gl, b, glDrawType);
        })
    }
    let {depthTexture, lightViewMatrix} = renderShadowMap(lp, lightRotation, baseUniforms.projectionMatrix, renderBuffers);

    gl.useProgram(program.program);
    renderBuffers(program, {shadowMap: depthTexture, lightViewMatrix, lightPosition: lp});



    gl.useProgram(bulbProgram.program);
    getUniforms = getSceneUniforms(getPosition(), getRotation(), lp.slice(0, 3), .3, lightRotation);
    bulbBuffer.forEach((b, i) => {
        let uniforms = getUniforms(bulb[i].modelMatrix, bulb[i].texture, {shadowMap: depthTexture, lightViewMatrix, lightPosition: lp});
        twgl.setUniforms(bulbProgram, uniforms);
        twgl.setBuffersAndAttributes(gl, bulbProgram, b);
        twgl.drawBufferInfo(gl, b, glDrawType);
    })

    x += 0.05;
    if (x > 70) {
        x = -70;
    }

    // renderSkybox(gl, getRotation(), getFPSCameraMatrix(getPosition(), getRotation()));


};

const setup = async () => {
    model = await loadModelFromURL("./gltf/portmackerel.glb");
    bulb = await loadModelFromURL("./gltf/Lamp.glb");
    // skybox = getCubeMapTexture("./png/skybox.png");
    skybox = await getCubeMapTexture(["./png/posx.jpg", "./png/negx.jpg", "./png/posy.jpg", "./png/negy.jpg", "./png/posz.jpg", "./png/negz.jpg"])
    renderSkybox = getSkyboxSceneUniforms(skybox, baseUniforms.projectionMatrix)
    console.log(model);
    console.log(model[0].texture)
    buffer = getBufferInfoArray(getVertexAttributes(model));
    bulbBuffer = getBufferInfoArray(getVertexAttributes(bulb));
    backfaceCulling();
}

const animate = animateRaycast;

export {setup, animate};
