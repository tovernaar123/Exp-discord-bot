//player data storage access with new format
//required_role has an exception for the user to look upthemselves, nothing needed here it is handeled in infoBot.js...
//this helpLevel:"all" is required to show up on "semi public commands" it is not needed if the regular command was not restricted to role.board

/*
function playerdata2command(name, msg) {
    //thousands separator
    function ts(x, nd) {
        // x as value
        // nd as nth decimal places
        nd = nd || 0;
    
        if (x === undefined) {
            return 0;
        } else {
            let i = Math.round(Number(x) * 100) / 100;
            var d = i.toFixed(nd).split('.');
            try {
                return d[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (d[1] ? '.' + d[1] : '');
            } catch(e) {
                return 0;
            }
        }
    }
                    
    function profile(msg_2) {
        var layout = ['Playtime', 'AfkTime', 'MapsPlayed', 'JoinCount', 'ChatMessages', 'CommandsUsed', 'RocketsLaunched', 'ResearchCompleted', 'MachinesBuilt', 'MachinesRemoved', 'TilesBuilt', 'TilesRemoved', 'TreesDestroyed', 'OreMined', 'ItemsCrafted', 'ItemsPickedUp', 'Kills', 'Deaths', 'DamageDealt', 'DistanceTravelled', 'CapsulesUsed', 'EntityRepaired', 'DeconstructionPlannerUsed', 'MapTagsMade'];
        var layout_dict = {
            // 0
            'Playtime':'Play Time',
            'AfkTime':'AFK Time',
            'MapsPlayed':'Maps Played',
            'JoinCount':'Join Count',
            'ChatMessages':'Chat Messages',
            // 5
            'CommandsUsed':'Commands',
            'RocketsLaunched':'Rockets Launched',
            'ResearchCompleted':'Research Completed',
            'MachinesBuilt':'Machines Built',
            'MachinesRemoved':'Machines Removed',
            // 10
            'TilesBuilt':'Tiles Placed',
            'TilesRemoved':'Tiles Removed',
            'TreesDestroyed':'Trees Destroyed',
            'OreMined':'Ore Mined',
            'ItemsCrafted':'Items Crafted',
            // 15
            'ItemsPickedUp':'Items Picked Up',
            'Kills':'Kills',
            'Deaths':'Deaths',
            'DamageDealt':'Damage Dealt',
            'DistanceTravelled':'Distance Travelled',
            // 20
            'CapsulesUsed':'Capsules Used',
            'EntityRepaired':'Machines Repaired',
            'DeconstructionPlannerUsed':'Decon Planner Used',
            'MapTagsMade':'Map Tags Created'
        };
                        
        let msg_4 = [];
                    
        for (let i = 0; i < layout.length; i++) {
            let msg_3 = [];
                            
            if (layout[i] == 'Playtime' || layout[i] == 'AfkTime') {
                try {
                    var t1 = msg_2[layout[i]];
                } catch (e) {
                    var t1 = 0;
                }
                                
                if (isNaN(t1)) {
                    t1 = 0;
                }
                                
                // the hours part of min-> hh:mm
                let h1 = Math.floor(t1 / 60);
                // the min part of hh:mm
                let m1 = Math.floor(t1 % 60);
                
                // if hours (of hh:mm) is more than 0 then show how many hours you have, else only show mins below
                if (h1 > 0) { 
                    msg_3.push(layout_dict[layout[i]]);
                    msg_3.push(ts(h1, 0) + ' h ' + m1 + ' m');
                } else {
                    msg_3.push(layout_dict[layout[i]]);
                    msg_3.push(m1 + ' m ');
                }
                    
            } else {
                try {
                    msg_3.push(layout_dict[layout[i]]);
                    msg_3.push(ts(msg_2[layout[i]], 0));
                } catch (e) {
                    msg_3.push(layout_dict[layout[i]]);
                    msg_3.push(ts(0, 0));
                }
            }
            
            // push title and value in array
            msg_4.push([msg_3[0], msg_3[1]]); 
        }         
        return msg_4;
    }
                    
    // Find "items" from datastore 
    // get raw data
    let rawdata = fs.readFileSync('/home/exp_admin/api_v2/persistent_storage.json');
    // Take raw data and change it into Json format, to make it simpler to format/lookup
    let mydata = JSON.parse(rawdata);
    // Use the key to look up the player data, for this current data key needs to be the player name to look up.
    // in dataFile
    let key1 = `${name}`; 
    // check data is the parsed data, but only the PlayerData, and that that matches the key1 (name)
    let checkdata = mydata['PlayerData'][key1];
    // Checks to see if any data was retured at all, if the name is not in the database, or the database is not accessable than it will return an error and stop running the command
    
    if (!checkdata) {
        msg.channel.send('Error: Name not found. Check the name or try again later.');
        console.log('Name not found');
        return;
    }

    // if it didnt stop based on the name not returining it will then filter out only the Statistics (removing prefrences like alt mode, join msg etc)
    let finaldata = mydata['PlayerData'][key1]['Statistics'];
    
    let channel = msg.channel;
    let result = profile(finaldata);
    let lookup = name;

    // log and channel (nonembed) messages sent
    console.log(`Player Data Requested by ${msg.member.displayName}\nUsername: ${lookup} `);
    channel.send(`\`\`\`txt\nPlayer Data Requested by ${msg.member.displayName}\nUsername: ${lookup}\n\`\`\``);
    // set up embeds
    const Embed = new Discord.MessageEmbed();
    Embed.setColor('0x00ff00');

    for (let i = 0; i < result.length/2; i+=2) {
        try {
            Embed.addField(result[i][0], result[i][1], true);
        } catch (e) {
            Embed.addField('** **', '** **', true);
        }

        try {
            Embed.addField(result[i+1][0], result[i+1][1], true);
        } catch (e) {
            Embed.addField('** **', '** **', true);
        }

        Embed.addField('** **', '** **', true);
    }

    const Embed2 = new Discord.MessageEmbed();
    Embed2.setColor('0x00ff00');

    for (let i = 0; i < result.length/2; i+=2) {
        let j = i + result.length/2;
        try {
            Embed2.addField(result[j][0], result[j][1], true);
        } catch (e) {
            Embed2.addField('** **', '** **', true);
        }

        try {
            Embed2.addField(result[j+1][0], result[j+1][1], true);
        } catch (e) {
            Embed2.addField('** **', '** **', true);
        }
                        
        Embed2.addField('** **', '** **', true);
    }

    // Send the Embeds, sent as 2 because depending on the length discord would error out if you sent them both.
    channel.send({embeds: [Embed, Embed2]});
    return;
}


module.exports = {
    name: 'playerdata',
    aka: ['pd','pdformatted','playerdataformatted'],
    description: 'Get stats (datastore info) for youself (all users) or any users (Board+)',
    guildOnly: true,
    args: false,
    helpLevel: 'all',
    // required_role: role.board,
    usage: ' <name>',
    async execute(msg, args, _, internal_error) {
        
        async function runCommand() {
            //board
            let role_needed = await msg.guild.roles.fetch(role.board);
            let allowedThisCommand = msg.member.roles.highest.comparePositionTo(role_needed) >= 0; 
            let name = args[0];

            if (name) {
                if (allowedThisCommand) {
                    // If the user is authorized to use the command and supplied a name
                    playerdata2command(name, msg);
                } else {
                    msg.channel.send('Error: You are not authorized to perform this action.');
                }
            } else {
                // User doesnt need to get authorized for a self lookup
                name = msg.member.displayName;
                playerdata2command(name, msg);
            }
        }
        runCommand();
    },
};
*/
let Eta = require('eta');
let Discord_Command = require('./../../command.js');
const Discord = require('discord.js');
const fs = require('fs');
const puppeteer = require('puppeteer');


var grid_layout = {
    'Playtime': 'Play Time',
    'AfkTime': 'AFK Time',
    'MapsPlayed': 'Maps Played',
    'JoinCount': 'Join Count',
    'ChatMessages': 'Chat Messages',
    'CommandsUsed': 'Commands',
    'RocketsLaunched': 'Rockets Launched',
    'ResearchCompleted': 'Research Completed',
    'MachinesBuilt': 'Machines Built',
    'MachinesRemoved': 'Machines Removed',
    'TilesBuilt': 'Tiles Placed',
    'TilesRemoved': 'Tiles Removed',
    'TreesDestroyed': 'Trees Destroyed',
    'OreMined': 'Ore Mined',
    'ItemsCrafted': 'Items Crafted',
    'ItemsPickedUp': 'Items Picked Up',
    'Kills': 'Kills',
    'Deaths': 'Deaths',
    'DamageDealt': 'Damage Dealt',
    'DistanceTravelled': 'Distance Travelled',
    'CapsulesUsed': 'Capsules Used',
    'EntityRepaired': 'Machines Repaired',
    'DeconstructionPlannerUsed': 'Decon Planner Used',
    'MapTagsMade': 'Map Tags Created'
};


class Playerdata extends Discord_Command {
    constructor() {
        let args = [
            {
                name: 'name',
                description: 'The name of the player to lookup',
                required: true,
                type: 'String',
            }
        ];
        super({
            name: 'playerdata',
            aka: [''],
            description: 'Returns a foto of the player\'s data',
            cooldown: 5,
            args: args,
            guildOnly: true
        });
    }

    async execute(interaction) {
        await interaction.deferReply();

        let name = interaction.options.getString('name');
        console.log(name);
        let stats = {
            'MapsPlayed': 24,
            'JoinCount': 51,
            'Playtime': 1715,
            'CommandsUsed': 325,
            'DistanceTravelled': 373267,
            'ItemsCrafted': 7043,
            'RocketsLaunched': 844,
            'ItemsPickedUp': 31452,
            'ChatMessages': 1183,
            'MachinesBuilt': 14622,
            'MachinesRemoved': 8716,
            'AfkTime': 38,
            'ResearchCompleted': 87,
            'OreMined': 3,
            'TilesBuilt': 299,
            'DeconstructionPlannerUsed': 178,
            'TreesDestroyed': 6414,
            'EntityRepaired': 2074,
            'CapsulesUsed': 380,
            'DamageDealt': 95055,
            'Kills': 749,
            'Deaths': 2
        };



        let data = fs.readFileSync('./commands/playerdata/grid.eta', 'utf8');

        //The grid is a 2d array of strings.
        //The number of columns in the grid.
        let colums = 4;


        let grid = [];

        //The index so that the data can be split into rows.
        let i = 0;
        //Loop over all the required item for the grid.
        for (const [json_key, grid_name] of Object.entries(grid_layout)) {

            let value = stats[json_key];
            if(!value) value = 'fix this';

            //if we have more then the required columns, we need to split the data into a new row.
            if(i % colums === 0  || i === 0) grid[grid.length] = [];

            //Add the data to the grid.
            grid[grid.length - 1].push(grid_name);
            grid[grid.length - 1].push(value);

            //plus 2 cause we add both name and value.
            i = i + 2;
        }
        let html = Eta.render(data, {grid});

        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        page.setJavaScriptEnabled(false);
        await page.setViewport({
            width: 680,
            height: 600,
            deviceScaleFactor: 1,
        });
        await page.setContent(html);
        await page.screenshot({ path: './.cache/profile.png' });
        await browser.close();
        await interaction.editReply({ files: ['./.cache/profile.png'] });
    }
}
let command = new Playerdata();
module.exports = command;
