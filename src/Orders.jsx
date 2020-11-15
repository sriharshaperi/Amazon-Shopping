import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { db } from "./firebase";
import Order from "./Order";
import "./Orders.css";
import { useStateValue } from "./StateProvider";

const Orders = () => {
  //user from data layer
  const [{ user }, dispatch] = useStateValue();
  //initialize state for orders
  const [orders, setOrders] = useState([]);
  //useHistory() for redirecting to routes
  const history = useHistory();
  //if user has not logged in, redirect to home route
  if (!user) history.push("/");

  console.log(user?.email);

  //fires once per component mount and also with respect to user
  useEffect(() => {
    if (user) {
      console.log("I am here");

      //setting orders data
      db.collection("users")
        .doc(user?.uid)
        .collection("orders")
        .orderBy("created", "desc")
        .onSnapshot((snapshot) => {
          setOrders(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              data: doc.data(),
            }))
          );
        });
    } else {
      setOrders([]);
    }
  }, [user]);

  return (
    <div className="orders">
      <h1>Your Orders</h1>

      {user ? (
        // {/* display orders if user has logged in */}

        <div className="orders__order">
          {/* map through all the orders */}
          {orders?.map((order) => (
            <Order order={order} />
          ))}
        </div>
      ) : (
        //if user has not logged in, redirect to home route
        history.push("/")
      )}
    </div>
  );
};

export default Orders;
