const User = require("../database/models/users");
const config = require("../../award.config.js");
const { v4: id } = require("uuid");
const WebSocket = require("ws");

module.exports = app => {
    const wss = new WebSocket.Server({
        server: app,
        path: "/v1/gateway"
    });

    wss.on("connection", async (ws, req) => {
        const close = value => {
            try {
                ws.send(JSON.stringify(value));
                ws.close(1000);
            } catch(err) {
                console.log(err);
            };
        };

        try {
            const _url = new URL(
                "wss://api.awardbot.me" + 
                req.url
            );

            let _id = id();
            ws._id = _id;
            ws._alive = true;
            ws._connected = Date.now();
            
            if (_url.searchParams.get("u") == 1) {
                if (!_url.searchParams.get("t")) return close({ type: "ERROR", message: "No token provided!", data: null });
                const profile = await User.findOne({ token: _url.searchParams.get("t") });
                if (!profile) return close({ type: "ERROR", message: "Invalid token provided!", data: null });
                ws._user = profile;

                wss.clients.forEach(_ => {
                    if (_._user && _._id != _id && _._user.token == profile.token) {
                        _.close();
                    };
                });
            } else {
                if (!_url.searchParams.get("i")) return close({ type: "ERROR", message: "No intents provided!", data: null });
                if (!_url.searchParams.get("g")) return close({ type: "ERROR", message: "No guild provided!", data: null });
                const _i = JSON.parse(_url.searchParams.get("i"));
                const _g = _url.searchParams.get("g");
                if (!Array.isArray(_i)) return close({ type: "ERROR", message: "Invalid intents provided!", data: null });
                if (_i.some(int => !config.gatewayIntents.find(__i => __i == int))) return close({ type: "ERROR", message: "Invalid intents provided!", data: null });

                ws._guild = _g;
                ws._intents = _i;
            };

            ws.on("pong", () => {
                ws._alive = true; 
            });

            ws.send(JSON.stringify({ 
                type: "CONNECT", 
                message: "Successful!", 
                data: null 
            }));
        } catch {
            close({ 
                type: "ERROR", 
                message: "Invalid intents provided!", 
                data: null 
            });
        };
    });

    const heartbeats = setInterval(() => {
        wss.clients.forEach(ws => {
            if (ws._alive !== true) {
                ws.terminate();
            } else {
                ws._alive = false;
                ws.ping();
            };
        });
    }, 30000);
    
    wss.on("close", () => {
        clearInterval(heartbeats);
    });

    console.log("(!) Gateway is listening!");
    return wss;
};