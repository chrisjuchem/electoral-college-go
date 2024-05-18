
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
            "Q: These scoring rules are stupid.",
            "A: So is the electoral college.",
        ],
        images: ["", ""]
    },
];

function Rules () {
    let [panel, setPanel] = useState(0);
    let info = PANELS[panel];


    return <>
        <div className="rulesTitle">
            How to Play Electoral College Go
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
            {[...Array(PANELS.length)].map((_, n) => <span className={`rulesNavBtn ${n !== panel ? "small" : ""}`}
                    key={n} onClick={e => setPanel(n)}> {n+1} </span>)}
            <span onClick={e => setPanel(prev => prev < PANELS.length - 1  ? prev + 1 : PANELS.length - 1)}
                className="rulesNavBtn"> ▶ </span>
        </div>
    </>;
}

export {Rules, Modal}
