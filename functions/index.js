var admin = require("firebase-admin");
var nodemailer = require('nodemailer');
var functions = require("firebase-functions");
var templates = require('./templates');

admin.initializeApp();

var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: functions.config().gmail.email,
        pass: functions.config().gmail.password
    }
});

var kuyuaAdmin = 'info@kuyua.com';
var kuyuaTeam = 'tom.gruintjes@gmail.com,jop.elschot@gmail.com, nik.perton@rabobank.com, tom.gruintjes@rabobank.nl,C.D.A.vanderWoude@gmail.com';

exports.sendEmailOnRegistration = functions.firestore
    .document('users/{userID}/userdata/{docID}')
    .onCreate(
        (snap, context) => {
            let email = snap.data().email;
            let mobile = snap.data().whatsAppNr;
            let fullName = snap.data().fullName;
            if (email == undefined) {
                email = 'noemail@kuyua.farm';
            }

            const mailOptionsToUser = {
                from: kuyuaAdmin,
                to: email,
                bcc: kuyuaAdmin,
                subject: 'Welcome to Kuyua! ' + fullName,
                html: templates.confirmationRegistrationMail()
            };
            transporter.sendMail(mailOptionsToUser, (error, data) => {
                if (error) {
                    console.log('Error mail to user', error, snap.data())
                    return
                }
                console.log("Sent to user!", JSON.stringify(snap.data()))
            });

            const mailOptionsToAdmin = {
                from: kuyuaAdmin,
                to: kuyuaTeam,
                subject: 'Kuyua user registration - ' + fullName + ' - ' + email + ' - ' + mobile,
                html: `<p>${email} -   ${mobile} - ${fullName} </p>` //
            };
            return transporter.sendMail(mailOptionsToAdmin, (error, data) => {
                if (error) {
                    console.log('Error mail to admin', error, snap.data())
                    return
                }
                console.log("Sent to admin!", JSON.stringify(snap.data()))
            });
        });


exports.sendEmailOnInterest = functions.firestore
    .document('users/{userID}/postedinterests/{docID}')
    .onCreate(
        (snap, context) => {
            const mobile = snap.data().buyerWhatsAppNr;
            const fullName = snap.data().buyerDisplayName;
            const productionCommodity = snap.data().productionCommodity;
            const sellerEmail = snap.data().sellerEmail;
            const productionID = snap.data().productionID;
            const buyerID = snap.data().buyerUserID;
            const userID = context.params.userID;

            const url = 'https://kuyua.com/login/' + sellerEmail + '/viewbuyer/' + snap.data().productionID + '-' + buyerID;

            if (sellerEmail == undefined) {
                sellerEmail = 'noemail@kuyua.farm';
            }

            // get the tokens for trigger and send messages
            return admin.firestore().collection('/users/' + userID + '/' + 'userdata/')
                .doc(userID)
                .get()
                .then(async snapshot => {
                    const snapShotData = snapshot.data();

                    let fcmTokens = {}
                    if (snapShotData != undefined && snapShotData.fcmTokens != undefined) {
                        fcmTokens = snapshot.data().fcmTokens;
                    }
                    //   const { fcmTokens } = snapshot.data();

                    const tokens = Object.keys(fcmTokens)
                        .map(tokenID => fcmTokens[tokenID]);

                    //    console.log('Tokens to send', fcmTokens, tokens, snapshot.data());

                    if (tokens.length > 0) {
                        const payload = {
                            notification: {
                                title: 'New interest in your ' + productionCommodity,
                                body: fullName + ' has interest buying your ' + productionCommodity,
                                icon: 'https://kuyua.com/assets/img/signuplogin/logo_investor_plant_only.png',
                                click_action: url
                            },
                            data: {
                                productionID: snap.data().productionID,
                                buyerID,
                                userID
                            }
                        }

                        const response = await admin.messaging().sendToDevice(tokens, payload)
                            .catch(err => {
                                console.log('Error sendToDevice', err);
                            })

                        console.log('Sent tokens', tokens.length, response.results.length);
                        response.results.forEach((result, index) => {
                            const error = result.error;
                            if (error) {
                                functions.logger.error(
                                    'Failure sending notification to',
                                    tokens[index],
                                    error
                                );
                                // Cleanup the tokens who are not registered anymore.
                                if (error.code === 'messaging/invalid-registration-token' ||
                                    error.code === 'messaging/registration-token-not-registered') {
                                    //  tokensToRemove.push(tokensSnapshot.ref.child(tokens[index]).remove());
                                    console.log('we need to remove tokens', tokens[index]);
                                }
                            }
                        });
                    }
                })
                .catch(err => {
                    console.log('Error getting tokens', err)
                })
                .then(() => {
                    const mailOptions = {
                        from: kuyuaAdmin,
                        to: sellerEmail,
                        bcc: kuyuaAdmin,
                        subject: 'Kuyua Alert - interest in your products! ' + productionCommodity,
                        html: templates.productionInterestMail()
                            .replace(/_FULLNAME/g, fullName)
                            .replace(/_URL/g, url)
                            .replace(/_PRODUCTION/g, productionCommodity)
                    };

                    console.log('Sending email to ' + sellerEmail);

                    return transporter.sendMail(mailOptions, (error, data) => {
                        if (error) {
                            console.log('Error mail to interested user', error, snap.data())
                            return
                        }
                    });
                })
        })

exports.sendEmailOnCodeRequest = functions.firestore
    .document('confirmcodes/{uid}')
    .onCreate(
        (snap, context) => {
            const email = snap.data().email;
            const confirmCode = Math.floor(1000 + Math.random() * 9000); // 4 digit code
            const uid = context.params.uid;
            const url = 'https://us-central1-kuyua-2199c.cloudfunctions.net/publicapp/confirmcode/' + uid + '/' + confirmCode; // + '?browser=yes';

            if (email == undefined || uid == undefined) {
                console.log('Error confirmCode no params ', error, snap.data())
                return;
            }

            admin.firestore().collection('confirmcodes')
                .doc(uid)
                .set({ confirmCode, age: Date.now(), emailConfirmed: false }, { merge: true })
                .catch(error => {
                    console.log('Error writing confirmationCode', snap.data(), context)
                })

            const mailOptions = {
                from: kuyuaAdmin,
                to: email,
                bcc: kuyuaAdmin,
                subject: 'Kuyua code - ' + confirmCode,
                html: templates.codeConfirmationMail()
                    .replace(/_CODE/g, confirmCode)
                    .replace(/_URL/g, url)
                    .replace(/_UID/g, uid) //
            };
            transporter.sendMail(mailOptions, (error, data) => {
                if (error) {
                    console.log('Error confirmCode mail ', error, snap.data())
                    return
                }
            });
        });



const checkConfirmCode = (uid, codeReceived) => {
    return admin.firestore().collection('confirmcodes')
        .doc(uid)
        .get()
        .then(snapshot => {
            let compareResult = false;
            const data = snapshot.data();

            if (data === undefined) {
                res.status(500).send('Server error');
                return false;
            }

            if (data.emailConfirmed) {
                res.status(500).send('Already confirmed');
                return false;
            }

            console.log('Confirming', codeReceived, data.confirmCode, data.confirmCode == codeReceived);

            if (data.confirmCode == codeReceived) {
                //  sendResult = '{"result":true}';
                compareResult = true;

                admin.firestore().collection('confirmcodes')
                    .doc(uid)
                    .set({ emailConfirmed: true }, { merge: true });

                const mailOptions = {
                    from: kuyuaAdmin,
                    to: data.email,
                    bcc: kuyuaAdmin,
                    subject: 'Kuyua - confirmed email ',
                    html: templates.emailConfirmedMail()

                };
                transporter.sendMail(mailOptions, (error, data) => {
                    if (error) {
                        console.log('Error emailConfirmedMail mail ', error, data);
                        return
                    }
                });
            }
            return compareResult;
        })
        .catch(err => {
            console.log('Error confirming', err);
            return false;
        })
}


const cookieParser = require('cookie-parser')();
const express = require('express');
const cors = require('cors')({ origin: true });


// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
const validateFirebaseIdToken = async(req, res, next) => {
    functions.logger.log('Check if request is authorized with Firebase ID token');

    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !(req.cookies && req.cookies.__session)) {
        functions.logger.error(
            'No Firebase ID token was passed as a Bearer token in the Authorization header.',
            'Make sure you authorize your request by providing the following HTTP header:',
            'Authorization: Bearer <Firebase ID Token>',
            'or by passing a "__session" cookie.'
        );
        res.status(403).send('Unauthorized');
        return;
    }

    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        functions.logger.log('Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else if (req.cookies) {
        functions.logger.log('Found "__session" cookie');
        // Read the ID Token from cookie.
        idToken = req.cookies.__session;
    } else {
        // No cookie
        res.status(403).send('Unauthorized');
        return;
    }

    try {
        const decodedIdToken = await admin.auth().verifyIdToken(idToken);
        functions.logger.log('ID Token correctly decoded', decodedIdToken);
        req.user = decodedIdToken;
        next();
        return;
    } catch (error) {
        functions.logger.error('Error while verifying Firebase ID token:', error);
        res.status(403).send('Unauthorized!');
        return;
    }
};

const app = express();
app.use(cors);
app.use(cookieParser);
app.use(validateFirebaseIdToken);
app.get('/confirmcode/:uid/:code', (req, res) => {
    if (req.params.uid === undefined || req.params.code === undefined) {
        res.status(403).send('Unauthorized!');
        return;
    }

    checkConfirmCode(req.params.uid, req.params.code)
        .then(compareResult => {
            res.send(compareResult ? '{"result":true}' : '{"result":false}');
        });
});
exports.app = functions.https.onRequest(app);

// http://localhost:5001/kuyua-2199c/us-central1/publicapp/confirmcode/a/1234

const publicapp = express();
publicapp.use(cors);
publicapp.get('/confirmcode/:uid/:code', (req, res) => {

    if (req == undefined || res == undefined) {
        return;
    }

    if (req.params.uid == undefined || req.params.code == undefined) {
        res.status(403).send('Unauthorized!');
        return;
    }

    checkConfirmCode(req.params.uid, req.params.code)
        .then(compareResult => {
            if (compareResult) {
                res.send(templates.emailConfirmedMail())
            };
            if (!compareResult) {
                //  res.send(templates.emailConfirmedMail())
                res.status(403).send('Unauthorised code!');
            };
        });
});
exports.publicapp = functions.https.onRequest(publicapp);


/*


app.get('/getcode/:email/:uid', (req, res) => {
    const confirmCode = Math.floor(1000 + Math.random() * 9000); // 4 digit code

    if (req.params.uid === undefined || req.params.email === undefined) {
        res.status(403).send('Unauthorized!');
        return;
    }

    //  console.log('Confirmcode', confirmCode, 'code' + req.params.id)
    admin.firestore().collection('confirmcodes')
        .doc(req.params.uid)
        .set({ confirmCode, email: req.params.email, age: Date.now(), emailConfirmed: false })
        .catch(error => {
            console.log('Error writing confirmationCode', confirmCode)
        })

    let url = 'https://us-central1-kuyua-2199c.cloudfunctions.net/publicapp/confirmcode/' + req.params.uid + '/' + confirmCode; // + '?browser=yes';

    const mailOptions = {
        from: kuyuaAdmin,
        to: req.params.email,
        bcc: 'tom.gruintjes@gmail.com',
        subject: 'Kuyua code - ' + confirmCode,
        html: templates.codeConfirmationMail()
            .replace(/_CODE/g, confirmCode)
            .replace(/_URL/g, url)
            .replace(/_UID/g, req.params.uid) //
    };
    transporter.sendMail(mailOptions, (error, data) => {
        if (error) {
            console.log('Error confirmCode mail ', error, snap.data())
            return
        }
    });

    res.send(`{"code": true}`); // "${confirmCode}"

});


*/



//
// Notifications
//
// const FCMToken = admin.database().ref(`/FCMTokens/${userId}`).once('value');
/*

const followerUid = context.params.followerUid;
const followedUid = context.params.followedUid;
// If un-follow we exit the function.

// Get the list of device notification tokens.
const getDeviceTokensPromise = admin.database()
.ref(`/users/${followedUid}/notificationTokens`).once('value');

// Get the follower profile.
const getFollowerProfilePromise = admin.auth().getUser(followerUid);

// The snapshot to the user's tokens.
let tokensSnapshot;

// The array containing all the user's tokens.
let tokens;

const results = await Promise.all([getDeviceTokensPromise, getFollowerProfilePromise]);
tokensSnapshot = results[0];
const follower = results[1];

// Check if there are any device tokens.
if (!tokensSnapshot.hasChildren()) {
return functions.logger.log(
'There are no notification tokens to send to.'
);
}
functions.logger.log(
'There are',
tokensSnapshot.numChildren(),
'tokens to send notifications to.'
);
functions.logger.log('Fetched follower profile', follower);

// Notification details.
const payload = {
notification: {
title: 'You have a new follower!',
body: `${follower.displayName} is now following you.`,
icon: follower.photoURL
}
};

// Listing all tokens as an array.
tokens = Object.keys(tokensSnapshot.val());
// Send notifications to all tokens.
const response = await admin.messaging().sendToDevice(tokens, payload);
// For each message check if there was an error.
const tokensToRemove = [];
response.results.forEach((result, index) => {
const error = result.error;
if (error) {
functions.logger.error(
'Failure sending notification to',
tokens[index],
error
);
// Cleanup the tokens who are not registered anymore.
if (error.code === 'messaging/invalid-registration-token' ||
error.code === 'messaging/registration-token-not-registered') {
tokensToRemove.push(tokensSnapshot.ref.child(tokens[index]).remove());
}
}
});
return Promise.all(tokensToRemove);
*/
