const router = require("express").Router();
const verifySessionCookie = require("../middleware/SessionAuthenticate");
const admin = require('firebase-admin');


require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_KEY);







router.post('/create-user', async (req, res) => {
    // email and name from client 
    // const { email, name } = req.body;
    const email=req.body.email;
    const name =req.body.name;

    // console.log("inside create user route");
    try {
        
        // Check if the user already exists in Stripe
        const customers = await stripe.customers.list({
            email: email,
        });

        if (customers.data.length > 0) {
            // console.log("customer already exitsts");
            // console.log(customers.data);
            // User already exists in Stripe
            return res.status(200).json(customers.data[0]);
        }

        // Create a new Stripe customer if they don't already exist
        const customer = await stripe.customers.create({
            email: email,
            name: name,
        });

        res.status(200).json(customer);
        // console.log(customer);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(400).json({ error: error.message });
    }
});






router.post('/create-portal-session',verifySessionCookie, async (req, res) => {
    
    try {
        // console.log(req.user);
        const {user_id} =req.user

          // Fetch the customerId from Firestore
    const userDoc = await admin.firestore().collection('users').doc(user_id).get();

    if (!userDoc.exists) {
      throw new Error('User does not exist');
    }

    const { customerId } = userDoc.data();

    if (!customerId) {
      throw new Error('Customer ID not found for user');
    }

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            customer: customerId,
            line_items: [
              {
                price: req.body.priceId,
                // For metered billing, do not pass quantity
                quantity: 1,
              },
            ],
            // {CHECKOUT_SESSION_ID} is a string literal; do not change it!
            // the actual Session ID is returned in the query parameter when your customer
            // is redirected to the success page.
            success_url: `${process.env.CLIENT_ORIGIN}/account`,
            // cancel_url: 'https://example.com/canceled.html',
          });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating portal session:', error);
        res.status(400).json({ error: error.message });
    }
});


router.get('/active-subscriptions', verifySessionCookie, async (req, res) => {
    try {
      const { user_id } = req.user;
  
      // Fetch the customerId from Firestore
      const userDoc = await admin.firestore().collection('users').doc(user_id).get();
  
      if (!userDoc.exists) {
        throw new Error('User does not exist');
      }
  
      const { customerId } = userDoc.data();
  
      if (!customerId) {
        throw new Error('Customer ID not found for user');
      }
  
      // Retrieve all subscriptions for the customer
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
      });
  
      // Filter out only the active subscriptions
      const activeSubscriptions = subscriptions.data.filter(
        (subscription) => subscription.status === 'active'
      );
    // console.log(activeSubscriptions);
      res.json({ activeSubscriptions });
    } catch (error) {
      console.error('Error retrieving active subscriptions:', error);
      res.status(400).json({ error: error.message });
    }
  });
   



router.post('/cancel-subscription', async (req, res) => {
    const { subscriptionId } = req.body;

    try {
        const deleted = await stripe.subscriptions.cancel(subscriptionId);
        res.status(200).json(deleted);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;