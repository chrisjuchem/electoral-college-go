
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
            "Electoral College Go is a Go variant designed to mimic the Unites States' Electoral "+
            "College voting system.",
            "Instead of a normal go board, the board is shaped like the United States, and the "+
            "scoring is based on controlling regions rather than individual points."
        ],
        images: ["empty-board"]
    },
    {
        text: [
            "Except for the board and scoring, Electoral College Go uses the same rules as "+
            "standard Go (capturing, ko, etc.).",
            <>
                If you don't already know to play Go, <a href="https://way-to-go.gitlab.io">this
                interactive tutorial</a> does a great job explaining the rules and some basic strategy.
            </>
        ],
        images: ["empty-board"]
    },
    {
        text: [
            "Each colored region is a state worth a certain amount of points.",
            "The largest point values for states are 54 for California, 40 for Texas, "+
            "30 for Florida, and 28 for New York.",
            "The smallest value is 3, shared by "+
            "Delaware, North Dakota, South Dakota and Wyoming.",
        ],
        images: ["california", "texas","florida", "new-york"]
    },
    {
        text: [
            "In total, there are 528 points available on the board.",
            <>
                White is given a <i>komi</i> (bonus) of 10 points for the Electoral College
                votes not shown on the board (Alaska, Hawaii, and the District of Colombia).
            </>
        ],
        images: ["empty-board"]
    },
    {
        text: [
            "Just like on a normal Go board, the black lines show how many liberties a point has.",
            "Here, the white stone has 2 liberties and the black stone only has one."
        ],
        images: ["liberties"]
    },
    {
        text: [
            "Hover or tap a state on the board to see its name and how many points it is worth. "+
            "You will also be shown which player has control over the state.",
            "During the game, only placed stones will be counted, but at the end of the game, uncontested "+
            "territory will count towards control as well. Notice how Alabama (near the right in red) changes from "+
            "being controlled by black to being controlled by white once the territory is scored.",
        ],
        images: ["control-stones", "control-territory"]
    },
    {
        text: [
            "If control for a state is exactly equal, the players will share the state's points, "+
            "but if one player has greater control than the other, they take ALL of that state's points.",
            "Captures do not directly count for points, but do remove your opponent's control (just "+
            "like with standard Chinese/area scoring).",
        ],
        images: ["tie", "not-tie"]
    },
    {
        text: [
            "During your turn, hovering over a point will show a ghost stone. Click to play your "+
            "move on that point, or pass using the button below the board.",
            "On mobile, tap the board to zoom in and show the ghost stone. Then tap the stone again to "+
            "play your move there, tap somewhere else to move the ghost stone, or tap the red X to reset.",
            "Players can also pass using the button under the board."
        ],
        images: ["mobile"]
    },
    {
        text: [
            "If you misclick, you can request an undo. The other player can then grant the undo, or ignore "+
            "the request and continue playing.",
            "It is possible to undo multiple moves if both players take turns requesting undos.",
        ],
        images: ["undo"]
    },
    {
        text: [
            "After both players pass back-to-back, final scoring will begin. Players must manually "+
            "mark any dead stones and then agree to the final score.",
            "If there is a dispute about the status of any stones, or if any territory was accidentally "+
            "not fully outlined, either player can elect to resume playing."
        ],
        images: ["end", "end-end"]
    },
];

function Rules () {
    let [panel, setPanel] = useState(0);
    let info = PANELS[panel];


    return <>
        <div className="rulesTitle">
            How to Play Electoral College Go
        </div>

        <div className="rulesImgs" style={info.vertical ? {'flex-direction': 'vertical'} : {}}>
            {info.images.map(imgName =>
                <div className="rulesImg" key={imgName}>
                    <img src={`electoral-college-go/tutorial/${imgName}.png`} />
                </div>
            )}
        </div>

        <div className="rulesText">
            {info.text.map((text, n) =>
                <div className="rulesLine" key={n}> {text} </div>
            )}
        </div>

        <div className="rulesNav">
            <span onClick={e => setPanel(prev => prev > 0 ? prev - 1 : 0)}
                className="rulesNavBtn"> ◀ </span>
            {[...Array(PANELS.length)].map((_, n) => <span className={`rulesNavBtn ${n !== panel ? "small" : ""}`}
                    key={n} onClick={e => setPanel(n)}> {n+1} </span>)}
            <span onClick={e => setPanel(prev => prev < PANELS.length - 1  ? prev + 1 : PANELS.length - 1)}
                className="rulesNavBtn"> ▶ </span>
        </div>
    </>;
}

export {Rules, Modal}
