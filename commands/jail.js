const Rcon = require('rcon-client');
const rconpw = process.env.RCONPASS;
const baseport = `34228`;
module.exports = {
    name: 'jail',
    aka: ['jails'],
    description: 'jail any user (Admin/Mod only command)',
    guildOnly: true,
    args: true,
    helpLevel: 'staff',
    required_role: 'staff',
    usage: `<#> <username> <reason>`,
    execute(msg, args) {
        const server = args[0];
        const rconport = Number(server) + Number(baseport)
        let reason1 = args.slice(2).join(" ");
        let tojail = args[1];
        let snum = [`1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`];

        if (!server) {
            msg.channel.send('Please pick a server first just a number (1-8)');
            return;
        }
        if (snum.indexOf(server) === -1) {
            msg.channel.send(`Please pick a server first just a number (1-8).  Correct usage is jail \`<#> <username> <reason>\``);
            return;
        }
        if (!reason1) {
            msg.channel.send(`Please pick a server first just a number (1-8).  Correct usage is jail \`<#> <username> <reason>\``);
            return;
        }
        if (!tojail) {
            msg.channel.send(`You need to tell us who you would like to jail for us to be able to jail them`);
            return;
        }

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


            let responses = await Promise.all([
                rcon.send(`/jail ${tojail} ${reason1}`)

            ])




            msg.channel.send(responses + ` If no error above user **${tojail}** should have been jailed for *${reason1}*, check with someone to be sure because ALo wrote this...`);
            console.log(responses + `.`);

            rcon.end()
        }
        console.log(main().catch(console.log));
        msg.channel.send('.');
    },
};