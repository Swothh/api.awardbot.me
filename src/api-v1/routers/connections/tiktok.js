const fetch = require("node-fetch");

module.exports = (router, connectionsPath, users, passport, config) => {
    router.get(connectionsPath + "/tiktok/login", (req, res, next) => {
        const csrfState = Math.random().toString(36).substring(2);
        res.cookie('csrfState', csrfState, { maxAge: 9999999999999999 });
        let url = 'https://open-api.tiktok.com/platform/oauth/connect/';
        url += `?client_key=${config.auth.tiktok.key}`;
        url += `&scope=${config.auth.tiktok.scopes.map(a => a).join(',')}`;
        url += '&response_type=code';
        url += `&redirect_uri=${config.auth.tiktok.callback}`;
        url += '&state=' + csrfState;
        url += '&prompt=none';
        req.session._connectionCallback = req.query.url || '/';
        req.session._beta = req.query.__beta || false;
        req.session._connectionUser = req.user.id;
        res.redirect(url);
    })

    router.get(connectionsPath + "/tiktok/callback", async (req, res, next) => {
        let { code, state } = req.query;
        if (!code || !state) return res.send({
            success: false,
            message: "Something went wrong...",
            data: null
        });
        const { csrfState } = req.cookies;

        if (state !== csrfState) {
            res.status(422).send('Invalid state');
            return;
        }

        let url_access_token = 'https://open-api.tiktok.com/oauth/access_token/';
        url_access_token += '?client_key=' + config.auth.tiktok.key;
        url_access_token += '&client_secret=' + config.auth.tiktok.secret;
        url_access_token += '&code=' + code;
        url_access_token += '&grant_type=authorization_code';
        const accessToken = await fetch(url_access_token, {method: 'post'}).then(res => res.json());

        let url_refresh_token = 'https://open-api.tiktok.com/oauth/refresh_token/';
        url_refresh_token += '?client_key=' + config.auth.tiktok.key;
        url_refresh_token += '&grant_type=refresh_token';
        url_refresh_token += '&refresh_token=' + accessToken.data.refresh_token;
        const refreshToken = await fetch(url_refresh_token, {method: 'post'}) .then(res => res.json());
        if(accessToken && refreshToken) {
            let { data } = refreshToken;
            try {
                if(refreshToken) {
                    const userInfo = await fetch('https://open-api.tiktok.com/user/info/', {
                    body: JSON.stringify({
                        access_token: data.access_token,
                        open_id: data.open_id,
                        fields: ["open_id", "union_id", "avatar_url", "avatar_url_100", "avatar_url_200", "avatar_large_url", "display_name"]
                    }),
                    method: 'post'
                    }).then(res => res.json());
                    if(userInfo) {
                        try {
                            const _data = userInfo.data;
                            await users.updateOne({ user: req.session._connectionUser }, { 
                                tiktok: { 
                                    id: _data.user.open_id, 
                                    username: _data.user.display_name, 
                                    accessToken: data.access_token, 
                                    refreshToken: data.refresh_token 
                            }}, { upsert: true });
                            res.redirect((config.website.protocol + "://" + config.website.domain) + (req.session._connectionCallback || "/"));
                        } catch(err) {
                            console.error(err);
                            res.redirect((config.website.protocol + "://" + config.website.domain) + (req.session._connectionCallback || "/"));
                        };
                    } else {
                        res.send({
                            success: false,
                            message: "Something went wrong...",
                            data: null
                        });
                    }
                } else {
                    res.send({
                        success: false,
                        message: "Something went wrong...",
                        data: null
                    });
                }
            } catch(err) {
                console.error(err);
                res.redirect((config.website.protocol + "://" + config.website.domain) + (req.session._connectionCallback || "/"));
            };
        } else {
            res.send({
                success: false,
                message: "Something went wrong...",
                data: null
            });
        }

    })

    router.get(connectionsPath + "/tiktok/logout", async (req, res, next) => {
        try {
            await users.updateOne({ user: req.user.id }, { tiktok: {} });
            res.redirect((config.website.protocol + "://" + config.website.domain) + (req.query['url'] || "/"));
        } catch(err) {
            console.log(err);
            res.redirect((config.website.protocol + "://" + config.website.domain) + (req.query['url'] || "/"));
        };
    })
    return router;
};