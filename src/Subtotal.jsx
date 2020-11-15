import React, { useEffect, useState } from "react";
import "./Subtotal.css";
import CurrencyFormat from "react-currency-format";
import { useStateValue } from "./StateProvider";
import { getBasketTotal } from "./reducer";
import { useHistory } from "react-router-dom";
import { db } from "./firebase";

const Subtotal = () => {
  //user from data layer
  const [{ user }, dispatch] = useStateValue();
  //user's basket data
  const [basketItemsFromDB, setBasketItemsFromDB] = useState([]);
  //useHistory() to redirect to routes
  const history = useHistory();

  console.log(basketItemsFromDB);

  //this event fires once per component mount
  useEffect(() => {
    if (user) {
      //setting up user's basket items
      db.collection("users")
        .doc(user?.uid)
        .collection("basket")
        .onSnapshot((snapshot) =>
          setBasketItemsFromDB(snapshot.docs.map((doc) => doc.data()))
        );
    }
  }, []);

  return (
    <div className="subtotal">
      <CurrencyFormat
        renderText={(value) => (
          <>
            <p>
              Subtotal ({basketItemsFromDB.length}{" "}
              {basketItemsFromDB.length === 1 ? "item" : "items"}) :
              <strong>{` ${value}`} </strong>
            </p>
            <small className="subtotal__gift">
              <input type="checkbox" /> This order contains a gift
            </small>
          </>
        )}
        decimalScale={2}
        value={getBasketTotal(basketItemsFromDB)}
        displayType={"text"}
        thousandSeparator={true}
        prefix={"$"}
      />
      <button
        disabled={getBasketTotal(basketItemsFromDB) === 0} //this button is diabled for proceeding to checkout with empty cart
        onClick={(e) => history.push("/payment")}
      >
        Proceed to Checkout
      </button>
    </div>
  );
};

export default Subtotal;
