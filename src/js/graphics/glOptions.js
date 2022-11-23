const backfaceCulling = () => {
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
}


export {backfaceCulling};
