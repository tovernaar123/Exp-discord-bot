const fs = require('fs');
const Rcon = require('rcon-client');
const Discord = require('discord.js');
const client = new Discord.Client();
client.commands = new Discord.Collection();
const prefix = `.exp`
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}


let date_ob = new Date();
// current date
// adjust 0 before single digit date
let date = ("0" + date_ob.getDate()).slice(-2);
// current month
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
// current year
let year = date_ob.getFullYear();
// current hours
let hours = date_ob.getHours();
// current minutes
let minutes = date_ob.getMinutes();
// current seconds
let seconds = date_ob.getSeconds();
// See example from above code on how it can be used below - alo
// prints date in YYYY-MM-DD format
//console.log(year + "-" + month + "-" + date);
// prints date & time in YYYY-MM-DD HH:MM:SS format
//console.log(year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);
// prints time in HH:MM format
//console.log(hours + ":" + minutes);

require('dotenv').config();

const TOKEN = process.env.DISCORD_TOKEN;

client.on("ready", () => {
    console.log(year + "-" + month + date + " " + hours + ":" + minutes + ":" + seconds + ": I am ready!");
}); // when bot boots up prints the time along with the ready notice. 

client.on("message", msg => {
    const guild = msg.guild; 
    //Ends msg early if author is a bot
    if (msg.author.bot) return;
    //Ends msg  code early if the command does not start with a prefix
    if (msg.content.indexOf(prefix) !== 0) return;

    //creates the arguments and indexes them from the message typed, then makes sure all commands are lowercase to be the same always
    const args = msg.content.slice(prefix.length).trim().split(/ +/g);
    const commandName = args.shift().toLowerCase();
    // checks the commands from the above commands collection, it should also use the aka but that is not working right now...
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aka && cmd.aka.includes(commandName));
    if (!command) return;
    // disallows commands in dm's to run as commands in dms if it is set to guild only
    if (command.guildOnly && msg.channel.type !== 'text') 
    {
        return msg.reply('Sorry - I can\'t do that in a DM');
    }
    // only runs if below Guild id's (EXP = `260843215836545025`)
    if(command.guildOnly && (guild != `762249085268656178` && guild != `260843215836545025`)){
        console.log(`Not correct guild`);
        return msg.reply(`Wrong guild`);
    }
    // checks to see if role listed is allowed in the command.
        /* ALo to review */
    let req_role = command.required_role
    if(req_role){
        let all_roles = Array.from(guild.roles.cache)
        roles_required = all_roles.find(role_obj => role_obj[1].name === req_role)
        let allowed = msg.member.roles.highest.comparePositionTo(roles_required[1]) >= 0;
        if (!allowed) {
            console.log(`Unauthorized `);
            msg.channel.send(`You do not have ${roles_required[1]}`);
            return;
        };
    }
        /* END ALo to review */
    // If command requires an argument, decline to run if none is provided. Request arguments in the main export of the command file. 
    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${msg.author}!`;
        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix} ${command.name} ${command.usage}\``;
        }
        return msg.channel.send(reply);
    }

    try {
        command.execute(msg, args);
    } catch (error) {
        console.error(error);
        msg.reply(`there was an error trying to execute that command!`);
    }
})


client.login(TOKEN);