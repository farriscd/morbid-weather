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

    // Timers?
    this.delayTimer;
    this.soundTimer;

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

            case 0x0:
                switch (addr) {
                    case 0x0E0:
                        console.log('screen clear');
                        this.clearScreen();
                        break;
                    case 0x0EE:
                        console.log('returnFromSubroutine');
                        this.returnFromSubroutine();
                        break;
                    default:
                        console.log('call rca 1802');
                        break;
                }
                break;

            case 0x1:
                console.log('jumpto');
                this.jumpTo(addr);
                break;

            case 0x2:
                console.log('callSubroutine');
                this.callSubroutine(addr);
                break;

            case 0x3:
                console.log('skipifequals');
                this.skipIfEquals(x, byte);
                break;

            case 0x4:
                console.log('skipifnotequals');
                this.skipIfNotEquals(x, byte);
                break;

            case 0x5:
                console.log('skipifequalsVY');
                this.skipIfEqualsVY(x, y);
                break;

            case 0x6:
                console.log('setV');
                this.setVX(x, byte);
                break;

            case 0x7:
                console.log('addNNtoVX');
                this.addToVX(x, byte);
                break;

            case 0x8:
                switch (nibble) {
                    case 0x0:
                        console.log('assignVx');
                        this.assignVX(x, y);
                        break;

                    case 0x1:
                        console.log('bitwiseOr');
                        this.bitwiseOr(x, y);
                        break;

                    case 0x2:
                        console.log('bitwiseAnd');
                        this.bitwiseAnd(x, y);
                        break;

                    case 0x3:
                        console.log('bitwiseXOR');
                        this.bitwiseXor(x, y);
                        break;

                    case 0x4:
                        console.log('addSetCarry');
                        this.addVYtoVX(x, y);
                        break;

                    case 0x5:
                        console.log('subtractSetBorrow');
                        this.subtractVYfromVX(x, y);
                        break;

                    case 0x6:
                        console.log('bitwiseShiftRight');
                        this.bitwiseShiftRight(x, y);
                        break;

                    case 0x7:
                        console.log('diffVX');
                        this.diffVX(x, y);
                        break;

                    case 0xE:
                        console.log('bitwiseShiftLeft');
                        this.bitwiseShiftLeft(x, y);
                        break;
                }
                break;

            case 0x9:
                console.log('skipifnotequalsVY');
                this.skipIfNotEqualsVY(x, y);
                break;

            case 0xA:
                console.log('setI');
                this.setI(addr);
                break;

            case 0xB:
                console.log('jump to I plus V0');
                this.jumpToPlus(addr);
                break;

            case 0xC:
                console.log('rand');
                this.setRand(x, byte);
                break;

            case 0xD:
                console.log('draw');
                this.drawSprite(x, y, nibble);
                break;

            case 0xE:
                switch (byte) {
                    case 0x9E:
                        console.log('skipIfPressed');
                        this.skipIfPressed(x);
                        break;

                    case 0xA1:
                        console.log('skipIfNotPressed');
                        this.skipIfNotPressed(x);
                        break;
                }
                break;

            case 0xF:
                switch (byte) {
                    case 0x07:
                        console.log('getDelay');
                        this.getDelay(x);
                        break;

                    case 0x0A:
                        console.log('waitForKey');
                        break;

                    case 0x15:
                        console.log('setDelay');
                        this.setDelay(x);
                        break;

                    case 0x18:
                        console.log('setSound');
                        this.setSound(x);
                        break;

                    case 0x1E:
                        console.log('addToI');
                        this.addToI(x);
                        break;

                    case 0x29:
                        console.log('setItoFont');
                        this.setFont(x);
                        break;

                    case 0x33:
                        console.log('storeBCD');
                        this.storeBCD(x);
                        break;

                    case 0x55:
                        console.log('storeV');
                        this.storeV(x);
                        break;

                    case 0x65:
                        console.log('fillV')
                        this.fillV(x);
                        break;
                }
                break;

        }

        if (this.delayTimer > 0) {
            --this.delayTimer;
        }
        if (this.soundTimer > 0) {
            --this.soundTimer;
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
    clearScreen: function() {
        for (var i = 0; i < this.screen.length; i++) {
            this.screen[i] = 0;
        }
        this.programCounter += 2;
    },

    // 00EE - Flow - Returns from a subroutine
    returnFromSubroutine: function () {
        this.programCounter = this.virtualStack[this.stackPointer];
        --this.stackPointer;
        this.programCounter += 2;
    },

    // 1NNN - Flow - Jumps to address NNN
    jumpTo: function (nnn) {
        this.programCounter = nnn;
    },
    // 2NNN - Flow - Calls subroutine at NNN
    callSubroutine: function (addr) {
        ++this.stackPointer;
        this.virtualStack[this.stackPointer] = this.programCounter;
        this.programCounter = addr;
    },

    // 3XNN - Cond - Skips the next instruction if VX equals NN
    skipIfEquals: function (vx, nn) {
        if (this.register[vx] === nn) {
            console.log('skip');
            this.programCounter += 4;
        } else {
            console.log('no skip');
            this.programCounter += 2;
        }
    },

    // 4XNN - Cond - Skips the next instruction if VX doesn't equal NN
    skipIfNotEquals: function (vx, nn) {
        if (this.register[vx] != nn) {
            console.log('skip');
            this.programCounter += 4;
        } else {
            console.log('no skip');
            this.programCounter += 2;
        }
    },

    // 5XY0 - Cond - Skips the next instruction if VX equals VY
    skipIfEqualsVY: function (vx, vy) {
        if (this.register[vx] === this.register[vy]) {
            console.log('skip');
            this.programCounter += 4;
        } else {
            console.log('no skip');
            this.programCounter += 2;
        }
    },

    // 6XNN - Const - Sets VX to NN
    setVX: function (vx, nn) {
        this.register[vx] = nn;
        console.log(this.register[vx]);
        this.programCounter += 2;
    },

    // 7XNN - Const - Adds NN to VX
    addToVX: function (vx, nn) {
        this.register[vx] += nn;
        console.log(this.register[vx]);
        this.programCounter += 2;
    },

    // 8XY0 - Assign - Sets VX to the value of VY
    assignVX: function (vx, vy) {
        this.register[vx] = this.register[vy];
        this.programCounter += 2;
    },

    // 8XY1 - BitOp - Sets VX to VX or VY (Bitwise OR operation)
    bitwiseOr: function (vx, vy) {
        this.register[vx] = this.register[vx] | this.register[vy];
        this.programCounter += 2;
    },

    // 8XY2 - BitOp - Sets VX to VX and VY (Bitwise AND operation)
    bitwiseAnd: function (vx, vy) {
        this.register[vx] &= this.register[vy];
        this.programCounter += 2;
    },

    // 8XY3 - BitOp - Sets VX to VX xor VY
    bitwiseXor: function (vx, vy) {
        this.register[vx] = this.register[vx] ^ this.register[vy];
        this.programCounter += 2;
    },

    // 8XY4 - Math - Adds VY to VX
    addVYtoVX: function (vx, vy) {
        var newVX = this.register[vx] - this.register[vy];
        if (newVX > 0xFF) {
            this.register[0xF] = 1;
        } else {
            this.register[0xF] = 0;
        }
        this.register[vx] = newVX & 0x0FF;
        this.programCounter += 2;
    },

    // 8XY5 - Math - VY is subtracted from VX
    subtractVYfromVX: function (vx, vy) {
        var newVX = this.register[vx] - this.register[vy];
        if (this.register[vx] > this.register[vy]) {
            this.register[0xF] = 1;
        } else {
            newVX += 256;
            this.register[0xF] = 0;
        }
        this.register[vx] = newVX;
        this.programCounter += 2;
    },

    // 8XY6 - BitOp - Shifts VX right by one
    bitwiseShiftRight: function (vx, vy) {
        this.register[0xF] = this.register[vx] & 0b1;
        this.register[vx] >>= 1;
        this.programCounter += 2;
    },

    // 8XY7 - Math - Sets VX to VY minus VX
    diffVX: function (vx, vy) {
        var newVX = this.register[vy] - this.register[vx];
        if (this.register[vx] <= this.register[vy]) {
            this.register[0xF] = 1;
        } else {
            newVX += 256;
            this.register[0xF] = 0;
        }
        this.register[vx] = newVX;
        this.programCounter += 2;
    },

    // 8XYE - BitOp - Shifts VX left by one
    bitwiseShiftLeft: function (vx, vy) {
        this.register[0xF] = this.register[vx] & 0b1;
        this.register[vx] <<= 1;
        this.register[vx] &= 0x0FF;
        this.programCounter += 2;
    },

    // 9XY0 - Cond - Skips the next instruction if VX doesn't equal VY
    skipIfNotEqualsVY: function (vx, vy) {
        if (this.register[vx] != this.register[vy]) {
            console.log('skip');
            this.programCounter += 4;
        } else {
            console.log('no skip');
            this.programCounter += 2;
        }
    },

    // ANNN - MEM - Sets I to the address 
    setI: function (addr) {
        this.addressRegister = addr;
        console.log(this.addressRegister);
        console.log(this.virtualMemory[this.addressRegister]);
        this.programCounter += 2;
    },

    // BNNN - Flow - Jumps to the address NNN plus V0
    jumpToPlus: function (nnn) {
        this.programCounter = this.register[0x0] + nnn;
    },

    // CXNN - Rand - Sets VX to the result of a bitwise and operation on a random number and NN
    setRand: function (vx, nn) {
        var random = new Uint8Array(1);
        window.crypto.getRandomValues(random);
        console.log(random);
        this.register[vx] = (random & nn);
        console.log(this.register[vx]);
        this.programCounter += 2;
    },

    // DXYN - Disp - Draws a sprite at coordinate (VX, VY) that has a width of 8 pixels and a height of N pixels
    drawSprite: function (vx, vy, height) {
        this.register[0xF] = 0;
        for (var y = 0; y < height; y++) {
            var sprite = this.virtualMemory[this.addressRegister + y];
            for (var x = 0; x < 8; x++) {
                if ((sprite & (0x80 >> x)) != 0) {
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
    skipIfPressed: function (vx) {
        if (this.keyPress[this.register[vx]] != 0) {
            console.log('skip');
            this.programCounter += 4;
        } else {
            console.log('no skip');
            this.programCounter += 2;
        }
    },

    // EXA1 - KeyOp - Skips the next instruction if the key stored in VX isn't pressed
    skipIfNotPressed: function (vx) {
        if (this.keyPress[this.register[vx]] == 0) {
            console.log('skip');
            this.programCounter += 4;
        } else {
            console.log('no skip');
            this.programCounter += 2;
        }
    },

    // FX07 - Timer - Sets VX to the value of the delay timer
    getDelay: function (vx) {
        this.register[vx] = this.delayTimer;
        console.log(this.register[vx]);
        this.programCounter += 2;
    },

    // FX0A - KeyOp - A key press is awaited, and then stored in VX

    // FX15 - Timer - Sets the delay timer to VX
    setDelay: function (vx) {
        this.delayTimer = this.register[vx];
        console.log(this.delayTimer);
        this.programCounter += 2;
    },

    // FX18 - Sound - Sets the sound timer to VX
    setSound: function (vx) {
        this.soundTimer = this.register[vx];
        console.log(this.soundTimer);
        this.programCounter += 2;
    },

    // FX1E - MEM - Adds VX to I
    addToI: function (vx) {
        this.addressRegister += this.register[vx];
        this.programCounter += 2;
    },

    // FX29 - MEM - Sets I to the location of the sprite for the character in VX
    setFont: function (vx) {
        this.addressRegister = fontSet[vx];
        console.log(fontSet[vx]);
        this.programCounter += 2;
    },

    // FX33 - BCD -	Stores the binary-coded decimal representation of VX
    storeBCD: function (vx) {
        console.log(this.register[vx]);
        this.virtualMemory[this.addressRegister] = Math.floor(this.register[vx] / 100);
        this.virtualMemory[this.addressRegister + 1] = Math.floor(this.register[vx] / 10) % 10;
        this.virtualMemory[this.addressRegister + 2] = this.register[vx] % 10;
        this.programCounter += 2;
    },

    // FX55 - MEM - Stores V0 to VX (including VX) in memory starting at address I
    storeV: function (vx) {
        for (var i = 0; i <= vx; i++) {
            this.virtualMemory[this.addressRegister + i] = this.register[i];
        }
        this.programCounter += 2;
    },

    // FX65 - MEM - Fills V0 to VX (including VX) with values from memory starting at address I
    fillV: function (vx) {
        for (var i = 0; i <= vx; i++) {
            this.register[i] = this.virtualMemory[this.addressRegister + i];
        }
        this.programCounter += 2;
    }
}