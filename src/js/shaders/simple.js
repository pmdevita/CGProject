const vertexShader = `
  #version 300 es
  precision mediump float;

  in vec3 position;
  in vec3 normal;
  in vec2 uv;
  in vec2 uv2;

  uniform mat4 modelMatrix;
  uniform mat4 projectionMatrix;
  uniform mat4 cameraMatrix;
  
  out vec3 fragNormal;
  out vec3 fragPosition;
  out vec2 fragUV;
  out vec4 cameraSpacePosition;

  void main() {
    fragUV = uv;
    vec4 worldPosition = modelMatrix*vec4(position,1);
    cameraSpacePosition = projectionMatrix*cameraMatrix*worldPosition;
    gl_Position = cameraSpacePosition;
    fragNormal = normalize(normal);
    fragPosition = worldPosition.xyz;
  }
`;

const fragmentShader = `
  #version 300 es
  precision mediump float;

  in vec3 fragNormal;
  in vec3 fragPosition;
  in vec2 fragUV;
  
  out vec4 outColor;

  void main() {
    vec3 N = normalize(fragNormal);
    vec3 color = abs(N);
    // color = vec3(0.5, 0.3, 0.2);
    outColor = vec4(color, 1);
  }
`;

export {vertexShader, fragmentShader};
