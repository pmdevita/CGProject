import {computeModelExtent} from "../graphics/model-loader.js";
import {getFPSCameraMatrix, getModelMatrix, rotationToVector} from "../graphics/transform.js";

const getSceneUniforms = (model, projectionMatrix, cameraPosition, cameraRotation, lightPosition, skybox) => {
    let modelMatrix = getModelMatrix(model, [0,0,0], [0,0,0], 1);
    const uniforms = {
        projectionMatrix: projectionMatrix,
        cameraMatrix: getFPSCameraMatrix(cameraPosition, cameraRotation),
        shininess: 0.1,
        ambient: .15,
        K_s: .1,
        cameraVector: v3.normalize(rotationToVector(cameraRotation)),
        cameraPosition: cameraPosition,
        cubemap: skybox,
        lightPosition: [...lightPosition, 0]
    };
    return (objectMatrix, texture, extraUniforms = null) => {
        let u = {
            ...uniforms,
            modelMatrix: m4.multiply(modelMatrix, objectMatrix),
            ...extraUniforms
        };
        if (texture) {
            u["tex"] = texture;
        }
        return u;
    };
}

export {getSceneUniforms};