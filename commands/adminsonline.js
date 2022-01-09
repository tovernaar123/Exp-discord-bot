const Discord = require('discord.js');
const rconToSend = '/sc local admins, ctn = {}, 0 for _, p in ipairs(game.connected_players) do if p.admin then ctn = ctn + 1 admins[ctn] = p.name end end rcon.print(\'Online(\'..ctn..\') : \\n\'..table.concat(admins, \'\\n\'))'; //get Admins, then add count, then display.
let Discord_Command = require('./../command.js');
/**
 * 
 * @param {number} server 
 * @param {Rcon} rcon 
 * @param {Discord.Message} msg
 * @returns {string} only returns if msg is not provided
 */
async function runCommand(server, rcon, interaction) {
    let response;
    if (rcon.connected) {
        response = await rcon.send(rconToSend);
    } else {
        response = `Connection to S${server} is down.`;
    }

    if (!interaction) {
        return response;
    }

    // If Responses is blank (not normal ao).
    if (!response) {
        await interaction.editReply('AO - There was no response from the server, this is not normal for this command please ask an admin to check the logs.');
        console.log('Rcon: There was no response (Admins Online), this is not normal for this command please ask an admin to check the logs.');
    }

    // If repsonse by rcon/factorio exists than runs function "resp" in this case prints the rcon response instead of sucess/fail message 
    if (response) {
        const Embed = Discord.MessageEmbed();
        Embed.addField(`S${server}`, response, true);
        await interaction.editReply({ embeds: [Embed] });
        console.log(`S${server} checked admins online: ${response}`);
    }
}
/**
 * 
 * @param {Rcon} rcons 
 * @param {Discord.Message} msg 
 * @returns {void}
*/
async function all_servers(rcons, interaction) {
    await interaction.editReply('Asked for all online admins: Awaiting reply from servers...');
    const Embed = Discord.MessageEmbed();

    //adds fields for every server
    let amount_of_fields = 0;
    for (let i = 1; i < 9; i++) {
        let rcon = rcons[i];
        let res = await runCommand(i, rcon);
        Embed.addField(`S${i}`, res, true);
        amount_of_fields += 1;
    }

    //adds empty fields to make the grid look good
    let amount_of_empty_spaces = 3 - (amount_of_fields % 3);
    for (let i = 0; i < amount_of_empty_spaces; i++) {
        //add and empty to make it look nice 
        Embed.addField('\u200B', '\u200B', true);
    }
    await interaction.editReply({ embeds: [Embed] });
}

class Adminsonline extends Discord_Command {
    constructor() {
        let args = [
            Discord_Command.common_args.server
        ];
        super({
            name: 'admins',
            aka: ['adminsonline'],
            description: 'Get the amount of admins online on the servers.',
            cooldown: 5,
            args: args,
            guildOnly: true
        });
    }

    async execute(interaction) {
        await interaction.deferReply();

        let server = interaction.options.getString('server');
        if (server === 'all') {
            await all_servers(Discord_Command.Rcons, interaction);
        } else {
            server = parseInt(server);
            await runCommand(server, Discord_Command.Rcons[server], interaction);
        }
    }
}


let command = new Adminsonline();
module.exports = command;