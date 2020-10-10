const Rcon = require('rcon-client');
const baseport = 34228;
module.exports = {
    name: 'ao',
    aka: ['adminonline','adminsonline','ao'],
    description: 'how many players are online?',
    guildOnly: true,
    args: true,
    usage: `<#>`,
    execute(msg, args, rcons, internal_error) {
        const rconpw = process.env.RCONPASS;
        const rconToSend = `/sc local admins, ctn = {}, 0 for _, p in ipairs(game.connected_players) do if p.admin then ctn = ctn + 1 admins[ctn] = p.name end end rcon.print('Online: '..ctn..': '..table.concat(admins, ', '))`; //get Admins, then add count, then display.
        const server = args[0];
        let rconport = Number(server) + baseport

        async function main() {
            const rcon = new Rcon.Rcon({
                host: "127.0.0.1",
                port: `${rconport}`,
                password: `${rconpw}`
            });

            rcon.on("connect", () => console.log("connected"));
            rcon.on("authenticated", () => console.log("authenticated"));
            rcon.on("end", () => console.log("end"));

            await rcon.connect();

            let responses1 = await rcon.send(rconToSend);
            if(responses1 && responses1 != ""){
                msg.channel.send(responses1);
            }

            console.log(responses1);

            rcon.end();
        }
        console.log(main().catch(console.log));
    },
};