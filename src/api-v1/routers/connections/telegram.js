module.exports = (router, connectionsPath, users, passport, config) => {
  router.get(connectionsPath + '/telegram/login', (req, res, next) => {
        req.session._connectionCallback = req.query.url || '/';
        req.session._beta = req.query.__beta || false;
        next();
    },passport.authenticate('telegram', { failureRedirect: connectionsPath + "/telegram/login", }))

      router.get(connectionsPath + "/telegram/callback", (req, res, next) => {
        req.session._connectionUser = req.user.id;
        next();
    }, passport.authenticate("telegram", {
        failureRedirect: connectionsPath + "/telegram/login",
        session: false
    }), async (req, res) => {
        if (req.user) {
            try {
              console.log(req.session._connectionUser)
                await users.updateOne({ user: req.session._connectionUser }, { telegram: { id: req.user.id, name: req.user.displayName, username: req.user.username, accessToken: req.user.accessToken } }, { upsert: true });
                res.redirect((config.website.protocol + "://" + config.website.domain) + (req.session._connectionCallback || "/"));
            } catch(err) {
                console.error(err);
                res.redirect((config.website.protocol + "://" + config.website.domain) + (req.session._connectionCallback || "/"));
            };
        } else {
            res.redirect(connectionsPath + "/telegram/login");
        };
    });

      router.get(connectionsPath + "/telegram/logout", async (req, res) => {
        try {
            await users.updateOne({ user: req.user.id }, { telegram: {} });
            res.redirect((config.website.protocol + "://" + config.website.domain) + (req.query['url'] || "/"));
        } catch(err) {
            console.log(err);
            res.redirect((config.website.protocol + "://" + config.website.domain) + (req.query['url'] || "/"));
        };
    });
    
    return router;
}