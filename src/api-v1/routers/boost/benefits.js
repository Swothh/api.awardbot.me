const boosts = require("../../../database/models/boosts.js");
const config = require("../../../../award.config.js");
const benefits = require("../../../util/benefits.js");
const express = require("express");
const router = express.Router();

module.exports = client => {
    router.get("/:id", async (req, res) => {
        try {
            const _benefits = await benefits(req.params["id"]);
            if (!_benefits) return res.json({ success: false, message: req.locale["boost"]["not_found"], data: null });

            res.json({
                success: true,
                message: req.locale["global"]["successful"],
                data: _benefits
            });
        } catch(err) {
            console.log(err);
            res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
        };
    });
    
    return router;
};