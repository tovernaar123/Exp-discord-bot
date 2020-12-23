module.exports = {
	name: 'ping',
	description: 'Bot will reply with a pong if you wish to test that it is online and responding to proper commands.',
	aka: ['pings','ping?','p','pingme'],
	cooldown: 5,
	guildOnly: false,
	usage: ` (with no arguments)`,
	args: false,
	
	
	async execute(msg, args) {
        msg.channel.send('Ping?, Ping what?... \n I mean Pong..');
        console.log ('"Pong"')
	},
};
