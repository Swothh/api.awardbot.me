const giveaways = require("../../../database/models/giveaways.js");
const config = require("../../../../award.config.js");
const { Permissions } = require("discord.js");
const express = require("express");
const router = express.Router();

module.exports = client => {
    router.get("/prizes", async (req, res) => {
        try {
            let _filter = req.query.query;
            let _perPage = req.query.count;
            let _page = req.query.page;
            if (!_perPage) _perPage = 12;
            if (_page && isNaN(_page) || _page && Number(_page) < 1 ) _page = 1;

            const _db = await giveaways.find({ status: 'CONTINUES' }, { _id: 0 }).select("id guild prize");
            res.json({ 
                success: true, 
                message: req.locale["global"]["successful"], 
                data: _page ? 
                    _db.filter(a => _filter ? a.prize.toLowerCase().includes(_filter.toLowerCase()) : a).slice((Number(_page) - 1) * _perPage, Number(_page) * _perPage) : 
                    _db.filter(a => _filter ? a.prize.toLowerCase().includes(_filter.toLowerCase()) : a) 
            });
        } catch(err) { 
            console.log(err);
            res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
        };
    });

    return router;
};