let { spawn } = require("child_process");
let shell = spawn('/bin/bash')

shell.stdout.on('data', data => {
    console.log(`stdout:\n${data}`);
});

shell.stderr.on('data', data => {
    console.error(`stderr: ${data}`);
});




async function run_command(msg, args, internal_error) {
    let branch = args[0]
    if (branch) {
        shell.stdin.write(`git reset --hard origin/${branch}\n`);
        shell.stdin.write(`git clean -fd\n`);
        await msg.reply('Updating bot will restart now')
        shell.stdin.write(`pm2 restart infoBot\n`);
    }else{
        await msg.reply('need a branch.')
    }
}

module.exports = {
    name: 'update-bot',
    aka: ['upb, update'],
    description: 'update the bot from the github',
    guildOnly: true,
    args: true,
    helpLevel: 'staff',
    required_role: role.staff,
    usage: `<branch>`,
    execute(msg, args, _, internal_error) {
        run_command(msg, args, internal_error)
            .catch((err) => { internal_error(err); return })
    }
}