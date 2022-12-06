
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
  uniform vec3 offsetCoords;
  uniform float unwrapSlider;
  uniform float uvScale;
  
  out vec3 fragNormal;
  out vec3 fragPosition;
  out vec2 fragUV;
  out vec2 fragUV2;
  out vec4 fragTexture;
  out vec4 cameraSpacePosition;

  void main() {
    fragUV = uv;
    fragUV2 = uv2;
    vec4 worldPosition = modelMatrix*vec4(position, 1);
    float posX = mod((uv2.x * uvScale), uvScale) * unwrapSlider + (1.f - unwrapSlider) * worldPosition.x;
    float posY = offsetCoords.y * unwrapSlider + (1.f - unwrapSlider) * worldPosition.y;
    float posZ = mod((uv2.y * uvScale), uvScale) * unwrapSlider + (1.f - unwrapSlider) * worldPosition.z;
    vec4 unwrapPosition = vec4(posX, posY, posZ, 1);
    cameraSpacePosition = projectionMatrix*cameraMatrix*worldPosition;
    vec4 uvSpacePosition = projectionMatrix*cameraMatrix*unwrapPosition;
    gl_Position = uvSpacePosition;
    fragNormal = normalize(normal);
    fragPosition = worldPosition.xyz;
  }
`;

export {vertexShader};