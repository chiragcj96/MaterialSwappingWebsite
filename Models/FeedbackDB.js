class FeedbackDBOffer {
	constructor(feedbackId, itemCode, userId, rating, feedback) {
		this.feedbackId = feedbackId;
		this.itemCode = itemCode,
		this.userId = userId,
		this.rating = rating,
		this.feedback = feedback
	}
}

class FeedbackDBUser {
	constructor(feedbackId, offerId, userId, swapUserId, rating, feedback) {
		this.feedbackId = feedbackId;
		this.offerId = offerId,
		this.userId = userId,
		this.swapUserId = swapUserId,
		this.rating = rating,
		this.feedback = feedback
	}
}

// class FeedbackDBUser {
// 	constructor(offerId, userId, swapUserId, rating, feedback) {
// 		this.offerId = offerId,
// 		this.userId = userId,
// 		this.swapUserId = swapUserId,
// 		this.rating = rating,
// 		this.feedback = feedback
// 	}
// }

var mongoose = require('mongoose');

const FeedbackItem = mongoose.model('itemfeedbacks', {
	feedbackId: {
	 	type: String, required: true
	},
	itemCode: {
		type: String, required: true
	},
	userId: {
		type: String, required: true
	},
	rating: {
		type: String, required: true
	},
	feedback: {
		type: String, required: true
	}
});

const FeedbackUser = mongoose.model('userfeedbacks', {
  userId: {
		type: String, required: true
	},
  offerId: {
		type: String, required: true
	},
	swapUserId: {
		type: String, required: true
	},
	rating: {
		type: String, required: true
	},
	feedback: {
		type: String, required: true
	}
});

module.exports.addItemFeedback = (itemCode, userId, rating, feedback) => {
	FeedbackItem.countDocuments().then((count) => {
	var offerFeedback = new FeedbackDBOffer(count + 1, itemCode, userId, rating, "");
	var newFeedback = new FeedbackItem(offerFeedback);
	addOfferFeedbackByUser(offerFeedback);
}, (err) => {
	res.status(400).send(err);
});
}
var addOfferFeedbackByUser = (offerFeedback) => {
	offerFeedback.save((err) => {
		if(err) throw err;
	})
}

module.exports.getItemFeedback = (userId, itemCode) => {
	try {
		return FeedbackItem.findOne({userId, itemCode});
	} catch(e) {
		console.log(e);
	}
}

module.exports.updateItemFeedback = (userId, itemCode, rating, feedback) => {
	try {
		FeedbackItem.findOneAndUpdate({userId, itemCode}, {$set: {rating}}, {$new: true}, (err, doc) => {
			if(err) throw err;
		});
	} catch(e) {
		console.log(e);
	}
}

module.exports.addOfferFeedback = (offerId, userId, swapUserId, rating, feedback) => {
	var userFeedback = new FeedbackDBUser(offerId, userId, swapUserId, rating, feedback);
	addFeedbackForUser(userFeedback);
}
var addFeedbackForUser = (userFeedback) => {
	FeedbackUser.save((err) => {
		if(err) throw err;
	})
}

var getNumberOfFeedbackForItem = (itemCode) => {
	try {
		return FeedbackItem.find(itemCode).countDocuments();
	} catch(e) {
		console.log(e);
	}
}

module.exports.getAverageRating = (itemCode) => {
	try {
		return FeedbackItem.aggregate([
	        { $match: {
	            itemCode
	        }},
	        { $group: {
	            _id: "$itemCode",
	            totalRating: { $sum: "$rating"  }
	        }}
	    ], function (err, result) {
	        if (err) {
	            console.log(err);
	            return;
	        }
	        console.log(result);
	    });
		} catch(e) {
			console.log(e);
		}
}
