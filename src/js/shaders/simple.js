const vectorShader = `
  #version 300 es
  precision mediump float;

  in vec3 position;
  in vec3 normal;
  in vec2 uv;

  uniform mat4 modelMatrix;
  uniform mat4 projectionMatrix;
  uniform mat4 cameraMatrix;

  out vec3 fragNormal;
  out vec3 fragPosition;
  out vec2 fragUV;

  void main() {
    fragUV = uv;
    vec4 newPosition = modelMatrix*vec4(position,1);
    gl_Position = cameraMatrix*newPosition*projectionMatrix;
    fragNormal = normalize(normal);
    fragPosition = newPosition.xyz;
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
    outColor = vec4(color, 1);
  }

`;

export {vectorShader, fragmentShader};