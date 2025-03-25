// ViewToggleContext.jsx
import { createContext, useContext, useState } from 'react';

const ViewToggleContext = createContext();

export const ViewToggleProvider = ({ children }) => {
 const [viewMode, setViewMode] = useState('card');

 const toggleViewMode = (mode) => setViewMode(mode); // This must be a function

 return (
  <ViewToggleContext.Provider value={{ viewMode, toggleViewMode }}>
   {children}
  </ViewToggleContext.Provider>
 );
};

export const useViewToggle = () => useContext(ViewToggleContext);
