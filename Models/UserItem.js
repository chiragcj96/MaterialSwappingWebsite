class UserItemClass {
	constructor(userId, code, name, category, description, rating, totalUserRatedItem, totalUserRating, image_url, active, userRating, status) {
		this.userId = userId,
		this.code = code,
		this.name = name,
		this.category = category, 
		this.description = description,
		this.rating = rating,
		this.totalUserRatedItem = totalUserRatedItem,
		this.totalUserRating = totalUserRating,
		this.image_url = image_url,
		this.active = active,
		this.userRating = userRating,
		this.status = status
	}
}

var mongoose = require('mongoose');

const UserItem = mongoose.model('items', {
	userId: {
		type: String, required: true
	},
	code: {
		type: String, required: true
	},
	name: {
		type: String, required: true
	},
	category: {
		type: String, required: true
	},
	description: {
		type: String, required: true
	},
	rating: {
		type: String, required: true
	},
	totalUserRatedItem: {
		type: String, required: true
	},
	totalUserRating: {
		type: String, required: true
	},
	image_url: {
		type: String, required: true
	},
	active: {
		type: String, required: true
	},
	userRating: {
		type: String, required: true
	},
	status: {
		type: String, required: true
	}
});

module.exports.getAllItems = (callback) => {
	UserItem.find({active: "active", status: "available"}, (err, userItem) => {
		if(userItem) {
			callback(null, userItem);
		} else {
			callback(true, null);
		}
	});
}

module.exports.getAllItemsOfUser = (userId) => {
	try {
		return UserItem.find({userId: userId, active: "active", status: ["available", "pending", "swapped"]});
	} catch(e) {
		console.log(e);
	}
}

module.exports.getNotAllItemsOfUser = (userId) => {
	try {
		return UserItem.find({userId: userId, active: "active", status: ["available"]});
	} catch(e) {
		console.log(e);
	}
}

module.exports.getNotAllItemsOfUser = (userId) => {
	try {
		return UserItem.find({userId: {$ne: userId}, active: "active", status: "available"});
	} catch(e) {
		console.log(e);
	}
}

module.exports.getItem = (code) => {
	try {
		return UserItem.findOne({code});
	} catch(e) {
		console.log(e);
	}
}

module.exports.addItem = (userId, name, category, description, image_url) => {
	UserItem.countDocuments().then((count) => {
		var item = new UserItemClass(userId, count + 1, name, category, description, "0", "0", "0", image_url, "active", "0", "available");
		var newItem = new UserItem(item);
		saveItem(newItem);
	}, (err) => {
		res.status(400).send(err);
	});
}

var saveItem = (item) => {
	item.save((err) => {
		if(err) throw err;
	})
}

module.exports.deleteItem = (code) => {
	try {
		UserItem.findOneAndUpdate({code: code}, {$set: {active: "inactive"}}, {$new: true}, (err, doc) => {
			if(err) throw err;
		});
	} catch(e) {
		console.log(e);
	}
}

module.exports.getItemByName = (name) => {
	try {
		return UserItem.findOne({name});
	} catch(e) {
		console.log(e);
	}
}

module.exports.updateItemStatus = (code, status) => {
	try {
		UserItem.findOneAndUpdate({code: code}, {$set: {status: status}}, {$new: true}, (err, doc) => {
			if(err) throw err;
		});
	} catch(e) {
		console.log(e);
	}
}

module.exports.updateItemRating = (code, rating, totalUserRatedItem, totalUserRating) => {
	try {
		UserItem.findOneAndUpdate({code}, {$set: {rating, totalUserRatedItem, totalUserRating}}, {$new: true}, (err, doc) => {
			if(err) throw err;
		});
	} catch(e) {
		console.log(e);
	}
}

module.exports.updateMyItemRating = (code, rating, totalUserRatedItem, totalUserRating, userRating) => {
	try {
		UserItem.findOneAndUpdate({code}, {$set: {rating, totalUserRatedItem, totalUserRating, userRating}}, {$new: true}, (err, doc) => {
			if(err) throw err;
		});
	} catch(e) {
		console.log(e);
	}
}
