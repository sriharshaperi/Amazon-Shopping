import React, { useEffect, useState } from "react";
import "./Home.css";
import Product from "./Product";
import { products } from "./productsData"; //products json object data

const Home = () => {
  return (
    <div className="home">
      <div className="home__container">
        {/* home wallpaper */}
        <img
          className="home__image"
          src="https://store-images.s-microsoft.com/image/apps.16285.14618985536919905.552c0017-6644-49a8-8467-8f7b34ce0428.30ad6b05-16d9-4d5e-a242-43107708a16a?mode=scale&q=90&h=1080&w=1920"
          alt=""
        />

        {/* display data container */}

        {/* container row  */}
        <div className="home__row">
          {/* displaying a maximum of 4 products in a row */}
          {products
            .filter((product) => product.id < 4)
            .map((product) => (
              <Product
                id={product.id}
                title={product.title}
                image={product.image}
                rating={Math.floor(Math.random() * 5)}
                price={product.price}
              />
            ))}
        </div>

        {/* container row  */}
        <div className="home__row">
          {/* displaying a maximum of 4 products in a row */}
          {products
            .filter((product) => product.id >= 4 && product.id < 8)
            .map((product) => (
              <Product
                id={product.id}
                title={product.title}
                image={product.image}
                rating={Math.floor(Math.random() * 5)}
                price={product.price}
              />
            ))}
        </div>

        {/* container row  */}
        <div className="home__row">
          {/* displaying a maximum of 4 products in a row */}
          {products
            .filter((product) => product.id >= 8 && product.id < 12)
            .map((product) => (
              <Product
                id={product.id}
                title={product.title}
                image={product.image}
                rating={Math.floor(Math.random() * 5)}
                price={product.price}
              />
            ))}
        </div>

        {/* container row  */}
        <div className="home__row">
          {/* displaying a maximum of 4 products in a row */}
          {products
            .filter((product) => product.id >= 12 && product.id < 16)
            .map((product) => (
              <Product
                id={product.id}
                title={product.title}
                image={product.image}
                rating={Math.floor(Math.random() * 5)}
                price={product.price}
              />
            ))}
        </div>

        {/* container row  */}
        <div className="home__row">
          {/* displaying a maximum of 4 products in a row */}
          {products
            .filter((product) => product.id >= 16 && product.id < 20)
            .map((product) => (
              <Product
                id={product.id}
                title={product.title}
                image={product.image}
                rating={Math.floor(Math.random() * 5)}
                price={product.price}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
