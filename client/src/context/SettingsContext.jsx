import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const DEFAULT_SETTINGS = {
  businessName: 'Rathore Electronics',
  ownerName: 'Mahendra Rathore',
  address: 'Main Bus Stand, Atari Khejda, Vidisha, Madhya Pradesh',
  primaryPhone: '8435930113',
  secondaryPhone: '7067586087',
  whatsappNumber: '8435930113',
  email: 'support@rathoreelectronics.com',
  upiId: '8435930113@upi',
  upiQrImage: '',
  advanceAmount: 200,
  currency: 'INR'
};

const SettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  loading: true,
  refreshSettings: async () => {}
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await API.get('/settings');
      if (res.data?.settings) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...res.data.settings
        });
      }
    } catch (err) {
      console.warn('Using default business settings fallback:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings, updateLocalSettings: (s) => setSettings(prev => ({ ...prev, ...s })) }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
