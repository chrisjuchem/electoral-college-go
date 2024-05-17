const Chess = require("chess.js");

export function empty(fen, color){
    fen = fen.split(' ');
    fen[0] = '8/8/8/8/8/8/8/8';
    if (color) fen[1] = color[0];
    return fen.join(' ');
}

export function asColor(fen, color) {
    fen = fen.split(' ');
    fen[1] = color[0];
    return fen.join(' ');
}

export function asOtherColor(fen) {
    fen = fen.split(' ');
    fen[1] = fen[1] === 'w' ? 'b' : 'w';
    return fen.join(' ');
}

export function processMoves(fen, moves) {
    const rules = new Chess(fen);

    fen = fen.split(' ');

    const en_passants = [];

    moves.forEach(mv => {
        if (mv) {
            rules.remove(mv.from);
            rules.put({color: mv.color, type: mv.promotion || mv.piece}, mv.to);

            // en passant
            // if (mv.flags.includes('b')) {
            //     fen[3] = mv.to.replace('4', '3').replace('5', '6'); //TODO handle double push
            // }
            if (mv.flags.includes('e')) {
                en_passants.push(mv.to.replace('3', '4').replace('6', '5'));
            }

            //castling
            if (mv.flags.includes("k") || mv.flags.includes("q")) {
                const rank = mv.color === 'w' ? '1' : '8';
                const [rkFrom, rkTo] = mv.flags.includes("k") ? ['h', 'f'] : ['a', 'd'];
                rules.remove(rkFrom+rank);
                rules.put({color: mv.color, type: 'r'}, rkTo+rank);
            }
            //remove castling privledge
            if ((mv.color === 'w' && mv.piece === 'k') || [mv.from, mv.to].includes('a1')) {
                fen[2] = fen[2].replace('Q', '');
            }
            if ((mv.color === 'w' && mv.piece === 'k') || [mv.from, mv.to].includes('h1')) {
                fen[2] = fen[2].replace('K', '');
            }
            if ((mv.color === 'b' && mv.piece === 'k') || [mv.from, mv.to].includes('a8')) {
                fen[2] = fen[2].replace('q', '');
            }
            if ((mv.color === 'b' && mv.piece === 'k') || [mv.from, mv.to].includes('h8')) {
                fen[2] = fen[2].replace('k', '');
            }
            if (!fen[2]) {
                fen[2] = '-';
            }
        }
    })

    en_passants.forEach(ep => rules.remove(ep));

    const fen2 = rules.fen().split(' ');

    return [fen2[0], ...fen.slice(1)].join(' ');
}
