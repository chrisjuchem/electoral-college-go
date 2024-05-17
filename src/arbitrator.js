import * as Fen from './fen.js'
const Chess = require('chess.js');

function rulesMove(move) {
    return {from: move.orig, to: move.dest, promotion: 'q'}
}

export default function arbitrate(moves, fen) {
    const rulesW = new Chess(Fen.asColor(fen, 'w'));
    const rulesB = new Chess(Fen.asColor(fen, 'b'));

    let moveW, moveB, flipped;
    if (rulesW.get(moves[0].orig).color === 'w') {
        [moveW, moveB] = moves;
        flipped = false;
    } else {
        [moveB, moveW] = moves;
        flipped = true;
    }

    if (moves.length === 0) return [null, null];
    if (moves.length === 1) {
        const rules = rulesW.get(moves[0].orig).color === 'w' ? rulesW : rulesB;
        return [rules.move(rulesMove(moves[0]), {legal: false}), null];
    }


    // TODO re add for knights
    // // disallow swapping places
    // if (moveW.orig === moveB.dest && moveB.orig === moveW.dest &&
    //     rulesW.get(moveW.orig).type !== 'n') return [false, false];

    //{legal: false} allows moving while in check
    const resW1 = rulesW.move(rulesMove(moveW), {legal: false});
    rulesW.set_turn('b');
    const resB2 = rulesW.move(rulesMove(moveB), {legal: false});

    const resB1 = rulesB.move(rulesMove(moveB), {legal: false});
    rulesB.set_turn('w');
    const resW2 = rulesB.move(rulesMove(moveW), {legal: false});


    // disallow landing on the same square
    // TODO if it leads to conflicting results
    if (moveW.dest === moveB.dest) return [false, false];

    return flipped ? [resB2, resW2] : [resW2, resB2];
}
