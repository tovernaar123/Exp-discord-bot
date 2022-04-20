// @ts-check
let DiscordCommand = require('./../command.js');
class Help extends DiscordCommand {
    constructor() {
        let commands = DiscordCommand.client.Commands.map(
            /**
             * 
             * @param {DiscordCommand} command 
             * @returns {[string, string]}
             */
            (command) => {
                return [command.name, command.name];
            }
        );
        /**
         * @type {import("./../command.js").Argument[]} 
        */
        let args = [
            {
                name: 'command',
                type: 'String',
                required: false,
                description: 'The command to get info on.',
                choices: commands
            },
            {
                name: 'subcommand',
                type: 'String',
                required: false,
                description: 'The Subcommand to get info on.',
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
            description: 'Get a list of all my commands or get info about a specific command.',
            cooldown: 5,
            args: args,
            guildOnly: true,
            requiredRole: false
        });
    }

    /**
     * @type {import("./../command.js").Execute}
    */
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        let commandName = interaction.options.getString('command');
        let argument = interaction.options.getString('argument');
        let Subcommand = interaction.options.getString('subcommand');
        if (commandName) {
            /**
             * @type {DiscordCommand}
            */
            let cmd = DiscordCommand.client.Commands.find(c => c.name === commandName);
            if (Subcommand) {
                if(!cmd.Subcommands) return void await interaction.editReply('That\'s not a valid command!');
                cmd = cmd.Subcommands.find(c => c.name === Subcommand);
            }
            if (!cmd) {
                await interaction.editReply('That\'s not a valid command!');
                return;
            }
            if (argument) {
                let arg = cmd.args.find((arg) => {
                    if (arg.type === 'Subcommand') return false;
                    return arg.name === argument;
                });
                if (!arg) {
                    await interaction.editReply('That\'s not a valid argument!');
                    return;
                }
                if (arg.type === 'Subcommand') return;
                await interaction.editReply(`**Name:** ${arg.name}\n**Type:** ${arg.type}\n**Required:** ${arg.required}\n**Description:** ${arg.description}`);
                return;
            }

            /**
             * @type {string[]} 
            */
            let data = [];
            data.push(`**Name:** ${cmd.name}`);
            if (cmd.description) data.push(`**Description:** ${cmd.description}`);
            if (cmd.usage) data.push(`**Usage:** ${cmd.usage}`);
            data.push(`**Cooldown:** ${cmd.cooldown || 5} second(s)`);
            await interaction.editReply(data.join('\n'));
        } else {
            let admin = interaction.member.roles.highest.comparePositionTo(await interaction.guild.roles.fetch(DiscordCommand.roles.admin)) >= 0;
            let mod = (interaction.member.roles.highest.comparePositionTo(await interaction.guild.roles.fetch(DiscordCommand.roles.mod)) >= 0) || admin;
            let staff = (interaction.member.roles.highest.comparePositionTo(await interaction.guild.roles.fetch(DiscordCommand.roles.staff)) >= 0) || mod;
            let board = (interaction.member.roles.highest.comparePositionTo(await interaction.guild.roles.fetch(DiscordCommand.roles.board)) >= 0) || staff;

            let data = [];
            data.push('Here\'s a list of all my commands (that you can use):\n');

            if (admin) {
                data.push('**Admin Commands**');
                let adminCommands = DiscordCommand.client.Commands.filter(cmd => cmd.requiredRole === DiscordCommand.roles.admin);
                data.push(adminCommands.map(cmd => `\`${cmd.name}\``).join(', '));
            }

            if (mod) {
                data.push('**Mod Commands**');
                let ModCommands = DiscordCommand.client.Commands.filter(cmd => cmd.requiredRole === DiscordCommand.roles.mod);
                data.push(ModCommands.map(cmd => `\`${cmd.name}\``).join(', '));
            }

            if (staff) {
                data.push('**Staff Commands**');
                let staffCommands = DiscordCommand.client.Commands.filter(cmd => cmd.requiredRole === DiscordCommand.roles.staff);
                data.push(staffCommands.map(cmd => `\`${cmd.name}\``).join(', '));
            }

            if (board) {
                data.push('**Board Commands**');
                let boardCommands = DiscordCommand.client.Commands.filter(cmd => cmd.requiredRole === DiscordCommand.roles.board);
                data.push(boardCommands.map(cmd => `\`${cmd.name}\``).join(', '));
            }

            data.push('**Public Commands**');
            let publicCommands = DiscordCommand.client.Commands.filter(cmd => !cmd.requiredRole);
            data.push(publicCommands.map(cmd => `\`${cmd.name}\``).join(', '));

            data.push('\nYou can send `/help [command name]` to get info on a specific command!');
            await interaction.editReply(data.join('\n'));

        }
    }
}
let command = new Help();
module.exports = command;