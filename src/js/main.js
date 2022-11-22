import "./globals.js";
import {clearFrame, initGraphics} from "./graphics/basic.js";
// Import the graphics program here
import {animate} from "./programs/kyogretest.js";

initGraphics(gl);

function animationLoop() {
    clearFrame(gl);
    animate();
    requestAnimationFrame(animationLoop);
}
animationLoop();
