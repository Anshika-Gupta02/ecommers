import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth, API_URL } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { token, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync cart when authentication status or token changes
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchDBCart();
    } else {
      // Load guest cart from localStorage
      const guestCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
      setCartItems(guestCart);
    }
  }, [token, isAuthenticated]);

  // Save guest cart to localStorage when it changes (only for guests)
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('guest_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  // Fetch cart from MySQL DB via API
  const fetchDBCart = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCartItems(data);
      }
    } catch (err) {
      console.error('Error fetching DB cart:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add Item
  const addToCart = async (product, size, quantity = 1) => {
    if (isAuthenticated && token) {
      try {
        const res = await fetch(`${API_URL}/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            product_id: product.id,
            selected_size: size,
            quantity
          })
        });
        if (res.ok) {
          await fetchDBCart();
          setCartOpen(true); // Open drawer on addition
        }
      } catch (err) {
        console.error('Error adding to DB cart:', err);
      }
    } else {
      // Guest local storage addition
      setCartItems(prevItems => {
        const existingIdx = prevItems.findIndex(
          item => item.product_id === product.id && item.selected_size === size
        );

        if (existingIdx > -1) {
          const updated = [...prevItems];
          updated[existingIdx].quantity += quantity;
          return updated;
        } else {
          return [
            ...prevItems,
            {
              id: Date.now(), // Local guest ID
              product_id: product.id,
              name: product.name,
              price: product.price,
              selected_size: size,
              quantity,
              primary_image: product.primary_image || (product.images && product.images[0]?.image_url)
            }
          ];
        }
      });
      setCartOpen(true);
    }
  };

  // Update Quantity
  const updateQuantity = async (itemId, newQty) => {
    if (newQty <= 0) return;

    if (isAuthenticated && token) {
      try {
        const res = await fetch(`${API_URL}/cart/${itemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ quantity: newQty })
        });
        if (res.ok) {
          await fetchDBCart();
        }
      } catch (err) {
        console.error('Error updating DB cart qty:', err);
      }
    } else {
      setCartItems(prevItems =>
        prevItems.map(item => (item.id === itemId ? { ...item, quantity: newQty } : item))
      );
    }
  };

  // Remove Item
  const removeFromCart = async (itemId) => {
    if (isAuthenticated && token) {
      try {
        const res = await fetch(`${API_URL}/cart/${itemId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          await fetchDBCart();
        }
      } catch (err) {
        console.error('Error removing from DB cart:', err);
      }
    } else {
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    }
  };

  // Merge Guest Cart to DB Cart upon login
  const mergeCartOnLogin = async () => {
    const guestCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
    if (guestCart.length === 0) return;

    try {
      for (const item of guestCart) {
        await fetch(`${API_URL}/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            product_id: item.product_id,
            selected_size: item.selected_size,
            quantity: item.quantity
          })
        });
      }
      localStorage.removeItem('guest_cart');
      await fetchDBCart();
    } catch (err) {
      console.error('Error merging guest cart to DB:', err);
    }
  };

  // Trigger merge when user logs in
  useEffect(() => {
    if (isAuthenticated && token) {
      mergeCartOnLogin();
    }
  }, [isAuthenticated]);

  const clearCartState = () => {
    setCartItems([]);
    if (!isAuthenticated) {
      localStorage.removeItem('guest_cart');
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);

  const value = {
    cartItems,
    cartOpen,
    setCartOpen,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCartState,
    cartCount,
    cartTotal,
    refreshCart: fetchDBCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
