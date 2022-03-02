let { spawn } = require('child_process');
let shell = spawn('/bin/bash');

shell.stdout.on('data', data => {
    console.log(`[SHELL]: ${data}`);
});

shell.stderr.on('data', data => {
    console.error(`[SHELL ERROR]: ${data}`);
});

let Discord_Command = require('./../command.js');
class Update extends Discord_Command {
    constructor() {
        let args = [
            {
                name: 'branch',
                type: 'String',
                required: true,
                description: 'The branch to update to.'
            }
        ];
        super({
            name: 'update-bot',
            aka: [''],
            description: 'This will update the bot to the specified branch.',
            cooldown: 5,
            args: args,
            guildOnly: true,
            required_role: Discord_Command.roles.staff
        });
    }
    async authorize(interaction) {
        let admin = interaction.member.roles.highest.comparePositionTo(await interaction.guild.roles.fetch(Discord_Command.roles.admin)) >= 0;
        
        let staff = interaction.member.roles.highest.comparePositionTo(await interaction.guild.roles.fetch(Discord_Command.roles.staff)) >= 0;
        let contributing = interaction.member.roles.highest.comparePositionTo(await interaction.guild.roles.fetch(Discord_Command.roles.contributor)) >= 0;
        let authorize = admin || (staff && contributing);
        if (!authorize) {
            await interaction.reply('You need either the Admin or Staff and contributing dev role to use this command.');
            console.log(`${interaction.member.displayName} tried to use the update command but does not have the right role`);
            return false;
        }
        return authorize;
    }

    async execute(interaction) {
        await interaction.deferReply();
        let branch = interaction.options.getString('branch');

        shell.stdin.write(`git fetch; git checkout origin/${branch}\n`);
        await interaction.editReply('Updating bot will restart now');
        shell.stdin.write('npm i; pm2 restart infoBot\n');
    }
}
let command = new Update();
module.exports = command;