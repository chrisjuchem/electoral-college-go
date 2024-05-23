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

    let usPts = wPts, themPts = bPts, us="W", them="B";
    if (color === "black") {
        usPts = bPts;
        themPts = wPts;
        us="B";
        them="W";
    }

    const [[hovY, hovX], setHovered] = useState([0,0]);
    const hoveredState = states[map[hovY][hovX]];

    const [ourTurn, setOurTurn] = useState(color === "black");
    const [gameOver, setGameOver] = useState(false);
    const [undoRequested, setUndoRequested] = useState(false);

    const [acceptedScore, setAcceptedScore] = useState(false);
    const [acceptTimeout, setAcceptTimeout] = useState(null);
    const [oppAcceptedScore, setOppAcceptedScore] = useState(false);

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
        setUndoRequested(false);
    }, [board, ourTurn, setOurTurn]));

    useHandler("markDead", (move) => {
        if (!move.y || !move.x || move.y < 0 || move.y >= 39 || move.x < 0 || move.x >= 39) {
            return console.error("bad move:", move)
        }
        board.receiveMarkDeadAt(move.y, move.x);
        setOurTurn(turn => !turn); // hack: trigger re-render of score
        setAcceptedScore(false);
        setOppAcceptedScore(false);

        clearTimeout(acceptTimeout);
        setAcceptTimeout(setTimeout(() => setAcceptTimeout(null), 1500));;
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
                        result(true);
                        setOurTurn(false);
                        setUndoRequested(false);
                    },
                    submitMarkDeadAt: function(y, x, stones, result) {
                        result(true);
                        sendData("markDead", {y: y, x: x});
                        setOurTurn(turn => !turn); // hack: trigger re-render of score
                        setAcceptedScore(false);
                        setOppAcceptedScore(false);
                    },
                    submitPass: function(result) {
                        result(true);
                        sendData("move", {pass: true});
                        setOurTurn(false);
                        setUndoRequested(false);
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
    }, [boardRef, board, color]);

    const processUndo = useCallback(() => {
        setUndoRequested(false);
        setOurTurn(turn => !turn);
        board._game.undo();
    }, [board, setUndoRequested, setOurTurn]);

    const requestUndo = useCallback(() => {
        setUndoRequested(true);
        sendData("undo", "requested");
    }, [setUndoRequested]);

    const grantUndo = useCallback(() => {
        sendData("undo", "granted");
        processUndo();
    }, [processUndo]);

    useHandler("undo", useCallback(status => {
        if (status === "requested") {
            setUndoRequested(true);
        } else if (status === "granted") {
            if (!undoRequested || ourTurn) { return console.error("Undo granted when not requested!"); }
            processUndo();
        } else {
            console.error("bad undo message:", status)
        }
    }, [setUndoRequested, processUndo, undoRequested, ourTurn]));

    const resumePlay = useCallback(() => {
        board._game._moves.pop();
        let turn = board._game._moves.pop().color;
        board._game.render();
        setOurTurn(turn => !turn); // force rerender
        setOurTurn(turn === color);
    }, [color, board, setOurTurn]);

    useHandler("accept", useCallback((acc) => {
        if (!board.isOver()) { return console.error("Cannot accept in-progress game."); }
        if (gameOver) { return console.error("Cannot accept finished game."); }
        if (acc) {
            setOppAcceptedScore(true);
        } else {
            resumePlay();
        }
    }, [resumePlay, board, gameOver, setOppAcceptedScore]));
    useEffect(() => {
        if (acceptedScore && oppAcceptedScore) {
            setGameOver(true);
        }
    }, [acceptedScore, oppAcceptedScore, setGameOver])


    let statusString = "";
    if (gameOver) {
        if (usPts > themPts) {
            statusString = "You won!";
        } else if (usPts < themPts) {
            statusString = "You lost!";
        } else {
            statusString = "Draw!";
        }
    } else if (board && board.isOver() && !acceptedScore) {
        statusString = "Mark the dead stones.";
    } else if (!ourTurn) {
        statusString = "Waiting for opponent...";
    } else if (board && board._game._moves[board._game._moves.length - 1]?.pass) {
        statusString = "Opponent passed.";
    } else if (undoRequested) {
        statusString = "Opponent requested an undo.";
    }

    let colorString = `You are playing as ${color}.`;
    if (board && board.isOver()) {
       colorString = `${us} ${usPts} - ${themPts} ${them}`;
    }

    let infoString = "";
    if (hoveredState) {
        infoString = `${hoveredState.name} (${hoveredState.points} pts.) - `;

        const score = control[map[hovY][hovX]];
        const other = color === "white" ? "black" : "white";
        const ourPts = color === "white" ? score.wPts : score.bPts;
        const theirPts = color === "white" ? score.bPts: score.wPts;

        infoString += `${ourPts ? ` ${us}+${ourPts}` : ""} ${theirPts? ` ${them}+${theirPts}` : ""}`;
        infoString += ` (${us} ${score[color]}-${score[other]} ${them})`;
    }

    // must have `tenuki-board` class for css to work
    return <>
        <div className = "statusinfo info"> {statusString} </div>
        <div className = "colorinfo info"> {colorString} </div>

        <div className="board tenuki-board" ref={boardRef}/>

        <div className="button-row">
            {board && !board.isOver() && <button
                    onClick={(e) => { board && board.pass() }}
                    disabled={!ourTurn}
                > Pass </button>}
            {board && !board.isOver() && <button
                    onClick={(e) => { if (ourTurn) { grantUndo(); } else { requestUndo(); } }}
                    disabled={(ourTurn && !undoRequested) || board._game._moves.length < 1}
                > { undoRequested
                    ? ourTurn ? "Grant Undo" : "Undo Requested!"
                    : "Request Undo"} </button>}
            {board && board.isOver() && !gameOver && <button
                onClick={ (e) => { sendData("accept", true); setAcceptedScore(true); setOurTurn(false); }}
                disabled={acceptedScore || acceptTimeout}
            > Accept Score </button>}
            {board && board.isOver() && !gameOver && <button
                onClick={ (e) => { sendData("accept", false); resumePlay(); }}
            > Resume Play </button>}
        </div>
        <div className = "stateinfo info"> {infoString} </div>
    </>;
}
