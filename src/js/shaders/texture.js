
const fragmentShader = `
  #version 300 es
  precision mediump float;

  in vec3 fragNormal;
  in vec3 fragPosition;
  in vec2 fragUV;
  
  uniform sampler2D tex;
  uniform int id;
  uniform float K_s;
  uniform float shininess;
  uniform float ambient; 
  uniform vec3 cameraPosition;
  uniform vec4 light;

  out vec4 outColor;

  void main() {
    vec3 N = normalize(fragNormal);
    vec3 V  = normalize(cameraPosition - fragPosition);
    vec3 L;
    if (light.w==0.0){
      L = normalize(light.xyz);
    }
    else{
      L = normalize(light.xyz-fragPosition);
    }
    vec3 H = normalize(L + V);
    vec3 specularColor = vec3(1);
    vec3 texture = texture(tex, fragUV).xyz;
    vec3 ambientColor = ambient * texture;
    vec3 diffuse = texture * clamp(dot(L,N), 0.f,1.f) * .5f ;
    vec3 specular = specularColor * pow(clamp( dot(N,H), 0., 1.) , shininess); 
    vec3 color color = (1.- K_s)*diffuse + K_s*specular + ambient;
    outColor = vec4(color, 1);
  }
`;

export {fragmentShader};
