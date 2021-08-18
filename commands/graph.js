const Discord = require('discord.js');
const fs = require('fs');
const request = require('request');

let cooldown = new Set()
let timeout = 60 * 1000 * 3
let config = {
    load: 4,
    memory: 7,
    network: 9,
    disk: 10,
    usage: 11,
    cpu_temp: 28,
    cpu_freq: 42,
    cpu: 51,
    player: 54,
    ups: 55,
    rocket: 56
}
let graph_index_allowed = ["rocket", "player", "ups"];

const download = (url, path, callback) => {
    request.head(url, (err, res, body) => {
        request(url).pipe(fs.createWriteStream(path)).on('close', callback);
    })
}

module.exports = {
    name: 'graph',
    description: 'Provide server Info using graph',
    guildOnly: true,
    args: true,
    usage: `<Type>`,
    async execute(msg, args, _, internal_error) {
        let channel = msg.channel;
        let id = msg.author.id
        let type = args[0].toLowerCase();

        cooldown.add(id);

        setTimeout(() => {
            cooldown.delete(id)
        }, timeout);

        let url = 'https://info.explosivegaming.nl/grafana/render/d-solo/wRgzuFqiz/system-metrics?orgId=1&from=now-30m&to=now&panelId=' + config[type] + '&width=1000&height=300&tz=UTC';
        const path = '.cache/graph.png'
        channel.send("Downloading graph please wait.");
        
        try {
            download(url, path, () => {
                console.log('Download Complete.');
                channel.send({ files: ['.cache/graph.png'] }).catch((err) => {
                    console.error(err)
                    channel.send(`Error when sending image.`);
                });
            });
        } catch (e) {
            channel.send(`Error when saving image.`);
            console.log(`Error when saving graph image.`);
        }

    },
    async validator(msg, args, internal_error) {

        let type = args[0].toLowerCase();
        let id = msg.author.id

        let obj = {}
        obj.success = false;
        if (cooldown.has(id)) {
            obj.error = "Due to the memory need of this command it has a 3 minute cooldown please wait."
            return obj
        }

        let role_needed = global.role.board;
        let role = await msg.guild.roles.fetch(role_needed);
        let allowedThisCommand = msg.member.roles.highest.comparePositionTo(role) >= 0;

        if (!config[type]) {
            if (allowedThisCommand) obj.error = `Please enter one of the following for the type: \n${Object.keys(config).join(', ')} `;
            else obj.error = `Please enter one of the following for the type: \n${graph_index_allowed.join(', ')} `;
            return obj;
        }

        if (!(graph_index_allowed.indexOf(type) >  0 || allowedThisCommand)) {
            obj.error = `You do not have the right role for this graph type`;
            return obj;
        }
        obj.success = true
        return obj
    }
};
