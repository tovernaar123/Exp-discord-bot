const { Discord } = require("discord.js");

let prefix = process.env.PREFIX;
module.exports = {
    name: 'help',
    aka: ['helpme', 'h', 'a'],
    description: 'List all of my commands or info about a specific command.',
    aliases: ['commands'],
    usage: '[command name]',
    guildOnly: false,
    cooldown: 5,
    async execute(msg, args) {
        const data = [];
        const { commands } = msg.client;
        if (!args.length && msg.channel.type == "GUILD_TEXT") {
            let canKick = msg.member.permissions.has('KICK_MEMBERS');
            let isStaff = msg.member.roles.cache.has(role.staff);
            let isMod = msg.member.roles.cache.has(role.mod);
            let isAdmin = msg.member.roles.cache.has(role.admin);
            let isSadmin = msg.member.roles.cache.has(role.sadmin);
            let isBoard = msg.member.roles.cache.has(role.board);
            data.push(`Only commands you have access to will be listed: (Your permissions ->): *Board:${isBoard}, Staff:${isStaff}, Mod:${isMod} , Admin:${isAdmin}, Senior Admin:${isSadmin}* `);
            data.push('\nHere\'s a list of all my commands:\n**Public Commands**');
            let commandList = commands
                .filter(command => command.required_role != role.board)
                .filter(command => command.required_role != role.staff)
                .filter(command => command.required_role != role.admin)
                .filter(command => command.helpLevel != "owner")
                .map(command => command.name).join(', ');

            data.push(`\`${commandList}\``);
            //Semi Restricted Public Items//
            data.push(`**Special (semi-public) Commands:**`);
            let semiPublic = commands.filter(command => command.helpLevel === "all").map(command => command.name).join(', ');
            data.push(`\`${semiPublic}\``);
            //Board+//
            if (isBoard || isStaff) {
                data.push(`**Board Member(s) Commands:**`);
                let boardStuff = commands.filter(command => command.required_role === role.board).map(command => command.name).join(', ');
                data.push(`\`${boardStuff}\``);

            }
            if (canKick || isStaff || isAdmin || isMod || isSadmin) {
                data.push(`**Staff (role) Commands:**`);
                //data.push(commands.filter(command => command.required_role === "bob").map(command =>command.name).join('\n'));
                //data.push(commands.filter(command => command.required_role === role.admin).map(command =>command.name).join('\n'));
                let staffStuff = commands.filter(command => command.required_role === role.staff).map(command => command.name).join(', ');
                data.push(`\`${staffStuff}\``)
            } if (isAdmin || isSadmin) {
                data.push(`**Amdin (role) Commands:**`);
                let adminStuff = commands.filter(command => command.required_role === role.admin).map(command => command.name).join(', ');
                data.push(`\`${adminStuff}\``);
            }
            data.push(`\nYou can send \`${prefix} help [command name]\` to get info on a specific command!`);
            return msg.author.send(data.join('\n'))// + `K${canKick},S${isStaff},A${isAdmin},B${isBoard} ... \n Check:`+ role.staff +"staff", { split: true })
                .then(() => {
                    if (msg.channel.type === 'dm') return;
                    msg.reply('I\'ve sent you a DM with all my commands!');
                })
                .catch(error => {
                    console.error(`Could not send help DM to ${msg.author.tag}.\n`, error);
                    msg.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
                });

        } else if (!args.length) {
            return msg.reply(`You can send \`${prefix} help [command name]\` to get info on a specific command! or \`${prefix} help\` any any guild that the bot is in for a full list of commands`);
        }

        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aka && c.aka.includes(name));

        if (!command) {
            return msg.reply('that\'s not a valid command!');
        }

        data.push(`**Name:** ${command.name}`);

        if (command.aka) data.push(`**Aliases:** ${command.aka.join(', ')}`);
        if (command.description) data.push(`**Description:** ${command.description}`);
        if (command.usage) data.push(`**Usage:** ${prefix} ${command.name} ${command.usage}`);

        data.push(`**Cooldown:** ${command.cooldown || 30} second(s)`);
        msg.channel.send(data.join('\n'));
    },
};
