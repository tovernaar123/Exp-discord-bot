// @ts-check
const Discord = require('discord.js');
const net = require('net');
let client = new net.Socket();
let config = require('./../config');


function GetReport(server, Admin, toUnBan, reason) {
    const Embed = new Discord.MessageEmbed();
    Embed.addField('Unban', 'A player has been UnBanned', false);
    Embed.addField('Server Details', `server: S${server}`, false);
    Embed.addField('Player', `${toUnBan}`, true);
    Embed.addField('By', `${Admin}`, true);
    Embed.addField('Reason', `${reason}`, true);
    Embed.setColor('#00ff00');
    return Embed;
}


/**
 * 
 * @param {String} player 
 * @param {String} reason 
 * @param {import("discord.js").CommandInteraction<'cached'>} interaction 
 */
async function normal_unban(player, reason, interaction) {
    let server;
    //Get the first connected rcon
    let rcon = DiscordCommand.client.Rcons.GetAllRcons().find((rcon, index) => {
        server = index;
        return rcon?.connected;
    });
    if (!rcon) throw new Error('No Rcon Connected'); 

    //unban the player
    await rcon.Send(`/unban ${player}`);

    //Send the message to the discord.
    await interaction.editReply(`${player} has been unbanned (Without out ban sync) on S${server}.`);
    //Send the report to the reports channel.
    let report = GetReport(server, interaction.member.displayName, player, reason);
    let ReportChannel = await interaction.guild.channels.cache.get(config.getKey('ReportChannel'));	
    if(!(ReportChannel instanceof Discord.TextChannel || ReportChannel instanceof Discord.ThreadChannel)) return void console.error('Wrong report channel.');
    await ReportChannel.send({ embeds: [report] });

}

let DiscordCommand = require('./../command.js');
class Unban extends DiscordCommand {
    constructor() {
        /**
         * @type {import("./../command.js").Argument[]}
         */
        let args = [
            {
                name: 'player',
                description: 'The player to unban',
                required: true,
                type: 'String'
            },
            {
                name: 'reason',
                description: 'The reason for the unban',
                required: false,
                type: 'String'
            }
        ];
        super({
            name: 'unban',
            description: 'Unbans the players on all servers.',
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
        //Get the player to unban.
        let player = interaction.options.getString('player');
        //get the reason for the unban (or set it to No reason provided).
        let reason = interaction.options.getString('reason') ?? 'No reason provided';

        //try conneting to the bansync socket.
        client.connect(config.getKey('BanSync/Sokect'), function () {
            let message = JSON.stringify({ request: 'unban-player', player, reason });
            console.log(`[BAN SYNC] <= ${message}`);
            //Send the message (request for unban).
            client.write(message);
            //listen for the response (just once).
            client.once('data', async function (data) {
                //convert the data to a string.
                let StringData = String(data);
                let json_data;
                //try to parse the data as json.
                try {
                    json_data = JSON.parse(StringData);
                    if (!json_data) throw new Error('No data recieved');
                } catch (error) {
                    //if the data is not json, then throw error. (and end the connection).
                    client.end();
                    throw new Error(`received malformed json from bansync ${StringData}`);
                }
                //Show the raw data in the console.
                console.log(`[BAN SYNC] => ${StringData}`);

                //if success the player has been unbanned. (else try to unban the player on the normal way).
                if (json_data.success === true) {
                    //Send the message to the discord.
                    await interaction.editReply(`${player} was unbanned on all servers for "${reason}".`);
                    //Get the report channel to send the report to.
                    let ReportChannel = await interaction.guild.channels.cache.get('764881627893334047'); 
                    //Create the embed to send.
                    let report = GetReport('<internal>', interaction.member.displayName, player, reason);
                    //Send the report to the report channel.
                    if(!(ReportChannel instanceof Discord.TextChannel || ReportChannel instanceof Discord.ThreadChannel)) return void console.error('Wrong report channel.');
                    await ReportChannel.send({ embeds: [report] });
                } else {
                    //try to unban the player on the normal way.
                    await interaction.editReply(`Their was an error tyring to unban ${player} with Ban sync trying rcon... (check logs)`);
                    await normal_unban(player, reason, interaction);
                    //Show the error in the console.
                    console.error(`[BAN SYNC] => ${json_data.error}`);
                }
                client.end();
            });
        });
        client.on('error', function (error) {
            console.error(`[BAN SYNC] => ${error}`);
            client.destroy();
            //try to unban the player on the normal way.
            //requires a catch to prevent the error from being thrown (if something goes wrong) since normal ban is async.
            normal_unban(player, reason, interaction).catch((normal_error) => {
                console.error(`[NORMAl UNBAN] => ${normal_error}`);
                interaction.editReply(`Their was a problem trying to unban ${player}. They player has (most probibly) **NOT** been unbanned.`).catch(
                    //If even this fails, the bot is broken and to prevent further damage, the bot will kill itself.
                    process.exit
                );
            });
        });

    }
}
let command = new Unban();
module.exports = command;