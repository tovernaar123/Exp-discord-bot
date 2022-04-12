let DiscordCommand = require('./../command.js');
class Help extends DiscordCommand {
    constructor() {
        let commands = DiscordCommand.client.commands.map(
            (command) => {
                return [command.name, command.name];
            }
        );
        let args = [
            {
                name: 'command',
                type: 'String',
                required: false,
                description: 'The command to get info on.',
                choices: commands
            },
            {
                name: 'argument',
                type: 'String',
                required: false,
                description: 'The argument to get info on.',
            }
        ];
        super({
            name: 'help',
            aka: ['helpme', 'h', 'a'],
            description: 'Get a list of all my commands or get info about a specific command.',
            cooldown: 5,
            args: args,
            guildOnly: true
        });
    }

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        let command_name = interaction.options.getString('command');
        let argument = interaction.options.getString('argument');
        if (command_name) {
            let cmd = DiscordCommand.client.commands.find(c => c.name === command_name || c.aka?.includes(command_name));
            if (!cmd) {
                await interaction.editReply('That\'s not a valid command!');
                return;
            }
            if (argument) {
                let arg = cmd.args.find(a => a.name === argument);
                if (!arg) {
                    await interaction.editReply('That\'s not a valid argument!');
                    return;
                }
                await interaction.editReply(`**Name:** ${arg.name}\n**Type:** ${arg.type}\n**Required:** ${arg.required}\n**Description:** ${arg.description}`);
                return;
            }
            let data = [];
            data.push(`**Name:** ${cmd.name}`);
            if (cmd.aka) data.push(`**Aliases:** ${cmd.aka.join(', ')}`);
            if (cmd.description) data.push(`**Description:** ${cmd.description}`);
            if (cmd.usage) data.push(`**Usage:** ${cmd.usage}`);
            data.push(`**Cooldown:** ${cmd.cooldown || 5} second(s)`);
            await interaction.editReply(data.join('\n'));
        } else {
            if (this.requiredRole) {
                let role = await interaction.guild.roles.fetch(this.requiredRole);
                let allowed = interaction.member.roles.highest.comparePositionTo(role) >= 0;
                if (!allowed) {
                    interaction.reply(`You do not have ${role.name} permission.`);
                    return false;
                }
            }
            let admin = interaction.member.roles.highest.comparePositionTo(await interaction.guild.roles.fetch(DiscordCommand.roles.admin)) >= 0;
            let mod = (interaction.member.roles.highest.comparePositionTo(await interaction.guild.roles.fetch(DiscordCommand.roles.mod)) >= 0) || admin;
            let staff = (interaction.member.roles.highest.comparePositionTo(await interaction.guild.roles.fetch(DiscordCommand.roles.staff)) >= 0) || mod;
            let board = (interaction.member.roles.highest.comparePositionTo(await interaction.guild.roles.fetch(DiscordCommand.roles.board)) >= 0) || staff;

            let data = [];
            data.push('Here\'s a list of all my commands (that you can use):\n');

            if (admin) {
                data.push('**Admin Commands**');
                let adminCommands = DiscordCommand.client.commands.filter(cmd => cmd.requiredRole === DiscordCommand.roles.admin);
                data.push(adminCommands.map(cmd => `\`${cmd.name}\``).join(', '));
            }

            if (mod) {
                data.push('**Mod Commands**');
                let ModCommands = DiscordCommand.client.commands.filter(cmd => cmd.requiredRole === DiscordCommand.roles.mod);
                data.push(ModCommands.map(cmd => `\`${cmd.name}\``).join(', '));
            }

            if (staff) {
                data.push('**Staff Commands**');
                let staffCommands = DiscordCommand.client.commands.filter(cmd => cmd.requiredRole === DiscordCommand.roles.staff);
                data.push(staffCommands.map(cmd => `\`${cmd.name}\``).join(', '));
            }

            if (board) {
                data.push('**Board Commands**');
                let boardCommands = DiscordCommand.client.commands.filter(cmd => cmd.requiredRole === DiscordCommand.roles.board);
                data.push(boardCommands.map(cmd => `\`${cmd.name}\``).join(', '));
            }


            data.push('**Public Commands**');
            let publicCommands = DiscordCommand.client.commands.filter(cmd => !cmd.requiredRole);
            data.push(publicCommands.map(cmd => `\`${cmd.name}\``).join(', '));

            data.push('\nYou can send `/help [command name]` to get info on a specific command!');
            await interaction.editReply(data.join('\n'));

        }
    }
}
let command = new Help();
module.exports = command;