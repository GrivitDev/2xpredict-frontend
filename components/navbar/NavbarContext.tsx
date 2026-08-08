'use client';

import {
  createContext,
  useContext,
  useState,
} from 'react';

interface NavbarContextType {
  visible: boolean;
  setVisible: (value: boolean) => void;
}

const NavbarContext =
  createContext<NavbarContextType>({
    visible: true,
    setVisible: () => {},
  });

export function NavbarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [visible, setVisible] =
    useState(true);

  return (
    <NavbarContext.Provider
      value={{
        visible,
        setVisible,
      }}
    >
      {children}
    </NavbarContext.Provider>
  );
}

export function useNavbar() {
  return useContext(
    NavbarContext,
  );
}