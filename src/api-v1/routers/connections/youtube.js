module.exports = (router, connectionsPath, users, passport, config) => {
    router.get(connectionsPath + "/youtube/login", (req, res, next) => {
        req.session._connectionCallback = req.query.url || '/';
        req.session._beta = req.query.__beta || false;
        next();
    }, passport.authenticate("youtube", {
        scope: config.auth.youtube.scopes
    }));

    router.get(connectionsPath + "/youtube/callback", (req, res, next) => {
        req.session._connectionUser = req.user.id;
        next();
    }, passport.authenticate("youtube", {
        failureRedirect: connectionsPath + "/youtube/login",
        session: false
    }), async (req, res) => {
        if (req.user) {
            try {
                await users.updateOne({ user: req.session._connectionUser }, { youtube: { id: req.user.id, name: req.user.displayName, accessToken: req.user.accessToken, refreshToken: req.user.refreshToken } }, { upsert: true });
                res.redirect((config.website.protocol + "://" + config.website.domain) + (req.session._connectionCallback || "/"));
            } catch(err) {
                console.error(err);
                res.redirect((config.website.protocol + "://" + config.website.domain) + (req.session._connectionCallback || "/"));
            };
        } else {
            res.redirect(connectionsPath + "/youtube/login");
        };
    });

    router.get(connectionsPath + "/youtube/logout", async (req, res) => {
        try {
            await users.updateOne({ user: req.user.id }, { youtube: {} });
            res.redirect((config.website.protocol + "://" + config.website.domain) + (req.query['url'] || "/"));
        } catch(err) {
            console.log(err);
            res.redirect((config.website.protocol + "://" + config.website.domain) + (req.query['url'] || "/"));
        };
    });

    return router;
};