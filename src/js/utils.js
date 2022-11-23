import {GitHubPages} from "./config";

const deg2rad = (deg) => {return deg / 180.0 * Math.PI}

const hex2rgb = (hex) =>
    (hex = hex.replace("#", ""))
        .match(new RegExp("(.{" + hex.length / 3 + "})", "g"))
        .map((l) => parseInt(hex.length % 2 ? l + l : l, 16) / 255)

let currentPath = window.location.pathname.split("/").slice(1, -1);
const gitLFS = (path) => {
    if (!window.location.host.endsWith("github.io")) {
        return path;
    }
    let newPath;
    if (path.startsWith("./")) {
        let newPathParts = [...currentPath, ...path.split("/").splice(1, )];
        newPath = "/" + newPathParts.join("/");
        console.log(newPath);
    }
    return `https://media.githubusercontent.com/media/${GitHubPages.username}/${GitHubPages.project}/${GitHubPages.branch}${newPath}`;
}

export {deg2rad, hex2rgb, gitLFS}