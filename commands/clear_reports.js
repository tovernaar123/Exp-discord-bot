// @ts-check
let DiscordCommand = require('../command.js');

/**
 * 
 * @param {Number} server 
 * @param {import('./../rcon/RconClass')} rcon 
 * @param {import("discord.js").CommandInteraction<'cached'>} interaction 
 * @param {String} toClear
 * @returns {Promise<void>}
 */

async function runCommand(server, rcon, interaction, toClear) {
    if(!rcon.connected){
        await interaction.editReply(`S${server} is not connected the bot.`);
        return;
    }
    if(toClear.match(/\\|"|'/)){
        return void await interaction.editReply('You cannot use " , \\ or \' in the name of the player.');
    }
    if(interaction.member.displayName.match(/\\|"|'/)){
        return void await interaction.editReply('You cannot use " , \\ or \' in your username.');
    }
    let res = await rcon.Send(`/interface require("modules.control.reports").remove_all("${toClear}", "${interaction.member.displayName}")`);
    
    await interaction.editReply(`*Please make sure you have the correct username and a report was issued in #reports.* Server replies complete even if user does not exist. Server replied: ${res} By: ${interaction.member.displayName}.`);
}


class clear_reports extends DiscordCommand {
    constructor() {
        /**
         * @type {import("./../command.js").Argument[]}
         */
        let args = [
            DiscordCommand.CommonArgs.Server,
            {
                name: 'player',
                description: 'The name of the player you would like to clear reports for.',
                required: true,
                type: 'String'
            }
        ];
        super({
            name: 'clear_reports',
            description: 'Will clear the reports of a player.',
            cooldown: 5,
            args: args,
            guildOnly: true,
            requiredRole: DiscordCommand.roles.staff,
        });

    }
    /**
     * @type {import("./../command.js").Execute}
    */
    async execute(interaction) 
    {
        await interaction.deferReply();
        let server = parseInt(interaction.options.getString('server'));
        if(!server) return void await interaction.editReply('That is not a number');
        await runCommand(server, DiscordCommand.client.Rcons.GetRcon(server), interaction, interaction.options.getString('player'));
    }

}

let clear_report = new clear_reports();
module.exports = clear_report;