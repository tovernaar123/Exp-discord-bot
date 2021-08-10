const Discord = require('discord.js');
const rconToSend = `/sc local admins, ctn = {}, 0 for _, p in ipairs(game.connected_players) do if p.admin then ctn = ctn + 1 admins[ctn] = p.name end end rcon.print('Online('..ctn..') : \\n'..table.concat(admins, '\\n'))`; //get Admins, then add count, then display.

/**
 * 
 * @param {number} server 
 * @param {Rcon} rcon 
 * @param {Discord.Message} msg
 * @returns {string} only returns if msg is not provided
 */
async function runCommand(server, rcon, msg) {
    let response;

    if (rcon.connected) {
        response = await rcon.send(rconToSend);
    } else {
        response = `Connection to S${server} is down.`;
    }

    if (!msg) {
        return response;
    }

    // If no response
    if (!response) {
        await msg.channel.send({content: `There was no response from the server, contact an admin to check the logs.`});
        console.log(`Error: Command - Admin Online did not recieved response from the server, check the logs for details.`);
    };

    // If repsonse by rcon / factorio exists than runs function "resp" in this case prints the rcon response
    // instead of sucess / fail message

    if (response) {
        const Embed = Discord.MessageEmbed();
        Embed.addField('Online Admins', `request by ${msg.author.displayName} \n \u200B`, false);
        Embed.addField(`S${server}`, response, true);
        await msg.channel.send({embeds: [Embed]});
        console.log(`Info: Command - Admin Online checked admins online for S${server}: ${response}`);
    }
}

/**
 * 
 * @param {Rcon} rcons 
 * @param {Discord.Message} msg 
 * @returns {void}
*/
async function all_servers(rcons, msg) {
    const Embed = Discord.MessageEmbed();
    Embed.addField('Online Admins', `requested by ${msg.author.displayName}`, false);

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
        Embed.addField(`\u200B`, `\u200B`, true);
    }

    await msg.channel.send({embeds: [Embed]});
}

module.exports = {
    name: 'ao',
    aka: ['adminonline', 'adminsonline', 'admins'],
    description: 'Get numbers of admins online (Mod+)',
    guildOnly: true,
    args: true,
    required_role: role.staff,
    usage: `<server#>`,
    async execute(msg, args, rcons, internal_error) {
        let author = msg.author.displayName;
        let server = args[0] || 'all';

        if (isNaN(server)) {
            // Server is word
            server =  Number(server.replace('/server/i', '').replace('/s/i', '')) || server;
        } 
        
        if (server < 1 || server > 8 || isNaN(server)) {
            channel.send({content: `Error: Lookup out of range.`}).catch((err) => {internal_error(err); return});
            console.log(`Error: Command - Admin Online did not have a proper range included.`);
            server = -1;
            return;
        }

        if (args.length > 1) {
            msg.channel.send({content: `No extra arguments needed. Correct usage: \`.exp ao <server#>\``}).catch((err) => {internal_error(err); return});
            console.log(`Error: Command - Admin Online was given too many arguments.`);
        }

        if (server < 9 && server > 0) {
            console.log(`Info: Command - Admin Online server is ${server}.`);
            runCommand(server, rcons[server], msg).catch((err) => {internal_error(err); return});
        } else if (server === 'all') {
            console.log(`Info: Command - Admin Online server is all.`);
            all_servers(rcons, msg).catch((err) => {internal_error(err); return});
        }
    },
};
