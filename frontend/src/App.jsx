import React from 'react';
import { Analytics } from '@vercel/analytics/react';
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
            <Analytics />
          </CartProvider>
        </CurrencyProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
