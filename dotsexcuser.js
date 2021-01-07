
const Discord = require("discord.js");

const bot = new Discord.Client();
const token = 'Nzk2MTYwOTg4ODEwMzEzNzU5.X_T4sw.KrhusnKtkZwf0gQLC-MgumYYcLg';

const prefix = 'bridge to engineering';

function miniLeaderboard(msg){
	const https = require('https')
	const options = {
	  hostname: 'nyt-games-prd.appspot.com',
	  port: 443,
	  path: '/svc/crosswords/v6/leaderboard/mini.json',
	  method: 'GET',
	  headers: {
		'nyt-s': '1wo713ZDZz61dACt/MVkib/0MyxE3RJTYlkeQBACjf4wsZRMzUy5fMmkficUcSZ3aojOoea6bgYnSmrYRS.71QMeLFwtyWjsksCXmWy4wxavHlyfqy/AMTgjxDTQO38FS1'
	  }
	}

	const req = https.request(options, res => {
	  console.log(`statusCode: ${res.statusCode}`)

	  res.on('data', d => {
		if (d.includes("printDate")){  //dumb way to see if it was success, for now
		  d = JSON.parse(d);
		  console.log(d);
		  var out = "Current NYT Mini leaderboard for " + d.printDate + "\n";
     	  out += "Rank\tName\tTime\n";
		  for (i = 0; i < d.data.length; i++){
			var record = d.data[i];
			if (record.score){
				out += record.rank + "\t" + record.name + "\t" + record.score.secondsSpentSolving + "\n";
			}
		  }
		  console.log(out);
		  msg.reply(out);
		}
	  })
	})

	req.on('error', error => {
	  console.error(error)
	})

	req.end()
}

bot.on('ready', () => {
  console.log('is console output written by the bot as a chat?  what channel?')
})

bot.on('message', async (msg) => {
  if(!msg.content.toLowerCase().startsWith(prefix)) {
    console.log('no prefix')
    return
  }
  
  const parts = msg.content.slice(prefix.length).trim().split(' ');
  const command = parts.shift().toLowerCase();
  
  if (command == "leaderboard"){
	  miniLeaderboard(msg);
	  
  }
  
  else {	  
	  msg.reply("does reply (i can spell obvi) use the weird replay thing? or does it just post a new message. i guess either is fine");
  }
  
  
})

bot.login(token)

