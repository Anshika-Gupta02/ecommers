import React, { createContext, useState, useContext, useEffect } from 'react';

const CurrencyContext = createContext();

export const currencies = {
  USD: { symbol: '$', rate: 1, name: 'USD' },
  EUR: { symbol: '€', rate: 0.92, name: 'EUR' },
  GBP: { symbol: '£', rate: 0.78, name: 'GBP' },
  INR: { symbol: '₹', rate: 83.5, name: 'INR' },
  COP: { symbol: 'Col$', rate: 4000, name: 'COP' }
};

export function CurrencyProvider({ children }) {
  const [selectedCurrency, setSelectedCurrency] = useState(
    localStorage.getItem('selected_currency') || 'USD'
  );

  useEffect(() => {
    localStorage.setItem('selected_currency', selectedCurrency);
  }, [selectedCurrency]);

  const currency = currencies[selectedCurrency] || currencies.USD;

  // Converts USD price to selected currency and formats it
  const formatPrice = (priceInUSD) => {
    const converted = Number(priceInUSD) * currency.rate;
    return `${currency.symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const value = {
    selectedCurrency,
    setSelectedCurrency,
    currency,
    formatPrice,
    currencies
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
