const Discord = require('discord.js');
const fs  = require('fs');
const puppeteer = require('puppeteer');

function playerdata3command(name, msg, args) {
    //thousands separator
    function ts(x) { 
        if (x === undefined) {
            return 0;
        } else {
            try {
                return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            } catch(e) {
                return 0;
            }
        }
    }
                    
    function profile(msg_2) {
        var layout = ['Playtime', 'AfkTime', 'MapsPlayed', 'JoinCount', 'ChatMessages', 'CommandsUsed', 'RocketsLaunched', 'ResearchCompleted', 'MachinesBuilt', 'MachinesRemoved', 'TilesBuilt', 'TilesRemoved', 'TreesDestroyed', 'OreMined', 'ItemsCrafted', 'ItemsPickedUp', 'Kills', 'Deaths', 'DamageDealt', 'DistanceTravelled', 'CapsulesUsed', 'EntityRepaired', 'DeconstructionPlannerUsed', 'MapTagsMade'];
        var layout_dict = {
            'Playtime':'Play Time',
            'AfkTime':'AFK Time',
            'MapsPlayed':'Maps Played',
            'JoinCount':'Join Count',
            'ChatMessages':'Chat Messages',
            'CommandsUsed':'Commands',
            'RocketsLaunched':'Rockets Launched',
            'ResearchCompleted':'Research Completed',
            'MachinesBuilt':'Machines Built',
            'MachinesRemoved':'Machines Removed',
            'TilesBuilt':'Tiles Placed',
            'TilesRemoved':'Tiles Removed',
            'TreesDestroyed':'Trees Destroyed',
            'OreMined':'Ore Mined',
            'ItemsCrafted':'Items Crafted',
            'ItemsPickedUp':'Items Picked Up',
            'Kills':'Kills',
            'Deaths':'Deaths',
            'DamageDealt':'Damage Dealt',
            'DistanceTravelled':'Distance Travelled',
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
                    msg_3.push(h1 + ' h ' + m1 + ' m');
                } else {
                    msg_3.push(layout_dict[layout[i]]);
                    msg_3.push(m1 + ' m ');
                }
                    
            } else {
                try {
                    msg_3.push(layout_dict[layout[i]]);
                    msg_3.push(ts(msg_2[layout[i]]));
                } catch (e) {
                    msg_3.push(layout_dict[layout[i]]);
                    msg_3.push(ts(0));
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
    let checkdata = mydata["PlayerData"][key1];
    // Checks to see if any data was retured at all, if the name is not in the database, or the database is not accessable than it will return an error and stop running the command
    
    if (!checkdata) {
        msg.channel.send('Name error: Name not found in datastore. Check the name or try again later.');console.log(`Name Not Found`); return;
    }

    // if it didnt stop based on the name not returining it will then filter out only the Statistics (removing prefrences like alt mode, join msg etc)
    let finaldata = mydata["PlayerData"][key1]["Statistics"];
    
    let channel = msg.channel;
    let result = profile(finaldata);
    let lookup = name;

    // Background Color
    let html_background_color = '#4F4F4F';
    // Font Color
    let html_font_color = '#F0F0F0';
    // Table Border Color
    let html_table_border_color = '#6F6F6F';
    // Font Family
    let html_font_family = 'Arial,Helvetica,sans-serif';
    // Font Size
    let html_font_size = '1em';
    // Table Individual Width
    let html_table_width = [200, 120];
    // Table Total Width
    let html_table_width_total = 2 * (html_table_width[0] + html_table_width[1]);
    // Total Browser Height
    let html_body_height = 460;

    // font-weight:bold
    let html_code = ['<html>\n<head>\n<title></title>\n</head>\n<body style="background-color:' + html_background_color + '">',
    '<h2 style="width:100%;text-align:center;border-bottom:1px solid ' + html_table_border_color + ';line-height:0.1em;margin:10px 0 20px;color:' + html_font_color + '"><span style="background-color:' + html_background_color + ';padding:0 10px;font-family:' + html_font_family + ';">Data</span></h2>',
    '<p style="font-family:' + html_font_family + ';font-size:' + html_font_size + ';color:' + html_font_color + '">Player data requested by: ' + author + ' </p>',
    '<p style="font-family:' + html_font_family + ';font-size:' + html_font_size + ';color:' + html_font_color + '">Username: ' + lookup + ' </p>',
    // '<p style="font-family:' + html_font_family + ';font-size:' + html_font_size + ';color:' + html_font_color + '">Our servers will save your player data so that we can sync it between servers.</p>',
    // '<p style="font-family:' + html_font_family + ';font-size:' + html_font_size + ';color:' + html_font_color + '">All of your data can be found below.</p>',
    '<table style="border-collapse:collapse;width=' + html_table_width_total + 'px;">']

    let result = profile(item);
    let table_td_style = '<td style="padding:5px;border:1px solid ' + html_table_border_color + ';font-family:' + html_font_family + ';font-size:' + html_font_size + ';text-align:left;color:' + html_font_color + ';'
    let table_td_width = ['width:' + html_table_width[0] + 'px;">', 'width:' + html_table_width[1] + 'px;">'];

    // Table Contents
    for (let i = 0; i < result.length; i+=2) {
        let html_table = [];

        html_table.push('<tr>\n' + table_td_style + table_td_width[0]);
        html_table.push(result[i][0]);
        html_table.push('</td>\n' + table_td_style + table_td_width[1]);
        html_table.push(result[i][1]);
        html_table.push('</td>\n' + table_td_style + table_td_width[0]);
        html_table.push(result[i+1][0]);
        html_table.push('</td>\n' + table_td_style + table_td_width[1]);
        html_table.push(result[i+1][1]);
        html_table.push('</td>\n</tr>');
            
        html_code.push(j.join(''));
    }

    html_code.push('</table>\n</body>\n</html>');
    
    try {
        (async () => {
            const browser = await puppeteer.launch()
            const page = await browser.newPage()
            await page.setViewport({
                width: html_table_width_total,
                height: html_body_height,
                deviceScaleFactor: 1,
                });
            // page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
            await page.setContent(html_code.join('\n'))
            await page.screenshot({path: './graph.png'})
            await browser.close()
            })()
    } catch (e) {
        channel.send('Error when creating image.');
    }

    // channel.send(`\`\`\`Player Data Requested by ${message.author.username}\nUsername: ${lookup}\n\`\`\``);
    channel.send({files: ['./graph.png']})
    return;
}


module.exports = {
    name: 'playerdatapic',
    aka: ['pd3','pdp'],
    description: 'Get stats (datastore info) for youself (all users) or any users (Board+)',
    guildOnly: true,
    args: false,
    helpLevel: "all",
    // required_role: role.board,
    usage: ` <name>`,
    async execute(msg, args, _, internal_error) {
        
        async function runCommand() {
            //board
            let role_needed = "693500936491892826" 
            let role = await msg.guild.roles.fetch(role_needed)
            let allowedThisCommand = msg.member.roles.highest.comparePositionTo(role) >= 0; 
            
            if(allowedThisCommand) {
                let name = args[0];                
                // runs the command if the person supplied a name
                if (name) {
                    playerdata3command(name, msg, args);
                }

                // runs the command after setting the name to look up as the user who submitted the request
                if (!name) {
                    name = msg.member.displayName; 
                    playerdata3command(name, msg, args);
                } 

            } else {
                let name = args[0];

                if (name) {
                    msg.channel.send(`ERROR: User lookup not allowed, getting users data.`);
                }

                name = msg.member.displayName; 
                playerdata3command(name, msg, args);
            }
        }
        runCommand();
    },
};
