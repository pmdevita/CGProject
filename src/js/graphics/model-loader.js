// Adapted from Dr. Sumant Pattanaik
// https://observablehq.com/@spattana/model-loaders-using-threejs


import {gitLFS} from "../utils.js";
import {createTextureFromGLTF} from "./textures.js";

const ModelSupported = {
    "obj": THREE.OBJLoader,
    "gltf": THREE.GLTFLoader,
    "glb": THREE.GLTFLoader,
    "collada": THREE.ColladaLoader
}

const loadObject = (url, loader, mtls) => {
    return new Promise((resolve, reject) => {
        // instantiate a loader
        if (mtls) loader.setMaterials(mtls);
        loader.load(
            // resource URL
            url,
            // called when resource is loaded
            function (object) {
                resolve(object);
            },
            // called when loading is in progresses
            function (xhr) {
                return (xhr.loaded / xhr.total) * 100 + "% loaded";
            },
            // called when loading has errors
            function (error) {
                console.log(error);
                reject("Error in loading");
            }
        );
    })
}


const loadModelFromURL = async (url, modelFormat) => {
    let format;
    if (modelFormat) {
        format = modelFormat;
    } else {
        let parts = url.split(".");
        format = parts[parts.length - 1];
    }

    if (!format || !ModelSupported[format]) return "Missing model format parameter";
    const loader = ModelSupported[format.toLowerCase()];
    if (!loader) return "Model not supported";
    let loadedModel = await loadObject(gitLFS(url), new loader());
    console.log(loadedModel);
    return createSCs(loadedModel);
}


const createSCs = (obj) => {
    const sceneGraph = {};
    let scs = [];
    if (obj.scene) getNode(obj.scene, mat4.create()); else getNode(obj, mat4.create());

    function getNode(node, M) {
        const sc = {};
        sc.name = node.name;

        const translation = node.position ? [node.position.x, node.position.y, node.position.z] : [0, 0, 0];
        const quaternion = node.quaternion ? [node.quaternion.x, node.quaternion.y, node.quaternion.z, node.quaternion.w] : [0, 0, 0, 1];
        //const rotation = node.rotation?[node.rotation.x,node.rotation.y,node.rotation.z]:[0,0,0];// XYZ order
        const scale = node.scale && node.scale.x ? [node.scale.x, node.scale.y, node.scale.z] : [1, 1, 1];

        sc.modelMatrix = mat4.multiply(M, mat4.fromRotationTranslationScale(quaternion, translation, scale));

        if (node.geometry || node.attributes) {
            const attributes = node.geometry ? node.geometry.attributes : node.attributes;
            sc.sc = createSC(attributes);
            if (node.geometry.index) {
                sc.sc.indices = node.geometry.index.array.slice();
            }
            if (node.material && node.material.map !== null) {
                sc.material = node.material;
                sc.texture = createTextureFromGLTF(node.material);
            } else {
                sc.material = null;
                sc.texture = null;
            }
            scs.push(sc);
        }
        if (node.children) node.children.forEach((d) => getNode(d, sc.modelMatrix));
    }

    return scs;
}

const createSC = (attributes, offset) => {
    let newAttributes = {};
    for (let key in attributes) {
        newAttributes[key] = attributes[key].array.slice();
    }
    if (!attributes.normal) {
        let positions = attributes.position.array.slice();
        let count = positions.length / 3;
        let Ns = [];
        if (offset === undefined) {
            offset = {start: 0, count: positions.length}
        }

        for (let i = 0; i < offset.count; i += 3) {
            const k = offset.start + i;
            const v0 = positions.slice(k * 9, k * 9 + 3), v1 = positions.slice(k * 9 + 3, k * 9 + 6),
                v2 = positions.slice(k * 9 + 6, k * 9 + 9);
            const N = Array.from(v3.normalize(v3.cross(v3.subtract(v1, v0), v3.subtract(v2, v0))));
            Ns.push(N, N, N);
        }
        newAttributes.normal = Ns.flat();
    }

    return newAttributes;
}


let extentCache = {};

const computeModelExtent = function (o) {
    if (o in extentCache) {
        return extentCache[o];
    }


    const extents = o.map((d) => {
        const xExtent = d3.extent(d.sc.position.filter((_, i) => i % 3 === 0));
        const yExtent = d3.extent(d.sc.position.filter((_, i) => i % 3 === 1));
        const zExtent = d3.extent(d.sc.position.filter((_, i) => i % 3 === 2));
        return {
            min: [xExtent[0], yExtent[0], zExtent[0]],
            max: [xExtent[1], yExtent[1], zExtent[1]]
        };
    });

    const transformedExtents = extents.map((extent, i) => {
        return o[i].modelMatrix
            ? {
                min: mat4.transformPoint(o[i].modelMatrix, extent.min),
                max: mat4.transformPoint(o[i].modelMatrix, extent.max)
            }
            : extent;
    });
    const xMin = d3.min(transformedExtents, (d) => d.min[0]);
    const xMax = d3.max(transformedExtents, (d) => d.max[0]);
    const yMin = d3.min(transformedExtents, (d) => d.min[1]);
    const yMax = d3.max(transformedExtents, (d) => d.max[1]);
    const zMin = d3.min(transformedExtents, (d) => d.min[2]);
    const zMax = d3.max(transformedExtents, (d) => d.max[2]);
    const min = [xMin, yMin, zMin],
        max = [xMax, yMax, zMax];
    const center = v3.divScalar(v3.add(min, max), 2); // center of AABB
    const dia = v3.length(v3.subtract(max, min)); // Diagonal length of the AABB
    const finalExtents = {
        min,
        max,
        center,
        dia
    };
    extentCache[o] = finalExtents;
    return finalExtents;
}

const mat4 = function (){
    const M4 = twgl.m4;
    M4.create = () =>
        new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    M4.fromQuat = (q) => {
        let x = q[0],
            y = q[1],
            z = q[2],
            w = q[3];
        let x2 = x + x;
        let y2 = y + y;
        let z2 = z + z;
        let xx = x * x2;
        let yx = y * x2;
        let yy = y * y2;
        let zx = z * x2;
        let zy = z * y2;
        let zz = z * z2;
        let wx = w * x2;
        let wy = w * y2;
        let wz = w * z2;
        let out = [];
        out[0] = 1 - yy - zz;
        out[1] = yx + wz;
        out[2] = zx - wy;
        out[3] = 0;

        out[4] = yx - wz;
        out[5] = 1 - xx - zz;
        out[6] = zy + wx;
        out[7] = 0;

        out[8] = zx + wy;
        out[9] = zy - wx;
        out[10] = 1 - xx - yy;
        out[11] = 0;

        out[12] = out[13] = out[14] = 0;
        out[15] = 1;
        return out;
    };
    M4.fromRotationTranslationScale = (q, v, s) => {
        // Quaternion math
        let x = q[0],
            y = q[1],
            z = q[2],
            w = q[3];
        let x2 = x + x;
        let y2 = y + y;
        let z2 = z + z;
        let xx = x * x2;
        let xy = x * y2;
        let xz = x * z2;
        let yy = y * y2;
        let yz = y * z2;
        let zz = z * z2;
        let wx = w * x2;
        let wy = w * y2;
        let wz = w * z2;
        let sx = s[0];
        let sy = s[1];
        let sz = s[2];
        let out = [];
        out[0] = (1 - (yy + zz)) * sx;
        out[1] = (xy + wz) * sx;
        out[2] = (xz - wy) * sx;
        out[3] = 0;
        out[4] = (xy - wz) * sy;
        out[5] = (1 - (xx + zz)) * sy;
        out[6] = (yz + wx) * sy;
        out[7] = 0;
        out[8] = (xz + wy) * sz;
        out[9] = (yz - wx) * sz;
        out[10] = (1 - (xx + yy)) * sz;
        out[11] = 0;
        out[12] = v[0];
        out[13] = v[1];
        out[14] = v[2];
        out[15] = 1;
        return out;
    };
    return M4;
}();

export {loadModelFromURL, computeModelExtent};
