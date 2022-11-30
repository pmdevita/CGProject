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

const GLTFMinFilter = {
    9728: gl.NEAREST,
    9729: gl.LINEAR,
    9984: gl.NEAREST_MIPMAP_NEAREST,
    9985: gl.LINEAR_MIPMAP_NEAREST,
    9986: gl.NEAREST_MIPMAP_LINEAR,
    9987: gl.LINEAR_MIPMAP_LINEAR
}

const GLTFMagFilter = {
    9728: gl.NEAREST,
    9729: gl.LINEAR
}

const gltfTextureCache = {};

const createTextureFromGLTF = (material) => {
    if (material.uuid in gltfTextureCache) {
        return gltfTextureCache[material.uuid];
    }
    let tex = twgl.createTexture(gl, {
        src: material.map.source.data,
        flipY: material.map.flipY,
        min: GLTFMinFilter[material.map.minFilter],
        max: GLTFMagFilter[material.map.magFilter]
    });
    gltfTextureCache[material.uuid] = tex;
    return tex
}

export {getTexture, createTextureFromGLTF}
