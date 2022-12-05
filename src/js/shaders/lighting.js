const lightingShaderFunctions = `

vec3 apply_lighting(vec3 L, vec3 H, vec3 N, vec3 V, vec3 color) {

    vec3 specularColor = vec3(.95f, .95f, 1.f);
    vec3 ambientColor = ambient * color;
    vec3 diffuse = color * clamp(dot(L,N) * 2.f, 0.5f, 1.f);
    vec3 specular = specularColor * pow(clamp( dot(N,H), 0.1f, 1.f) , shininess); 
    vec3 newColor = (1.- K_s)*diffuse + K_s*specular + ambient;
    return newColor;
}
`

export {lightingShaderFunctions};