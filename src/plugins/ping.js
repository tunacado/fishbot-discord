const prefix = '!';

var pingPlugin = (function () {
    return {
        onMessage: async function(message) {
            if (!message.content.startsWith(prefix) || message.author.bot) return;

            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            if (command === 'ping') {
                message.reply('Pong!');
            }
        }
    }
  })();

module.exports = pingPlugin;