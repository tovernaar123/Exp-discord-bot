let Discord_Command = require('./../command.js');

class Ping extends Discord_Command {
    constructor() {
        let config = {
            name: 'ping',
            description: 'Bot will reply with a pong if you wish to test that it is online and responding to proper commands.',
            aka: ['pings','ping?','p','pingme'],
            cooldown: 5,
            cooldown_msg: 'I don\'t really want to ping you this much :).',
            guildOnly: false,
            args: {},
        };
        super(config);
    }

    async execute(interaction) {
        interaction.reply('Ping?, Ping what?... \n I mean Pong..');
        console.log ('"Pong"');
    }
	
}


let command = new Ping();

module.exports = command;

