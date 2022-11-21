const createShaderProgram = (shaders) => {
    return twgl.createProgramInfo(gl, shaders, (message) => {
        console.log("Shader compilation error!")
        console.log(message);
    });
}

export {createShaderProgram};