module.exports = {
	name: 'ponew',
	aka: ['playersonlinenew'],
	description: 'how many players are online?',
	guildOnly: true,
	args: true,
	usage: ` <server#>`,
	execute(msg, args) {
		const Discord = require('discord.js');
		const Rcon = require('rcon-client');
		const author = msg.author.username; //find author
		const aid = author.id; // find author id
		const aname = author.username; // find the display name of the author
		const guild = msg.guild; // get a guild id .id after or .name
		const rconToSend = `/p o`; //get /players online.
		const server = args[0];
		const baseport = `34228`;
		let snum = [`1`,`2`,`3`,`4`,`5`,`6`,`7`,`8`];
		let all = ['all'];		
		let rconport = Number(server) + Number(baseport)
		let p1 = Number(baseport) + Number('1');
		let p2 = Number(baseport) + Number('2');
		let p3 = Number(baseport) + Number('3');
		let p4 = Number(baseport) + Number('4');
		let p5 = Number(baseport) + Number('5');
		let p6 = Number(baseport) + Number('6');
		let p7 = Number(baseport) + Number('7');
		let p8 = Number(baseport) + Number('8');
		const rconpw = process.env.RCONPASS;
		const rcon = new Rcon.Rcon({
			host: "127.0.0.1",
			port: `${rconport}`,
			password: `${rconpw}`
		});



		if(!server){ // Checks to see if the person specified a server number, then checks to see if the server number is part of the array of the servers it could be (1-8 currently)
			msg.channel.send('Please pick a server first just a number (1-8). \`<#> <username> <reason>\`');
			console.log(`Kick-Did not have server number`);
			return;
		}
		if(snum.indexOf(server) > -1){
			console.log('Server is 1-8');
		}else if (all.indexOf(server) > -1){
			console.log(`Server is all`);
		} else {
		// If a person DID give a server number but did NOT give the correct one it will return without running - is the server number is part of the array of the servers it could be (1-8 currently)
			msg.channel.send(`Please pick a server first just a number (1-8) or *all*.  Correct usage is \` po <server#>\``);
			console.log(`players online by ${author} incorrect server number`);
			return;		
		}

		if(snum.indexOf(server) > -1){
		console.log(oneCommand().catch(console.log));
		}
		else if(all.indexOf(server) > -1){
			console.log(allCommand().catch(console.log));
		} else {console.log}
		
		
		




async function s1Command(r){
	
	let srv = 1
	try{
	
		const rcon = new Rcon.Rcon({
			host: "127.0.0.1",
			port: `${p1}`,
			password: `${rconpw}`
		});
		
		rcon.on("connect", () => console.log(`connected ${srv}`));
		rcon.on("error", () => {console.log(`issue ${srv}`); msg.channel.send(error);});
		rcon.on("authenticated", () => console.log(`authenticated ${srv}`));
		rcon.on("end", () => console.log(`end ${srv}`));
		await rcon.connect();
		let r = await rcon.send(rconToSend);
		//if (r === `string` && r.length) {msg.channel.send(`error, normally that is a server that is not online`)}
		//else{msg.channel.send(`Server ${srv} responded:${r}`);}
		console.log("test "+r);  
		rcon.end();
		return r;
	} catch (error) {
		if(error.stack.startsWith(`Error: connect ECONNREFUSED`)) {msg.channel.send(`No Response from Server ${srv}`); 
		console.log(`S${srv} Connection Error --- Details --- \nNAME: ${error.name} \nDESC: ${error.description} \nStack: ${error.stack}`) 
		}else{
		msg.channel.send(error.name + error.description + ' *Server ${srv}*'); 
		console.log(`S${srv} Connection Error --- Details --- \nNAME: ${error.name} \nDESC: ${error.description} \nStack: ${error.stack}`) 	
		} 
		}
		
	}
async function s2Command(r){
	
	let srv = 2
	try{
	
		const rcon = new Rcon.Rcon({
			host: "127.0.0.1",
			port: `${p2}`,
			password: `${rconpw}`
		});
		
		rcon.on("connect", () => console.log(`connected ${srv}`));
		rcon.on("error", () => {console.log(`issue ${srv}`); msg.channel.send(error);});
		rcon.on("authenticated", () => console.log(`authenticated ${srv}`));
		rcon.on("end", () => console.log(`end ${srv}`));
		await rcon.connect();
		let r = await rcon.send(rconToSend);
		if (r === `string` && r.length) {msg.channel.send(`error, normally that is a server that is not online`)}
		else{msg.channel.send(`Server ${srv} responded:${r}`);}
		console.log(r);  
		rcon.end();
	} catch (error) {
		if(error.stack.startsWith(`Error: connect ECONNREFUSED`)) {msg.channel.send(`No Response from Server ${srv}`); 
		console.log(`S${srv} Connection Error --- Details --- \nNAME: ${error.name} \nDESC: ${error.description} \nStack: ${error.stack}`) 
		}else{
		msg.channel.send(error.name + error.description + ' *Server ${srv}*'); 
		console.log(`S${srv} Connection Error --- Details --- \nNAME: ${error.name} \nDESC: ${error.description} \nStack: ${error.stack}`) 	
		} 
		}
	}

async function s3Command(r){
	let srv = 3
	try{
	
		const rcon = new Rcon.Rcon({
			host: "127.0.0.1",
			port: `${p3}`,
			password: `${rconpw}`
		});
		
		rcon.on("connect", () => console.log(`connected ${srv}`));
		rcon.on("error", () => {console.log(`issue ${srv}`); msg.channel.send(error);});
		rcon.on("authenticated", () => console.log(`authenticated ${srv}`));
		rcon.on("end", () => console.log(`end ${srv}`));
		await rcon.connect();
		let r = await rcon.send(rconToSend);
		if (r === `string` && r.length) {msg.channel.send(`error, normally that is a server that is not online`)}
		else{msg.channel.send(`Server ${srv} responded:${r}`);}
		console.log(r);  
		rcon.end();
	} catch (error) {
		if(error.stack.startsWith(`Error: connect ECONNREFUSED`)) {msg.channel.send(`No Response from Server ${srv}`); 
		console.log(`${srv} Connection Error --- Details --- \nNAME: ${error.name} \nDESC: ${error.description} \nStack: ${error.stack}`) 
		}else{
		msg.channel.send(error.name + error.description + ' *Server ${srv}*'); 
		console.log(`${srv} Connection Error --- Details --- \nNAME: ${error.name} \nDESC: ${error.description} \nStack: ${error.stack}`) 	
		} 
		}
	}

async function s4Command(r){
	
	let srv = 4
	try{
	
		const rcon = new Rcon.Rcon({
			host: "127.0.0.1",
			port: `${p4}`,
			password: `${rconpw}`
		});
		rcon.on("connect", () => console.log(`connected ${srv}`));
		rcon.on("error", () => {console.log(`issue ${srv}`); msg.channel.send(error);});
		rcon.on("authenticated", () => console.log(`authenticated ${srv}`));
		rcon.on("end", () => console.log(`end ${srv}`));
		await rcon.connect();
		let r = await rcon.send(rconToSend);
		if (r === `string` && r.length) {msg.channel.send(`error, normally that is a server that is not online`)}
		else{msg.channel.send(`Server ${srv} responded:${r}`);}
		console.log(r);  
		rcon.end();
	} catch (error) {
		if(error.stack.startsWith(`Error: connect ECONNREFUSED`)) {msg.channel.send(`No Response from Server ${srv}`); 
		console.log(`${srv} Connection Error --- Details --- \nNAME: ${error.name} \nDESC: ${error.description} \nStack: ${error.stack}`) 
		}else{
		msg.channel.send(error.name + error.description + ' *Server ${srv}*'); 
		console.log(`${srv} Connection Error --- Details --- \nNAME: ${error.name} \nDESC: ${error.description} \nStack: ${error.stack}`) 	
		} 
		}
	}

async function s5Command(r){
	let srv = 5
	try{
	
		const rcon = new Rcon.Rcon({
			host: "127.0.0.1",
			port: `${p5}`,
			password: `${rconpw}`
		});
		rcon.on("connect", () => console.log(`connected ${srv}`));
		rcon.on("error", () => {console.log(`issue ${srv}`); msg.channel.send(error);});
		rcon.on("authenticated", () => console.log(`authenticated ${srv}`));
		rcon.on("end", () => console.log(`end ${srv}`));
		await rcon.connect();
		let r = await rcon.send(rconToSend);
		if (r === `string` && r.length) {msg.channel.send(`error, normally that is a server that is not online`)}
		else{msg.channel.send(`Server ${srv} responded:${r}`);}
		console.log(r);  
		rcon.end();
	} catch (error) {
		if(error.stack.startsWith(`Error: connect ECONNREFUSED`)) {msg.channel.send(`No Response from Server ${srv}`); 
		console.log(`${srv} Connection Error --- Details --- \nNAME: ${error.name} \nDESC: ${error.description} \nStack: ${error.stack}`) 
		}else{
		msg.channel.send(error.name + error.description + ' *Server ${srv}*'); 
		console.log(`${srv} Connection Error --- Details --- \nNAME: ${error.name} \nDESC: ${error.description} \nStack: ${error.stack}`) 	
		} 
		}
	}

async function s6Command(r){
	let srv = 6
	try{
	
		const rcon = new Rcon.Rcon({
			host: "127.0.0.1",
			port: `${p6}`,
			password: `${rconpw}`
		});
		
		rcon.on("connect", () => console.log(`connected ${srv}`));
		rcon.on("error", () => {console.log(`issue ${srv}`); msg.channel.send(error);});
		rcon.on("authenticated", () => console.log(`authenticated ${srv}`));
		rcon.on("end", () => console.log(`end ${srv}`));
		await rcon.connect();
		let r = await rcon.send(rconToSend);
		if (r === `string` && r.length) {msg.channel.send(`error, normally that is a server that is not online`)}
		else{msg.channel.send(`Server ${srv} responded:${r}`);}
		console.log(r);  
		rcon.end();
	} catch (error) {
		if(error.stack.startsWith(`Error: connect ECONNREFUSED`)) {msg.channel.send(`No Response from Server ${srv}`); 
		console.log(`${srv} Connection Error --- Details --- \nNAME: ${error.name} \nDESC: ${error.description} \nStack: ${error.stack}`) 
		}else{
		msg.channel.send(error.name + error.description + ' *Server ${srv}*'); 
		console.log(`${srv} Connection Error --- Details --- \nNAME: ${error.name} \nDESC: ${error.description} \nStack: ${error.stack}`) 	
		} 
		}
	}

async function s7Command(r){
	let srv = 7
	try{
	
		const rcon = new Rcon.Rcon({
			host: "127.0.0.1",
			port: `${p7}`,
			password: `${rconpw}`
		});
		
		rcon.on("connect", () => console.log(`connected ${srv}`));
		rcon.on("error", () => {console.log(`issue ${srv}`); msg.channel.send(error);});
		rcon.on("authenticated", () => console.log(`authenticated ${srv}`));
		rcon.on("end", () => console.log(`end ${srv}`));
		await rcon.connect();
		let r = await rcon.send(rconToSend);
		if (r === `string` && r.length) {msg.channel.send(`error, normally that is a server that is not online`)}
		else{msg.channel.send(`Server ${srv} responded:${r}`);}
		console.log(r);  
		rcon.end();
	} catch (error) {
		if(error.stack.startsWith(`Error: connect ECONNREFUSED`)) {msg.channel.send(`No Response from Server ${srv}`); 
		console.log(`${srv} Connection Error --- Details --- \nNAME: ${error.name} \nDESC: ${error.description} \nStack: ${error.stack}`) 
		}else{
		msg.channel.send(error.name + error.description + ' *Server ${srv}*'); 
		console.log(`${srv} Connection Error --- Details --- \nNAME: ${error.name} \nDESC: ${error.description} \nStack: ${error.stack}`) 	
		} 
		}
	}

async function s8Command(r){
	let srv = 8
	try{
	
		const rcon = new Rcon.Rcon({
			host: "127.0.0.1",
			port: `${p8}`,
			password: `${rconpw}`
		});
		
		rcon.on("connect", () => console.log(`connected ${srv}`));
		rcon.on("error", () => {console.log(`issue ${srv}`); msg.channel.send(error);});
		rcon.on("authenticated", () => console.log(`authenticated ${srv}`));
		rcon.on("end", () => console.log(`end ${srv}`));
		await rcon.connect();
		let r = await rcon.send(rconToSend);
		if (r === `string` && r.length) {msg.channel.send(`error, normally that is a server that is not online`)}
		else{msg.channel.send(`Server ${srv} responded:${r}`);}
		console.log(r);  
		rcon.end();
	} catch (error) {
		if(error.stack.startsWith(`Error: connect ECONNREFUSED`)) {msg.channel.send(`No Response from Server ${srv}`); 
		console.log(`${srv} Connection Error --- Details --- \nNAME: ${error.name} \nDESC: ${error.description} \nStack: ${error.stack}`) 
		}else{
		msg.channel.send(error.name + error.description + ' *Server ${srv}*'); 
		console.log(`${srv} Connection Error --- Details --- \nNAME: ${error.name} \nDESC: ${error.description} \nStack: ${error.stack}`) 	
		} 
		}
	}

async function allCommand() {
	msg.channel.send('Asked for all online players: Awaiting reply from servers...')
	//setTimeout(function () {
	//	console.log('timeout completed'); 
	//}, 1000); 
	//setTimeout(() => {s1Command().r},1000);
	//setTimeout(() => {s2Command().r},1500);
	//setTimeout(() => {s3Command()},2000);
	//setTimeout(() => {s4Command()},2500);
	//setTimeout(() => {s5Command()},3000);
	//setTimeout(() => {s6Command()},3500);
	//setTimeout(() => {s7Command()},4000);
	const res = await s1Command();
	res;
	//setTimeout(function () {s8Command().r},4500);

} 




async function oneCommand() {
  try{
  
	  rcon.on("connect", () => console.log(`connected ${server}`));
	  rcon.on("error", () => {console.log(`issue ${srv}`); msg.channel.send(error);});
	  rcon.on("authenticated", () => console.log(`authenticated ${server}`));
	  rcon.on("end", () => console.log(`end ${server}`));
	  await rcon.connect();
	  let r = await rcon.send(rconToSend);
	  if (r === `string` && r.length) {msg.channel.send(`error, normally that is a server that is not online`)}
	  else{msg.channel.send(`Server ${server} responded:${r}`);}
	  console.log(r);  
	  rcon.end();
  } catch (error) {
	  if(error.stack.startsWith(`Error: connect ECONNREFUSED`)) {msg.channel.send(`No Response from Server ${server}`); 
	  console.log(`${server} Connection Error --- Details --- \nNAME: ${error.name} \nDESC: ${error.description} \nStack: ${error.stack}`) 
	  }else{
	  msg.channel.send(error.name + error.description + ' *Server ${srv}*'); 
	  console.log(`${server} Connection Error --- Details --- \nNAME: ${error.name} \nDESC: ${error.description} \nStack: ${error.stack}`) 	
	  } 
	  }
  }






}


}