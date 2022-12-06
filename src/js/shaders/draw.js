import {raycastFragmentFunctions} from "./raycast.js";

const planeFragmentShader = `
  #version 300 es
  precision mediump float;

  in vec3 fragNormal;
  in vec3 fragPosition;
  in vec2 fragUV;
  in vec4 cameraSpacePosition;
  
  uniform sampler2D tex;

  out vec4 outColor;

  void main() {
    outColor = texture(tex, fragUV);
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
  uniform vec3 cameraVector; // Needs to be normalized!
  uniform vec3 cameraPosition;
  uniform vec3 drawColor;
  uniform int screenDraw;
  
  out vec4 outColor;
 
  ${raycastFragmentFunctions}
  
  void main() {
    vec4 color;
    
    if (in_crosshairs() == 1) {
      color = vec4(drawColor, 1.f);
    } else {
      if (screenDraw == 1) {
        color = vec4(.1, .1, .1, 0.5);
      } else {
        color = vec4(0.f, 0.f, 0.f, 0.f);
      }
    }
    
    outColor = color;
  }

`


export {fragmentShader, planeFragmentShader};