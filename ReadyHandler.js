
const EMOJI_NO = "801265858051309578" //:nay:
const EMOJI_YES = "801265845417541662" //:yay:

const DOODLE_ID = '796160988810313759';

module.exports = {
	start: function(msg){
		msg.reply(msg.author.username + " has initiated a ready check!  Results will be recorded in 15 seconds.").then(m => react(m, msg));
	}
}


//:mountain_snow: :mountain: :mount_fuji:  :fire: :jigsaw:  :fire: :mountain_snow::mountain_snow: :mount_fuji:
function collect(msg, origMsg){
	const filter = (reaction, user) => (reaction.emoji.id === EMOJI_YES || reaction.emoji.id === EMOJI_NO);
	const collector = msg.createReactionCollector(filter, { time: 15000, dispose: true });
	collector.on('end', collected => respond(collected, origMsg));
}

function react(msg, origMsg){
	msg.react(EMOJI_YES).then(() => msg.react(EMOJI_NO)).then(() => collect(msg, origMsg));	
}

////relies on EMOJI_NO being a custom emoji.  For some reason, default emojis do not include an identifier in the response.
function respond(results, msg){
	
	//results = map of emoji id > object, 
	console.log(results);
	console.log(JSON.stringify(results));
	
	console.log("resp exists: " + results);
	console.log("resp length: " + results.length);
	
	if (!results || !results.length || results.length == 0){
		msg.reply("Ready check failed.  Nobody responded :(");
	} else if (results.length == 2 || results[0].emojiID == EMOJI_NO){
		msg.reply("Ready check failed.  One or more respondants indicated 'not ready'");
	} else {
		msg.reply("Ready check succeeded!  Party of " + (results[0].count - 1) + " gathered!");
	}
	

}