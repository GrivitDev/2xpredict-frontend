'use client';

import {
  createContext,
  useContext,
  useEffect,
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
  const [visible, setVisible] = useState(true);

  // ============================================================
  // NAVBAR SCROLL BEHAVIOUR
  // ============================================================

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;

      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        // Always show at the very top
        if (currentScrollY <= 20) {
          setVisible(true);
        }

        // Scrolling down
        else if (currentScrollY > lastScrollY) {
          setVisible(false);
        }

        // Scrolling up
        else if (currentScrollY < lastScrollY) {
          setVisible(true);
        }

        lastScrollY = currentScrollY;
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener(
        'scroll',
        handleScroll,
      );
    };
  }, []);

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
  return useContext(NavbarContext);
}