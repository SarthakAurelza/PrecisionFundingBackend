const router = require("express").Router();
const admin = require('firebase-admin');
const serviceAccount = require('../firebase/serviceAccountKey');
const verifySessionCookie = require("../middleware/SessionAuthenticate");

// intialising firebae 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// for signup

router.post("/signup", async (req, res) => {
    // console.log("Attempted for signup");
    // console.log(req.body);
    const {
        email, password, firstName, lastName, address,
        city, state, postalCode, country,customerId
    } = req.body;

    try {
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: `${firstName} ${lastName}`,
        });

        await admin.firestore().collection('users').doc(userRecord.uid).set({
            firstName,
            lastName,
            address,
            city,
            state,
            postalCode,
            country,
            email,
            customerId
        });
        // console.log("user created and saved in db");
        res.status(201).send({ uid: userRecord.uid });
    } catch (error) {
        console.error('Error creating new user:', error);
        res.status(500).send({ error: error.message });
    }




});

//  session creation

router.post('/sessionLogin', async (req, res) => {
    // console.log("inside session login route");
    const idToken = req.body.idToken.toString();
    

    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    try {
        const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
        const options = { maxAge: expiresIn, httpOnly: true, secure: true };
        res.cookie('session', sessionCookie, options);
        // console.log('session cookie sent');
        res.status(200).send({ status: 'success' });
    } catch (error) {
        res.status(401).send('UNAUTHORIZED REQUEST!');
    }
});

router.post('/sessionLogout', (req, res) => {
    res.clearCookie('session');
    res.status(200).send({ status: 'success' });
  });

router.post('/logout', (req, res) => {
    res.clearCookie('session');
    res.status(200).send({ status: 'success' });
});

// for checking authorisation 

router.get('/checkAuth', verifySessionCookie, (req, res) => {
    res.status(200).send('Authenticated');
});







module.exports = router;