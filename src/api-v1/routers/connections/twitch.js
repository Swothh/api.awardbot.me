module.exports = (router, connectionsPath, users, passport, config) => {
    router.get(connectionsPath + "/twitch/login", (req, res, next) => {
        req.session._connectionCallback = req.query.url || '/';
        req.session._beta = req.query.__beta || false;
        next();
    }, passport.authenticate("twitch", {
        scope: config.auth.twitch.scopes
    }));

    router.get(connectionsPath + "/twitch/callback", (req, res, next) => {
        req.session._connectionUser = req.user.id;
        next();
    }, passport.authenticate("twitch", {
        failureRedirect: connectionsPath + "/twitch/login",
        session: false
    }), async (req, res) => {
        if (req.user) {
            try {
                await users.updateOne({ user: req.session._connectionUser }, { twitch: { id: req.user.id, name: req.user.displayName, username: req.user.login, accessToken: req.user.accessToken, refreshToken: req.user.refreshToken } }, { upsert: true });
                res.redirect((config.website.protocol + "://" + config.website.domain) + (req.session._connectionCallback || "/"));
            } catch(err) {
                console.error(err);
                res.redirect((config.website.protocol + "://" + config.website.domain) + (req.session._connectionCallback || "/"));
            };
        } else {
            res.redirect(connectionsPath + "/twitch/login");
        };
    });

    router.get(connectionsPath + "/twitch/logout", async (req, res) => {
        try {
            await users.updateOne({ user: req.user.id }, { twitch: {} });
            res.redirect((config.website.protocol + "://" + config.website.domain) + (req.query['url'] || "/"));
        } catch(err) {
            console.log(err);
            res.redirect((config.website.protocol + "://" + config.website.domain) + (req.query['url'] || "/"));
        };
    });

    return router;
};