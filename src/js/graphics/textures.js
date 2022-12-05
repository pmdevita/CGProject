import {gitLFS, URLToImage} from "../utils.js";

const textureCache = {};

const getTexture = async (url) => {
    if (url in textureCache) {
        return textureCache[url];
    }
    let image = await URLToImage(gitLFS(url));
    let tex = twgl.createTexture(gl, {
        src: image,
        flipY: true,
        min: gl.LINEAR_MIPMAP_NEAREST,
        max: gl.LINEAR
    });
    tex.url = url;
    tex.width = image.width;
    tex.height = image.height;
    textureCache[url] = tex;
    return tex
}

const getCubeMapTexture = async (url) => {
    if (Array.isArray(url)) {
        url = await Promise.all(url.map(d => URLToImage(gitLFS(d), false)));
    }
    return twgl.createTexture(gl, {
        target: gl.TEXTURE_CUBE_MAP,
        src: url,
        min: gl.LINEAR_MIPMAP_NEAREST
    });
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
    tex.width = material.map.source.data.width;
    tex.height = material.map.source.data.height;
    gltfTextureCache[material.uuid] = tex;
    return tex
}

export {getTexture, createTextureFromGLTF, getCubeMapTexture}
