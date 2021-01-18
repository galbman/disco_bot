const https = require('https');
800440478138368021
module.exports = {


	miniLeaderboard: function(callback){
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
					callback(out);
				}	  
			})
		})

		req.on('error', error => {
			console.error(error)
		})

		req.end()
	},
	
	
	schedule: function(client, channelName){
		console.log("schedule initialized");
		setInterval(function(){
			console.log("schedule ding");
			
			var date = new Date();
			console.log(date.toLocaleString());
			
			if (date.getDay() == 6 || date.getDay() == 0){
				cutOffHour = 18;
			} else {
				cutOffHour = 22;
			}
			if(date.getHours() === cutOffHour-1 && date.getMinutes() >= 50){ // Check the time
				module.exports.miniLeaderboard(out => client.channels.fetch(channelName).then(channel => channel.send(out)).catch(error => console.log(error)));
			}
		}, 600000); // Repeat every 10 minutes
	}
	
	
};
