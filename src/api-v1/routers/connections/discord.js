module.exports = (router, path, users, passport, config, fetch, Discord, client) => {
    router.get(path + "/login", (req, res, next) => {
        if (req.query["extension"]) req.session._extension = req.query["extension"];
        if (req.query["__b"]) req.session._beta = req.query["__b"] === 'true' ? true : false;
        if (req.query["url"]) req.session._redir = req.query["url"];
        next();
    }, passport.authenticate("discord", {
        scope: config.auth.discord.scopes,
        prompt: config.auth.discord.prompt
    }));

    router.get(path + "/callback", (req, res, next) => {
        passport.authenticate("discord", {
            failureRedirect: path + "/login"
        }, (err, user) => {
            req.user = user;
            next();
        })(req, res, next);
    }, async (req, res) => {
        if (req.user) {

            const _userToken = await users.findOne({ user: req.user.id });
            const createKey = require("../../../util/key.js");
            const _token = createKey(50);
            if (!_userToken) {
                await users.updateOne({ user: req.user.id }, {
                    profile: req.user,
                    token: _token
                }, { upsert: true });
            } else {
                await users.updateOne({ user: req.user.id }, {
                    profile: req.user
                }, { upsert: true });
            };

            res.cookie("user_key", _userToken ? _userToken.token : _token, {
                maxAge: 365 * 24 * 60 * 60 * 1000,
                httpOnly: true
            });
            if (req.session["_beta"]) {
                res.redirect(
                    ("http://localhost:3000" + config.website.betaCallback) +
                    ("?_code=" + (_userToken ? _userToken.token : _token)) +
                    ("&url=" + (req.session["_redir"] || "/"))
                );
            } else {
                if (req.session["_extension"]) {
                    res.redirect(
                        ("chrome-extension://" + req.session["_extension"] + "/callback.html") +
                        ("?_code=" + (_userToken ? _userToken.token : _token)) +
                        ("&url=" + (req.session["_redir"] || "/"))
                    );
                } else {
                    res.redirect(
                        (config.website.protocol + "://" + config.website.domain + config.website.callback) +
                        ("?_code=" + (_userToken ? _userToken.token : _token)) +
                        ("&url=" + (req.session["_redir"] || "/"))
                    );
                };
            }
        } else {
            res.redirect(path + "/login");
        };
    });

    router.get(path + "/me", async (req, res) => {
        try {
            let _user = req.user;
            let _dbUser = req._user;
            let _guilds = _user.guilds || [];

            await _guilds.forEach((guild, index) => {
                const _perms = guild.permissions_new;
                const _checkBot = client.guilds.cache.get(guild.id);
                _guilds[index].bot_added = _checkBot ? true : false;
                _guilds[index].permissions = new Discord.Permissions(_perms).toArray();
            });

            delete _user.accessToken;
            _user.permissions = _dbUser ? _dbUser.permissions : [];
            _user.notifications = _dbUser ? _dbUser.notifications : [];
            _user.connections = {};
            _user.guilds = _guilds;

            if (_dbUser && _dbUser.youtube && _dbUser.youtube.id) _user.connections.youtube = _dbUser.youtube.name;
            if (_dbUser && _dbUser.github && _dbUser.github.id) _user.connections.github = _dbUser.github.name || _dbUser.github.username;
            if (_dbUser && _dbUser.twitter && _dbUser.twitter.id) _user.connections.twitter = _dbUser.twitter.name;
            if (_dbUser && _dbUser.twitch && _dbUser.twitch.id) _user.connections.twitch = _dbUser.twitch.name;
            if (_dbUser && _dbUser.tiktok && _dbUser.tiktok.id) _user.connections.tiktok = _dbUser.tiktok.username;

            res.json({
                success: true,
                message: req.locale["global"]["successful"],
                data: _user
            });
        } catch (err) {
            console.log(err);
            res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
        };
    });

    return router;
};
