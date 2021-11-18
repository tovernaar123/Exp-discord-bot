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
async function allCommand(msg, rcons) {
    await msg.channel.send("Asked for all online players: Awaiting reply from servers...");

    const Embed = Discord.MessageEmbed();
    Embed.addField('Online Players', `request by ${msg.author.username}`, false);

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
        Embed.addField(`\u200B`, `\u200B`, true);
    }

    //Send the embed
    return Embed;
}


let args = [
    {
        name: 'Server',
        description: 'The server to check for online players.',
        usage: '<#number||"all">',
        optional: false,
        type: "String",
    },
];

let flags = {
    name: 'Playersonline',
    aka: ['playersonline'],
    cooldown: 0.5,
    description: 'how many players are online?',
    cooldown_msg: 'please wait a moment before using this command again',
    guildOnly: true,
    args: args,
}

class Playersonline extends Discord_Command {

    constructor() {
        super(flags);
    }

    async execute(interaction) {
        let run_command = await super.execute(interaction, args);
        if (!run_command) return

        let server = interaction.options.getString('server');

        if (server === 'all') {
            await interaction.reply(await allCommand(interaction.msg, Discord_Command.rcons))
        } else {
            server = parseInt(server);
            let res = oneCommand(server, Discord_Command.rcons[server], interaction.msg, interaction.client);
            let embed = new Discord.MessageEmbed();
            embed.addField('Online Players', `request by ${msg.author.username} \n \u200B`, false);
            embed.addField(`S${server}`, res, true);
            await interaction.reply(embed);

        }
    }
}


{
    //let command = new Playersonline();
    //module.exports = command;
}

/*
module.exports = {
    name: 'po',
    aka: ['playersonline'],
    description: 'how many players are online?',
    guildOnly: true,
    args: true,
    usage: ` <server#>`,
    async execute(msg, args, rcons, internal_error) {
        const author = msg.author.username; //find author
        let server = Number(args[0]) || args[0];

        if(!isNaN(server)){
            server = Math.floor(args[0])
        }

        if (!server) { // Checks to see if the person specified a server number
            msg.channel.send(`Please pick a server first just a number (1-8). Usage: \`${prefix} po <server#>\` or \`${prefix} po all\``)
                .catch((err) => { internal_error(err); return })
            console.log(`po-Did not have server number`);
            return;
        }
        if (args[1]) {
            msg.channel.send(`No second argument is needed (1-8). correct usage: \`${prefix} po <server#>\` or \`${prefix} po all\``)
                .catch((err) => { internal_error(err); return })
            console.log(`To many args not have server number`);
            return
        }

        if (server < 9 && server > 0) {
            console.log(`Server is ${server}`);
            oneCommand(server, rcons[server], msg)
                .catch((err) => { internal_error(err); return })
        } else if (server === 'all') {
            console.log(`Server is all`);
            allCommand(msg, rcons, internal_error)
                .catch((err) => { internal_error(err); return })
        } else {
            // If a person DID give a server number but did NOT give the correct one it will return without running - is the server number is part of the array of the servers it could be (1-8 currently)
            msg.reply(`Please pick a server first just a number (1-8) or *all*.  Correct usage is \` po <server#>\``)
                .catch((err) => { internal_error(err); return })
            console.log(`players online by ${author} incorrect server number`);
        }
    }
}
*/
