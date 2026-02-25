/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react';

export const PROFILES = [
  { id: 'andrea',   name: 'Andrea',   color: '#003399', initial: 'A' },
  { id: 'caterina', name: 'Caterina', color: '#9c0000', initial: 'C' },
  { id: 'pippo',    name: 'Pippo',    color: '#1a7a3c', initial: 'P' },
];

const ProfileContext = createContext(null);

export const ProfileProvider = ProfileContext.Provider;

export const useProfile = () => useContext(ProfileContext);
