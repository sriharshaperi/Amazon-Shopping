import "./App.css";
import Header from "./Header";
import Home from "./Home";
import { Route, Switch } from "react-router-dom";
import Checkout from "./Checkout";
import Login from "./Login";
import Payment from "./Payment";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import Orders from "./Orders";
import AmazonPrime from "./AmazonPrime";
import PageNotFound from "./PageNotFound";
require("dotenv").config();

const App = () => {
  const promise = loadStripe(process.env.STRIPE_API_KEY);

  return (
    // main component
    <div className="app">
      {/* routes */}
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/checkout">
          <Header />
          <Checkout />
        </Route>
        <Route path="/payment">
          <Header />

          {/* Elements component wrapped over rendered component to let access to payment gateway in placing order */}
          <Elements stripe={promise}>
            <Payment />
          </Elements>
        </Route>
        <Route path="/amazonPrime">
          <Header />

          {/* Elements component wrapped over rendered component to let access to payment gateway in prime subscription */}
          <Elements stripe={promise}>
            <AmazonPrime />
          </Elements>
        </Route>
        <Route path="/orders">
          <Header />
          <Orders />
        </Route>

        {/* root route */}
        <Route exact path="/">
          <Header />
          <Home />
        </Route>

        {/* 404 - Page Not found */}
        <Route>
          <Header />
          <PageNotFound />
        </Route>
      </Switch>
    </div>
  );
};

export default App;
