// @ts-check

let DiscordCommand = require('../../command.js');
let { format } = require('util');
let config = require('../../config/index.js');
const puppeteer = require('puppeteer');
const fs = require('fs');
const { promisify } = require('util');



class open_j extends DiscordCommand {
    constructor() {
        /**
         * @type {import("../../command.js").Argument[]}
         */
        let args = [
            DiscordCommand.CommonArgs.ServerNoAll,
            {
                name: 'name',
                description: 'The name of the player.',
                required: true,
                type: 'String',
            }
        ];
        super({
            name: 'json',
            description: 'plain inventory display',
            cooldown: 5,
            args: args,
            guildOnly: true,
            requiredRole: DiscordCommand.roles.staff,
        });
    }
    /**
     * @type {import("../../command.js").Execute}
    */
    async execute(interaction) {
        await interaction.deferReply();
        let server = parseInt(interaction.options.getString('server'));
        let name = interaction.options.getString('name');
        let rcon = DiscordCommand.client.Rcons.GetRcon(server);

        if (!rcon.connected) {
            await interaction.editReply(format(config.getKey('ServerNotConnected'), server));
            return;
        }

        let res = await rcon.Send(`/interface game.table_to_json(game.players['${name}'].get_main_inventory().get_contents())`);
        try {
            res = JSON.parse(res);
        } catch {
            return void await interaction.editReply('Error When parsing the JSON');
        }
        if (res) {
            await interaction.editReply(`\`\`\`json\n${JSON.stringify(res, null, 4)}\`\`\``);
        } else {
            await interaction.editReply(`Command might have failed result: \`\`\`${res}\`\`\``);
        }
    }
}
let j = new open_j();

const INVENTORY_COMMANDS = {
    Main: '/interface return game.table_to_json(game.players["_name_"].get_main_inventory().get_contents())',
    Trash: '/interface return game.table_to_json(game.players["_name_"].get_inventory(defines.inventory.character_trash).get_contents())',
    Guns: '/interface return game.table_to_json(game.players["_name_"].get_inventory(defines.inventory.character_guns).get_contents())',
    Ammo: '/interface return game.table_to_json(game.players["_name_"].get_inventory(defines.inventory.character_ammo).get_contents())',
    Armor: '/interface return game.table_to_json(game.players["_name_"].get_inventory(defines.inventory.character_armor).get_contents())',
    Cursor: '/interface local cursor_stack = game.players["_name_"].cursor_stack if cursor_stack.valid_for_read then return game.table_to_json({[cursor_stack.name] = cursor_stack.count}) else return "{}" end'
};

/**
 * @param {Number} row
 * @param {Number} column
 * @param {[string, number][]} Inventory
 */
function CreateGrid(row, column, Inventory) {
    let html_grid = [];

    for (const [ItemName, ItemAmount] of Inventory) {
        html_grid.push('<div>');
        html_grid.push(`<img src="./../icons/${ItemName}.png">`);
        html_grid.push(`<div class="number">${ItemAmount}</div>`);
        html_grid.push('</div>');
    }
    let full_gird_size = row * column - Inventory.length;
    for (let i = 0; i < full_gird_size; i++) {
        html_grid.push('<div></div>');
    }
    return html_grid.join('\n');
}

class open_p extends DiscordCommand {
    constructor() {
        /**
         * @type {import("../../command.js").Argument[]}
         */
        let args = [
            DiscordCommand.CommonArgs.ServerNoAll,
            {
                name: 'name',
                description: 'The name of the player.',
                required: true,
                type: 'String',
            }
        ];
        super({
            name: 'pic',
            description: 'picture inventory display',
            cooldown: 5,
            args: args,
            guildOnly: true,
            requiredRole: DiscordCommand.roles.staff,
        });
    }
    /**
     * @type {import("../../command.js").Execute}
    */
    async execute(interaction) {
        await interaction.deferReply();
        let server = parseInt(interaction.options.getString('server'));
        let PlayerName = interaction.options.getString('name');
        let rcon = DiscordCommand.client.Rcons.GetRcon(server);

        if (!rcon.connected) {
            await interaction.editReply(format(config.getKey('ServerNotConnected'), server));
            return;
        }

        let IconPadding = 5;
        let CellBorderSize = 2;
        let IconSize = 64;
        let TitleMargin = 10;
        let GridContainerPadding = 10;
        let RowAmount = 8;
        let ColumnAmount = 12;
        let TitleHeight = 20;
        let WantedBorderSizeWidth = 20;
        let WantedBorderSizeHeight = 10;
        /**
            * @type {string[]}
        */
        let Pages = [];


        let res = (await rcon.Send(INVENTORY_COMMANDS.Main.replace('_name_', PlayerName))).split('\n')[0];
        /**
            * @type {{[key: string]: Number}}
        */
        let JsonInv;
        try {
            JsonInv = JSON.parse(res);
        } catch {
            return void await interaction.editReply('Error When parsing the JSON');
        }
        for (let j = 0; j < Object.keys(JsonInv).length; j += RowAmount * ColumnAmount) {
            const Inventory = Object.entries(JsonInv).slice(j, j + RowAmount * ColumnAmount);

            let HtmlCode = `
                <style>
                    :root {
                        --ColumnAmount: ${ColumnAmount};
                        --RowAmount: ${RowAmount};
                        --GridContainerPadding: ${GridContainerPadding}px;
                        --IconSize: ${IconSize}px;
                        --CellBorderSize: ${CellBorderSize}px;
                        --IconPadding: ${IconPadding}px;
                        --TitleMargin: ${TitleMargin}px;
                    }
                </style>
                <link rel="stylesheet" href="./../commands/open/main.css">
                <h4 class=title>
                    Main - ${PlayerName}
                </h4>
                <div class=grid>
                    ${CreateGrid(RowAmount, ColumnAmount, Inventory)}
            </div>`;

            Pages.push(HtmlCode);
        }
        let Trash = (await rcon.Send(INVENTORY_COMMANDS.Trash.replace('_name_', PlayerName))).split('\n')[0];
        let Guns = (await rcon.Send(INVENTORY_COMMANDS.Guns.replace('_name_', PlayerName))).split('\n')[0];
        let Ammo = (await rcon.Send(INVENTORY_COMMANDS.Ammo.replace('_name_', PlayerName))).split('\n')[0];
        let Armor = (await rcon.Send(INVENTORY_COMMANDS.Armor.replace('_name_', PlayerName))).split('\n')[0];
        let Cursor = (await rcon.Send(INVENTORY_COMMANDS.Cursor.replace('_name_', PlayerName))).split('\n')[0];
        /**
            * @type {{[key: string]: Number}}
        */
        let TrashJson;
        /**
            * @type {{[key: string]: Number}}
        */
        let GunsJson;
        /**
            * @type {{[key: string]: Number}}
        */
        let AmmoJson;
        /**
            * @type {{[key: string]: Number}}
        */
        let ArmorJson;
        /**
            * @type {{[key: string]: Number}}
        */
        let CursorJson;
        try {
            TrashJson = JSON.parse(Trash);
            GunsJson = JSON.parse(Guns);
            AmmoJson = JSON.parse(Ammo);
            ArmorJson = JSON.parse(Armor);
            CursorJson = JSON.parse(Cursor);
        } catch {
            return void await interaction.editReply('Error When parsing the JSON');
        }
        let HtmlCode = `
        <style>
        .Trash{
            --ColumnAmount: ${ColumnAmount};
            --RowAmount: ${4}; 
        }
        .Equiment {
            --ColumnAmount: ${5};
            --RowAmount: ${2}; 
        }
        :root {
            --GridContainerPadding: ${GridContainerPadding}px;
            --IconSize: ${IconSize}px;
            --CellBorderSize: ${CellBorderSize}px;
            --IconPadding: ${IconPadding}px;
            --TitleMargin: ${TitleMargin}px;
        }
        </style>
        <link rel="stylesheet" href="./../commands/open/main.css">
        <h4 class=title>
            Trash - ${PlayerName}
        </h4>
        <div class="grid Trash">
            ${CreateGrid(4, ColumnAmount, Object.entries(TrashJson))}
        </div>
        <h4>
            Equiment, Armor And Cursor
        </h4>
        <div class="grid Equiment" style="margin:0;">
            ${CreateGrid(1, 3, Object.entries(GunsJson))}
            ${CreateGrid(1, 1, [])}
            ${CreateGrid(1, 1, Object.entries(ArmorJson))}
            ${CreateGrid(1, 3, Object.entries(AmmoJson))}
            ${CreateGrid(1, 1, [])}
            ${CreateGrid(1, 1, Object.entries(CursorJson))}
        </div>
        `;
        Pages.push(HtmlCode);
        let writefile = promisify(fs.writeFile);



        const browser = await puppeteer.launch({ args: ['--allow-file-access-from-files', '--enable-local-file-accesses'] });
        const page = await browser.newPage();
        await interaction.editReply(`${PlayerName}'s inventory:`);
        await page.setViewport({
            width: ColumnAmount * (IconSize + 2 * IconPadding + 2 * CellBorderSize) + 2 * GridContainerPadding + WantedBorderSizeWidth,
            height: RowAmount * (IconSize + 2 * IconPadding + 2 * CellBorderSize) + 2 * GridContainerPadding + WantedBorderSizeHeight + 2 * TitleMargin + TitleHeight,
            deviceScaleFactor: 1,
        });
        for (let Page of Pages) {
            await writefile('./.cache/invpage.html', Page);
            await page.goto(`file://${__dirname}/../../.cache/invpage.html`);
            await page.screenshot({ path: './.cache/inventory.png' });
            await interaction.channel.send({ files: ['./.cache/inventory.png'] });

        }
        await browser.close();



    }
}
let p = new open_p();

class Open extends DiscordCommand {
    constructor() {
        /**
         * @type {import("../../command.js").Argument[]}
        */
        let args = [
            {
                type: 'Subcommand',
                command: j
            },
            {
                type: 'Subcommand',
                command: p
            }
        ];
        super({
            name: 'open',
            description: 'Factorio Server Open Inventory.',
            cooldown: 5,
            args: args,
            guildOnly: true,
            requiredRole: DiscordCommand.roles.staff
        });
    }
}

let command = new Open();
module.exports = command;
