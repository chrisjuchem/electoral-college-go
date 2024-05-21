import { useState, useEffect, useRef, useCallback } from 'react';
import { useHandler, sendData } from './network.js';
import tenuki from 'tenuki';
import './tenuki.css';
import { map, states, tints } from "./map.js";

function calcScore(board) {
    let control = {};
    Object.keys(states).forEach(state => control[state] = {white:0, black:0, empty:0, wPts:0, bPts:0})

    if (board) {
        let territory = board.territory();
        for (let y = 0; y < 39; y++) {
            for (let x = 0; x < 39; x++) {
                const state = map[y][x];
                if (state === "  ") {
                    continue;
                }
                let color = "empty";
                const matcher = (pt => pt.y === y && pt.x === x);
                if (territory.white.find(matcher)) {
                    color = "white";
                } else if (territory.black.find(matcher)) {
                    color = "black";
                }
                if (color === "empty") {
                    color = board.intersectionAt(y, x).value
                }

                control[state][color] += 1
            }
        }
    }


    let wPts=10, bPts=0; // white komi = AK(3) + HI(4) + DC(3)
    for (let state in states) {
        if (control[state].white > control[state].black) {
            control[state].wPts += states[state].points;
            wPts += states[state].points;
        } else if (control[state].black > control[state].white) {
            control[state].bPts += states[state].points;
            bPts += states[state].points;
        } else {
            control[state].wPts += states[state].points / 2;
            wPts += states[state].points / 2;
            control[state].bPts += states[state].points / 2;
            bPts += states[state].points / 2;
        }
    }

    return [wPts, bPts, control]
}

export default function Board ({color}) {
    const boardRef = useRef(null);

    const [board, setBoard] = useState(null);
    const [wPts, bPts, control] = calcScore(board);

    const [[hovY, hovX], setHovered] = useState([0,0]);
    const hoveredState = states[map[hovY][hovX]];

    const [ourTurn, setOurTurn] = useState(color === "black");

    useHandler("move", useCallback((move) => {
        if (ourTurn) return console.error("received move on our turn");

        if (move.pass) {
            board.receivePass();
        } else {
            if (!move.y || !move.x || move.y < 0 || move.y >= 39 || move.x < 0 || move.x >= 39) {
                return console.error("bad move:", move)
            }
            board.receivePlay(move.y, move.x);
        }
        setOurTurn(true);
    }, [board, ourTurn, setOurTurn]));

    useHandler("markDead", (move) => {
        if (!move.y || !move.x || move.y < 0 || move.y >= 39 || move.x < 0 || move.x >= 39) {
            return console.error("bad move:", move)
        }
        board.receiveMarkDeadAt(move.y, move.x);
        setOurTurn(turn => !turn); // hack: trigger re-render of score
    }, [board, setOurTurn]);

    useEffect(() => {
        if (boardRef.current && !board) {
            let oob = [];
            for (let y = 0; y < 39; y++) {
                for (let x = 0; x < 39; x++) {
                    if (map[y][x] === "  ") {
                        oob.push({x:x, y:y})
                    }
                }
            }
            let b = new tenuki.Client({
                player: color,
                element: boardRef.current,
                gameOptions:{
                    scoring: "area",
                    boardSize: 39,

                    oob: oob,
                    tints: tints,
                },
                hooks: {
                    submitPlay: function(y, x, result) {
                        sendData("move", {y: y, x: x});
                        setOurTurn(false);
                        result(true);
                    },
                    submitMarkDeadAt: function(y, x, stones, result) {
                        sendData("markDead", {y: y, x: x});
                        setOurTurn(turn => !turn); // hack: trigger re-render of score
                        result(true);
                    },
                    submitPass: function(result) {
                        sendData("move", {pass: true});
                        setOurTurn(false);
                        result(true);
                    }
                }
            });

            const oldHoverHook = b._game.renderer.hooks.hoverValue;
            b._game.renderer.hooks.hoverValue = function(y, x) {
                setHovered([y, x]);
                return oldHoverHook(y, x);
            }

            setBoard(b);
        }
    }, [boardRef.current, board]);

    let statusString = "";
    if (board && board.isOver()) {
        statusString = `W ${wPts} - ${bPts} B`;
    } else if (!ourTurn) {
        statusString = "Waiting for opponent to play...";
    } else if (board && board._game._moves[board._game._moves.length - 1]?.pass) {
        statusString = "Opponent passed.";
    }
    const colorString = `You are playing as ${color}.`;

    let infoString = "";
    if (hoveredState) {
        infoString = `${hoveredState.name} (${hoveredState.points} pts.) - `;

        const score = control[map[hovY][hovX]];
        infoString += `${score.wPts? " W+"+score.wPts : ""} ${score.bPts? " B+"+score.bPts : ""}`;
        infoString += ` (W ${score.white}-${score.black} B)`;
    }

    // must have `tenuki-board` class for css to work
    return <>
        <div className = "statusinfo info"> {statusString} </div>
        <div className = "colorinfo info"> {colorString} </div>

        <div className="board tenuki-board" ref={boardRef}/>

        <button onClick={(e) => { board && board.pass() }} disabled={!ourTurn && board && !board.isOver()}> Pass </button>
        <div className = "stateinfo info"> {infoString} </div>
    </>;
}
