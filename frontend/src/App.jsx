import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { CartProvider } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';
import AppContent from './AppContent';

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <CurrencyProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </CurrencyProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
