const Discord = require('discord.js');

/**
 * 
 * @param {Number} servernum the number name of the server not used for anything but printing
 * @param {Rcon} rcon the rcon to send the command 
 * @param {Discord.Message} send_message if given will send the result in an embed to the channel
 * @returns {string} the players that are online on the server
*/
async function oneCommand(servernum, rcon, msg, client) {
    let res;
    if (rcon.connected) {
        res = await rcon.send('/p o')
    } else if(msg){
        const Embed = Discord.MessageEmbed()
        Embed.addField(`S${servernum} is not connected to the bot`, `S${servernum} offline`, false)
        await msg.channel.send(Embed);
        return
    }else{
        res = `S${servernum} is not connected to the bot`
    }
    if (!msg) {
        return res
    } else {
        const Embed = Discord.MessageEmbed()
        Embed.addField('Online Players', `request by ${msg.author.username} \n \u200B`, false)
        Embed.addField(`S${servernum}`, res, true)
        await msg.channel.send(Embed)
    }
}
/**
 * 
 * @param {Discord.Message} msg the message that excute this command
 * @param {Rcon} rcons the open rcon connection to the server
 * @returns {void}
*/
async function allCommand(msg, rcons) {
    await msg.channel.send("Asked for all online players: Awaiting reply from servers...")

    const Embed = Discord.MessageEmbed()
    Embed.addField('Online Players', `request by ${msg.author.username}`, false)

    //adds field for every server
    let amount_of_fields = 0;
    for (let i = 1; i < 9; i++) {
        let res = await oneCommand(i, rcons[i])
        Embed.addField(`S${i}`, res, true)
        amount_of_fields += 1;
    }

    //adds empty fields to make the grid look good
    let amount_of_empty_spaces = 3 - (amount_of_fields % 3)
    for (let i = 0; i < amount_of_empty_spaces; i++) {
        //add and empty to make it look nice 
        Embed.addField(`\u200B`, `\u200B`, true)
    }

    //Send the embed
    await msg.channel.send(Embed)
}

module.exports = {
    name: 'po',
    aka: ['playersonline'],
    description: 'how many players are online?',
    guildOnly: true,
    args: true,
    usage: ` <server#>`,
    execute(msg, args, rcons, internal_error) {
        const author = msg.author.username; //find author
        let server = Number(args[0]) || args[0];

        if(!isNaN(server)){
            server = Math.floor(args[0])
        }

        if (!server) { // Checks to see if the person specified a server number, then checks to see if the server number is part of the array of the servers it could be (1-8 currently)
            msg.channel.send('Please pick a server first just a number (1-8). \`<#> <username> <reason>\`')
                .catch((err) => { internal_error(err); return })
            console.log(`po-Did not have server number`);
            return;
        }
        if (args[1]) {
            msg.channel.send('No second argument is needed (1-8). correct usage: \`<#> <username> <reason>\`')
                .catch((err) => { internal_error(err); return })
            console.log(`To many args not have server number`);
            return
        }

        if (server < 9 && server > 0) {
            console.log('Server is 1-8');
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