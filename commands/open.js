// @ts-check
let DiscordCommand = require('./../command.js');
let {format} = require('util');
let config = require('./../config');
const puppeteer = require('puppeteer');
const fs = require('fs');

function thousand_separator(value, decimal) {
    // Thousand separator with decimal places handle
    // value as value
    // decimal as nth decimal places
    decimal = decimal || 0;

    if (value === undefined) {
        return 0;
    } else {
        value = Math.round(Number(value) * 100) / 100;
        value = value.toFixed(decimal).split('.');
        return value[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (value[1] ? '.' + value[1] : '') || 0;
    }
}

function base64_encode(file) {
    var bitmap = fs.readFileSync(file);
    return new Buffer.from(bitmap).toString('base64');
}

class open_j extends DiscordCommand {
    constructor() {
        /**
         * @type {import("./../command.js").Argument[]}
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
     * @type {import("./../command.js").Execute}
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
        
        if (res) {
            await interaction.editReply(`\`\`\`json\n${JSON.stringify(res, null, 4)}\`\`\``);
        } else {
            await interaction.editReply(`Command might have failed result: \`\`\`${res}\`\`\``);
        }
    }
}
let j = new open_j();

class open_p extends DiscordCommand {
    constructor() {
        /**
         * @type {import("./../command.js").Argument[]}
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
     * @type {import("./../command.js").Execute}
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

        // Background Color
        let html_background_color = '#4F4F4F';
        // Font Color
        let html_font_color = '#F0F0F0';
        // Table Border Color
        let html_table_border_color = '#6F6F6F';
        // Font Family
        // Arial, Helvetica, Verdana, Calibri
        let html_font_family = 'Helvetica';
        // Font Size
        let html_font_size = '1em';
        // Description Font Size
        let html_description_font_size = '1.5em';
        // Table Individual Width
        let html_table_width = 64;
        // Table Total Width
        let html_table_width_total = 12 * (html_table_width);
        // Total Browser Height
        let html_body_height = 800;

        // font-weight:bold
        let html_code = ['<html>\n<head>\n<title></title>\n</head>\n<body style="background-color:' + html_background_color + '"><hr style="height:5px; visibility:hidden;margin:0px;border:0px;">',
        '<h2 style="width:100%;text-align:center;border-bottom:1px solid ' + html_table_border_color + ';line-height:0.1em;margin:10px 0 20px;color:' + html_font_color + '"><span style="background-color:' + html_background_color + ';padding:0 10px;font-family:' + html_font_family + ';">' + name + '</span></h2>',
        '<table style="border-collapse:collapse;width=' + html_table_width_total + 'px;">']

        let table_td_style = '<td style="padding:5px;border:1px solid ' + html_table_border_color + ';font-family:' + html_font_family + ';font-size:' + html_font_size + ';text-align:left;color:' + html_font_color + ';position:relative;z-index:1;';
        let table_td_width = 'width:' + html_table_width + 'px;">';
        let table_td_word = '<p class="img-with-text" style="font-family:' + html_font_family + ';font-size:' + html_description_font_size + ';color:' + html_font_color + 'width:' + html_table_width + ';font-weight:bold;text-shadow: -2px 0px #000000, 0px 2px #000000, 2px 0px #000000, 0px -2px #000000;z-index:2;position:absolute;bottom:-18px;right:4px;">';
        let table_td_word_end = '</p>';
        let table_td_empty = '<div style=height:' + html_table_width + ';width:' + html_table_width + ';clear:both;></div>';

        let table_image_url = './icons/';
        let item_list = [];

        for (const [item_dict_key, item_dict_value] of Object.entries(res)) {
            item_list.push([table_image_url + item_dict_key + '.png', item_dict_value]);
        }

        // Table Contents
        for (let i = 0; i < 9; i++) {
            let html_table_row_item = [];

            for (let k = 0; k < 10; k++) {
                let item_list_current = i * 10 + k;

                if (item_list_current < item_list.length - 1) {
                    if (k == 0) {
                        html_table_row_item.push('<tr>\n' + table_td_style + table_td_width);
                    } else {
                        html_table_row_item.push('</td>\n' + table_td_style + table_td_width);
                    }
                    html_table_row_item.push('<img src="data:image/png;base64,' + base64_encode(item_list[item_list_current][0]) + '" style=width:64px;height:64px;object-fit:cover;object-position:0% 0%;></img>' + table_td_word + thousand_separator(item_list[item_list_current][1], 0) + table_td_word_end);
                } else {
                    if (k == 0) {
                        html_table_row_item.push('<tr>\n' + table_td_style + table_td_width);
                    } else {
                        html_table_row_item.push('</td>\n' + table_td_style + table_td_width);
                    }
                    html_table_row_item.push(table_td_empty);
                }
            }

            html_table_row_item.push('</td>\n</tr>');
            html_code.push(html_table_row_item.join(''));
        }

        html_code.push('</table>\n</body>\n</html>');
    
        try {
            (async () => {
                const browser = await puppeteer.launch();
                const page = await browser.newPage();
                await page.setViewport({
                    width: html_table_width_total,
                    height: html_body_height,
                    deviceScaleFactor: 1,
                  });
                await page.setContent(html_code.join('\n'));
                await page.screenshot({path: './graph.png'});
                await browser.close();
              })()
        } catch (e) {
            await interaction.editReply({content: 'Error when creating image.'});
        }

        await interaction.editReply({files: ['./graph.png']})
    }
}
let p = new open_p();

class Open extends DiscordCommand {
    constructor() {
        /**
         * @type {import("./../command.js").Argument[]}
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
