import {createAlphaTexture, createRGBATexture, createRGBATextureBuffer, textureToArray} from "../graphics/textures.js";
import {renderTexture} from "./drawOnTexture.js";
import {createShaderProgram} from "../graphics/shaders.js";
import {vertexShader} from "../shaders/simple.js";
import {fragmentShader} from "../shaders/sumInk.js";

gl.getExtension('EXT_color_buffer_float');

const renderTextureProgram = createShaderProgram([vertexShader, fragmentShader]);

const makeTextureInkSummable = (texture) => {
    texture.inkSum = createRGBATexture(texture.width, texture.height);
    texture.inkSumBuffer = createRGBATextureBuffer(texture.inkSum);
}

const sumInk = (texture, colors, renderToScreen = false) => {
    if (!renderToScreen) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, texture.inkSumBuffer);
    }
    gl.viewport(0, 0, texture.width, texture.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.colorMask(true, true, true, true);

    let uniforms = {
        ink1: colors[0],
        ink2: colors[1],
        ink3: colors[2],
        ink4: colors[3]
    }

    renderTexture(texture, renderTextureProgram, uniforms);

    let array = textureToArray(texture.inkSum, texture.inkSumBuffer);
    // let outputColors = [0.25, 0.50, 0.75, 1].map(d => Math.round(d * 256) - 1);
    // I don't understand how .25, .50, .75, and 1.0 translate to this
    // even if they are getting cast to a byte but whatever it works
    let outputColors = [16, 63, 143, 255];
    let inkCoverage = [0, 0, 0, 0]
    for (let i=3; i<array.length; i+=4) {
        for (let j=0; j<4; j++) {
            if (array[i] === outputColors[j]) {
                inkCoverage[j]++;
            }
        }
    }
    // Turns into percentage against whole texture but this isn't really
    // what you want. We need to figure out the numbers for total coverage
    // for each object before this.
    // inkCoverage = inkCoverage.map(d => d / (array.length / 4));

    gl.disable(gl.BLEND);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    return inkCoverage;
}


export {makeTextureInkSummable, sumInk};

