let MyByteMap = {}

MyByteMap.SocketDecode = [
  0x29,0x23,0xBE,0x84,0xE1,0x6C,0xD6,0xAE,0x52,0x90,0x49,0xF1,0xBB,0xE9,0xEB,0xB3,
  0xA6,0xDB,0x3C,0x87,0x0C,0x3E,0x99,0x24,0x5E,0x0D,0x1C,0x06,0xB7,0x47,0xDE,0x12,
  0x4D,0xC8,0x43,0x8B,0x1F,0x03,0x5A,0x7D,0x09,0x38,0x25,0x5D,0xD4,0xCB,0xFC,0x96,
  0xF5,0x45,0x3B,0x13,0x89,0x0A,0x32,0x20,0x9A,0x50,0xEE,0x40,0x78,0x36,0xFD,0xF6,
  0x9E,0xDC,0xAD,0x4F,0x14,0xF2,0x44,0x66,0xD0,0x6B,0xC4,0x30,0xA1,0x22,0x91,0x9D,
  0xDA,0xB0,0xCA,0x02,0xB9,0x72,0x2C,0x80,0x7E,0xC5,0xD5,0xB2,0xEA,0xC9,0xCC,0x53,
  0xBF,0x67,0x2D,0x8E,0x83,0xEF,0x57,0x61,0xFF,0x69,0x8F,0xCD,0xD1,0x1E,0x9C,0x16,
  0xE6,0x1D,0xF0,0x4A,0x77,0xD7,0xE8,0x39,0x33,0x74,0xF4,0x9F,0xA4,0x59,0x35,0xCF,
  0xD3,0x48,0x75,0xD9,0x2A,0xE5,0xC0,0xF7,0x2B,0x81,0x0E,0x5F,0x00,0x8D,0x7B,0x05,
  0x15,0x07,0x82,0x18,0x70,0x92,0x64,0x54,0xCE,0xB1,0x85,0xF8,0x46,0x6A,0x04,0x73,
  0x2F,0x68,0x76,0xFA,0x11,0x88,0x79,0xFE,0xD8,0x28,0x0B,0x60,0x3D,0x97,0x27,0x8A,
  0xC2,0x08,0xA5,0xC1,0x8C,0xA9,0x95,0x9B,0xA8,0xA7,0x86,0xB5,0xE7,0x55,0x4E,0x71,
  0xE2,0xB4,0x65,0x7A,0x63,0x26,0xDF,0x6D,0x62,0xE0,0x34,0x3F,0xE3,0x41,0x0F,0x1B,
  0xF3,0xA0,0x7F,0xAA,0x5B,0xB8,0x3A,0x10,0x4C,0xEC,0x31,0x42,0x7C,0xE4,0x21,0x93,
  0xAF,0x6F,0x01,0x17,0x56,0xC6,0xF9,0x37,0xBD,0x6E,0x5C,0xC3,0xA3,0x98,0xC7,0xB6,
  0x51,0x19,0x2E,0xBC,0x94,0x4B,0x58,0xD2,0xAC,0x1A,0xA2,0xED,0xFB,0xDD,0xBA,0xAB
]

MyByteMap.SocketEncode = [
  0x8C,0xE2,0x53,0x25,0x9E,0x8F,0x1B,0x91,0xB1,0x28,0x35,0xAA,0x14,0x19,0x8A,0xCE,
  0xD7,0xA4,0x1F,0x33,0x44,0x90,0x6F,0xE3,0x93,0xF1,0xF9,0xCF,0x1A,0x71,0x6D,0x24,
  0x37,0xDE,0x4D,0x01,0x17,0x2A,0xC5,0xAE,0xA9,0x00,0x84,0x88,0x56,0x62,0xF2,0xA0,
  0x4B,0xDA,0x36,0x78,0xCA,0x7E,0x3D,0xE7,0x29,0x77,0xD6,0x32,0x12,0xAC,0x15,0xCB,
  0x3B,0xCD,0xDB,0x22,0x46,0x31,0x9C,0x1D,0x81,0x0A,0x73,0xF5,0xD8,0x20,0xBE,0x43,
  0x39,0xF0,0x08,0x5F,0x97,0xBD,0xE4,0x66,0xF6,0x7D,0x26,0xD4,0xEA,0x2B,0x18,0x8B,
  0xAB,0x67,0xC8,0xC4,0x96,0xC2,0x47,0x61,0xA1,0x69,0x9D,0x49,0x05,0xC7,0xE9,0xE1,
  0x94,0xBF,0x55,0x9F,0x79,0x82,0xA2,0x74,0x3C,0xA6,0xC3,0x8E,0xDC,0x27,0x58,0xD2,
  0x57,0x89,0x92,0x64,0x03,0x9A,0xBA,0x13,0xA5,0x34,0xAF,0x23,0xB4,0x8D,0x63,0x6A,
  0x09,0x4E,0x95,0xDF,0xF4,0xB6,0x2F,0xAD,0xED,0x16,0x38,0xB7,0x6E,0x4F,0x40,0x7B,
  0xD1,0x4C,0xFA,0xEC,0x7C,0xB2,0x10,0xB9,0xB8,0xB5,0xD3,0xFF,0xF8,0x42,0x07,0xE0,
  0x51,0x99,0x5B,0x0F,0xC1,0xBB,0xEF,0x1C,0xD5,0x54,0xFE,0x0C,0xF3,0xE8,0x02,0x60,
  0x86,0xB3,0xB0,0xEB,0x4A,0x59,0xE5,0xEE,0x21,0x5D,0x52,0x2D,0x5E,0x6B,0x98,0x7F,
  0x48,0x6C,0xF7,0x80,0x2C,0x5A,0x06,0x75,0xA8,0x83,0x50,0x11,0x41,0xFD,0x1E,0xC6,
  0xC9,0x04,0xC0,0xCC,0xDD,0x85,0x70,0xBC,0x76,0x0D,0x5C,0x0E,0xD9,0xFB,0x3A,0x65,
  0x72,0x0B,0x45,0xD0,0x7A,0x30,0x3F,0x87,0x9B,0xE6,0xA3,0xFC,0x2E,0x3E,0xA7,0x68
]

module.exports = MyByteMap;
