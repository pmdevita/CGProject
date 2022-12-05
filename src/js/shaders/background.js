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
  in vec4 cameraSpacePosition;
  
  uniform sampler2D tex;
  uniform int id;
  uniform float K_s;
  uniform float shininess;
  uniform float ambient; 
  uniform vec3 cameraPosition;
  uniform vec4 lightPosition;
  
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
    
    color = apply_lighting(L, H, N, V, color);
    
    outColor = vec4(color, 1);
  }
`;

export {vertexShader, fragmentShader};
