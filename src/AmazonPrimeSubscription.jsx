import React, { useEffect, useState } from "react";
import "./Payment.css";
import { useStateValue } from "./StateProvider";
import { useHistory } from "react-router-dom";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import CurrencyFormat from "react-currency-format";
import axios from "./axios";
import { db } from "./firebase";
import "./AmazonPrimeSubscription.css";

const AmazonPrimeSubscription = () => {
  //user from data layer
  const [{ user }, dispatch] = useStateValue();
  //initializing state with user basket data
  const [basketItemsFromDB, setBasketItemsFromDB] = useState([]);

  //setting up user's document
  const [userDoc, setUserDoc] = useState({});
  //initializing state for stripe for payments
  const stripe = useStripe();
  //initializing state for elemnents
  const elements = useElements();

  //initializing state for stages of payment
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState("");
  const [disabled, setDisabled] = useState(true);

  //initializing state for error to display error message if any
  const [error, setError] = useState(null);
  //initializing state for client secret to initiate payment
  const [clientSecret, setClientSecret] = useState(true);
  //history to redirect to url without page refresh
  const history = useHistory();

  //fires once per component mount
  useEffect(() => {
    if (user) {
      //setting up user's basket items
      db.collection("users")
        .doc(user?.uid)
        .collection("basket")
        .onSnapshot((snapshot) =>
          setBasketItemsFromDB(snapshot.docs.map((doc) => doc.data()))
        );

      //setting up user's document
      db.collection("users").onSnapshot((snapshot) =>
        snapshot.docs.map((doc) => {
          if (doc.id === user?.uid) setUserDoc(doc.data());
        })
      );
    }
  }, []);

  //redirect to home route if no user has logged in
  if (!user) history.push("/");

  //extract name from email id
  const name = user?.email.slice(0, user?.email.indexOf("@"));

  //fires at the time of componet mount and also everytime the basket content changes
  useEffect(() => {
    //generate the special stripe secret which allows to charge a customer
    const getClientSecret = async () => {
      //awaits fetch request
      const response = await axios({
        method: "post",
        url: `/payments/create?total=${5.99 * 100}`,
      });
      //set clientsecret response data
      setClientSecret(response.data.clientSecret);
    };
    getClientSecret();
  }, [basketItemsFromDB]);

  console.log("The secret is ==> ", clientSecret);

  //this event fires on clicking subscribe button
  const handleSubmit = async (event) => {
    //stripe functionality
    event.preventDefault();
    setProcessing(true);
    console.log("processing set to true");

    try {
      //stripe promise which resolves paymentIntent details
      await stripe
        ?.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              address: {
                line1:
                  typeof userDoc?.defaultAddress != "undefined"
                    ? userDoc?.defaultAddress?.line1
                    : "#56 Rizen rd",
                line2:
                  typeof userDoc?.defaultAddress != "undefined"
                    ? userDoc?.defaultAddress?.line2
                    : "Costa Brava",
                city:
                  typeof userDoc?.defaultAddress != "undefined"
                    ? userDoc?.defaultAddress?.city
                    : "Lubbock",
                state:
                  typeof userDoc?.defaultAddress != "undefined"
                    ? userDoc?.defaultAddress?.state
                    : "Texas",
                country:
                  typeof userDoc?.defaultAddress != "undefined"
                    ? userDoc?.defaultAddress?.country
                    : "US",
              },
              email: user?.email,
              name: name,
            },
          },
        })

        //paymentIntent object returned from response data of axios fetch url
        .then(({ paymentIntent }) => {
          console.log("promise satisfied and entered into then");

          console.log(paymentIntent);

          //storing the details of payment time, amount and description in the database
          db.collection("users")
            .doc(user?.uid)
            .collection("prime")
            .doc(paymentIntent?.id)
            .set({
              description: "Amazon Prime",
              amount: paymentIntent?.amount / 100,
              created: paymentIntent?.created,
            });

          console.log("data feeded into firestore");

          //payment intent implies payment confirmation
          setSucceeded(true);
          setError(null);
          setProcessing(false);

          console.log("process done");

          //replace the url endpoint after payment and redirect to subscribed page
          history.replace("/amazonPrime");
        });
    } catch (error) {
      //alerts errors if any
      alert(error.message);
    }
  };

  //this event fires on change of card details
  const handleChange = (event) => {
    //Listen for changes in the card element
    //display any errors if the customer inputs invalid card details
    setDisabled(event.empty);

    //display error message if any
    setError(event.error ? event.error.message : "");
  };

  return (
    <div className="payment prime__subscription__payment">
      <div className="payment__container">
        <h1>Amazon Prime Subscription</h1>
        {/* payment section */}
        <div className="payment__section">
          <div className="payment__title">
            <h3>Review items and delivery</h3>
          </div>
          <div className="payment__items">
            <h3>Amazon Prime Subscription</h3>
            <h3>$5.99</h3>
          </div>
        </div>
        <div className="payment__section payment__section__Transaction">
          <div className="payment__title">
            <h3>Payment Method</h3>
          </div>
          <div className="payment__details">
            {/* stripe magic will go here */}
            <form onSubmit={handleSubmit}>
              {/* card element where user inputs card details */}
              <CardElement onChange={handleChange} />
              <div className="payment__priceContainer">
                <CurrencyFormat
                  renderText={(value) => (
                    <>
                      <h3>Order Total : {value}</h3>
                    </>
                  )}
                  decimalScale={2}
                  value={5.99}
                  displayType={"text"}
                  thousandSeparator={true}
                  prefix={"$"}
                />

                {/* disable the card button until the process is finished */}
                <button disabled={processing || disabled || succeeded}>
                  <span>{processing ? <p>Processing...</p> : "Subscribe"}</span>
                </button>
              </div>
              {/* display errors if any */}
              {error && <div>{error}</div>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmazonPrimeSubscription;
