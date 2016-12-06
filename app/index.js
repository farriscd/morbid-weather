var remote = require('electron').remote;
const stats = new Stats();
//const ipc = require('electron').ipcRenderer;

let gui;

var rendererOptions = {
    rendering: true,
    framerateLimit: 60,
}

stats.showStats = function () {
    this.showPanel(0);
}

stats.hideStats = function () {
    this.showPanel(-1);
}


function draw(xIndex, yIndex, pixelWidth, pixelHeight, canvasWidth, imageData, color) {
    for (var x = xIndex; x < xIndex + pixelWidth; x++) {
        for (var y = yIndex; y < yIndex + pixelHeight; y++) {
            // Get the pixel index
            var pixelindex = (y * canvasWidth + x) * 4;

            // Set the pixel data
            imageData.data[pixelindex] = color;     // Red
            imageData.data[pixelindex + 1] = color; // Green
            imageData.data[pixelindex + 2] = color;  // Blue
            imageData.data[pixelindex + 3] = color;   // Alpha
        }
    }
}

function drawScreen(gfx) {
    for (var i = 0; i < gfx.length; i++) {
        var x = (i % 64) * pixelWidth;
        var y = Math.floor(i / 64) * pixelHeight;
        (gfx[i] == true)
            ? draw(x, y, pixelWidth, pixelHeight, canvas.width, imagedata, 255)
            : draw(x, y, pixelWidth, pixelHeight, canvas.width, imagedata, 0);
    }
}


var imagedata;
var pixelWidth;
var pixelHeight;

window.onload = function () {
    // Create new DAT GUI and close it by default.
    gui = new dat.GUI();
    gui.close();

    var ch = new Chip8;

    var data = remote.getGlobal('openFile');
    ch.loadROM(data);

    var statsFolder = gui.addFolder('stats');
    statsFolder.add(stats, 'showStats');
    statsFolder.add(stats, 'hideStats');

    var rendererFolder = gui.addFolder('renderer');
    rendererFolder.add(rendererOptions, 'rendering');
    rendererFolder.add(rendererOptions, 'framerateLimit', 10, 60);


    // Get the canvas and context
    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");
    canvas.width = 640;
    canvas.height = 320;

    //onResizeEvent();
    document.getElementById("viewport").style.backgroundColor = 'rgb(0, 0, 0)';


    // Define the pixel dimensions
    var ix;
    var iy;
    //var pixelWidth = canvas.width / 64;
    //var pixelHeight = canvas.height / 32;
    pixelWidth = 10;
    pixelHeight = 10;

    // Create an ImageData object
    imagedata = context.createImageData(canvas.width, canvas.height);

    function redrawBackground() {
        draw(0, 0, canvas.width, canvas.height, canvas.width, imagedata, 0);
    }

    function drawScreen(gfx) {
        imagedata = context.createImageData(canvas.width, canvas.height);
        for (var i = 0; i < gfx.length; i++) {
            var x = (i % 64) * pixelWidth;
            var y = Math.floor(i / 64) * pixelHeight;
            (gfx[i] == true)
                ? draw(x, y, pixelWidth, pixelHeight, canvas.width, imagedata, 255)
                : draw(x, y, pixelWidth, pixelHeight, canvas.width, imagedata, 0);
        }
    }


    // Create the image
    function createImage() {
        // Do nothing if rendering is not enabled.
        if (!rendererOptions.rendering) {
            return;
        }

        //redrawBackground();
        // Draw white pixel of size pixelWidth x pixelHeight at index (ix, iy)
        //draw(ix, iy, pixelWidth, pixelHeight, canvas.width, imagedata, 255);
        drawScreen(ch.screen);
    }


    // Main loop
    function main() {
        // Rate limit rendering based on framerate limit.
        setTimeout(function () {
            window.requestAnimationFrame(main);
        }, 1000 / rendererOptions.framerateLimit);

        stats.begin();

        // Create the image
        createImage();

        ch.checkOpCode();

        // Draw the image data to the canvas
        context.putImageData(imagedata, 0, 0);

        stats.end();
    }
    main(0);


    //document.onkeydown = checkKey;
    /*        function checkKey(e) {
                e = e || window.event;
                if (e.keyCode == '38' && iy > 0) {
                    // up arrow
                    iy -= 10;
                }
                else if (e.keyCode == '40' && iy < canvas.height - pixelHeight - 9) {
                    // down arrow
                    iy += 10;
                }
                else if (e.keyCode == '37' && ix > 0) {
                    // left arrow
                    ix -= 10;
                }
                else if (e.keyCode == '39' && ix < canvas.width - pixelWidth - 9) {
                    // right arrow
                    ix += 10;
                }
        
            }*/

    // Add the stats UI and hide it by default.
    document.body.appendChild(stats.dom);
    stats.hideStats();
};

function onResizeEvent() {
    var canvas = document.getElementById("viewport");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    pixelWidth = Math.floor(canvas.width / 64);
    pixelHeight = Math.floor(canvas.height / 32);
}

window.addEventListener('resize', onResizeEvent, false);
