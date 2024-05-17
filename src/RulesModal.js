
import { useState } from 'react';

function Modal ({close, children}) {
    return <div className="modalBg" onClick={close}>
        <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="closeModal" onClick={close}> &times; </div>
            <div className="modalContent">
                {children}
            </div>
        </div>
    </div>;
}

const PANELS = [
    {
        text: [
            "Diplomacy Chess is a chess variant based on the movement in the strategy game Diplomacy.",
            "In Diplomacy, all players submit moves secretly at the same time, and then all moves are revealed and executed.",
        ],
        images: ["intro"]
    },
    {
        text: [
            "To input a move, either drag the piece to where you want to move it, or click/tap a piece "+
                "to select it and then click/tap the square you want to move it to.",
            'You can change your move by inputting another move until you press "Submit". When you submit '+
            "your move, the arrow will turn from green to black."],
        images: ["move2", "move1"]
    },
    {
        text: ["Once both players have submitted their moves, the moves will be shown to both players."],
        images: ["submit"]
    },
    {
        text: [
            "Be careful! Your opponent can interfere with your moves to prevent them from happening.",
            "For example, if a piece gets captures, it cannot move.",
            "Prevented moves will always appear in red. Before you submit your move, you can input moves " +
            "for your opponent to see if either move would prevent the other."
        ],
        images: ["capture1", "capture2"]
    },
    {
        text: [
            "In general, for a move to be valid, it must be possible to make that if move if the other player moved first.",
            "Here, the knight cannot move because it would be captured if the pawn moved first, "+
            "but the pawn cannot move because if the knight moved first, there would be no piece to capture diagonally.",
        ],
        images: ["pawncapture"]
    },
    {
        text: [
            "Here, both bishops cannot move because they would already be captured if they moved second.",
            "The same move cannot be made twice in a row. All players must now chose a different move, but " +
            "after that move, they can try the original move again.",
        ],
        images: ["bishopcapture"]
    },
    {
        text: [
            "If you can predict where your opponent wants to move, you can prevent their move by blocking it.",
            "This tactic can sometimes be helpful when two pieces can capture each other from a distance. "+
            "After the moves on the second board, we now threaten to capture our opponent's bishop without them "+
            "threatening ours, since their capturing move cannot be repeated yet.",
        ],
        images: ["block2", "block3"]
    },
    {
        text: [
            "You are allowed to submit moves that look illegal. If your opponent's move causes yours to "+
            "become legal, then it will not be prevented!"
        ],
        images: ["illegal1", "illegal2"],
    },
    {
        text: [
            "Two pieces moving to the same square always prevent each other from moving.",
            "This tactic can be used to defend your pieces. Now that our opponent must chose a different move, "+
            "we can even push our threatened pawn without worry of it being captured first.",
        ],
        images: ["duel1", "duel2"]
    },
    {
        text: [
            "There is no check or checkmate in Diplomacy Chess. The game ends when the king is captured.",
            "You can even castle through, out of, or into check!"
        ],
        images: ["check","checkcastle"]
    },
    {
        text: [
            "En passant moves are possible, but only if you can predict when your opponent will push their pawn.",
            "Since the en-passant capture on the second board would happen after black's next move, it will be too late."
        ],
        images: ["enpassant1","enpassant2"]
    }
];

function Rules () {
    let [panel, setPanel] = useState(0);
    let info = PANELS[panel];


    return <>
        <div className="rulesTitle">
            How to Play Diplomacy Chess
        </div>

        <div className="rulesImgs">
            {info.images.map(imgName =>
                <div className="rulesImg">
                    <img key={imgName} src={`diplomacy-chess/tutorial/${imgName}.png`} />
                </div>
            )}
        </div>

        <div className="rulesText">
            {info.text.map((text, n) =>
                <div className="rulesLine" key={n}> {text} </div>
            )}
        </div>

        <div rulesNav>
            <span onClick={e => setPanel(prev => prev > 0 ? prev - 1 : 0)}
                className="rulesNavBtn"> ◀ </span>
            {[...Array(PANELS.length)].map((_, n) => <span className={`rulesNavBtn ${n != panel ? "small" : ""}`}
                    key={n} onClick={e => setPanel(n)}> {n+1} </span>)}
            <span onClick={e => setPanel(prev => prev < PANELS.length - 1  ? prev + 1 : PANELS.length - 1)}
                className="rulesNavBtn"> ▶ </span>
        </div>
    </>;
}

export {Rules, Modal}
