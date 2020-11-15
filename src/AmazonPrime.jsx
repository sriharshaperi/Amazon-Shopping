import React, { useEffect, useState } from "react";
import AmazonPrimeSubscription from "./AmazonPrimeSubscription";
import { db } from "./firebase";
import { useStateValue } from "./StateProvider";
import moment from "moment";
import "./AmazonPrime.css";

function AmazonPrime() {
  //user from data layer
  const [{ user }, dispatch] = useStateValue();

  //initializing primeuser state to false
  const [primeUser, setPrimeUser] = useState(false);

  //initializing state with a prime user document which consists of details regarding prime membership
  const [primeUserDetails, setPrimeUserDetails] = useState({});

  //fires once per component mount
  useEffect(() => {
    if (user) {
      //setting prime user document on snapshot if user is a prime member
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
    <div>
      {!primeUser ? (
        // if user is not a prime member, render Prime subscription component
        <AmazonPrimeSubscription />
      ) : (
        //else display prime membership details
        <div className="prime__user">
          {/* amazon prime logo */}
          <img
            className="prime__logo"
            src="https://pwxp5srs168nsac2n3fnjyaa-wpengine.netdna-ssl.com/wp-content/uploads/2018/01/Prime_0-1-600x314.png"
            alt="amazon__prime__logo"
          />
          {/* descrtiption */}
          <h2>Experience 1 day sureshot delivery with Amazon Prime</h2>
          <h2>Your Prime membership is valid until</h2>
          <h1 className="prime__validity">
            {/* setting up expiry date by adding 1 year to the moment of subscription */}
            {moment
              .unix(primeUserDetails?.data?.created)
              .add(1, "year")
              .format("MMMM Do YYYY, h:ma")}
          </h1>
        </div>
      )}
    </div>
  );
}

export default AmazonPrime;
