import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import "./Checkout.css";
import CheckoutProduct from "./CheckoutProduct";
import { db } from "./firebase";
import { useStateValue } from "./StateProvider";
import Subtotal from "./Subtotal";

const Checkout = () => {
  //user from data layer
  const [{ user }, dispatch] = useStateValue();

  //initializing state for user's basket items
  const [basketItemsFromDB, setBasketItemsFromDB] = useState([]);

  //for redirecting to routes
  const history = useHistory();

  //routes to home route
  if (!user) history.push("/");

  //fires once per component mount
  useEffect(() => {
    if (user) {
      // setting user basket items
      db.collection("users")
        .doc(user?.uid)
        .collection("basket")
        .onSnapshot((snapshot) =>
          setBasketItemsFromDB(snapshot.docs.map((doc) => doc.data()))
        );
    }
  }, []);

  return (
    <div className="checkout">
      <div className="ckeckout__left">
        {/* checkout page ad image */}
        <img
          className="checkout__ad"
          src="https://images-eu.ssl-images-amazon.com/images/G/31/img17/AmazonPay/PDAYILM/v1/01.jpg"
          alt="deals banner"
        />
        <div>
          {/* display user email if user has logged in, else diaply guest */}
          <h3 className="checkout_displayUser">
            Hello, {user ? user?.email : "Guest"}
          </h3>
          <h2 className="checkout__title">Your Shopping Basket</h2>

          {/* mapping through each product which is in the basket */}
          {basketItemsFromDB.map((item) => (
            // product in basket
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
      <div className="checkout__right">
        {/* subtotal component which maintaians state of the calculated subtotal amount by summing up price */}
        <Subtotal />
      </div>
    </div>
  );
};

export default Checkout;
