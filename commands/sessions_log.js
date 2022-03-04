
function Millisec_Converter(mill) {
    let hrs = Math.floor(mill / 3600000); // hours
    let mins = Math.round((mill % 3600000) / 60000); // minutes
    let seconds = Math.round(((mill % 3600000) % 60000) / 1000); // seconds
    return {hrs, mins, seconds};
}

function create_session(join, leave) {
    if (join && leave) {
        //get the data.
        let join_time_date = join[0];
        let join_date_time = join[1];
        let leave_time_date = leave[0];
        let leave_date_time = leave[1];

        //get the date.
        let join_time = new Date(`${join_time_date} ${join_date_time}`);
        let leave_time = new Date(`${leave_time_date} ${leave_date_time}`);
        
        //get the diff.
        let diff = leave_time - join_time;
        let time_obj = Millisec_Converter(diff);
        
        //return the msg
        return `    ${join_time_date}, ${join_date_time} => ${leave_time_date}, ${leave_date_time}; ${time_obj.hrs}hrs ${time_obj.mins}min ${time_obj.seconds}sec \n`;
    } else if (!leave) {
        //get the data.
        let join_time_date = join[0];
        let join_date_time = join[1];
        
        //get the date.
        let join_time = new Date(`${join_time_date} ${join_date_time}`);
        let now = Date.now();

        //get the diff.
        let diff = now - join_time;
        let time_obj = Millisec_Converter(diff);
        
        //return the msg
        return `    ${join_time_date}, ${join_date_time} => Still online; ${time_obj.hrs}hrs ${time_obj.mins}min ${time_obj.seconds}sec \n`;
    } else {
        let leave_time_date = leave[0];
        let leave_date_time = leave[1];
        
        //return the msg
        return `    No join event => ${leave_time_date}, ${leave_date_time};\n`;
    }
}

function parse_log(log) {
    //just the same as /.*?\[CHAT\].*?\n/ but does it for JOIN and LEAVE.
    let join_and_leave = log.match(/.*?(\[JOIN\]|\[LEAVE\]).*?\n/g);
    let sessions = {};

    /*
        Regex explanation:
        In the explanation the example will be:
        2020-12-07 17:41:34 [JOIN] tovernaar123 joined the game\n
        The first (.*?) will get everything up to the first space(.* is any char any amount of time).
        So this would be 2020-12-07.
        The second (.*?) will get everything up to the second space.
        So this would be 17:41:34
        Then (\[JOIN\]|\[LEAVE\]) will get the event type  JOIN in this case.
        Now we have another (.*?) which will get the name as that is next in the message (so tovernaar123).
        And then to finnalize it we do .*?\n to stop at a enter.
    */
    let name_regex = /(.*?) (.*?) (\[JOIN\]|\[LEAVE\]) (.*?) .*?\n/;
    if(!join_and_leave){ return 'No joins or leaves';}
    for (let i = 0; i < join_and_leave.length; i++) {
        //Line like: 2020-12-07 17:41:34 [JOIN] tovernaar123 joined the game
        let event = join_and_leave[i];

        //Run the regex on the line it will split it up in 4 data chunks (5 but the first one is not used).
        let data = name_regex.exec(event);

        //The year data 2020-12-07 in the example.
        let date_year = data[1];
        //The join time on the set date 17:41:34 in the example.
        let date_time = data[2];
        //Is either [JOIN] or [LEAVE], its [JOIN] in the example.
        let type = data[3];
        //The name of the player who joined or left tovernaar123 in the example.
        let name = data[4];

        //Final_data for this loop as format it will be tovernaar123 Joined at 17:41:34 on 2020-12-07 
        //If this is the first appearance of this name in this loop, create an array for it.
        if (!sessions[name]) {
            sessions[name] = {};
            sessions[name].joins = [];
            sessions[name].leaves = [];
        }
        
        //If its a join make the string joined at else make left at.
        if (type === '[JOIN]') {
            //Push the data.
            sessions[name].joins.push([date_year, date_time]);
        } else {
            //Push the data.
            sessions[name].leaves.push([date_year, date_time]);
        }
    }

    //The final message that will be send to the discord
    let final_message = '';
    
    //Loop over the sessions obj data is made up of leaves and joins.
    for (const [name, data] of Object.entries(sessions)) {
        //Get the joins array.
        let joins = data.joins;
        //Get the leaves array.
        let leaves = data.leaves;
        //Adds the name and an enter
        final_message += `${name}:\n`;

        let loop_length = Math.max(joins.length, leaves.length);
        //Loop for as long as loop_length
        for (let i = 0; i < loop_length; i++) {
            //create the session msg.
            final_message += create_session(joins[i], leaves[i]);
        }
    }
    return final_message;
}
const readline = require('readline');
const fs = require('fs');
let {format} = require('util');
let config = require.main.require('./config/utils.js');
function getLines(server) {
    return new Promise((resolve) => {
        let lines = [];

        const rl = readline.createInterface({
            input: fs.createReadStream(format(config.geKey('Logs/Directory'), server)),
        });

        rl.on('line', line => {
            lines.push(line);
            if (line.startsWith('=')) {
                lines = [];
            }
        });

        rl.on('close', () => {
            resolve(lines);
        });

    });
}
const max_size = 50;
async function get_logs(server, interaction) {
    let lines = await getLines(server);
    lines = lines.join('\n');
    lines = lines.replace(/\[special-item=.*?\]/g, '<blueprint>');
    lines = parse_log(lines.replace(/```/g, ',,,'));
    lines = lines.split('\n');
    lines = lines.slice(-1 * max_size);
    lines = lines.join('\n');
    lines = lines.match(/[\s\S]{1,1500}/g);
    for (let i = 0; i < lines.length; i++) {
        await interaction.channel.send(`\`\`\`log\n${lines[i]}\`\`\``);
    }
}

let Discord_Command = require('./../command.js');
class Sessions extends Discord_Command {
    constructor() {
        let args = [
            Discord_Command.common_args.server_NoAll,
        ];
        super({
            name: 'sessions',
            aka: [''],
            description: 'Gets the session from the log.',
            cooldown: 5,
            args: args,
            guildOnly: true,
            required_role: Discord_Command.roles.board,
        });
    }

    async execute(interaction) {
        await interaction.deferReply();
        let server = interaction.options.getString('server');
        await interaction.editReply(`Getting sessions for server S${server}...`);
        await get_logs(server, interaction);
    }
}
let command = new Sessions();
module.exports = command;
