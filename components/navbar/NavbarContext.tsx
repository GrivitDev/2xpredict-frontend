'use client';

import { createContext, useContext } from 'react';

interface NavbarContextType {
  visible: boolean;
  setVisible: (value: boolean) => void;
}

const NavbarContext = createContext<NavbarContextType>({
  visible: true,
  setVisible: () => undefined,
});

/** Kept for compatibility with existing imports. The navbar no longer hides on scroll. */
export function NavbarProvider({ children }: { children: React.ReactNode }) {
  return (
    <NavbarContext.Provider value={{ visible: true, setVisible: () => undefined }}>
      {children}
    </NavbarContext.Provider>
  );
}

export function useNavbar() {
  return useContext(NavbarContext);
}
