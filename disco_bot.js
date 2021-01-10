
const Discord = require("discord.js");

const client = new Discord.Client();
const token = 'Nzk2MTYwOTg4ODEwMzEzNzU5.X_T4sw.KrhusnKtkZwf0gQLC-MgumYYcLg';

const short_prefix = '!';
const long_prefix = 'hey doodle';

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

function schedule(){
	window.setInterval(function(){ // Set interval for checking
		var date = new Date(); // Create a Date object to find out what time it is
		if (date.getDay() == 6 || date.getDay() == 0){
			cutoffHour = 18;
		} else {
			cutOffHour = 22;
		}
		if(date.getHours() === cutOffHour-1 && date.getMinutes() >= 50){ // Check the time
			client.channels.cache.get('mini-leaderboard').send('boop');
		}
	}, 600000); // Repeat every 10 minutes
}

client.on('ready', () => {
  console.log('disco_bot ready!')
  
  //schedule();  
  client.channels.cache.get('mini-leaderboard').send('boop');
})

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
  } else {
	  msg.reply("Supported commands:\n");
	  //iterate over command list (map?), display each name + usage?
	  
  }
  
  else {	  
	  msg.reply("wat");
  }
  
})

client.login(token)

