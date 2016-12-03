var Chip8 = function () {
    // 0-0xFFF  8-bit
    this.virtualMemory = [];
    this.programCounter = 0x200;
    // register V0 - VF  8-bit
    this.register = [];
    // 16-bit
    this.addressRegister = 0;
    //  0 - 0xF
    this.virtualStack = [];
    this.stackPointer = 0;

    // input 0x0 - 0xF  1-bit array
    this.keyPress = [];

    // 64*32 display  1-bit array
    this.screen = [];



    this.opcode = 0;

}

Chip8.prototype = {

    fetchOpCode: function () {
        this.opcode = (this.virtualMemory[this.programCounter] << 8) +
            this.virtualMemory[this.programCounter + 1];
        console.log((this.opcode).toString(16));
    },

    checkOpCode: function () {
        this.fetchOpCode();
        var op = (this.opcode & 0xF000) >> 12;
        var addr = (this.opcode & 0x0FFF);
        var nibble = (this.opcode & 0x000F);
        var x = (this.opcode & 0x0F00) >> 8;
        var y = (this.opcode & 0x00F0) >> 4;
        var byte = (this.opcode & 0x00FF);

        switch (op) {
            case 0x6:
                console.log('setV');
                this.setVX(x, byte);
                break;
            case 0xA:
                console.log('setI');
                this.setI(addr);
                break;
            case 0xD:
                console.log('draw');
                this.drawSprite(x, y, nibble);
                break;

        }
    },

    loadROM: function (data) {
        for (var i = 0; i < data.length; i++) {
            this.virtualMemory[0x200 + i] = data[i];
            console.log(this.virtualMemory[0x200 + i].toString(16));
        }
    },





    // 0NNN - Call - Calls RCA 1802 program at address NNN
    // 00E0 - Display - Clears the screen
    // 00EE - Flow - Returns from a subroutine
    // 1NNN - Flow - Jumps to address NNN
    // 2NNN - Flow - Calls subroutine at NNN
    // 3XNN - Cond - Skips the next instruction if VX equals NN
    // 4XNN - Cond - Skips the next instruction if VX doesn't equal NN
    // 5XY0 - Cond - Skips the next instruction if VX equals VY
    // 6XNN - Const - Sets VX to NN
    setVX: function (vx, nn) {
        this.register[vx] = nn;
        console.log(this.register[vx]);
        this.programCounter += 2;
    },
    // 7XNN - Const - Adds NN to VX
    // 8XY0 - Assign - Sets VX to the value of VY
    // 8XY1 - BitOp - Sets VX to VX or VY (Bitwise OR operation)
    // 8XY2 - BitOp - Sets VX to VX and VY (Bitwise AND operation)
    // 8XY3 - BitOp - Sets VX to VX xor VY
    // 8XY4 - Math - Adds VY to VX
    // 8XY5 - Math - VY is subtracted from VX
    // 8XY6 - BitOp - Shifts VX right by one
    // 8XY7 - Math - Sets VX to VY minus VX
    // 8XYE - BitOp - Shifts VX left by one
    // 9XY0 - Cond - Skips the next instruction if VX doesn't equal VY
    // ANNN - MEM - Sets I to the address 
    setI: function (addr) {
        this.addressRegister = addr;
        console.log(this.addressRegister);
        console.log(this.virtualMemory[this.addressRegister]);
        this.programCounter += 2;
    },
    // BNNN - Flow - Jumps to the address NNN plus V0
    // CXNN - Rand - Sets VX to the result of a bitwise and operation on a random number and NN
    // DXYN - Disp - Draws a sprite at coordinate (VX, VY) that has a width of 8 pixels and a height of N pixels
    drawSprite: function (vx, vy, height) {
        this.register[0xF] = 0;
        for (var y = 0; y < height; y++) {
            var gfx = this.virtualMemory[this.addressRegister + y];
            for (var x = 0; x < 8; x++) {
                if ((gfx & (0x80 >> x)) != 0){
                    if (this.screen[(this.register[vx] + x + ((this.register[vy] + y) * 64))] == 1) {
                        this.register[0xF] = 1;
                    }
                    this.screen[(this.register[vx] + x + ((this.register[vy] + y) * 64))] ^= 1;
                }
            }
        }
        this.programCounter += 2;
    },

    // EX9E - KeyOp - Skips the next instruction if the key stored in VX is pressed
    // EXA1 - KeyOp - Skips the next instruction if the key stored in VX isn't pressed
    // FX07 - Timer - Sets VX to the value of the delay timer
    // FX0A - KeyOp - A key press is awaited, and then stored in VX
    // FX15 - Timer - Sets the delay timer to VX
    // FX18 - Sound - Sets the sound timer to VX
    // FX1E - MEM - Adds VX to I
    // FX29 - MEM - Sets I to the location of the sprite for the character in VX
    // FX33 - BCD -	Stores the binary-coded decimal representation of VX
    // FX55 - MEM - Stores V0 to VX (including VX) in memory starting at address I
    // FX65 - MEM - Fills V0 to VX (including VX) with values from memory starting at address I
}