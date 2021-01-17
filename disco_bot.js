

//discord things
const Discord = require("discord.js");
const client = new Discord.Client();
const short_prefix = '!';
const long_prefix = 'hey doodle';
const https = require('https');


//leaderboard things
const nyt_token = 'Nzk2MTYwOTg4ODEwMzEzNzU5.X_T4sw.KrhusnKtkZwf0gQLC-MgumYYcLg';

//dots things
const HACKMAN_ID = 40073716;
const MIAL_ID = 51470124;
const JAMIE_ID = 48519055;
const BRYAN_ID = 68412694;
const ANDY_ID = 53972304;
var DISCO_ID_MAP = new Map();


DISCO_ID_MAP.set('galbman', HACKMAN_ID);
DISCO_ID_MAP.set('mootilda', MIAL_ID);
DISCO_ID_MAP.set('_sirjamz', JAMIE_ID);
DISCO_ID_MAP.set('kama', BRYAN_ID);
DISCO_ID_MAP.set('meowsy', ANDY_ID);


client.login(nyt_token);

client.on('ready', () => {
  console.log('disco_bot ready!')
  
  schedule();
})


function miniLeaderboard(msg){
	const options = {
	  hostname: 'nyt-games-prd.appspot.com',
	  port: 443,
	  path: '/svc/crosswords/v6/leaderboard/mini.json',
	  method: 'GET',
	  headers: {
		'nyt-s': '1wo713ZDZz61dACt/MVkib/0MyxE3RJTYlkeQBACjf4wsZRMzUy5fMmkficUcSZ3aojOoea6bgYnSmrYRS.71QMeLFwtyWjsksCXmWy4wxavHlyfqy/AMTgjxDTQO38FS1',
		'Content-Type': 'application/json'
	  }
	}

	const req = https.request(options, res => {
	  console.log(`statusCode: ${res.statusCode}`)
		var resBody = '';
		res.on('data', chunk => {
		  resBody += chunk;
		})
		
		res.on('end', d => {	  
			if (resBody.includes("printDate")){  //dumb way to see if it was success, for now
				resBody = JSON.parse(resBody);
				console.log(resBody);
				var out = "Current NYT Mini leaderboard for " + resBody.printDate + "\n";
				out += "Rank\tName\tTime\n";
				for (i = 0; i < resBody.data.length; i++){
					var record = resBody.data[i];
					if (record.score){
						out += record.rank + "\t" + record.name + "\t" + record.score.secondsSpentSolving + "\n";
					}
				}
				console.log(out);
				if (msg){
					msg.reply(out);
				}else {
					client.channels.fetch('796927178121019403').then(channel => channel.send(out)).catch(error => console.error("error posting to channel :( " + error));
				}
			}	  
		})
	})
	 
	req.on('error', error => {
	  console.error(error)
	})

	req.end()
}

function schedule(){
	console.log("schedule initialized");
		setInterval(function(){ // Set interval for checking
		console.log("schedule ding");
		
		var date = new Date(); // Create a Date object to find out what time it is
		console.log(date.toLocaleString());
	 
		if (date.getDay() == 6 || date.getDay() == 0){
			cutOffHour = 18;
		} else {
			cutOffHour = 22;
		}
		if(date.getHours() === cutOffHour-1 && date.getMinutes() >= 50){ // Check the time
			miniLeaderboard();
		}
	}, 600000); // Repeat every 10 minutes
}


client.on('message', async (msg) => {
  var content = msg.content.toLowerCase();
  var prefix;
  if(content.startsWith(short_prefix)) {
	  prefix = short_prefix;
  } else if (content.startsWith(long_prefix)){
     prefix = long_prefix;
  } else {
	return;
  }
  
  const parts = content.slice(prefix.length).trim().split(' ');
  const command = parts.shift();
  
  if (command == "leaderboard"){
	  miniLeaderboard(msg);	  
	} else if (command == "excuse"){
		//param = 'me' or 'player'
		if (parts[0] === 'me'){
			getMatches(msg, DISCO_ID_MAP.get(msg.author.username.toLowerCase()));
		} else if (DISCO_ID_MAP.has(parts[0])){
			getMatches(msg, DISCO_ID_MAP.get(parts[0]));
		} else {
			msg.reply("wat");
		}
	} else {
		msg.reply("wat");
		//msg.reply("Supported commands:\n");
		//iterate over command list (map?), display each name + usage?
	}
})


//determines reason for win or loss
function excuse(msg, match, playerId){
	let player_radiant = false;
	for (const player of match.players){
		if (player.account_id === playerId){
			player_radiant = player.isRadiant;
		}
	}
	
	var date = new Date(match.start_time * 1000);
	
	let outStr = "Match [" + match.match_id + "](https://www.dotabuff.com/matches/" + match.match_id + ") played on " + date.toDateString() + " at " + date.toLocaleTimeString('en-US') + ' was ';
	
	if (match.radiant_win === player_radiant){
		outStr += 'won! Thanks Obama!';
	} else {
		outStr += 'lost. Thanks Obama :(';
	}
		
	console.log(outStr);
	msg.reply(new Discord.MessageEmbed().setDescription(outStr));
}

//fetches the match, then calls excuse
function getMatch(msg, matchId, playerId){
	
	const options = {
		hostname: 'api.opendota.com',
		port: 443,
		path: '/api/matches/' + matchId,
		method: 'GET',
		headers: {
			Authorization: 'Bearer ea5b8d3e-7aba-4611-8c13-7f71a6d6f054'		
		}
	}
	
	const req = https.request(options, res => {
		console.log(`statusCode: ${res.statusCode}`)
		let resBody = '';
		
		res.on('data', chunk => {
		  resBody += chunk;
		})
		
		res.on('end', d => {  
		resBody = JSON.parse(resBody);
		console.log(resBody);
		excuse(msg, resBody, playerId);
		
		
		
		
		//return resBody;
		/*if (msg){
			msg.reply(out);
		}else {
			client.channels.fetch('796927178121019403').then(channel => channel.send(out)).catch(error => console.error("error posting to channel :( " + error));
		}*/	 
		})
	})
	 
	req.on('error', error => {
	  console.error(error)
	})

	req.end();	
}

//gets matches for the provided player, then calls getMatch with the latest match for them
function getMatches(msg, playerId){
	const options = {
		hostname: 'api.opendota.com',
		port: 443,
		path: '/api/players/'+playerId+'/recentMatches',
		method: 'GET',
		headers: {
			Authorization: 'Bearer ea5b8d3e-7aba-4611-8c13-7f71a6d6f054'
		}
	}
	
	const req = https.request(options, res => {
	  console.log(`statusCode: ${res.statusCode}`)
		let resBody = '';
		
		res.on('data', chunk => {
		  resBody += chunk;
		})

		res.on('end', d => {	  
			resBody = JSON.parse(resBody);
			console.log(resBody);
			getMatch(msg, resBody[0].match_id, playerId);
			/*if (msg){
				msg.reply(out);
			}else {
				client.channels.fetch('796927178121019403').then(channel => channel.send(out)).catch(error => console.error("error posting to channel :( " + error));
			}*/	 
		})
	})

	req.on('error', error => {
	  console.error(error)
	})

	req.end()
}



