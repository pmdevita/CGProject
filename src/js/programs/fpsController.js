import {deg2rad} from "../utils.js";

const getFPSController = (position = [0, 0, 0], look = [0, 0, 0]) => {
    let pos = position;
    // let look = [0, 0, 0];

    let currentKeys = {};

    canvas.requestPointerLock = canvas.requestPointerLock ||
        canvas.mozRequestPointerLock;

    document.exitPointerLock = document.exitPointerLock ||
        document.mozExitPointerLock;

    canvas.onclick = function() {
        canvas.requestPointerLock();
    };

    document.addEventListener('pointerlockchange', mouseLockChange, false);
    document.addEventListener('mozpointerlockchange', mouseLockChange, false);

    const mouseMove = (event) => {
        look[0] = Math.max(Math.min(90, look[0] - event.movementY), -90);
        look[1] = (look[1] - event.movementX) % 360;
    }

    function mouseLockChange() {
        if (document.pointerLockElement === canvas ||
            document.mozPointerLockElement === canvas) {
            document.addEventListener("mousemove", mouseMove, false);
            document.addEventListener("keydown",  keyDown);
        } else {
            document.removeEventListener("mousemove", mouseMove, false);
            document.removeEventListener("keydown",  keyDown);
        }
    }

    let keysRegistered = null;
    let keysDelay = 1/30;
    const keyDown = (event) => {
        if (event.key === " ") {
            event.preventDefault();
        }
        currentKeys[event.key] = true;
        if (keysRegistered === null) {
            keysRegistered = setTimeout(processKeys, keysDelay);
        }
    };

    const processKeys = () => {
        let moveX = 0;
        let moveZ = 0;
        for (let key of Object.keys(currentKeys)) {
            switch (key) {
                case "w":
                    moveZ -= 1;
                    break;
                case "a":
                    moveX -= 1;
                    break;
                case "d":
                    moveX += 1;
                    break;
                case "s":
                    moveZ += 1;
                    break;
                case "Shift":
                    pos[1] = pos[1] - 1;
                    break;
                case " ":
                    pos[1] = pos[1] + 1;
                    break;
            }
        }
        let xVelo = (moveX * Math.cos(deg2rad(look[1]))) + (moveZ * Math.sin(deg2rad(look[1])));
        let zVelo = (moveX * Math.sin(deg2rad(-look[1]))) + (moveZ * Math.cos(deg2rad(look[1])));
        pos[0] = pos[0] + xVelo;
        pos[2] = pos[2] + zVelo;
        if (keysRegistered) {
            keysRegistered = setTimeout(processKeys, keysDelay);
        }
    }

    document.addEventListener("keyup", (event) => {
        delete currentKeys[event.key];
        if (Object.keys(currentKeys).length === 0) {
            clearTimeout(keysRegistered);
            keysRegistered = null;
        }
    })

    const getPosition = () => {
        return pos;
    }

    const getRotation = () => {
        return look.map(d => deg2rad(d));
    }

    return {getPosition: getPosition, getRotation: getRotation};
}


export {getFPSController};
