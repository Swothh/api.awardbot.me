const config = require("../../award.config.js");
const { connect } = require("mongoose");

module.exports = () => {
    connect(config.mongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: false
    }).then(() => {
        console.log("(!) Connected to database!");
    }).catch(err => {
        console.log(err);
        console.log("(!) Failed connecting to database!");
        process.exit(1);
    });
};