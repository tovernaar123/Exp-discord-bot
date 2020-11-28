let { spawn } = require("child_process");
let shell = spawn('C:\\Windows\\System32\\bash.exe')

shell.stdout.on('data', data => {
    console.log(`stdout:\n${data}`);
});

shell.stderr.on('data', data => {
    console.error(`stderr: ${data}`);
});




async function run_command(msg, args, internal_error) {
    let branch = args[0]
    shell.stdin.write('mkdir ./temp\n')
    if (branch) {
        shell.stdin.write(`git clone https://github.com/tovernaar123/Exp-discord-bot.git --branch ${branch}\n`)
    }else{
        shell.stdin.write('git clone https://github.com/tovernaar123/Exp-discord-bot.git\n')
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