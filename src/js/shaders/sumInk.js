const fragmentShader = `
  #version 300 es
  precision mediump float;

  in vec3 fragNormal;
  in vec3 fragPosition;
  in vec2 fragUV;
  in vec4 cameraSpacePosition;
  
  uniform sampler2D tex;
  uniform vec3 ink1;
  uniform vec3 ink2;
  uniform vec3 ink3;
  uniform vec3 ink4;

  out vec4 outColor;
    
  int inkMatches(vec3 a, vec3 b) {
    if (a.r == b.r && a.g == b.g && a.b == b.b) {
        return 1;
    } else {
        return 0;
    }
  }
  
  void main() {
    vec4 color = texture(tex, fragUV);    
    if (color.w == 0.f) {
        outColor = vec4(0.f);
        return;
    }
    vec3 inkColor = color.rgb;
    if (inkMatches(inkColor, ink1) == 1) {
        outColor = vec4(0.25f);
    } else if (inkMatches(inkColor, ink2) == 1) {
        outColor = vec4(0.50f);
    } else if (inkMatches(inkColor, ink3) == 1) {
        outColor = vec4(0.75f);
    } else if (inkMatches(inkColor, ink4) == 1) {
        outColor = vec4(1.f);
    } else {
        outColor = vec4(0.f);
    }
    
  }
`;

export {fragmentShader};
