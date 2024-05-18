import { useState, useEffect, useRef } from 'react';
import { useHandler, sendData } from './network.js';
import tenuki from 'tenuki';
import './tenuki.css';

export default function Board ({color}) {
    const [won, _setWon] = useState(0);
    const boardRef = useRef(null);
    const [board, setBoard] = useState(null);

    useEffect( () => {
        if (boardRef.current && !board) {
            setBoard(new tenuki.Game({ element: boardRef.current, boardSize: 27, oob: [{x:2, y:1}] }))
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
        <div className="tenuki-board" ref={boardRef}>
        </div>
    </>;
}
