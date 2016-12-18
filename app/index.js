var remote = require('electron').remote;
//const ipc = require('electron').ipcRenderer;

let gui;

var emulatorOptions = {
    executing: true,
    frequencyLimit: 60.
}

function draw(xIndex, yIndex, pixelWidth, pixelHeight, color, context) {
  context.fillStyle=color;
  context.fillRect(xIndex, yIndex, pixelWidth, pixelHeight);
}

var pixelWidth;
var pixelHeight;

window.onload = function () {
    // Create new DAT GUI and close it by default.
    gui = new dat.GUI();
    gui.close();

    var ch = new Chip8;

    var data = remote.getGlobal('openFile');
    ch.loadFont();
    ch.loadROM(data);

    var emulatorFolder = gui.addFolder('emulator');
    emulatorFolder.add(emulatorOptions, 'executing');
    emulatorFolder.add(emulatorOptions, 'frequencyLimit', 1, 1024);

    // Get the canvas and context
    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");
    canvas.width = 640;
    canvas.height = 320;

    // Define the pixel dimensions
    var ix;
    var iy;

    pixelWidth = pixelHeight = 10;

    function drawScreen(gfx) {
      for (var i = 0; i < 64 * 32; i++) {
        var x = (i % 64) * pixelWidth;
        var y = Math.floor(i / 64) * pixelHeight;

        draw(x, y, pixelWidth, pixelHeight, (gfx[i] === 1) ? 'red' : 'black', context);
      }
    }

    function onDraw(event) {
        drawScreen(ch.screen);
    }

    ch.addEventListener('draw', onDraw);

    // Create the image
    function createImage() {
        // Draw white pixel of size pixelWidth x pixelHeight at index (ix, iy)
        //draw(ix, iy, pixelWidth, pixelHeight, canvas.width, imagedata, 255);
        drawScreen(ch.screen);
    }

    // Bind keys to emulator controller.
    boundKeys = [
        '1', '2', '3', '4',
        'q', 'w', 'e', 'r',
        'a', 's', 'd', 'f',
        'z', 'x', 'c', 'v'
    ];

    controller = [
        0x1, 0x2, 0x3, 0xc,
        0x4, 0x5, 0x6, 0xd,
        0x7, 0x8, 0x9, 0xe,
        0xa, 0x0, 0xb, 0xf
    ];

    boundKeys.forEach((key, index) => {
        keyboardJS.bind(key, () => {
            ch.keyPress[controller[index]] = 1;
        }, () => {
            ch.keyPress[controller[index]] = 0;
        })
    });

    // Main loop
    function main() {
        // Rate limit emulator execution speed.
        setTimeout(function () {
            window.requestAnimationFrame(main);
        }, 1000 / emulatorOptions.frequencyLimit);

        //console.log("!!!!!!!!!!!!!!!!CYCLE!!!!!!!!!!!!!!!!");

        // Do nothing if execution is not enabled.
        if (!emulatorOptions.executing) {
            return;
        }

        ch.checkOpCode();
    }
    main(0);
};

function onResizeEvent() {
    var canvas = document.getElementById("viewport");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    pixelWidth = Math.floor(canvas.width / 64);
    pixelHeight = Math.floor(canvas.height / 32);
}

window.addEventListener('resize', onResizeEvent, false);

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
