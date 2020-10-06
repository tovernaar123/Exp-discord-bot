const { Rcon } = require('rcon-client');
const Discord = require('discord.js');
const baseport = 34228;
const rconpw = process.env.RCONPASS;

async function oneCommand(servernum) {
    let port_to_use = baseport + Number(servernum)
    const rcon = await Rcon.connect({
        host: "localhost", port: port_to_use, password: rconpw
    })
    let res = await rcon.send('/p o')
    return res
}

async function allCommand(msg, internal_error) {
    await msg.channel.send("Asked for all online players: Awaiting reply from servers...")
    let results = [];
    for (let i = 1; i < 9; i++) {
        let res = oneCommand(i).catch((err)=>{internal_error(err); return})
        results.push(res)
    }
    let values = await Promise.all(results)
    return values
}

module.exports = {
    name: 'po',
    aka: ['playersonline'],
    description: 'how many players are online?',
    guildOnly: true,
    args: true,
    usage: ` <server#>`,
    execute(msg, args, internal_error) {
        const author = msg.author.username; //find author
        const server =  Number(args[0]) || args[0];

        if (!server) { // Checks to see if the person specified a server number, then checks to see if the server number is part of the array of the servers it could be (1-8 currently)
            msg.channel.send('Please pick a server first just a number (1-8). \`<#> <username> <reason>\`')
                .catch((err)=>{internal_error(err); return})
            console.log(`Kick-Did not have server number`);
            return;
        }

        if (server >= 1 && server <= 1) {
            console.log('Server is 1-8');
            oneCommand(server)
                .then((result) => {
                    msg.channel.send(result)
                        .catch((err)=>{internal_error(err); return})
                })
                .catch((err)=>{internal_error(err); return})
        } else if (server === 'all') {
            console.log(`Server is all`);
            allCommand(msg, internal_error)
                .then((values)=>{
                    const Embed = new Discord.MessageEmbed()
                        .addField('Online Players', `request by ${author}`, false)
                        .setColor('0xb40e0e')
                    for (let i = 0; i < values.length; i++) {
                        Embed.addField(`S${i+1}`, values[i], true)
                    }
                    let amount_of_empty_spaces = 3 - (values.length % 3)
                    for (let i = 0; i < amount_of_empty_spaces; i++) {
                        //add and empty to make it look nice 
                        Embed.addField(`\u200B`,`\u200B`,true)
                    }
                    msg.channel.send(Embed)
                })
                .catch((err)=>{internal_error(err); return})
        } else {
            // If a person DID give a server number but did NOT give the correct one it will return without running - is the server number is part of the array of the servers it could be (1-8 currently)
            msg.reply(`Please pick a server first just a number (1-8) or *all*.  Correct usage is \` po <server#>\``)
                .catch((err)=>{internal_error(err); return})
            console.log(`players online by ${author} incorrect server number`);
        }
    }
}