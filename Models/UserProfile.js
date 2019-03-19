const UserItems = require('../Models/UserItem');

class UserProfile{

    constructor(userId, userItems){
        this._userId = userId,
        this._userItems = userItems
    }

    removeUserItem(item) {
    	}
    	getUserItems() {
    		var Items = [UserItems.userItem1, UserItems.userItem2, UserItems.userItem3];
    		return Items;
    	}
    	emptyProfile() {
    	}
    	getUserProfile(userId) {
    	}
    }

module.exports = UserProfile;
