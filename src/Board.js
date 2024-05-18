import { useState, useEffect, useRef } from 'react';
import { useHandler, sendData } from './network.js';
import tenuki from 'tenuki';
import './tenuki.css';
import { map, states, tints } from "./map.js";


export default function Board ({color}) {
    const [won, _setWon] = useState(0);
    const boardRef = useRef(null);
    const [board, setBoard] = useState(null);

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
            setBoard(new tenuki.Game({ element: boardRef.current, boardSize: 39, oob: oob, tints: tints}))
        }
    }, [boardRef.current, board])

    let winString;
    if (won === -1) {
        winString = "You lost!"
    } else if (won === 1) {
        winString = "You won!"
    }

    // must have `tenuki-board` class for css to work
    return <>
        {winString}
        <div className="board tenuki-board" ref={boardRef}>
        </div>
    </>;
}
