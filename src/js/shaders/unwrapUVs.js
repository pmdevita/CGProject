
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
  out vec2 fragUV2;
  out vec4 fragTexture;
  out vec4 cameraSpacePosition;
  
  float uv_scale = 1.f;

  void main() {
    fragUV = uv;
    fragUV2 = uv2;
    vec4 unwrapPosition = vec4(mod((uv2.x * uv_scale), uv_scale), 0, mod((uv2.y * uv_scale), uv_scale), 1);
    vec4 worldPosition = modelMatrix*vec4(position, 1);
    cameraSpacePosition = projectionMatrix*cameraMatrix*worldPosition;
    vec4 uvSpacePosition = projectionMatrix*cameraMatrix*unwrapPosition;
    gl_Position = uvSpacePosition;
    fragNormal = normalize(normal);
    fragPosition = worldPosition.xyz;
  }
`;

export {vertexShader};