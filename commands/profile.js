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
    var msg_3 = [];

    /*
    function pad (num, places) {
        return String(num).padStart(places, '0');
    }
    */

    msg_3.push('Statistics:');
    msg_3.push('Main:');
    var t1 = msg_2['Playtime'];
    var h1 = Math.floor(t1 / 60);
    var m1 = Math.floor(t1 % 60);

    if (h1 > 0) {
        // msg_3.push('Play Time: ' + pad(h1, 2) + ':' + pad(m1, 2));
        msg_3.push('Play Time: ' + h1 + ' hrs ' + m1 + ' min ')
    } else {
        // msg_3.push('Play Time: ' + pad(h1, 2) + ':' + pad(m1, 2));
        msg_3.push('Play Time: ' + m1 + ' min ')
    }

    var t2 = msg_2['AfkTime'];
    var h2 = Math.floor(t2 / 60);
    var m2 = Math.floor(t2 % 60);

    if (h2 > 0) {
        // msg_3.push('Afk Time: ' + ts(pad(h2, 2)) + ':' + pad(m2, 2));
        msg_3.push('Afk Time: ' + h2 + ' hrs ' + m2 + ' min '
    } else {
        // msg_3.push('Afk Time: ' + ts(pad(h2, 2)) + ':' + pad(m2, 2));
        msg_3.push('Afk Time: ' + m2 + ' min ')
    }

    msg_3.push('Maps Played: ' + ts(msg_2['MapsPlayed']));
    msg_3.push('Join Count: ' + ts(msg_2['JoinCount']));
    msg_3.push('Chat Messages: ' + ts(msg_2['ChatMessages']));
    msg_3.push('Commands Used: ' + ts(msg_2['CommandsUsed']));

    msg_3.push('\nGameplay:');
    msg_3.push('Distance Travelled: ' + ts(msg_2['DistanceTravelled']));
    msg_3.push('Kills: ' + ts(msg_2['Kills']));
    msg_3.push('Damage Dealt: ' + ts(msg_2['DamageDealt']));
    msg_3.push('Deaths: ' + ts(msg_2['Deaths']));
    msg_3.push('Deconstruction Planner Used: ' + ts(msg_2['DeconstructionPlannerUsed']));
    msg_3.push('Trees Destroyed: ' + ts(msg_2['TreesDestroyed']));
    msg_3.push('Capsules used: ' + ts(msg_2['CapsulesUsed']));

    msg_3.push('\nAchievements:');
    msg_3.push('Machines built: ' + ts(msg_2['MachinesBuilt']));
    msg_3.push('Machines removed: ' + ts(msg_2['Machines Removed']));
    msg_3.push('Research completed: ' + ts(msg_2['ResearchCompleted']));
    msg_3.push('Rockets launched: ' + ts(msg_2['RocketsLaunched']));

    msg_3.push('\nOthers');
    msg_3.push('Map tags made: ' + ts(msg_2['MapTagsMade']));
    msg_3.push('Items crafted: ' + ts(msg_2['ItemsCrafted']));
    msg_3.push('Entity repaired: ' + ts(msg_2['EntityRepaired']));
    msg_3.push('Items picked Up: ' + ts(msg_2['ItemsPickedUp']));
    msg_3.push('Tiles built: ' + ts(msg_2['TilesBuilt']));
    msg_3.push('Tiles removed: ' + ts(msg_2['TilesRemoved']));
    msg_3.push('Ore mined: ' + ts(msg_2['OreMined']));

    return msg_3.join('\n');
}

msg = {'JoinCount': 44, 'DistanceTraveled': 231, 'CommandsUsed': 246, 'Playtime': 2469, 'ChatMessages': 764, 'MapsPlayed': 8, 'DistanceTravelled': 336100, 'ItemsCrafted': 10142, 'ResearchCompleted': 375, 'ItemsPickedUp': 9037, 'MachinesRemoved': 14288, 'MachinesBuilt': 20052, 'TreesDestroyed': 3666, 'DeconstructionPlannerUsed': 79, 'DamageDealt': 11571, 'Kills': 143, 'EntityRepaired': 559, 'AfkTime': 307, 'CapsulesUsed': 21, 'RocketsLaunched': 45, 'Deaths': 6, 'MapTagsMade': 2};

// discord.js モジュールのインポート
const Discord = require('discord.js');

// Discord Clientのインスタンス作成
const client = new Discord.Client();

// トークンの用意
const token = 'MzUyMzQyNDk2ODY2NTk4OTE1.DIgATw.GRiauOHALNCsx2qsGvpmmCzsBPo';

// 準備完了イベントのconsole.logで通知黒い画面に出る。
client.on('ready', () => {
    console.log('ready...');
});


// 後でここに追記します。

// メッセージがあったら何かをする
client.on('message', message => {
    // メッセージの文字列による条件分岐
    if (message.content === '/js') {

        let channel = message.channel;
        let author = message.author.username;
        // let reply_text = `こんばんわ。${author}様。`;
        let reply_text = profile(msg);
        // そのチェンネルにメッセージを送信する
        message.channel.send(reply_text)
            .then(message => console.log(`Sent message: ${reply_text}`))
            .catch(console.error);
        return;
    }
});

// Discordへの接続
client.login(token);