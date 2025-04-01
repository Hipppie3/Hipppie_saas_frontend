import { createContext, useContext, useState, useEffect } from 'react';
import api from '@api';

const ViewToggleContext = createContext();

export const ViewToggleProvider = ({ children }) => {
 const [viewMode, setViewMode] = useState('table');

 useEffect(() => {
  const fetchViewMode = async () => {
   try {
    const res = await api.get('/api/preferences/view-mode', { withCredentials: true });
    setViewMode(res.data.viewMode);
   } catch (err) {
    console.error('Error fetching view mode:', err);
   }
  };
  fetchViewMode();
 }, []);

 const toggleViewMode = async (mode) => {
  setViewMode(mode);
  try {
   await api.post('/api/preferences/view-mode', { viewMode: mode }, { withCredentials: true });
  } catch (err) {
   console.error('Error saving view mode:', err);
  }
 };

 return (
  <ViewToggleContext.Provider value={{ viewMode, toggleViewMode }}>
   {children}
  </ViewToggleContext.Provider>
 );
};

export const useViewToggle = () => useContext(ViewToggleContext);
