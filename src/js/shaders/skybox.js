const vertexShader = `
  #version 300 es
  precision mediump float;
   
  in vec2 position;
  out vec2 fragPosition;
    
  void main() {
    fragPosition = position;
    gl_Position = vec4(position, 1, 1);
  }
`;

const fragmentShader = `
  #version 300 es
  precision mediump float;
   
  in vec2 fragPosition;
    
  uniform samplerCube cubemap;
  uniform mat4 invProjectionMatrix;
  uniform vec3 cameraPosition;
  out vec4 outColor;
    
  void main() {
    vec4 farPlanePosition = invProjectionMatrix * vec4(fragPosition, 1, 1);
    vec3 direction = farPlanePosition.xyz/farPlanePosition.w - cameraPosition;
    outColor = vec4(texture(cubemap, normalize(direction)));
    // outColor = vec4(texture(cubemap, normalize(farPlanePosition.xyz / farPlanePosition.w)));
  }

`;


export {vertexShader, fragmentShader};