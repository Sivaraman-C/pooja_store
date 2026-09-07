import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {

  const [cartItems, setCartItems] = useState(() => {

    try {

      const savedCart =
        localStorage.getItem("devaloka_cart");

      return savedCart
        ? JSON.parse(savedCart)
        : [];

    } catch (error) {

      console.error(
        "Cart loading error:",
        error
      );

      return [];

    }

  });


  // =========================
  // SAVE CART
  // =========================

  useEffect(() => {

    localStorage.setItem(
      "devaloka_cart",
      JSON.stringify(cartItems)
    );

  }, [cartItems]);


  // =========================
  // ADD TO CART
  // =========================

  const addToCart = (product) => {

    setCartItems((currentItems) => {

      const existingProduct =
        currentItems.find(
          (item) => item.id === product.id
        );

      if (existingProduct) {

        return currentItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item
        );

      }

      return [
        ...currentItems,
        {
          ...product,
          quantity: 1,
        },
      ];

    });

  };


  // =========================
  // INCREASE
  // =========================

  const increaseQuantity = (id) => {

    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity:
                item.quantity + 1,
            }
          : item
      )
    );

  };


  // =========================
  // DECREASE
  // =========================

  const decreaseQuantity = (id) => {

    setCartItems((items) =>
      items
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) => item.quantity > 0
        )
    );

  };


  // =========================
  // REMOVE
  // =========================

  const removeFromCart = (id) => {

    setCartItems((items) =>
      items.filter(
        (item) => item.id !== id
      )
    );

  };


  // =========================
  // CLEAR CART
  // =========================

  const clearCart = () => {

    setCartItems([]);

  };


  // =========================
  // CART COUNT
  // =========================

  const cartCount =
    cartItems.reduce(
      (total, item) =>
        total + Number(item.quantity),
      0
    );


  // =========================
  // CART TOTAL
  // =========================

  const cartTotal =
    cartItems.reduce(
      (total, item) =>
        total +
        Number(item.price) *
          Number(item.quantity),
      0
    );


  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );

};


export const useCart = () => {

  return useContext(CartContext);

};