// @ts-check
//Reset Times reader
const fs = require('fs').promises;
let config = require('./../config');
config.addKey('NextReset/Directory');

/**
 * @param {import("discord.js").CommandInteraction<'cached'>} interaction 
*/
async function resetData(interaction) {
    // Find "EU-0#" from reset_times.json 
    // get raw data
    let rawdata = await fs.readFile(config.getKey('NextReset/Directory'));

    // Take raw data and change it into Json format, to make it simpler to format/lookup
    let mydata = JSON.parse(rawdata.toString());
   
    let svrNum = 1;
    let sendFirst = '**Next Reset Time:**\n*All times Local*';
    let sendFull = '';
    for(const servernames in mydata){
        let server = mydata[servernames];
           
        if(server['enabled']){
            let unixTimestamp = Math.floor(new Date(server['next_reset']).getTime()/1000);
            let serverInfo = `\n**S${svrNum++}** <t:${unixTimestamp}:R> (<t:${unixTimestamp}:d> at <t:${unixTimestamp}:t>)`;
            sendFull += serverInfo; 
        }else{
            sendFull += `\n**S${svrNum++}** *Auto Reset Disabled*`;
        }
    }
        
    await interaction.editReply(sendFirst + sendFull);
}
let DiscordCommand = require('./../command.js');
class Nextreset extends DiscordCommand {
    constructor() {
        let args = [];
        super({
            name: 'nextreset',
            description: 'This command give the next reset time for each server',
            cooldown: 5,
            args: args,
            guildOnly: true,
            requiredRole: false
        });
    }
    /**
     * @type {import("./../command.js").Execute}
    */
    async execute(interaction) {
        await interaction.deferReply();
        await resetData(interaction);
    }
}
let command = new Nextreset();
module.exports = command;