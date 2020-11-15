import React from "react";
import { useHistory } from "react-router-dom";
import "./CheckoutProduct.css";
import { useStateValue } from "./StateProvider";
import StarOutlinedIcon from "@material-ui/icons/StarOutlined";
import { db } from "./firebase";

//object destructuring of props
const CheckoutProduct = ({ id, image, title, price, rating, hideButton }) => {
  //user from data layer
  const [{ user }, dispatch] = useStateValue();
  //for redirecting to routes
  const history = useHistory();

  //this event fires on clicking remove from basket
  const removeFromBasket = () => {
    //if no user has logged in, redirect to login page
    if (!user) history.push("/login");
    else {
      //remove the item from the basket and update the data on view on snapshot
      db.collection("users")
        .doc(user?.uid)
        .collection("basket")
        .onSnapshot((snapshot) =>
          snapshot.docs.map((doc) => {
            if (doc.id === id) doc.ref.delete();
          })
        );
    }
  };

  return (
    <div className="checkoutProduct">
      {/* product image */}
      <img className="checkoutProduct__image" src={image} alt="" />
      <div className="checkoutProduct__info">
        {/* product name/title */}
        <p className="checkoutProduct__title">{title}</p>
        <p className="checkoutProduct__price">
          <small>$</small>
          {/* product price */}
          <strong>{price}</strong>
        </p>
        <div className="checkoutProduct__rating">
          {/* rating is a number and Array(rating).fill().map() is mapping till the rating number specified and renders star icons as per rating numbers */}
          {Array(rating)
            .fill()
            .map(() => (
              // material ui star icon
              <StarOutlinedIcon style={{ color: " #f0c14b" }} />
            ))}
        </div>

        {/* conditional rendering of remove from basket button if hideButton is not true*/}
        {!hideButton && (
          <button onClick={removeFromBasket}>Remove from Basket</button>
        )}
      </div>
    </div>
  );
};

export default CheckoutProduct;
