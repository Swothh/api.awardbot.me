const giveaways = require("../../../database/models/giveaways.js");
const config = require("../../../../award.config.js");
const { Permissions } = require("discord.js");
const express = require("express");
const router = express.Router();

module.exports = client => {
    router.get("/search", async (req, res) => {
        try {
            const _giveaways = await giveaways.find((req.query["id"] ? { guild: req.query["id"], private: false, status: "CONTINUES" } : { private: false, status: "CONTINUES" }), { _id: 0, __v: 0 }); 
            let _perPage = req.query.count;
            let _page = req.query.page;
            if (!_perPage) _perPage = 12;
            if (_page && isNaN(_page) || _page && Number(_page) < 1 ) _page = 1;
            
            if(!req.query["query"]) {
                let resData = _page ? _giveaways.slice((Number(_page) - 1) * _perPage, Number(_page) * _perPage) : _giveaways;
                res.json({ 
                    success: true,
                    message: req.locale["global"]["successful"],
                    data: resData.map(val => {
                        val.requireds = val.requireds.map(_r => {
                            _r.img = config.requireds[_r.provider] ? config.requireds[_r.provider].img : null;
                            return _r;
                        });

                        return val;
                    })
                });
            } else {
                let resData = _page ? _giveaways.filter(__ => Object.values(__).filter(_v => typeof _v == "string").some(_v => _v.toLowerCase().includes(req.query["query"].toLowerCase()))).slice((Number(_page) - 1) * _perPage, Number(_page) * _perPage) : _giveaways.filter(__ => __.title.toLowerCase().includes(req.query["query"].toLowerCase()));
                res.json({ 
                    success: true, 
                    message: req.locale["global"]["successful"], 
                    data: resData.map(val => {
                        val.requireds = val.requireds.map(_r => {
                            _r.img = config.requireds[_r.provider] ? config.requireds[_r.provider].img : null;
                            return _r;
                        });

                        return val;
                    })
                });
            };
        } catch(err) {
            console.log(err);
            res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
        };
    });

    return router;
};