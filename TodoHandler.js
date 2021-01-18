var fs = require('fs');

const STATUS_PENDING_APPROVAL = 'Pending Approval';
const STATUS_REJECTED = 'Rejected';
const STATUS_TODO = 'Active';
const STATUS_DONE = 'Done';

const TODO_FILE = './resources/todo.json';

module.exports = {

	//can be done by anyone
	list: function(callback, type){
		
		//all, rejected, pending, done, active
		
		let stage = "";
		
		switch(type){
			case "":
				stage = STATUS_TODO;
				break;
			case "all":
				break;
			case "rejected":
				stage = STATUS_REJECTED;
				break;
			case "pending":
				stage = STATUS_PENDING_APPROVAL;
				break;
			case "done":
				stage = STATUS_DONE;
				break;
			case "active":
				stage = STATUS_TODO;
				break;
			default:
				callback("Status parameter <" + type + "> is invalid.  Expected 'all', 'rejected', 'pending', 'done', or 'active'");
				return;
		}
		
		let out = "";
		let data = readList();
		if (!data || !data.length){
			out = "Todo list is currently empty.  Feel free to make a suggestion with the the 'todo add <description>' command!";
		} else {
			data.forEach(function(item, index, array){
				if (stage == "" || item.stage == stage){
					out += "\n" + index + " - ";
					if (stage == ""){
						out += item.stage + " - ";
					}
					out += item.desc;
				}
			});
		}
		//no matching values found
		if (out == ""){
			callback("No suggestions found in status <" + type + ">.  You can see the full list of suggestions using status parameter 'all'.");
		} else {
			callback(out);	
		}
	},


	//can be done by anyone
	add: function (callback, desc, author) {
		let data = readList();
		let newLength = data.push({stage: STATUS_PENDING_APPROVAL, desc: desc, from: author, created: new Date()});
		writeList(data);
		callback("Suggestion <" + desc + "> was added at index " + (newLength - 1));
	},

	//only can be done by hackman
	complete: function (callback, index) {
		let data = readList();
		data[index].stage = STATUS_DONE;
		writeList(data);
		callback("Suggestion <" + data[index].desc + "> was marked as complete");
	},

	//only can be done by hackman
	accept: function(callback, index){
		let data = readList();
		data[index].stage = STATUS_TODO;
		writeList(data);
		callback("Suggestion <" + data[index].desc + "> was accepted");
	},
	
	//only can be done by hackman
	reject: function(callback, index) {
		let data = readList();
		data[index].stage = STATUS_REJECTED;
		writeList(data);
		callback("Suggestion <" + data[index].desc + "> was rejected");
	}

};

function readList(){
	let data = fs.readFileSync(TODO_FILE, 'utf8');
	return JSON.parse(data);
}

function writeList(data){
	let out = JSON.stringify(data);
	fs.writeFileSync(TODO_FILE, JSON.stringify(data));
}

function sortArray(){
	
}