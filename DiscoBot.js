//properties file
const pr = require('properties-reader');

const CONFIG_PATH = './resources/config.txt';
const PROPERTIES = pr(CONFIG_PATH);


//discord things
const Discord = require("discord.js");
const https = require('https');
const todo = require("./TodoHandler.js");
const leaderboard = require("./LeaderboardHandler.js");
const ready = require("./ReadyHandler.js");

const client = new Discord.Client();
const short_prefix = '!';
const long_prefix = 'hey doodle';
const disco_token = PROPERTIES.get('discord.secret');

const TEST_CHANNEL = '800440478138368021';
const LEADERBOARD_CHANNEL = '796927178121019403';
const SAFE_PLACE_CHANNEL = '452248804066983958';
const CHAT_CHANNEL = '406604158641373214';


//dots things
const OPENDOTA_AUTH = PROPERTIES.get('opendota.secret');

const HACKMAN_ID = 40073716;
const MIAL_ID = 51470124;
const JAMIE_ID = 48519055;
const BRYAN_ID = 68412694;
const ANDY_ID = 53972304;
var DISCO_ID_MAP = new Map();


DISCO_ID_MAP.set('galbman', HACKMAN_ID);
DISCO_ID_MAP.set('hackman', HACKMAN_ID);
DISCO_ID_MAP.set('mootilda', MIAL_ID);
DISCO_ID_MAP.set('mial', MIAL_ID);
DISCO_ID_MAP.set('richard', MIAL_ID);
DISCO_ID_MAP.set('sirjamz', JAMIE_ID);
DISCO_ID_MAP.set('jamie', JAMIE_ID);
DISCO_ID_MAP.set('kama', BRYAN_ID);
DISCO_ID_MAP.set('bryan', BRYAN_ID);
DISCO_ID_MAP.set('andrewjm', ANDY_ID);
DISCO_ID_MAP.set('meowsy', ANDY_ID);
DISCO_ID_MAP.set('andy', ANDY_ID);


client.login(disco_token);

client.on('ready', () => {
		
	console.log('discobot ready!'); 
	leaderboard.schedule(client, LEADERBOARD_CHANNEL);
		
	//todo.add("moo", "galbman");
	//todo.list(data => console.log(data), 'rejected');
	//todo.complete(0);
	//todo.accept(0);
//	var todoList = [{stage: STATUS_PENDING_APPROVAL, desc: "set up todo commands", from: "galbman", created: new Date()}, {stage: STATUS_TODO, desc: "solve world hunger", from: "galbman", created: new Date()}]
	
})

client.on('message', async (msg) => {
	//console.log(JSON.stringify(msg.author));
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
		leaderboard.miniLeaderboard(out => msg.reply(out));
	} else if (command == "excuse"){
		if (parts.length < 1){
			msg.reply("'leaderboard' command requires a subject parameter, either 'me' or a discord name");
		} else if (parts[0] === 'me'){
			getMatches(msg, DISCO_ID_MAP.get(msg.author.username.toLowerCase()));
		} else if (DISCO_ID_MAP.has(parts[0])){
			getMatches(msg, DISCO_ID_MAP.get(parts[0]));
		} else {
			msg.reply("wat");
		}
	} else if (command == "todo"){
		let action = "";
		if (parts.length < 1){
			msg.reply("'todo' command requires one of the following parameters: 'list', 'add', 'reject', 'accept', 'complete'");
			return;
		} else {
			action = parts.shift();
		}
		
		if (action === 'list'){
			let listType = "";
			if (parts.length > 0) {
				listType = parts[0];
			}
			todo.list(out => msg.reply(out), listType);			
		} else if (action === 'add'){
			let desc = "";
			if (parts.length < 1){
				msg.reply("No suggestion provided, todo list was not modified");
			} else {
					desc = parts.join(" ");
			}
			todo.add(out => msg.reply(out), desc, msg.author.username);
		} else if (action === 'reject') {
			if (msg.author.username.toLowerCase() !== 'galbman'){
				msg.reply("For reasons, only galbman can use the 'reject' command");
			} else {
				todo.reject(out => msg.reply(out), parts[0]);
			}
		} else if (action === 'accept'){
			if (msg.author.username.toLowerCase() !== 'galbman'){
				msg.reply("For reasons, only galbman can use the 'accept' command");
			} else {
				todo.accept(out => msg.reply(out), parts[0]);
			}
		} else if (action === 'complete'){
			if (msg.author.username.toLowerCase() !== 'galbman'){
				msg.reply("For reasons, only galbman can use the 'complete' command");
			} else {
				todo.complete(out => msg.reply(out), parts[0]);
			}			
		} else {
			msg.reply("'todo' command requires one of the following parameters: 'list', 'add', 'reject', 'accept', 'complete'");
		}
	} else if (command == "ready" || command == "beacons" || (command == "light" && parts.length > 1 && parts[0] == "the" && parts[1] == "beacons")){
		ready.start(client, msg, parts[parts.length - 1]);
	} else {
		msg.reply("wat");
		//msg.reply("Supported commands:\n");
		//iterate over command list (map?), display each name + usage?
	}
});


//determines reason for win or loss
function excuse(msg, match, playerId){
	let player_radiant = false;
	for (const player of match.players){
		if (player.account_id === playerId){
			player_radiant = player.isRadiant;
		}
	}
	
	var date = new Date(match.start_time * 1000);
	
	let outStr = "Match [" + match.match_id + "](https://www.opendota.com/matches/" + match.match_id + "/) played on " + date.toDateString() + " at " + date.toLocaleTimeString('en-US') + ' was ';
	
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
			Authorization: OPENDOTA_AUTH
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

