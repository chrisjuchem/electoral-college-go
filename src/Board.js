import Chessground from '@react-chess/chessground';
import { useEffect, useState, useMemo, useCallback } from 'react';
import arbitrate from './arbitrator.js';
import * as Fen from './fen.js';
import { useHandler, sendData } from './network.js';
const Chess = require('chess.js');

const BRUSHES = {
    valid:{
        key: 'valid',
        color:'black',
        lineWidth:8,
    },
    invalid:{
        key: 'invalid',
        color:'red',
        lineWidth:8,
    },
    submitted:{
        key: 'submitted',
        color:'green',
        lineWidth:8,
    },
};
const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const ALL_SQUARES = "abcdefgh".split('').map(a => "12345678".split('').map(n => a+n)).flat()

export default function Board ({color}) {
    const [fen, setFen] = useState(Fen.asColor(STARTING_FEN, color));
    useEffect(() => setFen(Fen.asColor(STARTING_FEN, color)), [color]);

    const [moves, setMoves] = useState([[]]); // {orig, dest, status}
    const [submitted, setSubmitted] = useState(false);
    const [oppHash, setOppHash] = useState(false);
    const [oppMoveStr, setOppMoveStr] = useState(false);

    const [rules, validMoves] = useMemo(() => {
        const rules = new Chess(fen);
        const allowedmoves = new Map(ALL_SQUARES.map(sq => {
            const piece = rules.get(sq);
            if (!piece) return [sq, []];
            const emptyRules = new Chess(Fen.empty(fen, piece.color));
            emptyRules.put(piece, sq);
            if (piece.type == 'p') { //enable pawn captures
                const baseIndex = ALL_SQUARES.indexOf(sq);
                [7, 9, -7, -9].forEach(offset => {
                    emptyRules.put({type:'p', color:piece.color==='w'?'b':'w'}, ALL_SQUARES[baseIndex + offset]);
                })
            }
            const choices = emptyRules.moves({square:sq, verbose:true, legal:false}).map(m=>m.to);
            const previousMove = (moves.at(-2) || []).filter(mv => mv.orig === sq).map(mv => mv.dest);
            return [sq, choices.filter(to => !previousMove.includes(to))];
        }));
        return [rules, allowedmoves];
    }, [fen, moves]);
    const moveColor = useCallback((mv)=> rules.get(mv.orig)?.color, [rules])

    const sendFullMove = useCallback((moveStr) => sendData("move", moveStr), [])

    const myCurrentMove = (mvs) =>
        mvs.at(-1).filter(m => moveColor(m) === color[0]).map(m=>({...m, status:"valid"}))[0];
    const submitMove = () => {
        const move = myCurrentMove(moves);
        const moveStr = "noise"+"=="+move.orig+"=="+move.dest+"=="+"noise"
        const hash = "AAA";
        setSubmitted({move, moveStr, hash})

        // remove opp moves
        setMoves(mvs => [
            ...mvs.slice(0, -1),
            [myCurrentMove(mvs)],
        ]);

        sendData("submit", hash);

        if (oppHash) sendFullMove(moveStr);
    };

    useHandler("submit", useCallback((hash) => {
        if (oppHash) return console.error("recieved double move");
        if (!hash) return console.error("submit missing hash");

        setOppHash(hash);

        if (submitted) sendFullMove(submitted.moveStr);
    }, [submitted, oppHash, sendFullMove]));

    useHandler("move", setOppMoveStr);

    const processMoves = useCallback((moves, commit=false) => {
        //validate rules
        const results = arbitrate(moves, fen);

        moves.forEach((mv, i) => {
            const res = results[i]
            if (res) {
                mv.san = res.san;
                mv.status = commit ? 'valid' : 'submitted';
            } else {
                mv.status = 'invalid';
            }
        });

        if (commit) {
            setFen(Fen.processMoves(fen, results));
            setMoves(mvs => [
                ...mvs.slice(0, -1),
                moves,
                []
            ]);
    
            setSubmitted(false);
            setOppHash(false);
            setOppMoveStr(false);
        } else {
            setMoves(mvs => [
                ...mvs.slice(0, -1),
                moves,
            ]);
        }

    }, [fen]);
    
    useEffect(() => {
        if (!oppMoveStr) return;

        // if (hash(moveStr) !== oppSubmitted) {
        if ("AAA" !== oppHash) return console.error("hash mismatch", oppHash);
        const parts = oppMoveStr.split("==");
        if (parts.length !== 4) return console.error("invalid move string");
        const [orig, dest] = parts.slice(1,3);
        const oppMove = {orig, dest};
        const myMove = submitted.move;
  
        processMoves([myMove, oppMove], true);
    }, [submitted, oppMoveStr, oppHash, processMoves])

    const ourKingExists = fen.split(' ')[0].includes(color[0] === 'w' ? 'K' : 'k');
    const oppKingExists = fen.split(' ')[0].includes(color[0] === 'w' ? 'k' : 'K');
    console.log(fen.split(' ')[0], ourKingExists, oppKingExists)
    let winString;
    if (!ourKingExists && !oppKingExists) {
        winString = "The game is a draw!"
    } else if (!ourKingExists) {
        winString = "You lost!"
    } else if (!oppKingExists) {
        winString = "You won!"
    }

    return <>
        {winString}
        <div className="board">
            <Chessground contained={true} config={{
                key:'diplomacy-chess',
                fen,
                orientation: color === 'random' ? 'white' : color,
                turnColor: color,
                lastMove: (moves.at(-2) || []).map(
                    (mv) => mv.status === "valid" ? [mv.orig, mv.dest] : [mv.orig]
                ).flat(),
                animation: {
                    enabled: false,
                    // duration: 50,
                },
                movable: {
                    free: false,
                    color: (submitted.move || color === 'random' || winString) ? undefined : 'both',
                    dests: validMoves,
                    // showDests: false,
                    events: {
                        after: (orig, dest, _metadata) => processMoves(
                            [
                                ...moves.at(-1).filter(m => (
                                    // remove moves by same color
                                    moveColor(m) !== moveColor({orig})
                                )),
                                {orig, dest, status:'submitted'},
                            ],
                        ),
                    },
                },

                drawable:{
                    enabled: false,
                    brushes:BRUSHES,
                    autoShapes: (
                        moves.at(-1).length ? moves.at(-1) : (moves.at(-2) || [])
                    ).map(({orig, dest, status}) => ({orig, dest, brush:status})),
                },
            }}/>
        </div>
        <button onClick={submitMove} disabled={!myCurrentMove(moves) || submitted}> Submit </button>
    </>;
}
