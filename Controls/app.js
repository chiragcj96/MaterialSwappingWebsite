const express = require ('express');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const crypto = require('crypto');


const urlencodedParser = bodyParser.urlencoded({extended: false});
var nodemailer = require('nodemailer');
const http = require("http");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

let userItem = require('../Models/UserItem');

const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const ProfileController = require('../Controls/ProfileController');
app.use(ProfileController);

// var item = require('../Models/item');
// var items = item.getItems();
// console.log(items);

app.set('Views', '../Views');
app.set('view engine', 'ejs');
console.log(__dirname)
app.use('/Resources', express.static(path.join(__dirname, '../Resources')));
// express.static(path.join(__dirname, 'public'))
app.use(cookieParser());
app.use(session({secret: "nbad"}));
//app.use(session({secret: "max"}));

// var {ObjectID} = require('mongodb');

const mongoose = require('../Controls/mongoose');
const User = require('../Models/UserDB');
const UserItem = require('../Models/UserItem');
const offer = require('../Models/offer');
const userDB = require('../Models/UserDB');
const UserProfile = require('../Models/UserProfile');
const FeedbackDB = require('../models/FeedbackDB');

const profileOne = new UserProfile();

let items = [];

let categoryOptions = ['Delicacy on Demand', 'Meal type'];
let itemOptions = ['1001', '1002', '1003', '1004', '1005', '1006', '1007', '1008', '1009', '10010', '10011', '10012', '10013', '10014', '10015', '10016', '10017', '10018', '10019', '10020'];

app.get('/', function(req, res){
  if(req.session.theUser === undefined){
    res.render('index', {
			welcome: 'Not signed in.',
			sessionStatus: false,
			name: 'Anonymous'
    });
  }
  else {
    res.render('index', {
			welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
			sessionStatus: true,
			name: req.session.theUser.firstName
		});
	}
});
//
// app.get('/users', function(req, res) {
// 	User.find().then((user) => {
// 		res.send(user);
// 	}, (e) => {
// 		console.log(e);
// 	});
// });
//
// app.get('/userItems', function(req, res) {
// 	UserItem.find().then((userItem) => {
// 		res.send(userItem);
// 	}, (e) => {
// 		console.log(e);
// 	});
// });

app.get('/categories', function(req, res){
  if(req.session.theUser === undefined) {
		res.render('categories', {
			welcome: 'Not signed in.',
			sessionStatus: false
		});
	} else {
		res.render('categories', {
			welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
			sessionStatus: true
		});
	}
});

app.get('/subCategories', async (req, res) => {
	if(req.session.theUser === undefined) {
		userItem.getAllItems((err, item) => {
				if (categoryOptions.includes(req.query.catalogCategory)) {
				res.render('subCategories', {
				welcome: 'Not signed in.',
				catalogCategory: req.query.catalogCategory,
				items: item,
				sessionStatus: false
				});			} else {
				res.render('categories', {
					welcome: 'Not signed in.',
					sessionStatus: false
				});
			}
		});
	} else {
		let userId = req.session.theUser.userId;
		let items = await userItem.getNotAllItemsOfUser(userId);
		if (categoryOptions.includes(req.query.catalogCategory)) {
		res.render('subCategories', {
			welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
			catalogCategory: req.query.catalogCategory,
			items,
			sessionStatus: true
		});
		} else {
			res.render('categories', {
				welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
				sessionStatus: true
			});
		}
	}
});

app.get('/item', async (req, res) => {

	if(req.session.theUser === undefined) {
		if(Object.keys(req.query.length != 0)) {
			if (itemOptions.includes(req.query.itemCode)) {
				let item = await userItem.getItem(req.query.itemCode);
				res.render('item', {
					welcome: 'Not signed in.',
					item: item,
					sessionStatus: false,
					itemStatus: 'available',
					swapIt: "yes"
				});
			} else {
				res.render('categories', {
					welcome: 'Not signed in.',
					sessionStatus: false
				});
			}
		} else {
			res.render('categories', {
				welcome: 'Not signed in.',
				sessionStatus: false
			});
		}
	} else {
		if(Object.keys(req.query.length != 0)) {
			if (itemOptions.includes(req.query.itemCode)) {
				let item = await userItem.getItem(req.query.itemCode);
				let itemStatus = item.status;
				let swapIt = req.session.theUser.userId === item.userId ? "no" : "yes";

				res.render('item', {
					welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
					item,
					sessionStatus: true,
					itemStatus,
					swapIt
				});
			} else {
				res.render('categories', {
					welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
					sessionStatus: true
				});
			}
		} else {
			res.render('categories', {
				welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
				sessionStatus: true
			});
		}
	}
});

app.get('/contact', function(req, res) {
	if(req.session.theUser === undefined) {
		res.render('contact', {
			welcome: 'Not signed in.',
			sessionStatus: false
		});
	} else {
		res.render('contact', {
			welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
			sessionStatus: true
		});
	}
});

app.get('/about', function(req, res) {
	if(req.session.theUser === undefined) {
		res.render('about', {
			welcome: 'Not signed in.',
			sessionStatus: false
		});
	} else {
		res.render('about', {
			welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
			sessionStatus: true
		});
	}
});

app.get('/mySwaps', async (req, res) => {
	if(req.session.theUser === undefined) {
		res.render('login', {
			welcome: 'Not signed in.',
			sessionStatus: false,
			name: 'Anonymous',
			error: 'null'
		});
	} else {
		let offerList = await offer.getPendingOffers(req.session.theUser.userId);
		let count = await offer.getCountOfPending(req.session.theUser.userId);
		if(count !== 0) {
			let userItemList= [];
			let swapUserItemList = [];
			let actionList = [];
			Object.keys(offerList).forEach(async (offer) => {
				let item = await userItem.getItem(offerList[offer].userItemCode);
				let swapItem = await userItem.getItem(offerList[offer].swapUserItemCode);
				if((req.session.theUser.userId == offerList[offer].userId)) {
          userItemList.push(item);
					swapUserItemList.push(swapItem);
					actionList.push("withdraw");
				} else {
          userItemList.push(swapItem);
					swapUserItemList.push(item);
					actionList.push("accept/reject");
				}
				if((count - 1) == offer) {
					res.render('mySwaps', {
						welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
						swapList: userItemList,
						swapItemList: swapUserItemList,
						sessionStatus: true,
						name: req.session.theUser.firstName,
						actionList,
            swapping: false
					});
				}
			});
		} else {
			res.render('mySwaps', {
				welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
				sessionStatus: true,
				swapList: {},
				name: 'My',
				actionList: [],
        swapping: true
			});
		}
	}
});

app.post('/confirmswap', urlencodedParser, async (req, res) => {
	if(req.session === undefined) {
		res.render('index', {
			welcome: 'Not signed in.',
			sessionStatus: false,
			name: 'Anonymous'
		});
	} else {
		offer.addOffer(req.body.userId, req.body.swapUserId, req.body.userItemCode, req.body.swapUserItemCode, "pending", "0");
		await userItem.updateItemStatus(req.body.userItemCode, "pending");
		await userItem.updateItemStatus(req.body.swapUserItemCode, "pending");
		req.session.currentProfile.userItems = await userItem.getAllItemsOfUser(req.session.theUser.userId);
		res.render('myItems', {
          	welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
          	userItemList:req.session.currentProfile.userItems,
          	sessionStatus: true
        });
	}
});

app.get('/login', (req, res) => {
	if(req.session.theUser === undefined) {
		res.render('login', {
			welcome: 'Not signed in',
			sessionStatus: false,
			name: 'Anonymous',
			error: 'null'
		});
	} else {
		res.render('myItems', {
			welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
			userItemList: req.session.currentProfile.userItems,
			sessionStatus: true
		});
	}
});

app.get('/register', (req, res) => {
	if(req.session.theUser === undefined) {
		res.render('register', {
			welcome: 'Not signed in',
			sessionStatus: false,
			name: 'Anonymous',
      user: {}
		});
	} else {
		res.render('myItems', {
			welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
			userItemList: req.session.currentProfile.userItems,
			sessionStatus: true
		});
	}
});

app.post('/login', urlencodedParser,
[
  check('username').blacklist(`{}<>&'/"`).isEmail().trim(),
  sanitizeBody('notifyOnReply').toBoolean()
],
async (req, res) => {
	if(req.body.signIn === 'Submit') {
		if(req.session.theUser === undefined) {
			if(req.body.username === '') {
				res.render('login', {
					welcome: 'Not signed in',
					sessionStatus: false,
					name: 'Anonymous',
					error: 'username'
				});
			}
      else if(req.body.password === '') {
        res.render('login', {
					welcome: 'Not signed in',
					sessionStatus: false,
					name: 'Anonymous',
					error: 'password',
					username: req.body.username
				});
      } else {
				const errors = validationResult(req);
        console.log(errors.array());
			  	if (!errors.isEmpty()) {
			    	res.render('login', {
						welcome: 'Not signed in',
						sessionStatus: false,
						name: 'Anonymous',
						error: 'incorrect-email'
					});

			  	} else {
            let userLoginData = await userDB.getUser(req.body.username);
            if(userLoginData !== null) {
              if(userDB.checkUser(req.body.username, req.body.password, userLoginData.password, userLoginData.salt)) {
                req.session.theUser = userLoginData;
                profileOne.userId = req.session.theUser.userId;
                profileOne.userItems = await userItem.getAllItemsOfUser(profileOne.userId);
                req.session.currentProfile = profileOne;
                res.render('myItems', {
                welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
                userItemList: req.session.currentProfile.userItems,
                sessionStatus: true
              });
              } else {
                req.session.theUser = undefined;
              req.session.currentProfile = undefined;
              res.render('login', {
                welcome: 'Not signed in',
                sessionStatus: false,
                name: 'Anonymous',
                error: 'incorrect'
              });
              }
            } else {
              req.session.theUser = undefined;
            req.session.currentProfile = undefined;
            res.render('login', {
              welcome: 'Not signed in',
              sessionStatus: false,
              name: 'Anonymous',
              error: 'incorrect-email'
            });
            }
			  	}
			}
    } else {
      res.render('myItems', {
        welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
        userItemList: req.session.currentProfile.userItems,
        sessionStatus: true
      });
    }
  } else {
    res.render('login', {
      welcome: 'Not signed in',
      sessionStatus: false,
      name: 'Anonymous',
      error: 'null'
    });
  }
});

app.post('/register', urlencodedParser,
[
  check('firstName').isAlpha().withMessage('First name missing'),
  check('lastName').isAlpha().withMessage('Last name missing'),
  check('email').blacklist(`{}<>&'/"`).isEmail().withMessage('should be an email'),
  check('password').isAlphanumeric().withMessage('password missing'),
  check('confirmPassword').isAlphanumeric().withMessage('confirm password missing'),
  check('addressField1').isAscii().withMessage('Address Field 1 missing'),
  check('addressField2').isAscii().withMessage('Address Field 2 missing'),
  check('city').isAscii().withMessage('City missing'),
  check('state').isAscii().withMessage('state missing'),
  check('zip').isNumeric().withMessage('zip missing'),
  check('country').isAscii().withMessage('country missing'),
  sanitizeBody('notifyOnReply').toBoolean()
],
async (req, res) => {
	if (req.session.theUser === undefined) {
		const firstName = req.body.firstName;
		const lastName = req.body.lastName;
		const email = req.body.email;
		const password = req.body.password;
		const confirmPassword = req.body.confirmPassword;
		const addressField1 = req.body.addressField1;
		const addressField2 = req.body.addressField2;
		const city = req.body.city;
		const state = req.body.state;
		const zip = req.body.zip;
		const country = req.body.state;

		const errors = validationResult(req);
		console.log(errors.array());

	  	if (!errors.isEmpty()) {
	    	res.render('register', {
				welcome: 'Not signed in',
				sessionStatus: false,
				name: 'Anonymous',
				user: req.body,
			});
	  	} else {
	  		let userData = await userDB.getUser(email);
	  		if(userData !== null) {
	  			console.log("Email already in use");
	  			res.render('register', {
					welcome: 'Not signed in',
					sessionStatus: false,
					name: 'Anonymous',
					user: req.body,
				});
	  		} else {
		  		await userDB.addUser(firstName, lastName, email, password, addressField1, addressField2, city, state, zip, country);
        }
				res.render('login', {
					welcome: 'Not signed in',
					sessionStatus: false,
					name: 'Anonymous',
					error:'success',
					firstName
				});
	  		}


	} else {
		res.render('myItems', {
			welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
			userItemList: req.session.currentProfile.userItems,
			sessionStatus: true
		});
	}
});

// const storage = multer.diskStorage({
// 	destination, filename
// });
//
// const allowedImagesExts = ['jpg', 'jpeg', 'png'];  //only these are the allowed types
// const fileFilter =  (req, file, cb) => {
//   cb(null, allowedImagesExts.includes(file.originalname.split('.').pop()))
// }
//
// const upload = multer({
// 	storage,
// 	fileFilter
// }).single('itemImage');


app.post('/addItem', (req, res) => {
	if(req.session.theUser === undefined) {
		res.render('login', {
			welcome: 'Not signed in.',
			sessionStatus: false,
			name: 'Anonymous',
			error: 'null'
		});
	} else {
    res.render('addItem', {
			welcome: req.session.theUser.firstName,
			sessionStatus: true
		});
	}
});


const destination = (req, file, callback) => {
  callback(null, '../Resources/images/');
};

const filename = (req, file, callback) => {
	callback(null, file.fieldname  + '-' + Date.now() + path.extname(file.originalname));
};

const storage = multer.diskStorage({
	destination, filename
});

const allowedImagesExts = ['jpg', 'png', 'jpeg'];  //only these are the allowed types

const fileFilter =  (req, file, cb) => {
  cb(null, allowedImagesExts.includes(file.originalname.split('.').pop()))
}

const upload = multer({
	storage,
	fileFilter
}).single('itemImage');


app.post('/addItem', urlencodedParser, async (req, res) => {
	if (req.session.theUser === undefined) {
		res.render('login', {
			welcome: 'Not signed in',
			sessionStatus: false,
			name: 'Anonymous',
			error: 'null'
		});
	} else {
		upload(req, res, async (err) => {
			if (err) {
				/* Render Error */
				console.log(err);
			} else {
				if (req.file == undefined) {
					console.log("No File selected");
				} else {
					/* Render file successfully uploaded */
					console.log('File successfully uploaded');
					const name = req.body.itemName;
					const category = req.body.itemCategory;
					const description = req.body.itemDescription;
					const userId = req.session.theUser.userId;
					await userItem.addItem(userId, name, category, description, "/Resources/images/" + req.file.filename);
					itemOptions.push(itemOptions.length + 1 + '');
					console.log(await userItem.getAllItemsOfUser(req.session.theUser.userId));
					req.session.currentProfile.userItems = await userItem.getAllItemsOfUser(req.session.theUser.userId);
					res.render('myItems', {
						welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
						userItemList: req.session.currentProfile.userItems,
						sessionStatus: true
					});
				}
			}
		});
	}
});


app.post('/confirmRating', urlencodedParser, async (req, res) => {
	if(req.session.theUser === undefined) {
		res.render('login', {
			welcome: 'Not signed in',
			sessionStatus: false,
			name: 'Anonymous',
			error: 'null'
		});
	} else {
		var feedback = await FeedbackDB.getItemFeedback(req.session.theUser.userId, req.body.itemCode);
		if(feedback === null) {
			await FeedbackDB.addItemFeedback(req.session.theUser.userId, req.body.itemCode, req.body.rating, "");

			let item = await userItem.getItem(req.body.itemCode);
			console.log(item);
			let currentTotalRating = Number(item.totalUserRating) + Number(req.body.rating);
			let totalUsers = Number(item.totalUserRatedItem) + 1;
			let rating = Number((currentTotalRating / totalUsers).toFixed(2));   //finds avg rating

			if(item.userId === req.session.theUser.userId) {
				await userItem.updateMyItemRating(req.body.itemCode, rating, totalUsers, currentTotalRating, req.body.rating);
			} else {
				await userItem.updateMyItemRating(req.body.itemCode, rating, totalUsers, currentTotalRating);
			}

			let userUpdatedItem = await userItem.getItem(req.body.itemCode);
			let itemStatus = userUpdatedItem.status;
			let swapIt = req.session.theUser.userId === item.userId ? "no" : "yes";
			res.render('item', {
				welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
				item: userUpdatedItem,
				sessionStatus: true,
				itemStatus,
				swapIt
			});
		} else {
			let oldRating = feedback.rating;
			await FeedbackDB.updateItemFeedback(req.session.theUser.userId, req.body.itemCode, req.body.rating, "");

			let item = await userItem.getItem(req.body.itemCode);
      // calculate the older rating
			let currentTotalRating = Number(item.totalUserRating) + Number(req.body.rating) - Number(oldRating);
			let totalUsers = Number(item.totalUserRatedItem);
			let rating = (currentTotalRating / totalUsers).toFixed(2);
			if(item.userId === req.session.theUser.userId) {
				await userItem.updateMyItemRating(req.body.itemCode, rating, totalUsers, currentTotalRating, req.body.rating);
			} else {
				await userItem.updateMyItemRating(req.body.itemCode, rating, totalUsers, currentTotalRating);
			}
			let userUpdatedItem = await userItem.getItem(req.body.itemCode);
			let itemStatus = userUpdatedItem.status;
			let swapIt = req.session.theUser.userId === item.userId ? "no" : "yes";
			res.render('item', {
				welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
				item: userUpdatedItem,
				sessionStatus: true,
				itemStatus,
				swapIt
			});
		}
	}
});



app.get('/*', (req, res) => {
	res.send('Plain Message');
});



app.listen(3000, function(){
  console.log("listening at 3000");
});
