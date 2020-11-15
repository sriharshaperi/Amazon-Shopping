import React, { useEffect, useState } from "react";
import CheckoutProduct from "./CheckoutProduct";
import "./Payment.css";
import { useStateValue } from "./StateProvider";
import { Link, useHistory } from "react-router-dom";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import CurrencyFormat from "react-currency-format";
import { getBasketTotal } from "./reducer";
import axios from "./axios";
import { db } from "./firebase";
import { Button, Dialog, DialogContent, DialogTitle } from "@material-ui/core";

const Payment = () => {
  //user from data layer
  const [{ user }, dispatch] = useStateValue();
  //initialize state to user's basket items
  const [basketItemsFromDB, setBasketItemsFromDB] = useState([]);

  //new address fields
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressState, setAddressState] = useState("");
  const [addressCountry, setAddressCountry] = useState("");

  //initialize state for dialog container for adding new address
  const [newAddressDialog, setNewAddressDialog] = useState(false);
  //initialize state for dialog container for changing delivery address
  const [changeAddressDialog, setChangeAddressDialog] = useState(false);

  //initialize state for setting up addresses array of documents
  const [addresses, setAddresses] = useState([]);

  //initialize state for setting up user document
  const [userDoc, setUserDoc] = useState({});

  //initialize state for access to stripe
  const stripe = useStripe();

  //initialize state for access to elements
  const elements = useElements();

  //initialize state for payment process levels
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState("");
  const [error, setError] = useState(null);
  const [disabled, setDisabled] = useState(true);

  //initialize state for clientSecret to get access to initiate payment request
  const [clientSecret, setClientSecret] = useState(true);

  //useHistory() for redirecting to routes
  const history = useHistory();

  //fires once per component mount
  useEffect(() => {
    if (user) {
      //setting up user's basket data
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

      //setting up the list of shipping addresses set by user in the addresses collection
      db.collection("users")
        .doc(user?.uid)
        .collection("addresses")
        .onSnapshot((snapshot) =>
          setAddresses(snapshot.docs.map((doc) => doc.data()))
        );
    }
  }, []);

  //if no user has logged in, redirect to home route
  if (!user) history.push("/");

  //extracting name of the user from email
  const name = user?.email.slice(0, user?.email.indexOf("@"));

  //fires for every change in the basket data
  useEffect(() => {
    //generate the special stripe secret which allows to charge a customer
    const getClientSecret = async () => {
      //sending request to firebase cloud functions with axios post request to get the response data
      const response = await axios({
        method: "post",
        url: `/payments/create?total=${
          getBasketValueUptoTwoDecimals(getBasketTotal(basketItemsFromDB)) * 100
        }`,
      });

      //setting up the response data recieved from firebase cloud functions through axios baseUrl
      setClientSecret(response.data.clientSecret);
    };
    getClientSecret();
  }, [basketItemsFromDB]);

  //adjusting the payment amount upto two decimals with this function
  const getBasketValueUptoTwoDecimals = (value) => {
    let valueString = value + "";
    let indexOfPoint = valueString.indexOf(".");
    let filteredString = valueString.slice(0, indexOfPoint + 3);
    return Number(filteredString);
  };

  console.log("The secret is ==> ", clientSecret);

  //this event fires upon user giving card details as input and clikcing on buy now
  const handleSubmit = async (event) => {
    //stripe functionality
    event.preventDefault();
    setProcessing(true);
    console.log("processing set to true");

    try {
      //awaiting promise which returns "paymentIntent" recieved as response data
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
        .then(({ paymentIntent }) => {
          console.log("promise satisfied and entered into then");

          console.log(paymentIntent);

          //feeding the data binded with paymentIntent into db
          db.collection("users")
            .doc(user?.uid)
            .collection("orders")
            .doc(paymentIntent?.id)
            .set({
              basket: basketItemsFromDB,
              amount: paymentIntent?.amount,
              created: paymentIntent?.created,
              shippingAddress: {
                line1: userDoc.defaultAddress?.line1 || "#56 Rizen rd",
                line2: userDoc.defaultAddress?.line2 || "Costa Brava",
                city: userDoc.defaultAddress?.city || "Lubbock",
                state: userDoc.defaultAddress?.state || "Texas",
                country: userDoc.defaultAddress?.country || "US",
              },
            });

          console.log("data feeded into firestore");

          //payment intent implies payment confirmation

          // upon the data been successfully fed into db, set the following payment levels to default state
          setSucceeded(true);
          setError(null);
          setProcessing(false);

          //empty the basket after the order has beeen placed
          db.collection("users")
            .doc(user?.uid)
            .collection("basket")
            .onSnapshot((snapshot) =>
              snapshot.docs.map((doc) => doc.ref.delete())
            );
          console.log("process done");

          //upon the order being successfully placed, replace the route to orders and display the orders
          history.replace("/orders");
        });
    } catch (error) {
      //alert messages if any
      alert(error.message);
    }
  };

  //this event fires onChange of the card details and shoots up errors if found
  const handleChange = (event) => {
    //Listen for changes in the card element
    //display any errors if the customer inputs invalid card details
    setDisabled(event.empty);

    //display error message if any
    setError(event.error ? event.error.message : "");
  };

  //this event fires upon adding a new address
  const addNewShippingAddress = (event) => {
    //prevents the default refreshing behaviour of the browser
    event.preventDefault();

    //add the address data to db
    db.collection("users")
      .doc(user?.uid)
      .collection("addresses")
      .add({
        line1: addressLine1,
        line2: addressLine2,
        city: addressCity,
        state: addressState,
        country: addressCountry,
      })
      .then((doc) => {
        //every time a new address gets added, we set that address as default address in the user's document which can also be changed later

        db.collection("users")
          .doc(user?.uid)
          .set(
            {
              defaultAddress: {
                id: doc.id,
                line1: addressLine1,
                line2: addressLine2,
                city: addressCity,
                state: addressState,
                country: addressCountry,
              },
            },
            { merge: true }
          );

        //assigning doc ref to the id property of document for ease of access
        doc.set({ id: doc.id }, { merge: true });
      });

    //after this whole process, close the dialog
    setNewAddressDialog(false);
  };

  //changing the default shipping address
  const setDefaultShippingAddress = (event) => {
    //prevents the default refreshing behaviour of the browser
    event.preventDefault();

    /*  among the list of addresses displayed, every address has a button at the bottom which has a value. 
    The value of each button is the id of that particular address.
    event.currentTarget.value gives the value of the button that has been clicked */
    db.collection("users")
      .doc(user?.uid)
      .collection("addresses")
      .where("id", "==", event.currentTarget.value) //picking up the document where the doc.ref matches the value of the button that has been clicked
      .get()
      .then((doc) =>
        //setting default address to the address document that has been picked up
        doc.forEach((document) => {
          db.collection("users")
            .doc(user?.uid)
            .set({ defaultAddress: document.data() }, { merge: true });

          //after setting up the default address, set the state of the address input fields back to default initialzed state
          setAddressLine1("");
          setAddressLine2("");
          setAddressCity("");
          setAddressState("");
          setAddressCountry("");
        })
      );

    //close the dialog after the whole process
    setChangeAddressDialog(false);
  };

  return (
    <div className="payment">
      <div className="payment__container">
        <h1>
          Checkout
          {
            // link to redirect too checkout page
            <Link to="/checkout" className="payment__checkoutLink">
              {" (" + basketItemsFromDB.length}{" "}
              {basketItemsFromDB.length === 1 ? " item)" : " items)"}
            </Link>
          }
        </h1>

        {/* payment section */}
        <div className="payment__section">
          <div className="payment__title">
            <h3>Delivery Address</h3>
          </div>
          <div className="payment__address">
            <div className="address__details">
              {/* Dialog container for adding a new address */}
              <Dialog
                onClose={() => setNewAddressDialog(false)}
                open={newAddressDialog}
                maxWidth="xl"
              >
                <DialogTitle>
                  <center>Add New Address</center>
                </DialogTitle>
                <DialogContent>
                  <center>
                    <form
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "10px",
                        margin: "10px",
                      }}
                    >
                      <div className="form__element">
                        <label htmlFor="line1">Line 1</label>
                        <input
                          name="line1"
                          type="text"
                          value={addressLine1}
                          onChange={(e) => setAddressLine1(e.target.value)}
                        />
                      </div>

                      <div className="form__element">
                        <label htmlFor="line2">Line 2</label>
                        <input
                          name="line2"
                          type="text"
                          value={addressLine2}
                          onChange={(e) => setAddressLine2(e.target.value)}
                        />
                      </div>

                      <div className="form__element">
                        <label htmlFor="city">City</label>
                        <input
                          name="city"
                          type="text"
                          value={addressCity}
                          onChange={(e) => setAddressCity(e.target.value)}
                        />
                      </div>

                      <div className="form__element">
                        <label htmlFor="state">State</label>
                        <input
                          name="state"
                          type="text"
                          value={addressState}
                          onChange={(e) => setAddressState(e.target.value)}
                        />
                      </div>

                      <div className="form__element">
                        <label htmlFor="country">Country</label>
                        <input
                          name="country"
                          type="text"
                          value={addressCountry}
                          onChange={(e) => setAddressCountry(e.target.value)}
                        />
                      </div>

                      <div className="form__element__buttons">
                        <button
                          type="submit"
                          onClick={addNewShippingAddress}
                          disabled={
                            /*  add address button is disabled until all the fields are filled up.
                            checking for field.trim() === "" prevents proceeding with empty space as the data */
                            addressLine1.trim() === "" ||
                            addressLine2.trim() === "" ||
                            addressCity.trim() === "" ||
                            addressState.trim() === "" ||
                            addressCountry.trim() === ""
                          }
                        >
                          Add Address
                        </button>

                        {/* cancel button to close the dialog */}
                        <button
                          onClick={(event) => {
                            event.preventDefault();
                            setNewAddressDialog(false);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </center>
                </DialogContent>
              </Dialog>

              {/* dialog container to chnage the shipping address */}
              <Dialog
                open={changeAddressDialog}
                onClose={() => setChangeAddressDialog(false)}
                maxWidth="lg"
              >
                <DialogTitle>
                  <center>Choose an address</center>
                </DialogTitle>
                <DialogContent style={{ display: "flex" }}>
                  {/* map through the list of all addresses */}
                  {addresses.map((address) => (
                    <div
                      className="existing__address__details"
                      style={{ display: "flex" }}
                    >
                      <div className="existing__address">
                        <p>{address.line1}</p>
                        <p>{address.line2}</p>
                        <p>{address.city}</p>
                        <p>{address.state}</p>
                        <p>{address.country}</p>

                        {/* conditional rendering of "deliver to this address" button for rest of the addresses but the default address  */}

                        {address.id === userDoc.defaultAddress?.id ? null : (
                          <div className="existing__address__options">
                            <button
                              onClick={setDefaultShippingAddress}
                              value={address.id}
                            >
                              Deliver to this Address
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </DialogContent>
              </Dialog>

              {/* If a user has logged in for the first time, there would be not default address set.
              render "Add new address" button if no default address has been set */}

              {typeof userDoc.defaultAddress === "undefined" ? (
                <button onClick={() => setNewAddressDialog(true)}>
                  Add New Address
                </button>
              ) : (
                /*  else if there exists a defaut address, render "add new address" and "change shipping address" buttons 
                  along with the default address  */
                <>
                  <div className="address__details__text">
                    <p>{user?.email}</p>
                    <p>{userDoc?.defaultAddress?.line1}</p>
                    <p>{userDoc?.defaultAddress?.line2}</p>
                    <p>{userDoc?.defaultAddress?.city}</p>
                    <p>{userDoc?.defaultAddress?.state}</p>
                    <p>{userDoc?.defaultAddress?.country}</p>
                  </div>
                  <div className="address__buttons">
                    <button onClick={() => setChangeAddressDialog(true)}>
                      Change Shipping Address
                    </button>
                    <button onClick={() => setNewAddressDialog(true)}>
                      Add New Address
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="payment__section">
          <div className="payment__title">
            <h3>Review items and delivery</h3>
          </div>
          <div className="payment__items">
            {/* map through all the checkout products that are available in the basket  */}
            {basketItemsFromDB.map((item) => (
              <CheckoutProduct
                id={item.id}
                title={item.title}
                image={item.image}
                price={item.price}
                rating={item.rating}
              />
            ))}
          </div>
        </div>
        <div className="payment__section payment__section__Transaction">
          <div className="payment__title">
            <h3>Payment Method</h3>
          </div>
          <div className="payment__details">
            {/* stripe magic will go here */}
            <form onSubmit={handleSubmit}>
              <CardElement onChange={handleChange} />
              <div className="payment__priceContainer">
                <CurrencyFormat
                  renderText={(value) => (
                    <>
                      <h3>Order Total : {value}</h3>
                    </>
                  )}
                  decimalScale={2}
                  value={getBasketTotal(basketItemsFromDB)} //from reducer.js
                  displayType={"text"}
                  thousandSeparator={true}
                  prefix={"$"}
                />
                <button
                  /* Upon clicking the "Buy Now" button, the processing starts. until the process finishes up successfully
                    or unless the basket value is not more than 0 or the default address has not been setup, button remains disabled. */

                  disabled={
                    processing ||
                    disabled ||
                    succeeded ||
                    getBasketTotal(basketItemsFromDB) === 0 ||
                    typeof userDoc?.defaultAddress === "undefined"
                  }
                >
                  <span>{processing ? <p>Processing...</p> : "Buy Now"}</span>
                </button>
              </div>
              {/* display error message if any */}
              {error && <div>{error}</div>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
