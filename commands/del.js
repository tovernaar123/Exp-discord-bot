const { Role } = require("discord.js");

module.exports = {
    name: 'del',
    aka: ['delete', 'dels'],
    description: 'delete posts (Admin/Mod only command)',
    guildOnly: true,
    args: true,
    helpLevel: 'role.admin',
    required_role: role.admin,
    usage: `<num of posts>`,
    execute(msg, args, _, internal_error) {
        const bulknum = Math.floor(Number(args[0]));
        if (!bulknum) {
            msg.channel.send('please pick a number first');
            console.log(`wanted to delete but did not tell us how many posts`);
            return;
        }

        if (isNaN(bulknum)) { // Checks if the `amount` parameter is a number. If not, the command throws an error
            msg.reply('The amount parameter isn`t a number!');
            console.log(`Not a number`);
            return;
        }
        if (bulknum > 20) {
            msg.reply('You can`t delete more than 20 messages at once!'); // makes sure less than 20 posts
            return;
        }
        if (bulknum < 1) {
            msg.reply('You have to delete at least 1 message!'); // makes sure 1 or more posts  
            return;
        }

        msg.channel.messages.fetch({ limit: bulknum }).then(messages => { // finds (feteches) messages
            msg.channel.bulkDelete(messages).catch((err) => { internal_error(err); return });
        }).catch((err) => { internal_error(err); return });

    },
};