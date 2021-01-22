const https = require('https');

const COLUMN_0_SIZE = 7;
const COLUMN_1_SIZE = 13;
const COLUMN_2_SIZE = 6;
const COLUMN_0_HEADER = "Rank";
const COLUMN_1_HEADER = "Name";
const COLUMN_2_HEADER = "Time";


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
					console.log(resBody);
					resBody = JSON.parse(resBody);
					var out = "\nCurrent NYT Mini leaderboard for " + resBody.printDate + "\n";
					out += "`" + COLUMN_0_HEADER.padEnd(COLUMN_0_SIZE) + COLUMN_1_HEADER.padEnd(COLUMN_1_SIZE) + COLUMN_2_HEADER.padEnd(COLUMN_2_SIZE) + "\n";
					for (i = 0; i < resBody.data.length; i++){
						var record = resBody.data[i];
						if (record.score && record.score.secondsSpentSolving){
							out += (record.rank ? record.rank : "").padEnd(COLUMN_0_SIZE) + record.name.padEnd(COLUMN_1_SIZE) + record.score.secondsSpentSolving.toString().padEnd(COLUMN_2_SIZE) + "\n";
						}
					}
					out += "`";
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
