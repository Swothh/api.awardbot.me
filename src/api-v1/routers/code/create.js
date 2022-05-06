const promo = require("../../../database/models/promo.js");
const config = require("../../../../award.config.js");
const express = require("express");
const router = express.Router();

module.exports = client => {
    router.post("/create", async (req, res) => {
        try {
            if (!req._user["permissions"].find(_p => _p == "*" || _p == "CREATE_CODES")) return res.json({ success: false, message: "You must be * or CREATE_CODES permission to use this action!", data: null });
            let _u = req.query["u"], _a = req.query["a"], _d = req.query["d"];
            if (!_u || !_a || !_d) return res.json({ success: false, message: "No 'u', 'a' or 'd' provided!", data: null });
            if (isNaN(_u) || Number(_u) < 1 || Number(_u) > 50) return res.json({ success: false, message: "The number of uses must be at least 1 and at most 50!", data: null });
            if (isNaN(_a) || Number(_a) < 1 || Number(_a) > 10) return res.json({ success: false, message: "The amount of boost to be given should be at least 1 and at most 10!", data: null });
            if (isNaN(_d) || Number(_d) < (1000 * 60 * 5) || Number(_a) > (1000 * 60 * 60 * 24 * 30)) return res.json({ success: false, message: "The duration of the promo code must be between 5 minutes and 30 days!", data: null });

            let $cl = config.promoLength || 15;
            const { emoji: $gen } = require("../../../util/key");
            const _code = $gen($cl);

            const codeObj = {
                id: require("../../../util/key")(15),
                created_by: req.user.id,
                code: _code,
                boost_count: Number(_a),
                expires_at: String(Date.now() + Number(_d)),
                uses: Number(_u),
                used_by: []
            };

            await (new promo(codeObj)).save();
            res.json({
                success: true,
                message: req.locale["global"]["successful"],
                data: codeObj
            });
        } catch(err) {
            console.log(err);
            res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
        };
    });
    
    return router;
};