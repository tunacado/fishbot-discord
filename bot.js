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
            plugin.bot = bot;
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

bot.setInterval(() => {
    // Run periodically for plugins
    plugins.forEach(async function (plugin) {
        if (typeof plugin.periodic === "function") {
            await plugin.periodic();
        }
    });
}, config.get('bot.intervalSeconds') * 1000);

bot.on('message', async receivedMessage => {
    // Any message is received
    plugins.forEach(async function (plugin) {
        if (typeof plugin.onMessage === "function") {
            await plugin.onMessage(receivedMessage);
        }
    });
});

bot.on('messageDelete', async message => {
    // Any message is received
    plugins.forEach(async function (plugin) {
        if (typeof plugin.onMessageDelete === "function") {
            await plugin.onMessageDelete(message);
        }
    });
});


bot.on('messageReactionAdd', async (messageReaction, user) => {
    // User adds a reaction
    // Only works on cached messages
    plugins.forEach(async function (plugin) {
        if (typeof plugin.onReactionAdd === "function") {
            await plugin.onReactionAdd(messageReaction, user);
        }
    });
});

bot.on('messageReactionRemove', async (messageReaction, user) => {
    // User removes a reaction
    // Only works on cached messages
    plugins.forEach(async function (plugin) {
        if (typeof plugin.onReactionRemove === "function") {
            await plugin.onReactionRemove(messageReaction, user);
        }
    });
});

bot.on('guildMemberAdd', member => {
    // User joins the server
    plugins.forEach(async function (plugin) {
        if (typeof plugin.onUserJoinServer === "function") {
            await plugin.onUserJoinServer(member);
        }
    });
});

bot.on('guildMemberRemove', member => {
    // User leaves the server
    plugins.forEach(async function (plugin) {
        if (typeof plugin.onUserLeaveServer === "function") {
            await plugin.onUserLeaveServer(member);
        }
    });
});

bot.on('guildMemberUpdate', (oldMember, newMember) => {
    // User is updated
    plugins.forEach(async function (plugin) {
        if (typeof plugin.onUserUpdate === "function") {
            await plugin.onUserUpdate(oldMember, newMember);
        }
    });
});

bot.on('guildUpdate', (oldGuild, newGuild) => {
    // Server is updated
    plugins.forEach(async function (plugin) {
        if (typeof plugin.onServerUpdate === "function") {
            await plugin.onServerUpdate(oldGuild, newGuild);
        }
    });
});

bot.on('presenceUpdate', (oldPresence, newPresence) => {
    // Server is updated
    plugins.forEach(async function (plugin) {
        if (typeof plugin.onUserStateChange === "function") {
            await plugin.onUserStateChange(oldPresence, newPresence);
        }
    });
});


bot.on('voiceStateUpdate', (oldState, newState) => {
    if(oldState.voiceChannel === undefined && newState.voiceChannel !== undefined) {
        // User joins a channel
        plugins.forEach(async function (plugin) {
            if (typeof plugin.onUserJoinChannel === "function") {
                await plugin.onUserJoinChannel(newState.channel);
            }
        });
    } else if(oldState.voiceChannel === undefined) {
        // User leaves a channel
        plugins.forEach(async function (plugin) {
            if (typeof plugin.onUserLeaveChannel === "function") {
                await plugin.onUserLeaveChannel(oldstate.channel);
            }
        });
    } else if(oldState.mute && !newState.mute) {
        // User unmuted
        plugins.forEach(async function (plugin) {
            if (typeof plugin.onUserUnmute === "function") {
                await plugin.onUserUnmute(newState.channel);
            }
        });
    } else if(!oldState.mute && newState.mute) {
        // User muted
        plugins.forEach(async function (plugin) {
            if (typeof plugin.onUserMute === "function") {
                await plugin.onUserMmute(newState.channel);
            }
        });
    }
});

// Bot internal actions only
bot.on('ready', () => {
    log.info({ bot }, `Logged in to Discord as ${bot.user.tag}`);
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