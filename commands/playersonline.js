const Discord = require('discord.js');
let Discord_Command = require('./../command.js');


/**
 * 
 * @param {Number} servernum the number name of the server not used for anything but printing
 * @param {Rcon} rcon the rcon to send the command 
 * @param {Discord.Message} send_message if given will send the result in an embed to the channel
 * @returns {string} the players that are online on the server
*/

async function oneCommand(servernum, rcon) {

    let res;
    if (rcon.connected) res = await rcon.send('/p o');
    else res = `S${servernum} is not connected to the bot`;
    return res;
}
/**
 * 
 * @param {Discord.Message} msg the message that excute this command
 * @param {Rcon} rcons the open rcon connection to the server
 * @returns {void}
*/
async function allCommand(interaction, rcons) {
    await interaction.editReply('Asked for all online players: Awaiting reply from servers...');

    const Embed = Discord.MessageEmbed();

    //adds field for every server
    let amount_of_fields = 0;
    for (let i = 1; i < 9; i++) {
        let res = await oneCommand(i, rcons[i]);
        Embed.addField(`S${i}`, res, true);
        amount_of_fields += 1;
    }

    //adds empty fields to make the grid look good
    let amount_of_empty_spaces = 3 - (amount_of_fields % 3);
    for (let i = 0; i < amount_of_empty_spaces; i++) {
        //add and empty to make it look nice 
        Embed.addField('\u200B', '\u200B', true);
    }

    //Send the embed
    return Embed;
}


class Playersonline extends Discord_Command {

    constructor() {
        
        let args = [
            {
                name: 'server',
                description: 'The server to check for online players.',
                usage: '<#number||"all">',
                required: true,
                type: 'String',
                choices: [
                    ['Sever 1', '1'],
                    ['Sever 2', '2'],
                    ['Sever 3', '3'],
                    ['Sever 4', '4'],
                    ['Sever 5', '5'],
                    ['Sever 6', '6'],
                    ['Sever 7', '7'],
                    ['Sever 8', '8'],
                    ['All servers', 'all'],
                ]
            },
        ];

        super({
            name: 'playersonline',
            aka: ['playersonline'],
            cooldown: 0.5,
            description: 'how many players are online?',
            cooldown_msg: 'Please wait a moment before using this command again.',
            guildOnly: true,
            args: args,
        });
    }

    async execute(interaction) {
        await interaction.deferReply();
        let server = await interaction.options.getString('server');

        if (server === 'all') {
            await interaction.editReply({ embeds: [await allCommand(interaction, Discord_Command.Rcons)] });
        } else {
            server = parseInt(server);
            let res = await oneCommand(server, Discord_Command.Rcons[server], interaction.msg, interaction.client);
            let embed = new Discord.MessageEmbed();
            embed.addField(`S${server}`, res, true);
            await interaction.editReply({ embeds: [embed] });

        }
    }
}


let command = new Playersonline();
module.exports = command;