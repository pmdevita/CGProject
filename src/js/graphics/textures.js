import {gitLFS} from "../utils.js";

const textureCache = {};

const getTexture = (url) => {
    if (url in textureCache) {
        return textureCache[url];
    }
    let tex = twgl.createTexture(gl, {
        src: gitLFS(url),
        flipY: true,
        min: gl.LINEAR_MIPMAP_NEAREST,
        max: gl.LINEAR
    });
    tex.url = url;
    textureCache[url] = tex;
    return tex

}

export {getTexture}
