import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { auth, db } from "./firebase";
import "./Login.css";
import { useStateValue } from "./StateProvider";

const Login = () => {
  const [{}, dispatch] = useStateValue();

  //useHistory() to redirect to routes
  const history = useHistory();

  //initialize state for email input
  const [email, setEmail] = useState("");
  //initialize state for password input
  const [password, setPassword] = useState("");

  //fires once per component mount
  useEffect(() => {
    //this event fires on auth state change - signIn/signOut event
    auth.onAuthStateChanged((authUser) => {
      console.log("User is ", authUser);

      if (authUser) {
        //user has logged in/ state is maintained

        //dispatching/pushing user state to data layer
        dispatch({
          type: "SET_USER",
          user: authUser,
        });
      } else {
        //user has logged out

        //dispatching/pushing user state to data layer
        dispatch({
          type: "SET_USER",
          user: null,
        });
      }
    });
  }, []);

  //this event fires on user signIn
  const signIn = (event) => {
    //sign in the user
    event.preventDefault();

    //signIn user with email and password
    auth
      .signInWithEmailAndPassword(email, password)
      .then((authUser) => {
        if (authUser) history.push("/");
      })
      .catch((error) => alert(error.message));
  };

  //this event fires on user registering up
  const register = (event) => {
    //sign in the user
    event.preventDefault();

    //registering user with email and password
    auth
      .createUserWithEmailAndPassword(email, password)
      .then((authUser) => {
        if (authUser) history.push("/");
      })
      .catch((error) => alert(error.message));
  };

  return (
    <div className="login">
      {/* route to home */}
      <Link to="/">
        <img
          className="login__logo"
          src="https://www.zencoreproducts.com/images/amazon_logo_RGB-1000x458.jpg"
          alt=""
        />
      </Link>

      <div className="login__container">
        <h1>Sign In</h1>

        <form>
          <h5>E-mail</h5>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <h5>Password</h5>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="login__signInButton"
            onClick={signIn}
          >
            Sign In
          </button>
        </form>
        <p>
          By signing-in, you agree to Amazon's conditions of use and sale.
          Please see our Privacy Notice, our Cookies Notice and Interest-Based
          Ads and Notice.{" "}
        </p>

        <button className="login__registerButton" onClick={register}>
          Create your Amazon account here
        </button>
      </div>
    </div>
  );
};

export default Login;
