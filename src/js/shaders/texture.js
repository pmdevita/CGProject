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
  out vec4 fragTexture;

  void main() {
    fragUV = uv;
    vec4 worldPosition = modelMatrix*vec4(position,1);
    gl_Position = projectionMatrix*cameraMatrix*worldPosition;
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
  
  uniform sampler2D tex;
  
  out vec4 outColor;
  
  void main() {
  
    vec3 color = texture(tex, fragUV).xyz;
    outColor = vec4(color, 1);
  }
`;

export {vertexShader, fragmentShader};
