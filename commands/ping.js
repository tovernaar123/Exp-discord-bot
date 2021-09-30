let Discord_Command = require('./../command.js');

async function execute(interaction) {
	interaction.channel.send('Ping?, Ping what?... \n I mean Pong..');
	console.log ('"Pong"')
}

let flags = {
	description: 'Bot will reply with a pong if you wish to test that it is online and responding to proper commands.',
	aka: ['pings','ping?','p','pingme'],
	cooldown: 5,
	cooldown_msg: 'I don\'t really want to ping you this much :).',
	guildOnly: false,
	required_role: Discord_Command.roles.staff
}

let args = {
	number: 0
};

let command = new Discord_Command('ping', execute, flags, args);

module.exports = command;
