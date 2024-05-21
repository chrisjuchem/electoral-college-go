import { useState, useEffect, useRef } from 'react';
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


    let wPts=10, bPts=0; // komi
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
    const [won, _setWon] = useState(0);
    const boardRef = useRef(null);

    const [board, setBoard] = useState(null);
    const [wPts, bPts, control] = calcScore(board);

    const [[hovY, hovX], setHovered] = useState([0,0]);
    const hoveredState = states[map[hovY][hovX]];

    useEffect( () => {
        if (boardRef.current && !board) {
            let oob = [];
            for (let y = 0; y < 39; y++) {
                for (let x = 0; x < 39; x++) {
                    if (map[y][x] === "  ") {
                        oob.push({x:x, y:y})
                    }
                }
            }
            let b = new tenuki.Game({
                element: boardRef.current,
                scoring: "area",
                boardSize: 39,
                komi: 10, // AK(3) + HI(4) + DC(3)

                oob: oob,
                tints: tints,
            });

            const oldhook = b.renderer.hooks.hoverValue;
            b.renderer.hooks.hoverValue = function(y, x) {
                setHovered([y, x]);
                return oldhook(y, x);
            }

            setBoard(b);
        }
    }, [boardRef.current, board])

    function pass(e) {
        board.pass();
        setBoard(board);
    }

    let winString;
    if (won === -1) {
        winString = "You lost!"
    } else if (won === 1) {
        winString = "You won!"
    }

    let scoreString = "";
    if (board && board.isOver()) {
       scoreString = `W ${wPts} - ${bPts} B`;
    }

    let infoString = "";
    if (hoveredState) {
        infoString = `${hoveredState.name} (${hoveredState.points} pts.) - `;

        const score = control[map[hovY][hovX]];
        infoString += `${score.wPts? " W+"+score.wPts : ""} ${score.bPts? " B+"+score.bPts : ""}`;
        infoString += ` (W ${score.white}-${score.black} B)`;
    }

    // must have `tenuki-board` class for css to work
    return <>
        <div className = "scoreinfo info"> {scoreString} </div>

        <div className="board tenuki-board" ref={boardRef}/>

        <button onClick={pass} disabled={false}> Pass </button>
        <div className = "stateinfo info"> {infoString} </div>
    </>;
}
