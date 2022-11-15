getModelMatrix = (node) => {
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