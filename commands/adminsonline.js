// @ts-check
const Discord = require('discord.js');
const rconToSend = '/sc local admins, ctn = {}, 0 for _, p in ipairs(game.connected_players) do if p.admin then ctn = ctn + 1 admins[ctn] = p.name end end rcon.print(\'Online(\'..ctn..\') : \\n\'..table.concat(admins, \'\\n\'))'; //get Admins, then add count, then display.
let DiscordCommand = require('./../command.js');

const {format} = require('util');
let config = require('./../config');
config.addKey('AdminsOnline/WaitingForReply', 'Awaiting reply from servers...');

/**
 * 
 * @param {Number} server 
 * @param {import('./../rcon/RconClass')} rcon 
 * @param {import("discord.js").CommandInteraction} [interaction]
 * @returns {Promise<void | String>}
 */
async function runCommand(server, rcon, interaction) {
    let response;
    if (rcon.connected) {
        response = await rcon.Send(rconToSend);
    } else {
        response = format(config.getKey('ServerNotConnected'), server);
    }

    if (!interaction) {
        return response;
    }

    // If Responses is blank (not normal ao).
    if (!response) {
        await interaction.editReply(config.getKey('NoResponse'));
    }

    // If repsonse by rcon/factorio exists than runs function "resp" in this case prints the rcon response instead of sucess/fail message 
    if (response) {
        const Embed = new Discord.MessageEmbed();
        Embed.addField(`S${server}`, response, true);
        await interaction.editReply({ embeds: [Embed] });
    }
}
/**
 * 
 * @param {readonly import('./../rcon/RconClass')[]} rcons 
 * @param {import("discord.js").CommandInteraction} interaction 
 * @returns {Promise<void>}
*/
async function all_servers(rcons, interaction) {
    await interaction.editReply(config.getKey('AdminsOnline/WaitingForReply'));
    const Embed = new Discord.MessageEmbed();
    //adds fields for every server
    let amount_of_fields = 0;
    for (let i = 1; i < 9; i++) {
        let rcon = rcons[i];
        let res = await runCommand(i, rcon);
        if(!res) {Embed.addField(`S${i}`, 'No data', true); continue;}
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

class Adminsonline extends DiscordCommand {
    constructor() {
        let args = [
            DiscordCommand.CommonArgs.Server
        ];
        super({
            name: 'admins',
            description: 'Get the amount of admins online on the servers.',
            cooldown: 5,
            args: args,
            guildOnly: true,
            requiredRole: DiscordCommand.roles.staff
        });
    }
    /**
     * @type {import("./../command.js").Execute}
    */
    async execute(interaction) {
        await interaction.deferReply();
        /**
         * @type {String | Number}
        */
        let server = interaction.options.getString('server');
        if (server === 'all') {
            await all_servers(DiscordCommand.client.Rcons.GetAllRcons(), interaction);
        } else {
            server = parseInt(server);
            await runCommand(server, DiscordCommand.client.Rcons.GetRcon(server), interaction);
        }
    }
}


let command = new Adminsonline();
module.exports = command;