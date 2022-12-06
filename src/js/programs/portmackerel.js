import {computeModelExtent, loadModelFromURL} from "../graphics/model-loader.js";
import {createShaderProgram} from "../graphics/shaders.js";
import {fragmentShader as simpleFrag, vertexShader as simpleVert} from "../shaders/simple.js";
import {fragmentShader as textureFragShader, vertexShader as textvert} from "../shaders/texture.js";
import {fragmentShader as drawfrag} from "../shaders/draw.js";
import {createSkyBox as getSkyboxSceneUniforms} from "../uniforms/skybox.js";
import {
    getBufferInfoArray,
    getModelMatrix,
    getProjectionMatrix,
    getVertexAttributes, old_getFPSCameraMatrix, rotationToVector
} from "../graphics/transform.js";
import {glDrawType} from "../config.js";
import {getFPSController} from "./fpsController.js";
import {backfaceCulling} from "../graphics/glOptions.js";
import {getCubeMapTexture, getTexture, textureToArray} from "../graphics/textures.js";
import {createDrawableShader, createDrawableTexture, drawOnTexture} from "./drawOnTexture.js";
import {getSceneUniforms as getBackgroundUniforms} from "../uniforms/backgroundModel.js"
import {fragmentShader as backfrag} from "../shaders/background.js";
import {hex2rgb} from "../utils.js";
import {makeTextureInkSummable, sumInk} from "./sumInk.js";



let model;
let backgroundModel;
let skybox;
let bulb;
let plane;
let planeBuffer;
let program = createShaderProgram([textvert, textureFragShader]);
let drawingProgram = createDrawableShader(drawfrag);
// let drawingProgram = createDrawableShader(textureFragShader);
let backgroundProgram = createShaderProgram([textvert, backfrag]);
// let bulbProgram = createShaderProgram([vertexShader, fragmentShader]);

let inkColors = ["6c57f5", "f1fa06", "79f3e0", "f9af5c"].map(hex2rgb);

// html elements
// let alwaysCompute = document.getElementById("alwaysCompute");
let showInkTextureRender = document.getElementById("showInkTextureRender");
let mapObjects = document.getElementById("mapObjects");
let selectInkColor = document.getElementById("inkColor");
let coverageButton = document.getElementById("coverage");
let coverageInfo = document.getElementById("coverageInfo");

const baseUniforms = {
    projectionMatrix: getProjectionMatrix(50, 1,300),
    // projectionMatrix: getOrthoProjectionMatrix(1, 1, 1,10)
};

const getSceneUniforms = (cameraPosition, cameraRotation, position = [0, 0, 0], scale = null, rotation = [0, 0, 0], currentColor) => {
    let extents = computeModelExtent(model);
    let modelMatrix = getModelMatrix(model, position, rotation, scale ? scale : 1);
    const uniforms = {
        projectionMatrix: baseUniforms.projectionMatrix,
        cameraMatrix: old_getFPSCameraMatrix(cameraPosition, cameraRotation),
        shininess: 0.1,
        ambient: .1,
        K_s: .1,
        cameraVector: v3.normalize(rotationToVector(cameraRotation)),
        cameraPosition: cameraPosition,
        currentColor,
        cubemap: skybox,
        lightPosition: [...lightPosition, 0]
    };
    return (objectMatrix, texture, inkTexture, extraUniforms = null) => {
        let u = {
            ...uniforms,
            modelMatrix: m4.multiply(modelMatrix, objectMatrix),
            inkTexture,
            ...extraUniforms
        };
        if (texture) {
            u["tex"] = texture;
        }
        return u;
    };
}
let renderSkybox;

// const nicediagposition = [23, 32, 32.6];
const {getPosition, getRotation, getMouseClick} = getFPSController([ -4.6454324467653825, 10.4, -33.33269986411267 ],
    [ -25.9, 194.5, 0 ], 0.1, 0.3);

let buffer;
let backgroundBuffer;
let bulbBuffer;

let lightPosition = [8, 20, 10];
let lightRotation = [0, 180, 0];
let x = 150;

let coverage = [0, 0, 0, 0];

// let renderShadowMap = createShadowMap();

// let renderInkTexture = createDrawableTexture(model[0].texture.width, model[0].texture.height);

const doCalculation = () => {
    // Call to update totalCoverage
    let objectCoverage = model.map(o => {
        return sumInk(o.inkTexture, inkColors);
    });
    console.log(objectCoverage);
    let totalCoverage = [];
    for (let i = 0; i < inkColors.length; i++) {
        let sum = objectCoverage.reduce((partialSum, c) => partialSum + c[i], 0);
        // Doesn't work unless we fix percentages
        // totalCoverage.push(sum / objectCoverage.length);
        totalCoverage.push(sum);
    }
    console.log("total coverage", totalCoverage);
    coverageInfo.textContent = `Purple: ${totalCoverage[0]}, Orange:  ${totalCoverage[1]}, Green: ${totalCoverage[2]}, Pink:  ${totalCoverage[3]}`;
}
coverageButton.onclick = doCalculation;


const animateRaycast = () => {
    let colorIndex = parseInt(selectInkColor.value);
    renderSkybox(getRotation());

    let getUniforms = getSceneUniforms(getPosition(), getRotation(), [0, 0, 0], 1, [0,0,0], inkColors[colorIndex]);
    const renderBuffers = (buffers) => (program, extraUniforms) => {
        buffers.forEach((b, i) => {
            let uniforms = getUniforms(model[i].modelMatrix, model[i].texture, model[i].inkTexture.copy, extraUniforms);
            twgl.setUniforms(program, uniforms);
            twgl.setBuffersAndAttributes(gl, program, b);
            twgl.drawBufferInfo(gl, b, glDrawType);
        })
    }

    if (getMouseClick()) {
        // Call only when you want to draw
        buffer.forEach((b, i) => {
            drawOnTexture(model[i].inkTexture, drawingProgram, renderBuffers([b]), inkColors[colorIndex]);
        });
    }

    // Calculate total coverage
    if (false) {
        // Call to update totalCoverage
        let objectCoverage = model.map(o => {
            return sumInk(o.inkTexture, inkColors);
        });
        console.log(objectCoverage);
        let totalCoverage = [];
        for (let i = 0; i < inkColors.length; i++) {
            let sum = objectCoverage.reduce((partialSum, c) => partialSum + c[i], 0);
            // Doesn't work unless we fix percentages
            // totalCoverage.push(sum / objectCoverage.length);
            totalCoverage.push(sum);
        }
        console.log("total coverage", totalCoverage);
    }



    gl.useProgram(program.program);
    // if (x > 0) {
    renderBuffers(buffer)(program);
    // }
    if (showInkTextureRender.checked) {
        let objectIndex = parseInt(mapObjects.value);
        drawOnTexture(model[objectIndex].inkTexture, drawingProgram, renderBuffers([buffer[objectIndex]]), inkColors[colorIndex], true);
    }


    gl.useProgram(backgroundProgram.program)
    getUniforms = getBackgroundUniforms(backgroundModel, baseUniforms.projectionMatrix, getPosition(), getRotation(), lightPosition, skybox);
    backgroundBuffer.forEach((b, i) => {
        let uniforms = getUniforms(backgroundModel[i].modelMatrix, backgroundModel[i].texture);
        twgl.setUniforms(backgroundProgram, uniforms);
        twgl.setBuffersAndAttributes(gl, backgroundProgram, b);
        twgl.drawBufferInfo(gl, b, glDrawType);
    })

    x--;
    if (x < -150) {
        x = 150;
    }
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
    model.forEach(o => {
        // o.texture.width, o.texture.height
        o.inkTexture = createDrawableTexture(gl.MAX_TEXTURE_SIZE, gl.MAX_TEXTURE_SIZE);
        // o.inkTexture = createDrawableTexture(500, 500);
        makeTextureInkSummable(o.inkTexture);
    })
    bulb = await loadModelFromURL("./gltf/Lamp.glb");
    backgroundModel = await loadModelFromURL("./gltf/portmackerel-background.glb");
    // skybox = await getCubeMapTexture("./png/skybox.png");
    // skybox = await getCubeMapTexture(["./png/posx.jpg", "./png/negx.jpg", "./png/posy.jpg", "./png/negy.jpg", "./png/posz.jpg", "./png/negz.jpg"])
    skybox = await getCubeMapTexture(["./png/pure_sky_skymap/px.png", "./png/pure_sky_skymap/nx.png",
        "./png/pure_sky_skymap/py.png", "./png/pure_sky_skymap/ny.png",
        "./png/pure_sky_skymap/pz.png", "./png/pure_sky_skymap/nz.png"])
    renderSkybox = getSkyboxSceneUniforms(skybox, baseUniforms.projectionMatrix)
    buffer = getBufferInfoArray(getVertexAttributes(model));
    bulbBuffer = getBufferInfoArray(getVertexAttributes(bulb));
    backgroundBuffer = getBufferInfoArray(getVertexAttributes(backgroundModel));
}

const animate = animateRaycast;

export {setup, animate};
