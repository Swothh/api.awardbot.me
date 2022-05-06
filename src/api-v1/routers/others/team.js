const config = require("../../../../award.config.js");
const axios = require("axios");
const express = require("express");
const router = express.Router();

module.exports = client => {
    router.get("/team", async (req, res) => {
        try {
            const team = (await Promise.all(config.team.map(async member => {
                const { data } = await axios.get("https://linkcord.js.org/api/v3/user/" + member.id).catch(() => {});
                member.spotify = false;
                member.user = data ? (data.data ? data.data || false : false) : false;
                return member;
            }))).filter(_m => typeof _m.user == "object");
            
            res.json({ 
                success: true, 
                message: req.locale["global"]["successful"], 
                data: team
            });
        } catch(err) {
            console.log(err);
            res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
        };
    });
    
    return router;
};
