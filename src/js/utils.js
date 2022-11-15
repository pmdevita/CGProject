const deg2rad = (deg) => {return deg / 180.0 * Math.PI}

const hex2rgb = (hex) =>
    (hex = hex.replace("#", ""))
        .match(new RegExp("(.{" + hex.length / 3 + "})", "g"))
        .map((l) => parseInt(hex.length % 2 ? l + l : l, 16) / 255)

export {deg2rad, hex2rgb}