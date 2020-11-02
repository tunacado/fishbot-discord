// Set up logging
const { DEBUG } = require('bunyan');
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: "fishbot"});
log.level(DEBUG);

// Create the bot
const discord = require('discord.js');
const bot = new discord.Client()
const fs = require('fs');

// Load plugins
var loadPlugins = require('plugin-system');
let plugins;
loadPlugins(
    {
        paths: [
            __dirname + `/src/plugins/`
        ]
    }, log)
    .then(function onSuccess(loadedPlugins) {
        log.info(`Loaded plugins: ${loadedPlugins}`);
        plugins = loadedPlugins;
        
    })

    .catch(function onError(err) {
        log.error(`Error loading plugins: ${err}`);
    })

// Create event handlers for bot
bot.on('ready', () => {
    log.info({ bot }, `Logged in to Discord as ${bot.user.tag}`);
});

bot.on('message', async receivedMessage => {
    plugins.forEach(async function (plugin) {
        if (typeof plugin.onMessage === "function") {
            await plugin.onMessage(receivedMessage);        }
    });
});

// Only works on cached messages
bot.on('messageReactionAdd', async (messageReaction, user) => {
    plugins.forEach(async function (plugin) {
        if (typeof plugin.onReactionAdd === "function") {
            await plugin.onReactionAdd(messageReaction, user);
        }
    });
});

// Only works on cached messages
bot.on('messageReactionRemove', async (messageReaction, user) => {
    plugins.forEach(async function (plugin) {
        if (typeof plugin.onReactionRemove === "function") {
            await plugin.onReactionRemove(messageReaction, user);
        }
    });
});

bot.on('guildMemberAdd', member => {
    plugins.forEach(async function (plugin) {
        if (typeof plugin.onUserJoin === "function") {
            await plugin.onUserJoin(member);
        }
    });
});

bot.on('rateLimit', rateLimitInfo => {

});

bot.on('warn', info => {

});

bot.on('error', error => {
    
});

// Start the bot
bot.login("SOME_TOKEN")