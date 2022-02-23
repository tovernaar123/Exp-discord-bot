//player data storage access with new format
//required_role has an exception for the user to look upthemselves, nothing needed here it is handeled in infoBot.js...
//this helpLevel:"all" is required to show up on "semi public commands" it is not needed if the regular command was not restricted to role.board

let Eta = require('eta');
let Discord_Command = require('./../../command.js');
//const Discord = require('discord.js');
const fs = require('fs');
const puppeteer = require('puppeteer');


let grid_layout = {
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
                description: 'The name of the player to lookup.',
                required: true,
                type: 'String',
            },
            {
                name: 'style',
                description: 'The style the foto will be send in.',
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



        

        //The grid is a 2d array of strings.
        //The number of columns in the grid.
        let colums = 4;


        let grid = [];

        //The index so that the data can be split into rows.
        let i = 0;
        //Loop over all the required item for the grid.
        for (const [json_key, grid_name] of Object.entries(grid_layout)) {

            let value = stats[json_key];

            //if the value is not present it means that it is 0 (the lua event has never been triggerd).
            if(!value) value = 0;

            //if we have more then the required columns, we need to split the data into a new row.
            if(i % colums === 0  || i === 0) grid[grid.length] = [];

            //Add the data to the grid.
            grid[grid.length - 1].push(grid_name);
            grid[grid.length - 1].push(value);

            //plus 2 cause we add both name and value.
            i = i + 2;
        }
        //render the site with the grid.eta file (we read the file here so that it can be changed on the fly).
        let template = fs.readFileSync('./commands/playerdata/grid.eta', 'utf8');
        let html = Eta.render(template, {grid});

        //No sandbox but we have disabled javascript so its not required.
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        
        //Create the page from the created browser.
        const page = await browser.newPage();
        //Disable js immediately for security reason. 
        page.setJavaScriptEnabled(false);
        //set the photo to 680 and 600.
        await page.setViewport({
            width: 680,
            height: 600,
            deviceScaleFactor: 1,
        });
        //Set the page content.
        await page.setContent(html);
        //Render the page
        await page.screenshot({ path: './.cache/profile.png' });
        await browser.close();
        await interaction.editReply({ files: ['./.cache/profile.png'] });
    }
}
let command = new Playerdata();
module.exports = command;
