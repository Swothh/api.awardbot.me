module.exports = (router, connectionsPath, users, passport, config) => {
    router.get(connectionsPath + "/twitter/login", (req, res, next) => {
        req.session._connectionCallback = req.query.url || '/';
        req.session._beta = req.query.__beta || false;
        next();
    }, passport.authenticate("twitter", {
        scope: config.auth.twitter.scopes
    }));

    router.get(connectionsPath + "/twitter/callback", (req, res, next) => {
        req.session._connectionUser = req.user.id;
        next();
    }, passport.authenticate("twitter", {
        failureRedirect: connectionsPath + "/twitter/login",
        session: false
    }), async (req, res) => {
        if (req.user) {
            try {
                await users.updateOne({ user: req.session._connectionUser }, { twitter: { id: req.user.id, name: req.user.displayName, username: req.user.username, accessToken: req.user.accessToken, refreshToken: req.user.refreshToken } }, { upsert: true });
                res.redirect((config.website.protocol + "://" + config.website.domain) + (req.session._connectionCallback || "/"));
            } catch(err) {
                console.error(err);
                res.redirect((config.website.protocol + "://" + config.website.domain) + (req.session._connectionCallback || "/"));
            };
        } else {
            res.redirect(connectionsPath + "/twitter/login");
        };
    });

    router.get(connectionsPath + "/twitter/logout", async (req, res) => {
        try {
            await users.updateOne({ user: req.user.id }, { twitter: {} });
            res.redirect((config.website.protocol + "://" + config.website.domain) + (req.query['url'] || "/"));
        } catch(err) {
            console.log(err);
            res.redirect((config.website.protocol + "://" + config.website.domain) + (req.query['url'] || "/"));
        };
    });

    return router;
};