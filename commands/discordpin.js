const { Role } = require("discord.js");
const Discord = require('discord.js');

module.exports = {
    name: 'discordpin',
    aka: ['pin', 'pinpost'],
    description: 'Pins a post in our discord. Must run command in the same channel as the message you want to pin (Mod+ only)',
    guildOnly: true,
    args: true,
    helpLevel: 'role.staff',
    required_role: role.staff,
    usage: `<id>`,
    execute(msg, args, _, internal_error) {

        let idToPin = args[0];

        msg.channel.messages.fetch(idToPin)
            .then(msg => msg.pin())
            .then(console.log(`message ${idToPin} has been pinned in ${msg.channel.name}`))
            .catch((err) => { internal_error(err); return })
    },
};