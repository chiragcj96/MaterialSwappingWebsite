const http = require('http');
const express = require('express');
const session = require('express-session');
const app = express();

let userDB = require('../Models/UserDB');
let UserProfile = require('../Models/UserProfile');
let userItem = require('../Models/UserItem');
let offer = require('../Models/offer');
const profileOne = new UserProfile();
let itemOptions = ['1001', '1002', '1003', '1004', '1005', '1006', '1007', '1008', '1009', '10010', '10011', '10012', '10013', '10014', '10015', '10016', '10017', '10018', '10019', '10020'];
//var categoryService = require('./../Models/categoryService');
app.set('Views', '../Views');
app.set('view engine', 'ejs');
app.use('/Resources', express.static('../Resources'));
app.use(session({secret: "nbad"}));

var actions = ['accept', 'reject', 'withdraw', 'update', 'offer', 'delete', 'signout'];

app.get('/myItems', async (req, res) => {
	if(req.session.theUser === undefined) {
		res.render('login', {
			welcome: 'Not signed in.',
			sessionStatus: false,
			name: 'Anonymous',
			error: 'null'
		});

	} else {
		req.session.currentProfile.userItems = await userItem.getAllItemsOfUser(req.session.theUser.userId);
		res.render('myItems', {
			welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
			userItemList: req.session.currentProfile.userItems,
			sessionStatus: true
		});
	}
});

// 		req.session.theUser = await userDB.getUser("1");
// 		profileOne.userId = req.session.theUser.userId;
// 		profileOne.userItems = await userItem.getAllItemsOfUser(profileOne.userId);
// 		req.session.currentProfile = profileOne;
//
// 		if(req.session.currentProfile.userItems === undefined || req.session.currentProfile.userItems.length === 0) {
// 			res.render('myItems', {
// 				welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
// 				itemMsg: false,
// 				itemsMsg: 'Sorry! No items to display.',
// 				sessionStatus: true
// 			});
// 		} else {
// 			res.render('myItems', {
// 				welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
// 				itemMsg : true,
// 				userItemList: req.session.currentProfile.userItems,
// 				sessionStatus: true
// 			});
// 		}
// 	} else {
// 		res.render('myItems', {
// 			welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
// 			itemMsg : true,
// 			userItemList: req.session.currentProfile.userItems,
// 			sessionStatus: true
// 		});
// 	}
// });

app.get('/signout', function(req, res) {
	req.session.theUser = undefined;
	req.session.currentProfile = undefined;
	res.render('categories', {
		welcome: 'Not signed in.',
		sessionStatus: false
	});
});


app.get('myItems/:action', function(req, res) {
	if(req.session.theUser !== undefined) {
		if(action.includes(req.params.action)) {
			res.render('myItems', {
				welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
				userItemList: req.session.currentProfile.userItems,
				sessionStatus: true
			});
		} else {
			res.render('myItems', {
				welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
				userItemList: req.session.currentProfile.userItems,
				sessionStatus: true
			});
		}
	} else {
		res.render('index', {
			welcome: 'Not signed in.',
			sessionStatus: false,
			name: 'Anonymous'
		});
	}
});


app.get('/myItems/:action/:theItem', async (req, res) => {
	var userItemList;
	if(req.session.theUser !== undefined) {
		if(actions.includes(req.params.action) && req.params.action === "update") {
			if(req.params !== undefined && itemOptions.includes(req.params.theItem)) {

				let actionList = [];
				let item = await userItem.getItem(req.params.theItem);
				if(item.status === 'pending') {
					let swapList = [];
					let swapItemList = [];
					let itemOffer = await offer.getOfferByUser(req.session.theUser.userId, req.params.theItem);
					if(itemOffer === null) {
						let itemOfferInner = await offer.getOfferByOtherUser(req.session.theUser.userId, req.params.theItem);
						swapList.push(await userItem.getItem(itemOfferInner.userItemCode));
						swapItemList.push(await userItem.getItem(itemOfferInner.swapUserItemCode));
						actionList.push("accept");
					} else {
						swapList.push(await userItem.getItem(itemOffer.userItemCode));
						swapItemList.push(await userItem.getItem(itemOffer.swapUserItemCode));
						actionList.push("withdraw")
					}
					res.render('mySwaps', {
						welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
						swapList,
						swapItemList,
						sessionStatus: true,
						name: req.session.theUser.firstName,
						itemStatus: 'pending',
						swapping: false,
						actionList
					});
				} else if(item.status === 'available') {

					res.render('item', {
						welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
						item,
						sessionStatus: true,
						itemStatus: 'available',
						swapIt: "no"
					});
				} else if(item.status === 'swapped') {
					userItemList = await userItem.getItem(req.params.theItem);

					res.render('item', {
						welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
						item: userItemList,
						sessionStatus: true,
						itemStatus: 'swapped'
					});
				} else {

				}
			} else {

				res.render('myItems', {
					welcome: 'Not signed in',
					sessionStatus: false,
					userItemList: {}

				});
			}
		} else if(actions.includes(req.params.action) && req.params.action === "accept" || req.params.action === "reject" || req.params.action === "withdraw") {
				/* if the action is accept/reject/withdraw */
				if(req.params !== undefined && itemOptions.includes(req.params.theItem)) {
					if(req.params.action === 'reject'){
	                  let offerItem = await offer.rejectOffer(req.session.theUser.userId, req.params.theItem);
	                  await offer.updateOffer(req.session.theUser.userId, req.params.theItem, req.params.action);
	                  await userItem.updateItemStatus(offerItem.swapUserItemCode, "available");
	                  await userItem.updateItemStatus(offerItem.userItemCode, "available");
		              req.session.currentProfile.userItems = await userItem.getAllItemsOfUser(req.session.theUser.userId);
	                  res.render('myItems',{
	                  	welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
	                  	userItemList:req.session.currentProfile.userItems,
	                  	sessionStatus: true,
	                  });
	                } else if (req.params.action === 'withdraw') {
	                	let offerItem = await offer.getOfferByUser(req.session.theUser.userId, req.params.theItem);
                	  	await offer.withdrawUpdateOffer(req.session.theUser.userId, req.params.theItem, req.params.action);
                	  	await userItem.updateItemStatus(offerItem.userItemCode, "available");
	                  	await userItem.updateItemStatus(offerItem.swapUserItemCode, "available");
	                	req.session.currentProfile.userItems = await userItem.getAllItemsOfUser(req.session.theUser.userId);
		                res.render('myItems',{
		                  	welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
		                  	userItemList:req.session.currentProfile.userItems,
		                  	sessionStatus: true,
		                });
	                } else if(req.params.action === 'accept'){
		                /* set the status value to indicate that this item was swapped */
		                let offerItem = await offer.acceptOffer(req.session.theUser.userId, req.params.theItem);
			              await userItem.updateItemStatus(offerItem.userItemCode, "swapped");
			              await userItem.updateItemStatus(offerItem.swapUserItemCode, "swapped");
		                req.session.currentProfile.userItems = await userItem.getAllItemsOfUser(req.session.theUser.userId);
		                  res.render('myItems',{
		                  	welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
		                  	userItemList:req.session.currentProfile.userItems,
		                  	sessionStatus: true
		                });
	                }
				} else {
					res.render('myItems', {
						welcome: 'Not signed in',
						sessionStatus: false,
						userItemList: {}
					});
				}
		} else if(actions.includes(req.params.action) && req.params.action === "delete") {

			if(req.params !== undefined && itemOptions.includes(req.params.theItem)) {
				await userItem.deleteItem(req.params.theItem);
				req.session.currentProfile.userItems = await userItem.getAllItemsOfUser(req.session.theUser.userId);
				res.render('myItems', {
                  	welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
                  	userItemList:req.session.currentProfile.userItems,
                  	sessionStatus: true
                });
			} else {
				/* Current situation : User is sign out, also TODO: check if session is cleared */
				res.render('myItems', {
					welcome: 'Not signed in',
					sessionStatus: false,
					userItemList: {}
				});
			}
		} else if(actions.includes(req.params.action) && req.params.action === "offer") {
			/* if the action is offer */
			let availableList = [];
			if(req.params !== undefined && itemOptions.includes(req.params.theItem)) {
				Object.keys(req.session.currentProfile.userItems).forEach((item) => {
					if(req.session.currentProfile.userItems[item].status === 'available') {
						availableList.push(req.session.currentProfile.userItems[item]);
					}
				});
				if(availableList.length > 0) {
					let item = await userItem.getItem(req.params.theItem);
					res.render('swap', {
						welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
						availableList,
						flag: true,
						sessionStatus: true,
						item
					});
				} else {
					let item = await userItem.getItem(req.params.theItem);
					res.render('swap', {
						message: 'There is no item to swap. Add items to start swapping again.',
						welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
						flag: false,
						sessionStatus: true,
						item
					});
				}
			} else {

				res.render('myItems', {
					welcome: 'Not signed in',
					sessionStatus: false,
					userItemList: req.session.currentProfile.userItems
				});
			}
		}  else {
			res.render('myItems', {
				welcome: 'Hi ' + req.session.theUser.firstName + '.' + 'Welcome!',
				userItemList: req.session.currentProfile.userItems,
				sessionStatus: true
			});
		}
	} else {
		req.session.theUser = undefined;
		req.session.currentProfile = undefined;
		res.render('index', {
			welcome: 'Not signed in.',
			sessionStatus: false,
			name: 'Anonymous'
		});
	}
});

module.exports = app;
