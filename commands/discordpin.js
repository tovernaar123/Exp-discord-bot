const { Role } = require("discord.js");

module.exports = {
    name: 'pin',
    aka: ['pin', 'pinpost'],
    description: 'pin a post (Mod+ only)',
    guildOnly: true,
    args: true,
    helpLevel: 'role.staff',
    required_role: role.staff,
    usage: `<id>`,
    execute(msg, args, _, internal_error) {
        const idToPin = Math.floor(Number(args[0]));
        if (!idToPin) {
            msg.channel.send('please pick an id first');
            console.log(`wanted to pin but did not pick an id first`);
            return;
        }

        if (isNaN(idToPin)) { // Checks if the `amount` parameter is a number. If not, the command throws an error
            msg.reply('The id is not a number');
            console.log(`id is not an id/number`);
            return;
        }
        if (idToPin < 1) {
            msg.reply('an id number can not be this small'); // makes sure 1 or more posts  
            return;
        }


        msg.channel.messages.fetch(id)
        .then(message => message.pin())
        .catch((err) => { internal_error(err); return })
    },
};