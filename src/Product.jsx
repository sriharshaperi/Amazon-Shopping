import React from "react";
import "./Product.css";
import StarOutlinedIcon from "@material-ui/icons/StarOutlined";
import { useStateValue } from "./StateProvider";
import { useHistory } from "react-router-dom";
import { db } from "./firebase";

const Product = ({ id, title, image, price, rating }) => {
  //user from data layer
  const [{ user }, dispatch] = useStateValue();

  //useHistory() for redirecting to routes
  const history = useHistory();

  const addToBasket = () => {
    //if no user has logged in, redirect to login component
    if (!user) history.push("/login");
    else {
      //add new item to basket
      db.collection("users")
        .doc(user?.uid)
        .collection("basket")
        .add({
          title: title,
          image: image,
          price: price,
          rating: rating,
        })

        //after adding a new document, set the newly added document reference as the id property in the document for ease of access
        .then((doc) => doc.set({ id: doc.id }, { merge: true }));
    }
  };

  return (
    <div className="product">
      <div className="product__info">
        <p>{title}</p>
        <p className="product__price">
          <small>$</small>
          <strong>{price}</strong>
        </p>
        <div className="product__rating">
          <p>
            {/* map as per the rating number specified and render the star rating count as per the number */}
            {Array(rating)
              .fill()
              .map((_, i) => (
                <StarOutlinedIcon style={{ color: " #f0c14b" }} />
              ))}
          </p>
        </div>
      </div>
      {/* product image */}
      <img src={image} alt="" />
      <button onClick={addToBasket}>Add to Basket</button>
    </div>
  );
};

export default Product;
