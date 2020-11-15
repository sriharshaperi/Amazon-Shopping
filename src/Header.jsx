import React, { useEffect, useState } from "react";
import "./Header.css";
import SearchIcon from "@material-ui/icons/Search";
import ShoppingCartOutlinedIcon from "@material-ui/icons/ShoppingCartOutlined";
import { Link } from "react-router-dom";
import { useStateValue } from "./StateProvider";
import { auth, db } from "./firebase";
import { Badge, makeStyles } from "@material-ui/core";

//style for prime authenticated badge
const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
    },
  },
}));

const Header = () => {
  //user from data layer
  const [{ user }, dispatch] = useStateValue();

  //initializing state for user's basket items
  const [basketItemsFromDB, setBasketItemsFromDB] = useState([]);

  //initialize state for user's document
  const [userdoc, setUserDoc] = useState({});

  //initialize state to primeuser status
  const [primeUser, setPrimeUser] = useState(false);

  //useStyles for applying styles to badge
  const classes = useStyles();

  //fires once per component mount
  useEffect(() => {
    //event fires on auth state change - login and logout events
    auth.onAuthStateChanged((authUser) => {
      console.log("User is ", authUser);
      if (authUser) {
        //user has logged in/ state is maintained

        // dispatch/push state to data layer with respect to a particular type of action
        dispatch({
          type: "SET_USER",
          user: authUser,
        });

        //initializing basket items
        db.collection("users")
          .doc(authUser.uid)
          .collection("basket")
          .onSnapshot((snapshot) =>
            setBasketItemsFromDB(snapshot.docs.map((doc) => doc.data()))
          );

        //conditional initialization of user's prime subscription status
        db.collection("users")
          .doc(authUser.uid)
          .collection("prime")
          .onSnapshot((snapshot) => {
            //if a prime collection exists, user has subscribed to prime otherwise user has not subscribed to prime
            snapshot.docs.length > 0 ? setPrimeUser(true) : setPrimeUser(false);
          });
      } else {
        //user has logged out

        // dispatch/push state to data layer with respect to a particular type of action
        dispatch({
          type: "SET_USER",
          user: null,
        });
      }
    });
  }, []);

  //this event fires on signout
  const handleAuthentication = () => {
    if (user) auth.signOut();
  };

  return (
    <div className="header">
      <Link to="/">
        {/* checks if user has logged in or not */}
        {user ? (
          // if user has logged in, checks whether user is a prime user or not
          primeUser ? (
            // if user is a prime user, a prime badge is rendered
            <Badge
              badgeContent={"prime"}
              color="primary"
              className={`${classes.root}`}
            >
              {/* logo on the navbar - navbar brand */}
              <img
                className={`header__logo`}
                // src="https://media.corporate-ir.net/media_files/IROL/17/176060/Oct18/Amazon%20logo.PNG"
                src="http://pngimg.com/uploads/amazon/amazon_PNG11.png"
                alt="amazon-logo"
              />
            </Badge>
          ) : (
            // else if user is not a prime user, do not render prime badge on logo
            <img
              className="header__logo"
              // src="https://media.corporate-ir.net/media_files/IROL/17/176060/Oct18/Amazon%20logo.PNG"
              src="http://pngimg.com/uploads/amazon/amazon_PNG11.png"
              alt="amazon-logo"
            />
          )
        ) : (
          // else if no user has logged in, do not render prime badge and simply display the logo
          <img
            className="header__logo"
            // src="https://media.corporate-ir.net/media_files/IROL/17/176060/Oct18/Amazon%20logo.PNG"
            src="http://pngimg.com/uploads/amazon/amazon_PNG11.png"
            alt="amazon-logo"
          />
        )}

        {/* Navbar items */}

        {/* searchbar */}
      </Link>
      <div className="header__search">
        <input className="header__searchInput" type="text" />
        <SearchIcon className="header__searchIcon" />
      </div>

      <div className="header__nav">
        {/* navbar user signIn/signOut option */}
        <Link to={!user && "/login"} style={{ textDecoration: "none" }}>
          <div onClick={handleAuthentication} className="header__option">
            <span className="header__optionLineOne">
              Hello{" "}
              {/* displays user's email if user has logged in and email exists */}
              {/* displays Unauthorized if user has logged in and email does not exist */}
              {/* displays Guest if user has not logged in */}
              {user ? `${user?.email ? user?.email : "Unauthorized"}` : "Guest"}
            </span>
            <span className="header__optionLineTwo">
              {/* conditional rendering - renders signOut button if user has logged in otherwise renders signIn button */}
              {user ? "Sign Out" : "Sign In"}
            </span>
          </div>
        </Link>

        {/* navbar orders options */}

        {/* if user has logged in, display orders upon clicking this option otherwise redirect to home route */}
        <Link to={user ? "/orders" : "/"} style={{ textDecoration: "none" }}>
          <div className="header__option">
            <span className="header__optionLineOne">Returns</span>
            <span className="header__optionLineTwo">& Orders</span>
          </div>
        </Link>

        {/* if user has logged in, display prime subscription status otherwise redirect to home route */}
        <Link
          to={user ? "/amazonPrime" : "/"}
          style={{ textDecoration: "none" }}
        >
          <div className="header__option">
            <span className="header__optionLineOne">
              {/* if user has not logged in, display "Try prime" */}
              {/* if user has logged in and is not a prime user, display "Try prime" */}
              {/* if user has logged in and is a prime user, display "Your prime" */}
              {user ? (primeUser ? "Your" : "Try") : "Try"}
            </span>
            <span className="header__optionLineTwo">Prime</span>
          </div>
        </Link>

        {/* if user has logged in, display basket items otherwise redirect to login page */}
        <Link to="/checkout" style={{ textDecoration: "none" }}>
          <div className="header__OptionBasket">
            <ShoppingCartOutlinedIcon />
            <span className="header__optionLineTwo header__basketCount">
              {/* if user has logged in, display number of items in basket otherwise display the count as 0 */}
              {user ? basketItemsFromDB.length : 0}
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Header;
