const users = require("../database/models/users.js");
const config = require("../../award.config.js");
const middleware = require("./award.check.js");
const cookieParser = require('cookie-parser');
const session = require("express-session");
const bodyParser = require("body-parser");
const Discord = require("discord.js");
const express = require("express");
const cors = require("cors");
const http = require("http");
const app = express();
const moment = require("moment");
require("moment-duration-format");
const server = http.createServer(app);

module.exports = client => {

    // <GATEWAY> //
    const wss = require("./award.socket.js")(server);
    const wsSend = require("../util/trigger.js")(wss, client);
    // </GATEWAY> //

    // <SESSION & CORS> //
    app.use(
        session({
            secret: config.sessionKey,
            resave: false,
            saveUninitialized: false
        })
    );

    app.set("trust proxy", 1);
    app.use(cookieParser())
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(cors(
        {
            origin: "*"
        }
    ));

    app.use((req, res, next) => {
        res.setHeader('x-powered-by', 'award API');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        res.setHeader('Access-Control-Allow-Credentials', true);
        next();
    });
    // </SESSION & CORS> //

    // <RATELIMIT> //
    let rlSettings = [10, 1000 * 60 * 60];
    let rateLimits = {};
    app.use("/v1/code/use", (req, res, next) => {
        const token = req.query["_token"];
        if (!token) return next();
        const [maxRequests, resetMs] = rlSettings;
        res.setHeader("x-award-ratelimit-limit", maxRequests);

        const rlResponse = () => {
            return res.json({
                success: false,
                message: "You are being rate limited. (" + Math.round((rateLimits[token].rate_limited - Date.now()) / 1000 / 60) + "mins)",
                data: {
                    resets_in: rateLimits[token].rate_limited - Date.now()
                }
            });
        };

        if (!rateLimits[token]) rateLimits[token] = {
            requests: [],
            rate_limited: false
        };

        if (rateLimits[token].rate_limited) {
            if (Date.now() < rateLimits[token].rate_limited) {
                res.setHeader("x-award-ratelimit-remaining", 0);
                res.setHeader("x-award-ratelimit-reset", rateLimits[token].rate_limited - Date.now());
                return rlResponse();
            } else {
                res.setHeader("x-award-ratelimit-remaining", maxRequests - 1);
                rateLimits[token].rate_limited = false;
            };
        };

        if (rateLimits[token].requests.filter(_r => (
            (Date.now() - _r) < resetMs
        )).length >= maxRequests) {
            rateLimits[token] = {
                requests: [],
                rate_limited: Date.now() + resetMs
            };

            res.setHeader("x-award-ratelimit-remaining", 0);
            res.setHeader("x-award-ratelimit-reset", resetMs);
            return rlResponse();
        } else {
            rateLimits[token].requests = [...rateLimits[token].requests, Date.now()];
            res.setHeader("x-award-ratelimit-remaining", maxRequests - rateLimits[token].requests.filter(_r => (Date.now() - _r) < resetMs).length);
            next();
        };
    });
    // </RATELIMIT> //

    // <API INFO> //
    app.get("/", (req, res) => {
        res.json({
            hello: "world!",
            version: 1
        });
    });
    // </API INFO> //

    // <LANGUAGE> //
    app.use((req, res, next) => {
        try {
            let lang = req.query["lang"];
            if (!lang) lang = config.defaultLang;
            req.locale = require("../langs/" + lang.toLowerCase() + ".js");
            next();
        } catch {
            req.locale = require("../langs/" + config.defaultLang.toLowerCase() + ".js");
            next();
        };
    });
    // </LANGUAGE> //

    // <USER COOKIE> //
    app.use(async (req, res, next) => {
        if (!req.path.includes("/v1/connections")) return next();
        if (!req.cookies["user_key"] && !req.query["_token"]) return next();
        const _loadUser = await users.findOne({ token: req.cookies["user_key"] || req.query["_token"] });
        if (!_loadUser || !_loadUser.profile) return next();

        const _ware = await middleware(_loadUser, req.locale);
        if (_ware) return res.json({ success: false, message: _ware, data: null });

        req.user = _loadUser.profile;
        next();
    });
    // </USER COOKIE> //

    // <AUTHORIZATION> //
    app.use(async (req, res, next) => {
        if (req.path.includes("/v1/auth/login")) return next();
        if (req.path.includes("/v1/auth/callback")) return next();
        if (req.path.includes("/v1/connections")) return next();
        if (req.path.includes("/v1/invite")) return next();
        if (req.path.includes("/v1/others/stats")) return next();
        if (req.path.includes("/v1/others/team")) return next();
        if (req.path.includes("/v1/others/partners")) return next();
        if (req.path.includes("/v1/giveaway/search")) return next();
        if (req.path.endsWith("/overview") && req.path.includes("/v1/giveaway")) return next();

        if (!req.query["_token"]) return next();
        const _loadUser = await users.findOne({ token: req.query["_token"] }, { _id: 0, __v: 0 });
        if (!_loadUser || !_loadUser.profile) return next();

        const _ware = await middleware(_loadUser, req.locale);
        if (_ware) return res.json({ success: false, message: _ware, data: null });

        req.userAuth = _loadUser.profile;
        req._user = _loadUser;
        next();
    });
    // </AUTHORIZATION> //

    // <AUTHORIZATION CHECK> //
    app.use((req, res, next) => {
        if (req.path.includes("/v1/auth/login")) return next();
        if (req.path.includes("/v1/auth/callback")) return next();
        if (req.path.includes("/v1/connections")) return next();
        if (req.path.includes("/v1/invite")) return next();
        if (req.path.includes("/v1/others/stats")) return next();
        if (req.path.includes("/v1/others/team")) return next();
        if (req.path.includes("/v1/others/partners")) return next();
        if (req.path.includes("/v1/giveaway/search")) return next();
        if (req.path.endsWith("/overview") && req.path.includes("/v1/giveaway")) return next();

        if (!req.userAuth) {
            return res.json({
                success: false,
                message: req.locale["server"]["no_token_provided"],
                data: null
            });
        } else {
            req._publicProfile = {
                id: req.userAuth.id,
                username: req.userAuth.username,
                avatar: req.userAuth.avatar,
                discriminator: req.userAuth.discriminator,
                flags: req.userAuth.flags
            };

            req.user = req.userAuth;
            next();
        };
    });
    // </AUTHORIZATION CHECK> //

    // <DEV ROUTES> //
    app.get("/__/reset/tokens", async (req, res) => {
        if (!req._user || !(req._user.permissions || []).some(_p => _p == "**")) return res.status(404).end();
        const Users = await users.find();

        Users.forEach(async user => {
            await users.updateOne({ user: user.user },
                {
                    $set: {
                        token: createKey(50)
                    }
                }
            );
        });

        res.status(200).json({
            success: true,
            message: 'Successful.',
            data: null
        });
    });
    app.get("/__/guild/leave", async (req, res) => {
        if (!req._user || !(req._user.permissions || []).some(_p => _p == "**")) return res.status(404).end();
        try {
            let guild = await client.guilds.fetch(req.query.guildId);
            if(guild) {
                guild.leave();
                return res.status(200).json({
                    success: true,
                    message: 'Successful.',
                    data: null
                });
            } else {
                return res.status(404).json({
                    success: true,
                    message: 'Guild not found.',
                    data: null
                });
            }
        } catch {
            return res.status(500).json({
                success: true,
                message: 'Something went wrong...',
                data: null
            });
        }
    });
    app.get("/__/guild/bans", async (req, res) => {
        if (!req._user || !(req._user.permissions || []).some(_p => _p == "**")) return res.status(404).end();
        try {
            let guild = await client.guilds.cache.get("911264853086318702");
            let bans = [];
            let fetchBans = await guild.bans.fetch();
            if(guild) {
                return res.status(200).json({
                    success: true,
                    message: 'Successful.',
                    data: fetchBans
                });
            }
        } catch(e) {
            console.log(e)
            return res.status(404).json({
                success: true,
                message: 'Guild not found.',
                data: null
            });
        }
    });
    app.get("/__/guilds", async (req, res) => {
        if (!req._user || !(req._user.permissions || []).some(_p => _p == "**")) return res.status(404).end();
        try {
            let { min, max } = req.query;
            let guilds = [];
            if(!min) min = 0;
            if(!max) max = 10000000;
            client.guilds.cache.filter(a => a.memberCount > min && a.memberCount < max).map(a => guilds.push({
                id: a.id,
                name: a.name,
                icon: a.icon,
                members: a.memberCount
            }));
            return res.status(200).json({
                success: true,
                message: null,
                data: await guilds
            });
        } catch {
            return res.status(500).json({
                success: false,
                message: 'Something went wrong...',
                data: null
            });
        }
    });
    app.get("/__/clients", async (req, res) => {
        if (!req._user || !(req._user.permissions || []).some(_p => _p == "*" || _p == "VIEW_CLIENTS")) return res.status(404).end();
        let clients = [];

        wss.clients.forEach(ws => {
            if (!ws._user) return;
            if (clients.find(_ => _.id == ws._user.user)) return;
            ws._user.profile.accessToken = null;
            ws._user.profile.guilds = null;

            clients = [
                {
                    _id: ws._id,
                    _connected: moment
                        .duration(Date.now() - ws._connected)
                        .format(`D [day] H [hour] m [minute] s [second]`),
                    user: {
                        ...ws._user.profile
                    }
                },
                ...clients
            ];
        });

        res.status(200).json({
            success: true,
            message: 'Successful.',
            data: clients
        });
    });
    // </DEV ROUTES> //

    // <AUTH & CONNECTIONS> //
    const __auths = require("./routers/auth.js")({ router: app, path: config.authPath, connectionsPath: config.connectionsPath, client });
    Object.keys(__auths).forEach(__auth => app.use(__auths[__auth]));
    // </AUTH & CONNECTIONS> //

    // <CUSTOM ROUTES> //
    app.get("/v1/invite/callback", (req, res) => {
        res.redirect(config.website.protocol + "://" + config.website.domain + config.website.invite);
    });

    app.get("/v1/invite/_callback", (req, res) => {
        res.redirect("http://3.120.245.111:3000" + config.website.invite);
    });

    app.get("/v1/invite/bot", (req, res) => {
        if (!req.query["__w"]) return res.redirect(config.auth.discord.botInvite + (req.query["__beta"] === "true" ? ("&redirect_uri=http://3.120.245.111:3000/dashboard/added") : "&redirect_uri=https://awardbot.me/dashboard/added") + (req.query["disable_select"] ? ("&disable_guild_select=true") : "") + (req.query["id"] ? ("&guild_id=" + req.query["id"]) : ""));
        res.redirect(config.auth.discord.botInvite + (req.query["__beta"] === "true" ? "&redirect_uri=https://api.awardbot.me/v1/invite/_callback" : "&redirect_uri=https://api.awardbot.me/v1/invite/callback") + (req.query["disable_select"] ? ("&disable_guild_select=true") : "") + (req.query["id"] ? ("&guild_id=" + req.query["id"]) : ""));
    });

    app.get("/v1/invite/discord", (req, res) => {
        res.redirect(config.auth.discord.invite);
    });
    // </CUSTOM ROUTES> //

    // <GIVEAWAY LIST> //
    const __giveawayList = require("./routers/giveaway/list.js")(client);
    app.use("/v1/giveaway", __giveawayList);
    // </GIVEAWAY LIST> //

    // <GIVEAWAY LIST SEARCH> //
    const __giveawaySearch = require("./routers/giveaway/search.js")(client);
    app.use("/v1/giveaway", __giveawaySearch);
    // </GIVEAWAY LIST SEARCH> //

    // <GIVEAWAY PRIZES> //
    const __giveawayPrizes = require("./routers/giveaway/prizes.js")(client);
    app.use("/v1/giveaway", __giveawayPrizes);
    // </GIVEAWAY PRIZES> //

    // <GIVEAWAY OVERVIEW> //
    const __giveawayOverview = require("./routers/giveaway/overview.js")(client);
    app.use("/v1/giveaway", __giveawayOverview);
    // </GIVEAWAY OVERVIEW> //

    // <GIVEAWAY CANCEL> //
    const __giveawayCancel = require("./routers/giveaway/cancel.js")(client, wsSend);
    app.use("/v1/giveaway", __giveawayCancel);
    // </GIVEAWAY CANCEL> //

    // <GIVEAWAY EDIT> //
    const __giveawayEdit = require("./routers/giveaway/edit.js")(client);
    app.use("/v1/giveaway", __giveawayEdit);
    // </GIVEAWAY EDIT> //

    // <GIVEAWAY JOIN> //
    const __giveawayJoin = require("./routers/giveaway/join.js")(client, wsSend);
    app.use("/v1/giveaway", __giveawayJoin);
    // </GIVEAWAY JOIN> //

    // <GIVEAWAY CREATE> //
    const __giveawayCreate = require("./routers/giveaway/create.js")(client, wsSend);
    app.use("/v1/giveaway", __giveawayCreate);
    // </GIVEAWAY CREATE> //

    // <GIVEAWAY CHECK PIN> //
    const __checkPin = require("./routers/giveaway/checkPin.js")(client, wsSend);
    app.use("/v1/giveaway", __checkPin);
    // </GIVEAWAY CHECK PIN> //

    // <GIVEAWAY REROLL> //
    const __giveawayReroll = require("./routers/giveaway/reroll.js")(client, wsSend);
    app.use("/v1/giveaway", __giveawayReroll);
    // </GIVEAWAY REROLL> //

    // <GUILD CHECK> //
    const __guildCheck = require("./routers/guilds/check.js")(client);
    app.use("/v1/guilds", __guildCheck);
    // </GUILD CHECK> //

    // <GUILD LOG> //
    const __guildLog = require("./routers/guilds/log.js")(client);
    app.use("/v1/guilds", __guildLog);
    // </GUILD LOG> //

    // <GUILD CHANNELS> //
    const __guildChannels = require("./routers/guilds/channels.js")(client);
    app.use("/v1/guilds", __guildChannels);
    // </GUILD CHANNELS> //

    // <GUILD CHANNELS> //
    const __guildRoles = require("./routers/guilds/roles.js")(client);
    app.use("/v1/guilds", __guildRoles);
    // </GUILD CHANNELS> //

    // <GUILD STATS> //
    const __guildStats = require("./routers/guilds/stats.js")(client);
    app.use("/v1/guilds", __guildStats);
    // </GUILD STATS> //

    // <GUILD SETTINGS> //
    const __guildSettings = require("./routers/guilds/settings.js")(client);
    app.use("/v1/guilds", __guildSettings);
    // </GUILD SETTINGS> //

    // <OTHER REQUIREDS> //
    const __otherRequireds = require("./routers/others/requireds.js")(client);
    app.use("/v1/others", __otherRequireds);
    // </OTHER REQUIREDS> //

    // <OTHER TEAM> //
    const __otherTeam = require("./routers/others/team.js")(client);
    app.use("/v1/others", __otherTeam);
    // </OTHER TEAM> //

    // <OTHER STATS> //
    const __otherStats = require("./routers/others/stats.js")(client);
    app.use("/v1/others", __otherStats);
    // </OTHER STATS> //

    // <OTHER PARTNERS> //
    const __otherPartners = require("./routers/others/partners.js")(client);
    app.use("/v1/others", __otherPartners);
    // </OTHER PARTNERS> //

    // <BOOST OVERVIEW> //
    const __boostGuildOverview = require("./routers/boost/overview.js")(client);
    app.use("/v1/boost", __boostGuildOverview);
    // </BOOST OVERVIEW> //

    // <BOOST GUILD> //
    const __boostGuild = require("./routers/boost/boost.js")(client, wsSend);
    app.use("/v1/boost", __boostGuild);
    // </BOOST GUILD> //

    // <UNBOOST GUILD> //
    const __unboostGuild = require("./routers/boost/unboost.js")(client, wsSend);
    app.use("/v1/boost", __unboostGuild);
    // </UNBOOST GUILD> //

    // <BOOST BENEFITS> //
    const __boostBenefits = require("./routers/boost/benefits.js")(client);
    app.use("/v1/boost", __boostBenefits);
    // </BOOST BENEFITS> //

    // <CODE CREATE> //
    const __codeCreate = require("./routers/code/create.js")(client);
    app.use("/v1/code", __codeCreate);
    // </CODE CREATE> //

    // <CODE LIST> //
    const __codeList = require("./routers/code/list.js")(client);
    app.use("/v1/code", __codeList);
    // </CODE LIST> //

    // <CODE DELETE> //
    const __codeDelete = require("./routers/code/delete.js")(client);
    app.use("/v1/code", __codeDelete);
    // </CODE DELETE> //

    // <CODE USE> //
    const __codeUse = require("./routers/code/use.js")(client);
    app.use("/v1/code", __codeUse);
    // </CODE USE> //

    // <USER PROFILE> //
    const __userProfile = require("./routers/user/id.js")(client);
    app.use("/v1/user", __userProfile);
    // </USER PROFILE> //

    // <PARTNERS ADD> //
    const __partnersAdd = require("./routers/partners/add.js")(client);
    app.use("/v1/partners", __partnersAdd);
    // </PARTNERS ADD> //

    // <PARTNERS DELETE> //
    const __partnersDelete = require("./routers/partners/delete.js")(client);
    app.use("/v1/partners", __partnersDelete);
    // </PARTNERS DELETE> //

    // <404> //
    app.use((req, res) => {
        try {
            res.json({
                success: false,
                message: req.locale["server"]["not_found"],
                data: null
            });
        } catch {};
    });
    // </404> //

    // <LISTEN SERVER> //
    server.listen(process.env.PORT || 80, () => {
        require("./award.boost.js")(client);
        require("./award.interval.js")(client, wsSend);
        console.log("(!) Server listening at ::" + (process.env.PORT || 80) + " port!");
    });
    // </LISTEN SERVER> //

};