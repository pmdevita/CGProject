import {deg2rad} from "../utils.js";

const getFPSController = (position = [0, 0, 0], look = [0, 0, 0], speed = 1, sensitivity = 0.5) => {
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
        look[0] = Math.max(Math.min(89.9, look[0] - event.movementY * sensitivity), -89.9);
        look[1] = ((look[1] - event.movementX * sensitivity) + 360) % 360 ;
    }

    function mouseLockChange() {
        if (document.pointerLockElement === canvas ||
            document.mozPointerLockElement === canvas) {
            document.addEventListener("mousemove", mouseMove, false);
            document.addEventListener("keydown",  keyDown);
            document.addEventListener("mousedown", onMouseDown);
            document.addEventListener("mouseup", onMouseUp);
        } else {
            document.removeEventListener("mousemove", mouseMove, false);
            document.removeEventListener("keydown",  keyDown);
            document.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("mouseup", onMouseUp);
            reset();
        }
    }

    const reset = () => {
        currentKeys = {};
        mouseState = false;
    }


    let mouseState = false;
    const onMouseDown = (event) => {
        if (event.button === 0) {
            mouseState = true;
        }
    }

    const onMouseUp = (event) => {
        if (event.button === 0) {
            mouseState = false;
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
                    moveZ -= speed;
                    break;
                case "a":
                    moveX -= speed;
                    break;
                case "d":
                    moveX += speed;
                    break;
                case "s":
                    moveZ += speed;
                    break;
                case "Shift":
                    pos[1] = pos[1] - speed;
                    break;
                case " ":
                    pos[1] = pos[1] + speed;
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

    const getMouseClick = () => {
        return mouseState;
    }

    window.getRotation = () => look;
    window.getPosition = () => pos;

    return {getPosition, getRotation, getMouseClick};
}


export {getFPSController};
