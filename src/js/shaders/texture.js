import {raycastFragmentFunctions} from "./raycast.js";

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
    vec3 specularColor = vec3(.95f, .95f, 1.f);
    vec3 texture = texture(tex, fragUV).xyz;
    vec3 ambientColor = ambient * texture;
    vec3 diffuse = texture * clamp(dot(L,N) * 2.f, 0.5f, 1.f);
    vec3 specular = specularColor * pow(clamp( dot(N,H), 0.1f, 1.f) , shininess); 
    vec3 color = (1.- K_s)*diffuse + K_s*specular; // + ambient;
    
    if (in_crosshairs() == 1) {
      color = color;
    } else {
      color = vec3(.4f, .2f, .5f);  // kind of purple
    }
    
    outColor = vec4(color, 1);
  }
`;

export {vertexShader, fragmentShader};
