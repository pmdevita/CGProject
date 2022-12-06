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

const createRGBATexture = (width, height) => {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
        gl.TEXTURE_2D,      // target
        0,                  // mip level
        gl.RGBA, // internal format
        width,    // width
        height,   // height
        0,                  // border
        gl.RGBA, // format
        gl.UNSIGNED_BYTE,           // type
        null);              // data
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    texture.width = width;
    texture.height = height;
    return texture;
}

const createAlphaTexture = (width, height) => {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
        gl.TEXTURE_2D,      // target
        0,                  // mip level
        gl.ALPHA, // internal format
        width,    // width
        height,   // height
        0,                  // border
        gl.ALPHA, // format
        gl.UNSIGNED_BYTE,           // type
        null);              // data
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    texture.width = width;
    texture.height = height;
    return texture;
}

const createRGBATextureBuffer = (texture) => {
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,       // target
        gl.COLOR_ATTACHMENT0,  // attachment point
        gl.TEXTURE_2D,        // texture target
        texture,         // texture
        0);                   // mip level
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return framebuffer;
}

const textureToArray = (texture, framebuffer = null, format = null) => {
    if (!framebuffer) {
        framebuffer = createRGBATextureBuffer(texture);
    }
    if (!format) {
        format = gl.RGBA;
    }
    // gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    let pixels = new Uint8Array(texture.width * texture.height * 4);
    gl.readPixels(0, 0, texture.width, texture.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    return pixels;
}

export {getTexture, createTextureFromGLTF, getCubeMapTexture, textureToArray, createRGBATexture, createRGBATextureBuffer, createAlphaTexture}
