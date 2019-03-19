const crypto = require('crypto');

class UserDB {
	constructor(userId, password, salt, firstName, lastName, email, address1, address2, city, state, zip, country) {
		this.userId = userId,
		this.password = password,
		this.salt = salt,
		this.firstName = firstName,
		this.lastName = lastName,
		this.email = email,
		this.addressField1 = address1,
		this.addressField2 = address2, 
		this.city = city,
		this.state = state,
		this.zip = zip,
		this.country = country
	}
}

var genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
};

/**
 * hash password with sha512.
 * @function
 * @param {string} password - List of required fields.
 * @param {string} salt - Data to be validated.
 */
var sha512 = function(password, salt){
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
};

function saltHashPassword(userpassword) {
    var salt = genRandomString(16);
    var passwordData = sha512(userpassword, salt);
    return passwordData;
}


var mongoose = require('mongoose');

const User = mongoose.model('users', {
	userId: {
		type: String, required: true
	},
	password: {
		type: String, required: true
	},
	salt: {
		type: String, required: true
	},
	firstName: {
		type: String, required: true
	},
	lastName: {
		type: String, required: true
	},
	email: {
		type: String, required: true
	},
	addressField1: {
		type: String, required: true
	},
	addressField2: {
		type: String, required: true
	},
	city: {
		type: String, required: true
	},
	state: {
		type: String, required: true
	},
	zip: {
		type: String, required: true
	},
	country: {
		type: String, required: true
	}
});

module.exports.addUser = (firstName, lastName, email, password, addressField1, addressField2, city, state, zip, country) => {
	User.countDocuments({}, (err, count) => {
		passwordData = saltHashPassword(password);
		var user = new UserDB(count + 1, passwordData.passwordHash, passwordData.salt, firstName, lastName, email, addressField1, addressField2, city, state, zip, country);
		addUser(new User(user));
	});
};

module.exports.checkUser = (userName, password, hash, salt) => {
	passwordData = sha512(password, salt);
	if(passwordData.passwordHash === hash) return true;
	return false;
}

var addUser = (user) => {
	user.save((err) => {
		if(err) throw err;
	})
}

module.exports.getAllUsers = (callback) => {
	User.find({}, (err, user) => {
		if(user) {
			callback(null, user);
		} else {
			callback(true, null);
		}
	});
}

module.exports.getUser = (userId) => {
	try {
		return User.findOne({userId});
	} catch(e) {
		console.log(e);
	}
}

module.exports.getUser = (email) => {
	try {
		return User.findOne({email});
	} catch(e) {
		console.log(e);
	}
}
