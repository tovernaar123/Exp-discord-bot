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

    // If Responses is blank (not normal ao) then runs function called respNone found below.
    if (!response) {
        await msg.channel.send({content: `AO - There was no response from the server, this is not normal for this command please ask an admin to check the logs.`});
        console.log(`Rcon: There was no response (Admins Online), this is not normal for this command please ask an admin to check the logs.`);
    };

    // If repsonse by rcon/factorio exists than runs function "resp" in this case prints the rcon response instead of sucess/fail message 
    if (response) {
        const Embed = Discord.MessageEmbed();
        Embed.addField('Online Admins', `request by ${msg.author.username} \n \u200B`, false);
        Embed.addField(`S${server}`, response, true);
        await msg.channel.send({embeds: [Embed]});
        console.log(`S${server} checked admins online: ${response}`);
    }
}

/**
 * 
 * @param {Rcon} rcons 
 * @param {Discord.Message} msg 
 * @returns {void}
*/
async function all_servers(rcons, msg) {
    await msg.channel.send({content: "Asked for all online admins: Awaiting reply from servers..."});
    const Embed = Discord.MessageEmbed();
    Embed.addField('Online Admins', `request by ${msg.author.displayName}`, false);

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
    description: 'how many players are online?',
    guildOnly: true,
    args: true,
    required_role: role.staff,
    usage: `<#>`,
    async execute(msg, args, rcons, internal_error) {
        let server = Number(args[0]) || args[0];
        let author = msg.author.displayName;

        if(!isNaN(server)){
            server = Math.floor(args[0]);
        }

        // Checks to see if the person specified a server number
        if (!server) {
            msg.channel.send({content: `Please pick a server. Just the number - ie S1 would be \`1\` (Currently 1-8). Correct usage is \`ao <Server#>\``})
                .catch((err) => {internal_error(err); return});
            console.log(`AO Check does not have server number`);
            return;
        }

        if (args.length > 1) {
            msg.channel.send({content: `No reasons (or extra arguments) needed - Please remove "${args.slice(1)}". Correct usage: \`ao <Server#>\``})
                .catch((err) => {internal_error(err); return});
            console.log(`AO was given too many arguments`);
        }

        if (server < 9 && server > 0) {
            console.log(`Server is ${server}`);
            runCommand(server, rcons[server], msg)
                .catch((err) => {internal_error(err); return});
        } else if (server === 'all') {
            all_servers(rcons, msg)
                .catch((err) => {internal_error(err); return});
        } else {
            // If a person DID give a server number but did NOT give the correct one it will return without running - is the server number is part of the array of the servers it could be (1-8 currently)
            msg.reply({content: `Please pick a server first just a number (1-8).  Correct usage is \` ao <server#>\``})
                .catch((err) => {internal_error(err); return});
            console.log(`players online by ${author} incorrect server number`);
        }

    },
};
