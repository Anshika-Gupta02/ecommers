import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { CartProvider } from './context/CartContext';
import AppContent from './AppContent';

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;
