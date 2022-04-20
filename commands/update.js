// @ts-check
let { spawnSync } = require('child_process');



let DiscordCommand = require('./../command.js');
class Update extends DiscordCommand {
    constructor() {
        /**
         * @type {import("./../command.js").Argument[]}
         */
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
            description: 'This will update the bot to the specified branch.',
            cooldown: 5,
            args: args,
            guildOnly: true,
            requiredRole: DiscordCommand.roles.staff
        });
    }
    /**
     * @type {import("./../command.js").Authorize}
    */
    async authorize(interaction) {
        let admin = interaction.member.roles.highest.comparePositionTo(await interaction.guild.roles.fetch(DiscordCommand.roles.admin)) >= 0;
        
        let staff = interaction.member.roles.highest.comparePositionTo(await interaction.guild.roles.fetch(DiscordCommand.roles.staff)) >= 0;
        let contributing = interaction.member.roles.highest.comparePositionTo(await interaction.guild.roles.fetch(DiscordCommand.roles.contributor)) >= 0;
        let authorize = admin || (staff && contributing);
        if (!authorize) {
            await interaction.reply('You need either the Admin or Staff and contributing dev role to use this command.');
            console.log(`${interaction.member.displayName} tried to use the update command but does not have the right role`);
            return false;
        }
        return authorize;
    }

    /**
     * @type {import("./../command.js").Execute}
    */
    async execute(interaction) {
        await interaction.deferReply();
        let branch = interaction.options.getString('branch');
        let res = spawnSync('git', ['fetch']);
        res = spawnSync('git', ['checkout', `origin/${branch}`]);
        if (res.stdout) console.log(res.stdout.toString());
        if (res.stderr) console.log(res.stderr.toString());

        await interaction.editReply('Updating bot will restart now');
        res = spawnSync('npm', ['install']);
        if (res.stdout) console.log(res.stdout.toString());
        if (res.stderr) console.log(res.stderr.toString());
        res = spawnSync('pm2', ['restart', 'infoBot']);
        if (res.stdout) console.log(res.stdout.toString());
        if (res.stderr) console.log(res.stderr.toString());
    }
}
let command = new Update();
module.exports = command;