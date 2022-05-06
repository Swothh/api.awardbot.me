const config = require("../../../../award.config.js");
const express = require("express");
const router = express.Router();

module.exports = client => {
    router.get("/requireds", async (req, res) => {
        try {
            res.json({ 
                success: true, 
                message: req.locale["global"]["successful"], 
                data: Object.keys(config.requireds).filter(_required => (
                    _required == "discord" ? req._user["profile"] : req._user[_required]
                )).map(_required => ({
                    name: _required,
                    img: config.requireds[_required].img,
                    types: config.requireds[_required].types.map(_type => {
                        _type.name = _type.name.split("_").join(" ");
                        return _type;
                    })
                }))
            });
        } catch(err) {
            console.log(err);
            res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
        };
    });
    
    return router;
};