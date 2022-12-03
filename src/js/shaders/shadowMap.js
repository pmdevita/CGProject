const vertexShader = `#version 300 es
    precision mediump float;
    uniform mat4 projectionMatrix;
    uniform mat4 viewMatrix;
    uniform mat4 modelMatrix;
    uniform mat4 normalMatrix;

    in vec3 position;
    in vec3 normal;

    out vec4 cameraPosition;

    void main () {
      cameraPosition = projectionMatrix *viewMatrix * modelMatrix * vec4( position, 1.0 );
      gl_Position = cameraPosition;
    }`;

const fragmentShader = `
    #version 300 es
    precision mediump float;
    in vec4 cameraPosition;
    out vec4 outColor;
    void main () {
        // outColor = vec4(vec3(1.f),1);
        // outColor = vec4(cameraPosition.z, cameraPosition.z, cameraPosition.z,1);
        // outColor = vec4(0.f, 0.f, 0.f,1);
        outColor = vec4(1.f, 1.f, 1.f,1);
    }
`;

export {vertexShader, fragmentShader};