
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

export {fragmentShader};
