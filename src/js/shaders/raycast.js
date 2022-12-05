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
  out vec4 cameraSpacePosition;

  void main() {
    fragUV = uv;
    vec4 worldPosition = modelMatrix*vec4(position,1);
    cameraSpacePosition = projectionMatrix*cameraMatrix*worldPosition;
    gl_Position = cameraSpacePosition;
    fragNormal = normalize(normal);
    fragPosition = worldPosition.xyz;
  }
`;

const raycastFragmentFunctions = `
  float epsilon = .001f;
  
  vec3 get_vector_to_camera() {
    return normalize(cameraPosition - fragPosition);
  }
  
  // Only takes normalized vectors, will break otherwise
  float vector_closeness(vec3 a, vec3 b) {
    float similarity = dot(a, b);
    return similarity;

    return clamp(similarity, 0.f, 1.f);
  }
  
  float get_camera_closeness() {
    return vector_closeness(cameraVector, get_vector_to_camera());
  }
  
  int in_crosshairs() {
    float closeness = get_camera_closeness();
    float normal_closeness = vector_closeness(cameraVector, fragNormal);
    float threshold = epsilon / length(cameraSpacePosition) * normal_closeness;
    
    if (closeness + threshold >= 1.f) {
        return 1;
    } else {
        return 0;
    }
  }
`

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
  
  out vec4 outColor;
 
 ${raycastFragmentFunctions}
  
  void main() {
    vec3 color;
    
    if (in_crosshairs() == 1) {
      color = texture(tex, fragUV).xyz;
    } else {
      color = vec3(.4f, .2f, .5f);  // kind of purple
    }
    
    outColor = vec4(color, 1);
  }
`;

export {vertexShader, fragmentShader, raycastFragmentFunctions};
