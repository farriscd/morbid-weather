/*var splash = require('./splash');

window.onload = function () {
    splash.main(0);
    splash.bgMusic.play();

    window.onblur = function () { splash.bgMusic.pause(); cancelAnimationFrame(splash.bgAnim); };
    window.onfocus = function () { splash.main(0); if (splash.bgMusic.paused) { splash.bgMusic.play(); } }
}*/

window.onload = function () {
    // Get the canvas and context
    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var ix = 0;
    var iy = 0;

    // Define the image dimensions
    var pixelWidth = canvas.width / 32;
    var pixelHeight = canvas.height / 64;

    // Create an ImageData object
    var imagedata = context.createImageData(canvas.width, canvas.height);

    // Create the image
    function createImage(offset) {
        // Loop over all of the pixels
        for (var x = ix; x < ix + pixelWidth; x++) {
            for (var y = iy; y < iy + pixelHeight; y++) {
                // Get the pixel index
                var pixelindex = (y * canvas.width + x) * 4;

                // Set the pixel data
                imagedata.data[pixelindex] = 255;     // Red
                imagedata.data[pixelindex + 1] = 0; // Green
                imagedata.data[pixelindex + 2] = 0;  // Blue
                imagedata.data[pixelindex + 3] = 255;   // Alpha
            }
        }
    }

    // Main loop
    function main(tframe) {
        // Request animation frames
        window.requestAnimationFrame(main);

        // Create the image
        createImage(Math.floor(tframe / 15));

        // Draw the image data to the canvas
        context.putImageData(imagedata, 0, 0);
    }
    main(0);

    document.onkeydown = checkKey;

    function checkKey(e) {
        e = e || window.event;

        if (e.keyCode == '38' && iy > 0) {
            // up arrow
            iy -= 1;
        }
        else if (e.keyCode == '40' && iy < canvas.height-pixelHeight-1) {
            // down arrow
            iy += 1;
        }
        else if (e.keyCode == '37' && ix > 0) {
            // left arrow
            ix -= 1;
        }
        else if (e.keyCode == '39' && ix < canvas.width-pixelWidth-1) {
            // right arrow
            ix += 1;
        }

    }
};

