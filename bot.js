// Set up configuration
const config = require('config');

// Set up logging
const { DEBUG } = require('bunyan');
var Logger = require('bunyan');
const log = new Logger({
    name: 'fishbot',
    streams: [
        {
            stream: process.stdout,
            level: config.get('bot.logLevel')
        }]
    }
);

// Create the bot
const discord = require('discord.js');
const bot = new discord.Client();
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
        plugins.forEach(function(plugin) {
            plugin.config = config;
            plugin.log = log;
            // Allow plugins to specify their own startup methods
            // post-construction after config is passed
            if(typeof plugin.initialize === "function") {
                plugin.initialize()
            } 
        })
    })

    .catch(function onError(err) {
        log.error(`Error loading plugins: ${err}`);
    })

// Create event handlers for bot
bot.on('ready', () => {
    log.info({ bot }, `Logged in to Discord as ${bot.user.tag}`);
});

bot.setInterval(() => {
    plugins.forEach(async function (plugin) {
        if (typeof plugin.periodic === "function") {
            await plugin.periodic();
        }
    });
}, config.get('bot.intervalSeconds') * 1000);

bot.on('message', async receivedMessage => {
    plugins.forEach(async function (plugin) {
        if (typeof plugin.onMessage === "function") {
            await plugin.onMessage(receivedMessage);
        }
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
const token = config.get('bot.token');
bot.login(token)