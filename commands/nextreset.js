//Reset Times reader
const fs = require('fs');

function resetData(server, msg) {
    // Find "EU-0#" from reset_times.json 
    // get raw data
    let rawdata = fs.readFileSync('/home/exp_admin/api_v2/reset_times.json');
    // Take raw data and change it into Json format, to make it simpler to format/lookup
    let mydata = JSON.parse(rawdata);
   
        let svrNum = 1
        let sendFirst = `**Next Reset Time:**\n*All times Local*`;
        let sendFull = ``;
        for(const servernames in mydata){
            let server = mydata[servernames];
           
            if(server["enabled"] ){
               let unixTimestamp = Math.floor(new Date(server["next_reset"]).getTime()/1000)
               let serverInfo = `\n**S${svrNum++}** <t:${unixTimestamp}>`;
               sendFull += serverInfo; 
               //msg.channel.send(serverInfo);
            }else{
                sendFull += `\n**S${svrNum++}** *Auto Reset Disabled*`;
            }
        }
        
        msg.channel.send(sendFirst + sendFull);

    console.log(`Reset data printed to ${msg.channel}`);
    return;
}

module.exports = {
    name: 'nextreset',
    aka: ['reset-time', 'nextreset', 'resets', 'nr'],
    description: 'Tells us about resets',
    guildOnly: true,
    args: false, //currently does not take args
    helpLevel: 'all', // helpLevel places it in the "semi-public" group
    //required_role: role.board,
    usage: ` <nameToLookup> || <null> (for self lookup)`,
    async execute(msg, args, _, internal_error) {
        
        async function runCommand(server) {
        resetData(server, msg);
        }
        runCommand();
    },
};
