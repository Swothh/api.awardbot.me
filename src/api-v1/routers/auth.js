const DiscordStrategy = require("passport-discord").Strategy;
const YoutubeStrategy = require("passport-youtube-v3").Strategy;
const GithubStrategy = require("passport-github").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;
const TwitchStrategy = require("passport-twitch-strategy").Strategy;
const TelegramStrategy = require("passport-telegram").Strategy;
const users = require("../../database/models/users.js");
const config = require("../../../award.config.js");
const ig = require("../../database/models/ig.js");
const Discord = require("discord.js");
const passport = require("passport");
const fetch = require("node-superfetch");
const express = require("express");

module.exports = settings => {
    const {
        router,
        path,
        connectionsPath,
        client
    } = settings;

    // <DISCORD STRATEGY> //
    passport.use(
        new DiscordStrategy({
            clientID: config.auth.discord.id, 
            clientSecret: config.auth.discord.secret, 
            callbackURL: config.auth.discord.callback, 
            scope: config.auth.discord.scopes 
        }, (accessToken, refreshToken, profile, done) => {
            process.nextTick(() => done(null, profile));
        })
    );
    // </DISCORD STRATEGY> //

    // <YOUTUBE STRATEGY> //
    passport.use(
        new YoutubeStrategy({
            clientID: config.auth.youtube.id,
            clientSecret: config.auth.youtube.secret,
            callbackURL: config.auth.youtube.callback,
            scope: config.auth.youtube.scopes
        }, function(accessToken, refreshToken, profile, done) {
            process.nextTick(() => done(null, Object.assign(profile, {
                accessToken, refreshToken
            })));
        }
    ));
    // </YOUTUBE STRATEGY> //

    // <GITHUB STRATEGY> //
    passport.use(
        new GithubStrategy({
            clientID: config.auth.github.id,
            clientSecret: config.auth.github.secret,
            callbackURL: config.auth.github.callback,
            scope: config.auth.github.scopes
        }, function(accessToken, refreshToken, profile, done) {
            process.nextTick(() => done(null, Object.assign(profile, {
                accessToken
            })));
        }
    ));
    // </GITHUB STRATEGY> //


    // <TWITTER STRATEGY> //
    passport.use(
        new TwitterStrategy({
            consumerKey: config.auth.twitter.id,
            consumerSecret: config.auth.twitter.secret,
            callbackURL: config.auth.twitter.callback,
            scope: config.auth.twitter.scopes
        }, function(accessToken, refreshToken, profile, done) {
            process.nextTick(() => done(null, Object.assign(profile, {
                accessToken, refreshToken
            })));
        }
    ));
    // </TWITTER STRATEGY> //

    // <TWITCH STRATEGY> //
    passport.use(
        new TwitchStrategy({
            clientID: config.auth.twitch.id,
            clientSecret: config.auth.twitch.secret,
            callbackURL: config.auth.twitch.callback,
            scope: config.auth.twitch.scopes
        }, function(accessToken, refreshToken, profile, done) {
            process.nextTick(() => done(null, Object.assign(profile, {
                accessToken, refreshToken
            })));
        }
    ));
    // </TWITCH STRATEGY> //

    // <TELEGRAM STRATEGY> //
    passport.use(
      new TelegramStrategy({
        clientID: "5212483120",
        clientSecret: "AAGg1wTqykQf4uI9XS8WziPtbs0rA-9Tlg8",
        callbackURL: 'https://api.awardbot.me/v1/connections/telegram/callback'
      },
      function(accessToken, refreshToken, profile, done) {
            process.nextTick(() => done(null, Object.assign(profile, {
                accessToken, refreshToken
            })));
      }));

    // </TELEGRAM STRATEGY> //


    // <PASSSPORT SETTINGS> //
    passport.serializeUser((user, done) => { done(null, user) });
    passport.deserializeUser((obj, done) => { done(null, obj) });
    router.use(passport.initialize());
    router.use(passport.session());
    // </PASSSPORT SETTINGS> //
  

    // <CONNECTION ROUTERS> //
    return {
        discord: require("./connections/discord.js")(express.Router(), path, users, passport, config, fetch, Discord, client),
        youtube: require("./connections/youtube.js")(express.Router(), connectionsPath, users, passport, config),
        github: require("./connections/github.js")(express.Router(), connectionsPath, users, passport, config),
        twitter: require("./connections/twitter.js")(express.Router(), connectionsPath, users, passport, config),
        twitch: require("./connections/twitch.js")(express.Router(), connectionsPath, users, passport, config),
        tiktok: require('./connections/tiktok.js')(express.Router(), connectionsPath, users, passport, config),
        telegram: require('./connections/telegram.js')(express.Router(), connectionsPath, users, passport, config)
    };
    // </CONNECTION ROUTERS> //

};