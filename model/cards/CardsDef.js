let CardsDef = {}
CardsDef.cards = [
    0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, // diamond 2 ~ A
    0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, // club 2 ~ A
    0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x2b, 0x2c, 0x2d, 0x2e, // heart 2 ~ A
    0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x3b, 0x3c, 0x3d, 0x3e, // spade 2 ~ A
    0x4e, // (Small Joker)
    0x4f, // (Big Joker)
]

CardsDef.SMALL_JOKER = 0x4e
CardsDef.BIG_JOKER = 0x4f
CardsDef.ACE_VALUE = 14
CardsDef.KING_VALUE = 13
CardsDef.TWO_VALUE = 2

CardsDef.VARIETY_DIAMOND = 0 // 方块
CardsDef.VARIETY_CLUB    = 1 // 梅花
CardsDef.VARIETY_HEART   = 2 // 红桃
CardsDef.VARIETY_SPADE   = 3 // 黑桃
CardsDef.VARIETY_JOKER   = 4 // Joker牌(0x4e小王; 0x4f大王)

module.exports = CardsDef