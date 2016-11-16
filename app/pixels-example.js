// The function gets called when the window is fully loaded
window.onload = function() {
    // Get the canvas and context
    var canvas = document.getElementById("viewport"); 
    var context = canvas.getContext("2d");
 
    // Load background music
    bgMusic = new Audio('mp3/Salty\ Ditty.mp3');
    bgMusic.volume = 0.25;

    // Define the image dimensions
    //var width = canvas.width;
    //var height = canvas.height;
    var width = window.innerWidth;
    var height = window.innerHeight;


    // Create an ImageData object
    var imagedata = context.createImageData(width, height);
 
    // Create the image
    function createImage(offset) {
        // Loop over all of the pixels
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                // Get the pixel index
                var pixelindex = (y * width + x) * 4;
 
                // Generate a xor pattern with some random noise
                var red = ((x + offset) % 256) ^ ((y + offset) % 256);
                var green = ((2 * x + offset) % 256) ^ ((2 * y + offset) % 256);
                var blue = 50 + Math.floor(Math.random() * 100);
 
                // Rotate the colors
                blue = (blue + offset) % 256;
 
                // Set the pixel data
                imagedata.data[pixelindex] = red;     // Red
                imagedata.data[pixelindex + 1] = green; // Green
                imagedata.data[pixelindex + 2] = blue;  // Blue
                imagedata.data[pixelindex + 3] = 255;   // Alpha
            }
        }
    }
 
    var bgAnim;
    // Main loop
    function main(tframe) {     
        // Request animation frames
        bgAnim = window.requestAnimationFrame(main);
 
        // Create the image
        createImage(Math.floor(tframe / 15));
 
        // Draw the image data to the canvas
        context.putImageData(imagedata, 0, 0);
    }
 
    // Call the main loop
    main(0);
    bgMusic.play();
    window.addEventListener('keydown', function (event) {
        if (event.keyCode == 37) {
            //bgMusic.volume += 0.05;
            //alert('Left was pressed');
        }
        else if (event.keyCode == 39) {
            //alert('Right was pressed');
            //bgMusic.volume -= 0.05;

        }
    });
    window.onblur = function() {bgMusic.pause(); cancelAnimationFrame(bgAnim);};
    window.onfocus = function() {main(0);  if (bgMusic.paused) { bgMusic.play(); } }
    
};
