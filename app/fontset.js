/**
 * CHIP-8 in-memory fontset.
 * (http://www.multigesture.net/articles/how-to-write-an-emulator-chip-8-interpreter/)
 *
 * All CHIP-8 emulators contain an in-memory fontset for drawing the
 * set of hex characters. These sprites are represented as bitmaps
 * and have a width of 4 and height of 5 pixels. The following shows
 * how these bitmaps map to, for example, the sprites '0' and '7'.
 */

// DEC   HEX    BIN         RESULT    DEC   HEX    BIN         RESULT
// 240   0xF0   1111 0000    ****     240   0xF0   1111 0000    ****
// 144   0x90   1001 0000    *  *      16   0x10   0001 0000       *
// 144   0x90   1001 0000    *  *      32   0x20   0010 0000      *
// 144   0x90   1001 0000    *  *      64   0x40   0100 0000     *
// 240   0xF0   1111 0000    ****      64   0x40   0100 0000     *

var fontSet = [
  0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
  0x20, 0x60, 0x20, 0x20, 0x70, // 1
  0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
  0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
  0x90, 0x90, 0xF0, 0x10, 0x10, // 4
  0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
  0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
  0xF0, 0x10, 0x20, 0x40, 0x40, // 7
  0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
  0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
  0xF0, 0x90, 0xF0, 0x90, 0x90, // A
  0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
  0xF0, 0x80, 0x80, 0x80, 0xF0, // C
  0xE0, 0x90, 0x90, 0x90, 0xE0, // D
  0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
  0xF0, 0x80, 0xF0, 0x80, 0x80, // F
];

// Example access to sprite bitmap for 'F':
//console.log(fontSet[0xF]);
