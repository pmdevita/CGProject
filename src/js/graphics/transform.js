import {deg2rad} from "../utils.js";
import {computeModelExtent} from "./model-loader.js";

const getNodeMatrix = (node) => {
    let extents = node.model ? computeModelExtent(node.model) : {center: [0, 0, 0]}
    let rotate = node.rotate ? node.rotate : [0, 0, 0];
    let T = m4.translation(v3.negate(extents.center));
    let cT = m4.translation(node.coords);
    let R_x = m4.rotationX(deg2rad(rotate[0]));
    let R_y = m4.rotationY(deg2rad(rotate[1]));
    let R_z = m4.rotationZ(deg2rad(rotate[2]));
    let scale = node.scale ? node.scale : 1;
    let S = m4.scaling([scale / 1, scale / 1, scale / 1]);
    return m4.multiply(m4.multiply(m4.multiply(m4.multiply(m4.multiply(S, R_z), R_y), R_x), T), cT);
}


const getModelMatrix = (model, position, rotation, scale, extents= null) => {
    let ex = extents ? extents : computeModelExtent(model);

    let T = m4.translation(v3.negate(ex.center));
    let R_x = m4.rotationX(deg2rad(rotation[0]));
    let R_y = m4.rotationY(deg2rad(rotation[1]));
    let R_z = m4.rotationZ(deg2rad(rotation[2]));
    let cT = m4.translation(position);
    let S = m4.scaling([scale / 1, scale / 1, scale / 1]);
    return m4.multiply(S,
        m4.multiply(R_z,
            m4.multiply(R_y,
                m4.multiply(R_z, cT)
            )
        )
    );
}

const getFPSCameraMatrix = (coords, angle) => {
    let vec = rotationToVector(angle);
    let pos = [coords[0] - vec[0], coords[1] - vec[1], coords[2] - vec[2]];
    return getCameraMatrix(coords, pos)
}

const getCameraMatrix = (coords, lookAt) => {
    return m4.inverse(m4.lookAt(coords, lookAt, [0, 1, 0]));
}

const getProjectionMatrix = (fov, near, far) => m4.perspective(deg2rad(fov), gl.canvas.width / gl.canvas.height, near, far);

const getOrthoProjectionMatrix = (width, height, near, far) => m4.ortho(0, width, 0, height, near, far)

const getVertexAttributes = (model) => model.map(d => {
    let totalVertices = d.sc.position.length / 3;
    let data = {};
    for (let key in d.sc) {
        data[key] = {
            numComponents: d.sc[key].length / totalVertices,
            data: d.sc[key]
        }
    }
    return data;
});

const getBufferInfoArray = (vertexAttributes, textures) => vertexAttributes.map((d, i) => {
    let obj = twgl.createBufferInfoFromArrays(gl, d);
    if (textures) {
        obj.texture = textures[i];
    }
    return obj
});

// convert rotation polar coordinates to cartesian
const rotationToVector = (rotation) => {
    let x = Math.sin(rotation[1]) * Math.cos(-rotation[0]);
    let y = Math.cos(rotation[1]) * Math.cos(-rotation[0]);
    let z = Math.sin(-rotation[0]);
    return [x, z, y];
}

const old_getFPSCameraMatrix = (coords, angle) => {
    let t = m4.translate(m4.identity(), coords);
    let rY = m4.rotationY(angle[1]);
    let rX = m4.rotationX(angle[0]);
    t = m4.multiply(m4.multiply(t, rY), rX);
    return m4.inverse(t);
}

export {old_getFPSCameraMatrix, getModelMatrix, getFPSCameraMatrix, getCameraMatrix, getProjectionMatrix, getVertexAttributes, getBufferInfoArray, rotationToVector, getOrthoProjectionMatrix};

