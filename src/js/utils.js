import {GitHubPages} from "./config.js";

const deg2rad = (deg) => {return deg / 180.0 * Math.PI}

const hex2rgb = (hex) =>
    (hex = hex.replace("#", ""))
        .match(new RegExp("(.{" + hex.length / 3 + "})", "g"))
        .map((l) => parseInt(hex.length % 2 ? l + l : l, 16) / 255)

// Remove the first part which is an empty string, and the second which is
// the project name
let currentPath;
if (window.location.host.endsWith("github.io")) {
    currentPath = window.location.pathname.split("/").slice(2, -1);
}

const gitLFS = (path) => {
    if (!window.location.host.endsWith("github.io")) {
        return path;
    }
    let newPath;
    if (path.startsWith("./")) {
        let newPathParts = [...currentPath, ...path.split("/").splice(1)];
        newPath = "/" + newPathParts.join("/");
    }
    return `https://media.githubusercontent.com/media/${GitHubPages.username}/${GitHubPages.project}/${GitHubPages.branch}${newPath}`;
}

export {deg2rad, hex2rgb, gitLFS}