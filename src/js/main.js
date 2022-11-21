import "./globals.js";
import {deg2rad} from "./utils.js";
import {initGraphics} from "./graphics/basic.js";
import {computeModelExtent, loadModelFromURL} from "./graphics/model-loader.js";
import {createShaderProgram} from "./graphics/shaders.js";
import {fragmentShader, vectorShader} from "./shaders/simple.js";
import {
    getBufferInfoArray,
    getCameraMatrix,
    getModelMatrix,
    getProjectionMatrix,
    getVertexAttributes
} from "./graphics/transform.js";
import {glDrawType} from "./config.js";

initGraphics(gl);

let kyogre = await loadModelFromURL("./obj/kyogre/kyogre.obj", "obj");
let program = createShaderProgram([vectorShader, fragmentShader]);

console.log(computeModelExtent(kyogre));
let uniforms = {
    modelMatrix: getModelMatrix(kyogre, [0,0,0], [20,20,0], 1/15),
    projectionMatrix: getProjectionMatrix(50, 1, 100),
    cameraMatrix: getCameraMatrix([20, 0, 20], [0, 0, 0])
}

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.enable(gl.DEPTH_TEST);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.useProgram(program.program);
twgl.setUniforms(program, uniforms);
let buffer = getBufferInfoArray(getVertexAttributes(kyogre));
console.log(buffer);
buffer.forEach((b) => {
    twgl.setBuffersAndAttributes(gl, program, b);
    twgl.drawBufferInfo(gl, b, glDrawType);
})

// console.log(deg2rad(80));
// console.log(gl.getSupportedExtensions());
