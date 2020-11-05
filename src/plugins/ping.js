const prefix = '!';

var pingPlugin = (function () {
    return {
        name: "ping",
        
        onMessage: async function(message) {
            if (!message.content.startsWith(prefix) || message.author.bot) return;

            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            if (command === 'ping') {
                if(this.config.get('plugins.pingPlugin.reply') === true) {
                    message.reply('Pong!');
                } else {
                    message.channel.send('Pong!');
                }
            }
        }
    }
  })();

module.exports = pingPlugin;