import {raycastFragmentFunctions} from "./raycast.js";
import {lightingShaderFunctions} from "./lighting.js";

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
  
  // float mod(float a, float b) {
  //   return a - (b * floor(a/b));
  // }
  
  float uv_scale = 1.f;

  void main() {
    fragUV = uv;
    fragUV2 = uv2;
    vec4 worldPosition = modelMatrix*vec4(position, 1);
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
  in vec2 fragUV2;
  in vec4 cameraSpacePosition;
  
  uniform sampler2D tex;
  uniform int id;
  uniform float K_s;
  uniform float shininess;
  uniform float ambient; 
  uniform vec3 cameraPosition;
  uniform vec4 lightPosition;
  uniform int viewHeight;
  uniform int viewWidth;
  uniform sampler2D inkTexture;
  
  uniform vec3 cameraVector; // Needs to be normalized!

  out vec4 outColor;
  
  ${raycastFragmentFunctions}
  ${lightingShaderFunctions}

  void main() {
    vec3 N = normalize(fragNormal);
    vec3 V  = normalize(cameraPosition - fragPosition);
    vec3 L;
    if (lightPosition.w==0.0){
      L = normalize(lightPosition.xyz);
    }
    else{
      L = normalize(lightPosition.xyz-fragPosition);
    }
    vec3 H = normalize(L + V);
    
    vec3 color = texture(tex, fragUV).xyz;
    
    vec4 inkColor = texture(inkTexture, fragUV2);
    
    // if (in_crosshairs() == 1) {
    if (inkColor.r == 1.f) {
      color = vec3(.4f, .2f, .5f);  // kind of purple
      // color = inkColor.xyz;
    } else {
      color = color;
    }
    // color = vec3(inkColor.w);
    
    color = apply_lighting(L, H, N, V, color);    
    
    outColor = vec4(color, 1);
  }
`;

export {vertexShader, fragmentShader};
