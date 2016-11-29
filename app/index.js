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

// load into 0x200 place
function loadROM(data, memArray) {
    for (var i = 512; i < 512 + data.length; i += 2) {
        memArray[i] = ((data[i] << 8) + data[i + 1]);
        console.log(memArray[i].toString(16));
    }
}

window.onload = function () {
    // Create new DAT GUI and close it by default.
    gui = new dat.GUI();
    gui.close();

    var virtualMemory = [];
    var data = remote.getGlobal('test');

/*    for (var i = 0; i < data.length; i += 2) {
        virtualMemory[i] = ((data[i] << 8) + data[i + 1]);
        //console.log(virtualMemory[i].toString(16));
    }*/

    loadROM(remote.getGlobal('test'), virtualMemory);

    var statsFolder = gui.addFolder('stats');
    statsFolder.add(stats, 'showStats');
    statsFolder.add(stats, 'hideStats');

    var rendererFolder = gui.addFolder('renderer');
    rendererFolder.add(rendererOptions, 'rendering');
    rendererFolder.add(rendererOptions, 'framerateLimit', 10, 60);


    // Get the canvas and context
    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");

    onResizeEvent();
    document.getElementById("viewport").style.backgroundColor = 'rgb(0, 0, 0)';


    // Define the pixel dimensions
    var ix = 0;
    var iy = 0;
    var pixelWidth = canvas.width / 64;
    var pixelHeight = canvas.height / 32;

    // Create an ImageData object
    var imagedata = context.createImageData(canvas.width, canvas.height);

    function redrawBackground() {
        draw(0, 0, canvas.width, canvas.height, canvas.width, imagedata, 0);
    }

    // Create the image
    function createImage(offset) {
        // Do nothing if rendering is not enabled.
        if (!rendererOptions.rendering) {
            return;
        }

        redrawBackground();
        // Draw white pixel of size pixelWidth x pixelHeight at index (ix, iy)
        draw(ix, iy, pixelWidth, pixelHeight, canvas.width, imagedata, 255);
    }


    // Main loop
    function main(tframe) {
        // Rate limit rendering based on framerate limit.
        setTimeout(function () {
            window.requestAnimationFrame(main);
        }, 1000 / rendererOptions.framerateLimit);

        stats.begin();

        // Create the image
        createImage(Math.floor(tframe / 15));

        // Draw the image data to the canvas
        context.putImageData(imagedata, 0, 0);

        stats.end();
    }
    main(0);


    document.onkeydown = checkKey;

    function checkKey(e) {
        e = e || window.event;
        if (e.keyCode == '38' && iy > 0) {
            // up arrow
            console.log(remote.getGlobal('test'));
            iy -= 10;
        }
        else if (e.keyCode == '40' && iy < canvas.height - pixelHeight - 9) {
            // down arrow
            console.log(virtualMemory);
            iy += 10;
        }
        else if (e.keyCode == '37' && ix > 0) {
            // left arrow
            console.log(data);
            ix -= 10;
        }
        else if (e.keyCode == '39' && ix < canvas.width - pixelWidth - 9) {
            // right arrow
            ix += 10;
        }

    }

    // Add the stats UI and hide it by default.
    document.body.appendChild(stats.dom);
    stats.hideStats();
};

function onResizeEvent() {
    var canvas = document.getElementById("viewport");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', onResizeEvent, false);
