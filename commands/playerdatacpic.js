const Discord = require('discord.js');
const fs = require('fs');
const puppeteer = require('puppeteer');

function playerdata5command(name1, name2, msg) {
    //thousands separator
    function ts(x, nd) {
        // x as value
        // nd as nth decimal places
        nd = nd || 0;
    
        if (x === undefined || isNaN(x)) {
            x = 0;
        }
        
        let i = Math.round(Number(x) * Math.pow(10, nd)) / Math.pow(10, nd);
        var d = i.toFixed(nd).split(".");
        return d[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (d[1] ? "." + d[1] : "");
    }
    
    function hhmm(n) {
        return [((Math.floor(n) / 60) > 0 ? 1 : 0), Math.floor(n / 60), Math.floor(n % 60)]
    }
    
    function pc_chg(a, b) {
        chg = (b - a) / a
        
        if (chg >= 0) {
            if (chg >= 10) {
                return '+ ' + ts(chg, 2) + ' x'
            } else {
                return '+ ' + ts(chg * 100, 2) + ' %'
            }
        } else {
            if (chg <= -10) {
                return '- ' + Math.abs(ts(chg, 2)) + ' x'
            } else {
                return '- ' + Math.abs(ts(chg * 100, 2)) + ' %'
            }
        }
    }

    function profile(data) {
        let layout = ['Playtime', 'AfkTime', 'MapsPlayed', 'JoinCount', 'ChatMessages', 'CommandsUsed', 'RocketsLaunched', 'ResearchCompleted', 'MachinesBuilt', 'MachinesRemoved', 'TilesBuilt', 'TilesRemoved', 'TreesDestroyed', 'OreMined', 'ItemsCrafted', 'ItemsPickedUp', 'Kills', 'Deaths', 'DamageDealt', 'DistanceTravelled', 'CapsulesUsed', 'EntityRepaired', 'DeconstructionPlannerUsed', 'MapTagsMade'];
        let layout_dict = {
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
        let layout_e = [['AFK Time Ratio (%)', 1, 'AfkTime', 'Playtime', 100], ['Session Length', 3, 'Playtime', 'JoinCount', 1], ['Map Join Ratio', 1, 'JoinCount', 'MapsPlayed', 1], ['Rocket Per Hour', 1, 'RocketsLaunched', 'Playtime', 60], ['Kill Death Ratio', 1, 'Kills', 'Deaths', 1], ['Damage Death Ratio', 1, 'DamageDealt', 'Deaths', 1]]
        var msg_5 = [];

        for (let i = 0; i < layout.length; i++) {
            if (data[layout[i]] === undefined) {
                data[layout[i]] = 0
            }

            let msg_4 = [];
            msg_4.push(layout_dict[layout[i]]);

            if (layout[i] == 'Playtime' || layout[i] == 'AfkTime') {
                let t1 = [data[0][layout[i]], data[1][layout[i]]];
                
                for (let k = 0; k < 2; k++) {
                    let hm = hhmm(t1[k]);

                    if (hm[0] > 0) {
                        msg_4.push(ts(hm[1], 0) + ' h ' + ts(hm[2], 0) + ' m');
                    } else {
                        msg_4.push(ts(hm[2], 0) + ' m ');
                    }

                }

                msg_4.push(pc_chg(t1[0], t1[1]));
            } else {
                n1 = data[0][layout[i]]
                n2 = data[1][layout[i]]
                msg_4.push(ts(n1, 0))
                msg_4.push(ts(n2, 0))
                msg_4.push(pc_chg(n1, n2))
            }

            msg_5.push([msg_4[0], msg_4[1], msg_4[2], msg_4[3]]);
        }
        
        // Additional Data
        for (let i = 0; i < layout_e.length; i++) {
            let msg_4 = [];
            let n1 = 0;
            let n2 = 0;
            msg_4.push(layout_e[i][0]);

            if (layout_e[i][1] == 1) {
                n1 = data[0][layout_e[i][2]] / data[0][layout_e[i][3]] * layout_e[i][4]
                n2 = data[1][layout_e[i][2]] / data[1][layout_e[i][3]] * layout_e[i][4]
                msg_4.push(ts(n1, 2))
                msg_4.push(ts(n2, 2))
                msg_4.push(pc_chg(n1, n2))
            } else if (layout_e[i][1] == 2) {
                n1 = data[0][layout_e[i][2]] / data[0][layout_e[i][3]] / layout_e[i][4]
                n2 = data[1][layout_e[i][2]] / data[1][layout_e[i][3]] / layout_e[i][4]
                msg_4.push(ts(n1, 2))
                msg_4.push(ts(n2, 2))
                msg_4.push(pc_chg(n1, n2))
            } else if (layout_e[i][1] == 3) {
                let t1 = [Math.floor(data[0][layout_e[i][2]] / data[0][layout_e[i][3]]), Math.floor(data[1][layout_e[i][2]] / data[1][layout_e[i][3]])];

                for (let k = 0; k < 2; k++) {
                    let hm = hhmm(t1[k]);

                    if (hm[0] > 0) {
                        msg_4.push(ts(hm[1], 0) + ' h ' + ts(hm[2], 0) + ' m');
                    } else {
                        msg_4.push(ts(hm[2], 0) + ' m ');
                    }
                }

                msg_4.push(pc_chg(t1[0], t1[1]));
            }

            msg_5.push([msg_4[0], msg_4[1], msg_4[2], msg_4[3]]);
        }

        return msg_5;
    }

    // Find "items" from datastore 
    // get raw data
    let rawdata = fs.readFileSync('/home/exp_admin/api_v2/persistent_storage.json'); 
    // Take raw data and change it into Json format, to make it simpler to format/lookup
    let mydata = JSON.parse(rawdata);
    // Use the key to look up the player data, for this current data key needs to be the player name to look up.
    // in dataFile
    let key1 = `${name1}`;
    let key2 = `${name2}`;
    // check data is the parsed data, but only the PlayerData, and that that matches the key1 (name)
    let checkdata1 = mydata["PlayerData"][key1];
    let checkdata2 = mydata["PlayerData"][key2];
    // Checks to see if any data was retured at all, if the name is not in the database, or the database is not accessable than it will return an error and stop running the command

    if (!checkdata1) {
        msg.channel.send('Error: Name 1 not found. Check the name or try again later.');
        console.log(`Name 1 not found`);
        return;
    }

    if (!checkdata2) {
        msg.channel.send('Error: Name 2 not found. Check the name or try again later.');
        console.log(`Name 2 not found`);
        return;
    }

    // checks to see if the user looked up has turned off data sync, if so error msg sent in channel and logged to console 
    let privacyData1 = mydata["PlayerData"][key1]["DataSavingPreference"];
    let privacyData2 = mydata["PlayerData"][key2]["DataSavingPreference"];

    if (privacyData1) {
        msg.channel.send('Error: Privacy Settings Prevent Lookup. Check name 1 or try again later after turning on Data sync.');
        console.log(`Privacy settings for user ${key1} prevent saved stats`);
        return;
    }

    if (privacyData2) {
        msg.channel.send('Error: Privacy Settings Prevent Lookup. Check name 2 or try again later after turning on Data sync.');
        console.log(`Privacy settings for user ${key2} prevent saved stats`);
        return;
    }

    // if it didnt stop based on the name not returining it will then filter out only the Statistics (removing prefrences like alt mode, join msg etc)
    let finaldata1 = mydata["PlayerData"][key1]["Statistics"];
    let finaldata2 = mydata["PlayerData"][key1]["Statistics"];

    let channel = msg.channel;
    let result = profile([finaldata1, finaldata2]);
    let lookup1 = name1;
    let lookup2 = name2;

    // Color
    // Background, Table Border, H2, Table 1, Table 2

    let html_font_color = ['222831', '14FFEC', 'FF9F1C', 'F1D00A', 'EEEEEE'];
    // Font Family
    // Arial, Helvetica, Verdana, Calibri, BIZ UDPGothic
    let html_font_family = 'Consolas';
    // Font Size
    let html_font_size = [2, 2];
    // Font Size
    let html_font_weight = 500;
    // Margin on title
    let html_margin_height = 0.2
    // Table Individual Width
    let html_table_width = [15, 12, 10];
    // Table Individual Height
    let html_table_height = 60;
    // Total Browser Height
    let html_body_width = 2400;
    // Table Width Percentage
    let html_table_width_percentage = 98;
    // Total Browser Height
    let html_body_height = (2.5 + 15) * html_table_height;

    let html_code = ['<html>\n<head>\n<title></title>\n</head>\n<body style="background-color:#' + html_font_color[0] + '"><hr style="height:5px; visibility:hidden;margin:0px;border:0px;">',
    '<p style="margin-top: ' + html_margin_height + 'em;margin-bottom: 0em;color:' + html_font_color[0] + 'font-family:' + html_font_family + ';font-size:' + html_font_size[0] + 'em;">.</p>',
     '<h2 style="width: ' + html_table_width_percentage + '%;text-align:center;border-bottom: 2px solid #' + html_font_color[3] + ';line-height:0em;margin:10px auto 20px auto;color:#' + html_font_color[2] + '"><span style="background-color:#' + html_font_color[0] + ';padding:0 0.5em;font-family:' + html_font_family + ';font-size:' + html_font_size[0] + 'em;">' + lookup1 + ' & ' + lookup2 + '</span></h2>',
    //'<p style="font-family:' + html_font_family + ';font-weight:' + html_font_weight + ';font-size:' + html_font_size[0] + 'em;color:#' + html_font_color[2] + '">' + lookup + ' </p>',
    '<p style="margin-top: ' + html_margin_height + 'em;margin-bottom: 0em;color:' + html_font_color[0] + 'font-family:' + html_font_family + ';font-size:' + html_font_size[0] + 'em;">.</p>',
    '<table style="width: ' + html_table_width_percentage + '%;margin-left: auto;margin-right: auto;border: 2px solid #' + html_font_color[1] + ';border-collapse:collapse;page-break-inside:auto;">']

    let table_td_style_desc = '<td style="padding:5px 15px;border:2px solid #' + html_font_color[1] + ';font-family:' + html_font_family + ';font-weight:' + html_font_weight + ';font-size:' + html_font_size[1] + 'em;text-align:left;color:#' + html_font_color[3] + ';height:' + html_table_height + 'px;page-break-inside:avoid; page-break-after:auto;';
    let table_td_style_data = '<td style="padding:5px 15px;border:2px solid #' + html_font_color[1] + ';font-family:' + html_font_family + ';font-weight:' + html_font_weight + ';font-size:' + html_font_size[1] + 'em;text-align:right;color:#' + html_font_color[4] + ';height:' + html_table_height + 'px;page-break-inside:avoid; page-break-after:auto;';
    let table_td_style_per = '<td style="padding:5px 15px;border:2px solid #' + html_font_color[1] + ';font-family:' + html_font_family + ';font-weight:' + html_font_weight + ';font-size:' + html_font_size[1] + 'em;text-align:right;color:#' + html_font_color[4] + ';height:' + html_table_height + 'px;page-break-inside:avoid; page-break-after:auto;';
    let table_td_width = ['width:' + html_table_width[0] + '%;">', 'width:' + html_table_width[1] + '%;">', 'width:' + html_table_width[2] + '%;">'];

    // Table Contents
    for (let i = 0; i < result.length; i+=2) {
        let html_table = [];

        html_table.push('<tr>\n' + table_td_style_desc + table_td_width[0]);
        html_table.push(result[i][0]);
        html_table.push('</td>\n' + table_td_style_data + table_td_width[1]);
        html_table.push(result[i][1]);
        html_table.push('</td>\n' + table_td_style_data + table_td_width[1]);
        html_table.push(result[i][2]);
        html_table.push('</td>\n' + table_td_style_per + table_td_width[2]);
        html_table.push(result[i][3]);
        html_table.push('</td>\n' + table_td_style_desc + table_td_width[0]);
        html_table.push(result[i+1][0]);
        html_table.push('</td>\n' + table_td_style_data + table_td_width[1]);
        html_table.push(result[i+1][1]);
        html_table.push('</td>\n' + table_td_style_data + table_td_width[1]);
        html_table.push(result[i+1][2]);
        html_table.push('</td>\n' + table_td_style_per + table_td_width[2]);
        html_table.push(result[i+1][3]);
        html_table.push('</td>\n</tr>');
            
        html_code.push(j.join(''));
    }

    html_code.push('</table>\n</body>\n</html>');
    
    try {
        (async () => {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.setViewport({
                width: html_body_width,
                height: html_body_height,
                deviceScaleFactor: 1,
                });
            await page.setContent(html_code.join('\n'));
            await page.screenshot({path: './graph.png'});
            await browser.close();
            })()
    } catch (e) {
        channel.send({content: 'Error when creating image.'});
    }

    return;
}


module.exports = {
    name: 'playerdatacomppic',
    aka: ['pd5', 'pdcp'],
    description: 'Get stats (datastore info) for youself (all users) or any users (Board+)',
    guildOnly: true,
    args: false,
    helpLevel: "all",
    usage: ` <name1> <name2>`,
    async execute(msg, args, _, internal_error) {
        async function runCommand() {
            //board
            let role_needed = await msg.guild.roles.fetch(role.board);
            let allowedThisCommand = msg.member.roles.highest.comparePositionTo(role_needed) >= 0;
            let name1 = args[0];
            let name2 = args[1];

            if (name1 && name2) {
                if (allowedThisCommand) {
                    // If the user is authorized to use the command and supplied a name, or used their own name
                    playerdata5command(name1, name2, msg);
                    console.log(`If No Name Error above: ${name1} & ${name2} player data comparsion image to ${msg.channel}, looked up by ${msg.member.displayName}`);
                } else {
                    msg.channel.send(`Error: You are not authorized to perform this action.`);
                    console.log(`User ${msg.member.displayName} tried to look up ${name1} & ${name2} user data (pdp) - it was not allowed due to lack of permissions`);
                }
            }
        }

        runCommand();
    },
};
