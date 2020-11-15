import React from "react";
import { Link, useHistory } from "react-router-dom";
import "./PageNotFound.css";

function PageNotFound() {
  const history = useHistory();
  return (
    <div className="pagenotfound">
      {/* logo on error page */}
      <img
        className="pagenotfound__logo"
        src="https://lahardanfinancial.com/wp-content/uploads/2019/04/amazon-cfr.jpg"
        alt="go__home"
      />
      <h1>Oops...That's 404</h1>
      <h3 className="description">Try again with a valid url</h3>
      <Link to="/" className="go__home">
        <p>Go Home</p>
      </Link>
    </div>
  );
}

export default PageNotFound;
