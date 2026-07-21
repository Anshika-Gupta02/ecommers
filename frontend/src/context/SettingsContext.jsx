import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_URL } from './AuthContext';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    store_name: "ANSHIKA'S STORE",
    logo_url: "",
    tagline: "Luxury Linens & Home Comfort",
    contact_email: "support@anshikastore.com",
    phone: "+1 (800) 555-0199",
    address: "742 Botanical Way, Suite 400, New York, NY 10013"
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/settings`);
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        if (data.store_name) {
          document.title = `${data.store_name} | ${data.tagline || 'E-Commerce Store'}`;
        }
      }
    } catch (err) {
      console.error('Failed to load store settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (updatedData, token) => {
    try {
      const res = await fetch(`${API_URL}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update store settings');
      }

      setSettings(data.settings);
      if (data.settings?.store_name) {
        document.title = `${data.settings.store_name} | ${data.settings.tagline || 'E-Commerce Store'}`;
      }
      return data.settings;
    } catch (err) {
      console.error('Error updating settings:', err);
      throw err;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, fetchSettings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
