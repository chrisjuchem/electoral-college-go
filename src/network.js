import Peer from 'peerjs';
import { useEffect } from 'react';

let handlers = {};
const registerHandler = (type, handler) => {
    if (handlers[type] === undefined) handlers[type] = [];
    handlers[type].push(handler);
};
const unregisterHandler = (type, handler) => {
    handlers[type] = handlers[type].filter(h => h !== handler);
};
const useHandler = (type, memoizedCallback) => {
    useEffect(() => {
        registerHandler(type, memoizedCallback);
        return () => unregisterHandler(type, memoizedCallback);
    }, [type, memoizedCallback]);
};

const dataHandler = (data) => {
    console.log("recieved", data.message, data.data);
    handlers[data.message]?.forEach(h=>h(data.data, HOST))
};

const peer = new Peer(/*{debug:3}*/);
let CONN, HOST;
peer.on('open', (id) => {
    handlers.id.forEach(h => h(id));
});
peer.on('connection', (conn) => {
    if (CONN)   {
        console.error("Rejected second connection!");
        sendData("rejected");
        return conn.close();
    }
    [CONN, HOST] = [conn, true];
    conn.on('open', () => handlers.connected.forEach(h => h(conn)));
    conn.on('data', dataHandler);
});
peer.on('error', console.error)


function connect(targetId) {
    if (CONN) return console.error("Cannot establish two connections!");
    if (targetId === peer.id) return console.warn("skipping own id");
    const conn = peer.connect(targetId, {serialization: "json"});
    conn.on('data', dataHandler);
    [CONN, HOST] = [conn, false];
}

function sendData(message, data={}) {
    console.log("sending", message, data)
    if (!CONN) {
        console.error("No connection to send data!")
        return;
    }
    CONN.send({message, data});
}

export { useHandler, connect, sendData, };
