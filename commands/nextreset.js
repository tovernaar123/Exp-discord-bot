//Reset Times reader
const fs = require('fs');

function resetData(interaction) {
    // Find "EU-0#" from reset_times.json 
    // get raw data
    let rawdata = fs.readFileSync('/home/exp_admin/api_v2/reset_times.json');
    // Take raw data and change it into Json format, to make it simpler to format/lookup
    let mydata = JSON.parse(rawdata);
   
    let svrNum = 1;
    let sendFirst = '**Next Reset Time:**\n*All times Local*';
    let sendFull = '';
    for(const servernames in mydata){
        let server = mydata[servernames];
           
        if(server['enabled'] ){
            let unixTimestamp = Math.floor(new Date(server['next_reset']).getTime()/1000);
            let serverInfo = `\n**S${svrNum++}** <t:${unixTimestamp}:R> (<t:${unixTimestamp}:d> at <t:${unixTimestamp}:t>)`;
            sendFull += serverInfo; 
            //msg.channel.send(serverInfo);
        }else{
            sendFull += `\n**S${svrNum++}** *Auto Reset Disabled*`;
        }
    }
        
    interaction.editReply(sendFirst + sendFull);
}
let Discord_Command = require('./../command.js');
class Nextreset extends Discord_Command {
    constructor() {
        let args = [
            
        ];
        super({
            name: 'nextreset',
            aka: [''],
            description: 'This command give the next reset time for each server',
            cooldown: 5,
            args: args,
            guildOnly: true,
        });
    }

    async execute(interaction) {
        await interaction.deferReply();
        resetData(interaction);
    }
}
let command = new Nextreset();
module.exports = command;