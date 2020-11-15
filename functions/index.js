require("dotenv").config()
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const axios = require('axios')
const { request, response } = require("express");
const stripe = require("stripe")(
    process.env.STRIPE_SECRET_KEY
);

//API

//App Config
const app = express()

//Middlewares
app.use(cors({ origin: true }))
app.use(express.json());

//API Routes
app.get('/', (request, response) => {
    response.status(200).send('Hello World')
})

app.post('/payments/create', async (request, response) => {
    const total = request.query.total;
    console.log('Payment request recieved', total);

    const paymentIntent = await stripe.paymentIntents.create({
        amount: total, //subunits of the currency
        currency: "usd",
        description: "payment from Amazon"
    })

    //ok --> created something
    response.status(201).send({
        clientSecret: paymentIntent.client_secret,
    })
})

//Listen command
exports.api = functions.https.onRequest(app)

//example endpoint
// http://localhost:5001/clone-48a78/us-central1/api