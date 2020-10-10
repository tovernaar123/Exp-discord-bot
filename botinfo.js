

//const Rcon = require('simple-rcon');
require('dotenv').config();
const fs = require('fs');
const { rcon_connect } = require('./rcon_auto_connect.js');
const Discord = require('discord.js');
const client = new Discord.Client();
const baseport = 34228;
const prefix = `.exp`
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
let rcons = {};

//array for all ofline servers
let offline_servers = [2]


async function start() {
    //instantiate the list of commands 
    client.commands = new Discord.Collection();
    for (const file of commandFiles) {
        //require to file so its loaded
        const command = require(`./commands/${file}`);
        //add it to the list 
        client.commands.set(command.name, command);
    }
    
    //9 cause 8 < 9 and we want to inculde 8 and we start at 1 cuase theirs no s0
    for (let i = 1; i < 9; i++) {
        //if servers is offline dont try and connect to it
        if(offline_servers.includes(i)){ 
            rcons[i] = {"connected": false}
            continue; 
        }
        //port starts at baseport 34228 and its it server num so s1 is 34229 etc.
        let port_to_use = baseport + i
        //Use the auto rcon connect
        rcon = await rcon_connect(port_to_use, i)
        //add to the list
        rcons[i] = rcon
    }
    //start listing for commands
    client.login(process.env.DISCORD_TOKEN);
}

start().catch((err)=>{
    console.log(err)
});


client.on("ready", () => {
    let date_string = new Date().toISOString().
        replace(/T/, ' ').      // replace T with a space
        replace(/\..+/, '')     // delete the dot and everything after
    console.log(`${date_string}: I am ready!`)
    //console.log(year + "-" + month + date + " " + hours + ":" + minutes + ":" + seconds + ": I am ready!");
});



client.on("message", msg => {
    function internal_error(err) {
        console.log(err)
        msg.channel.send('Internal error in the command plz contact and admin')
    }
    const guild = msg.guild;
    //Ends msg early if author is a bot, or if the command does not start with a prefix
    if (msg.author.bot) return;

    if (!msg.content.startsWith(prefix)) return;

    // remove the .exp then removes the spaces in the beging and end then splits it up into args
    const args = msg.content.slice(prefix.length).trim().split(/ +/g);

    //gets the command in lower case
    const commandName = args.shift().toLowerCase();

    // get the command or its aka
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aka && cmd.aka.includes(commandName));

    // if no command dont do anything
    if (!command) return;

    if (command.guildOnly && msg.channel.type !== 'text') {
        return msg.reply('Sorry - I can\'t do that in a DM');
    }

    // 260843215836545025 test server 762249085268656178 exp
    if (command.guildOnly && (guild != `762249085268656178` && guild != `260843215836545025`)) {
        console.log(`Not correct guild`);
        return msg.reply(`Wrong guild`);
    }

    let req_role = command.required_role
    if (req_role) {
        let all_roles = Array.from(guild.roles.cache)
        let roles_required = all_roles.find(role_obj => role_obj[1].name === req_role)
        let allowed = msg.member.roles.highest.comparePositionTo(roles_required[1]) >= 0;
        if (!allowed) {
            console.log(`Unauthorized `);
            msg.channel.send(`You do not have ${roles_required[1]}`);
            return;
        };
    }

    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${msg.author}!`;
        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }
        return msg.channel.send(reply);
    }

    try {
        command.execute(msg, args, rcons, internal_error);
    } catch (error) {
        console.log(error);
        msg.reply(`there was an error trying to execute that command!`);
    }
})

