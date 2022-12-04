import "./globals.js";
import {clearFrame, initGraphics} from "./graphics/glOptions.js";
// Import the graphics program here
import {setup, animate} from "./programs/portmackerel.js";

initGraphics(gl);
console.log("Initialized GL")

function animationLoop() {
    if (gl.isContextLost()) {
        console.log("Context lost, ending.");
        return;
    }
    clearFrame(gl);
    animate();
    requestAnimationFrame(animationLoop);
}
setup().then(() => {
    console.log("Setup complete, starting animation");
    animationLoop();
})

console.log("Started animation loop")
