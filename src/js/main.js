import "./globals.js";
import {clearFrame, initGraphics} from "./graphics/basic.js";
// Import the graphics program here
import {setup, animate} from "./programs/kyogretest.js";

initGraphics(gl);
console.log("Initialized GL")

function animationLoop() {
    clearFrame(gl);
    animate();
    requestAnimationFrame(animationLoop);
}
setup().then(() => {
    console.log("Setup complete, starting animation");
    animationLoop();
})

console.log("Started animation loop")
