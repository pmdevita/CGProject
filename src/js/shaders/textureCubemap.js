
const fragmentShader = `
  #version 300 es
  precision mediump float;

  in vec3 fragNormal;
  in vec3 fragPosition;
  in vec2 fragUV;
  
  uniform sampler2D tex;
  uniform samplerCube cubemap;
  uniform vec3 cameraPosition;
  
  out vec4 outColor;
  
  vec3 cubemap_reflection(vec3 R) {
    return texture(cubemap, normalize(R)).rgb;
  }

  vec3 get_color() {
    vec3 N = normalize(fragNormal);
    vec3 V = normalize(cameraPosition-fragPosition);
    vec3 R = reflect(-V, N);
    vec3 color = texture(tex, fragUV).xyz;
    // vec3 envColor = cubemap_reflection(R);
    // return color + envColor;
    return color;
  }
  
  void main() {
    outColor = vec4(get_color(), 1);
  }
`;

export {fragmentShader};
