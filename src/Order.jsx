import React, { useEffect, useState } from "react";
import "./Order.css";
import moment from "moment";
import CheckoutProduct from "./CheckoutProduct";
import CurrencyFormat from "react-currency-format";
import { db } from "./firebase";
import { useStateValue } from "./StateProvider";
import { Link } from "react-router-dom";

function Order({ order }) {
  //user data layer
  const [{ user }, dispatch] = useStateValue();
  //initializing state for prime user
  const [primeUser, setPrimeUser] = useState(false);
  //initializing state for prime user collection document
  const [primeUserDetails, setPrimeUserDetails] = useState({});

  //fires once per component mount
  useEffect(() => {
    if (user) {
      db.collection("users")
        .doc(user?.uid)
        .collection("prime")
        .onSnapshot((snapshot) => {
          if (snapshot.docs.length > 0) {
            setPrimeUser(true);
            snapshot.docs.map((doc) =>
              setPrimeUserDetails({ id: doc.id, data: doc.data() })
            );
          } else setPrimeUser(false);
        });
    }
  }, []);

  return (
    <div className="order">
      <h2>
        <strong>
          {/* displays moment(date & time) when order has been placed */}
          {moment.unix(order.data.created).format("MMMM Do YYYY, h:ma")}
        </strong>
      </h2>
      <h3>Shipping Address</h3>

      {/* display shipping address stored in prime collection's document */}

      <p>{order?.data?.shippingAddress?.line1}</p>
      <p>{order?.data?.shippingAddress?.line2}</p>
      <p>{order?.data?.shippingAddress?.city}</p>
      <p>{order?.data?.shippingAddress?.state}</p>
      <p>{order?.data?.shippingAddress?.country}</p>
      <p className="order__id">
        <strong>
          {/* display order id */}
          Order id : <small>{order.id}</small>
        </strong>
      </p>
      {/* map through all items in an order */}
      {order.data.basket?.map((item) => (
        // ordered product
        <CheckoutProduct
          id={item.id}
          title={item.title}
          image={item.image}
          price={item.price}
          rating={item.rating}
          hideButton={true}
        />
      ))}

      {/* currency format for maintaining currency format with thousands separator and currency prefix */}
      <CurrencyFormat
        renderText={(value) => (
          <>
            <h3 className="order__total">Order Total : {value}</h3>
            <h3 className="order__delivery__date">
              Order Delivery : {/* check whether user is prime user or not */}
              {primeUser ? (
                // if primeUser, check for the date of subscription
                moment
                  .unix(order.data.created)
                  .isSameOrAfter(
                    moment.unix(primeUserDetails?.data?.created)
                  ) ? (
                  // for every order placed after the prime subscription, deliver the product in 1 day
                  <>
                    {moment
                      .unix(order.data.created)
                      .add(1, "day")
                      .format("MMMM Do YYYY, h:ma")}
                    <p className="prime__order">(1 day delivery)</p>
                  </>
                ) : (
                  // for every order placed before the prime subscription, deliver the product in 7 days
                  moment
                    .unix(order.data.created)
                    .add(7, "days")
                    .format("MMMM Do YYYY, h:ma")
                )
              ) : (
                // if the user is not a prime user, deliver the product in 7 days
                moment
                  .unix(order.data.created)
                  .add(7, "days")
                  .format("MMMM Do YYYY, h:ma")
              )}
            </h3>
          </>
        )}
        decimalScale={2} //this ensures the floating amount is considered upto two decimals
        value={order.data.amount / 100} //value is divided by hundred because it has been multiplied by 100 before sending the request to axios baseUrl
        displayType={"text"}
        thousandSeparator={true}
        prefix={"$"}
      />

      {/* if user is not a prime user, conditionally render the link to subscribe to prime */}
      {!primeUser ? (
        <center>
          <Link to="/amazonPrime" style={{ textDecoration: "none" }}>
            <p>Subscribe to prime for super fast deliveries</p>
          </Link>
        </center>
      ) : null}
    </div>
  );
}

export default Order;
