
const EMOJI_NO = "801265858051309578" //:nay:
const EMOJI_YES = "801265845417541662" //:yay:
const EMOJI_DOTS = "<:dots:794206552516722748>"
const EMOJI_PUZZLE = ":jigsaw:"

const MOUNT_COUNT = 4;
const MOUNTAINS = [":mountain_snow:", ":mountain:", ":mount_fuji:"];


const DOODLE_ID = '796160988810313759';

module.exports = {
	start: function(client, msg, activity){
		
		let emoji = ":question:";
		
		if (activity){
			if (['dota', 'dots', 'dota2', 'doots', 'doota'].includes(activity.toLowerCase())){
				emoji = EMOJI_DOTS;
			} else if (['crossword', 'puzzle', 'puzzles', 'crosswords'].includes(activity.toLowerCase())){
				emoji = EMOJI_PUZZLE;
			}
		}
		
		let beacons = "";
		
		for (let i=0;i<MOUNT_COUNT;i++){
			beacons += MOUNTAINS[getRandomInt(MOUNTAINS.length)];
		}
		
		beacons += ":fire:";
		beacons += emoji;
		beacons += ":fire:";
		
		for (let i=0;i<MOUNT_COUNT;i++){
			beacons += MOUNTAINS[getRandomInt(MOUNTAINS.length)];
		}
		
		client.channels.cache.get(msg.channel.id).send(beacons).then(m => react(m, msg));
		
		//msg.reply(msg.author.username + " has initiated a ready check!  Results will be recorded in 15 seconds.").then(m => react(m, msg));
		//msg.reply(":mountain_snow: :mountain: :mount_fuji:  :fire: :jigsaw:  :fire: :mountain_snow::mountain_snow: :mount_fuji:").then(m => react(m, msg));
	}
}


function collect(msg, origMsg){
	const filter = (reaction, user) => (reaction.emoji.id === EMOJI_YES || reaction.emoji.id === EMOJI_NO);
	const collector = msg.createReactionCollector(filter, { time: 15000, dispose: true });
	collector.on('end', collected => respond(collected.array(), origMsg));
}

function react(msg, origMsg){
	msg.react(EMOJI_YES).then(() => msg.react(EMOJI_NO)).then(() => collect(msg, origMsg));	
}

////relies on EMOJI_NO being a custom emoji.  For some reason, default emojis do not include an identifier in the response.
function respond(results, msg){
	
	if (!results || !results.length || results.length == 0){
		msg.reply("Ready check failed.  Nobody responded :(");
	} else if (results.length == 2 || results[0].emojiID == EMOJI_NO){
		msg.reply("Ready check failed.  One or more respondants indicated 'not ready'");
	} else {
		msg.reply("Ready check succeeded!  Party of " + (results[0].count - 1) + " gathered!");
	}
}



function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}