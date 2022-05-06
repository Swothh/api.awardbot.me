const Partners = require("../../../database/models/partners");
const config = require("../../../../award.config.js");
const express = require("express");
const router = express.Router();

module.exports = client => {
    router.get("/partners", async (req, res) => {
        try {
            res.json({
                success: true,
                message: req.locale["global"]["successful"],
                data: await Partners.find({}, { _id: 0, __v: 0 })
            });
        } catch(err) {
            console.log(err);
            res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
        };
    });
    
    return router;
};