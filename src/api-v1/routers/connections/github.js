module.exports = (router, connectionsPath, users, passport, config) => {
    router.get(connectionsPath + "/github/login", (req, res, next) => {
        req.session._connectionCallback = req.query.url || '/';
        req.session._beta = req.query.__beta || false;
        next();
    }, passport.authenticate("github", {
        scope: config.auth.github.scopes
    }));

    router.get(connectionsPath + "/github/callback", (req, res, next) => {
        req.session._connectionUser = req.user.id;
        next();
    }, passport.authenticate("github", {
        failureRedirect: connectionsPath + "/github/login",
        session: false
    }), async (req, res) => {
        if (req.user) {
            try {
                await users.updateOne({ user: req.session._connectionUser }, { github: { id: req.user.id, name: req.user.displayName, username: req.user.username, accessToken: req.user.accessToken } }, { upsert: true });
                res.redirect((config.website.protocol + "://" + config.website.domain) + (req.session._connectionCallback || "/"));
            } catch(err) {
                console.error(err);
                res.redirect((config.website.protocol + "://" + config.website.domain) + (req.session._connectionCallback || "/"));
            };
        } else {
            res.redirect(connectionsPath + "/github/login");
        };
    });

    router.get(connectionsPath + "/github/logout", async (req, res) => {
        try {
            await users.updateOne({ user: req.user.id }, { github: {} });
            res.redirect((config.website.protocol + "://" + config.website.domain) + (req.query['url'] || "/"));
        } catch(err) {
            console.log(err);
            res.redirect((config.website.protocol + "://" + config.website.domain) + (req.query['url'] || "/"));
        };
    });

    return router;
};