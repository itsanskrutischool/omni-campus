'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface TenantSettings {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | null;
}

interface TenantContextType {
  tenantId: string | null;
  settings: TenantSettings | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const defaultSettings: TenantSettings = {
  primaryColor: '#0f172a',
  secondaryColor: '#64748b',
  logoUrl: null
};

export const TenantProvider = ({ 
  children, 
  tenantId,
  initialSettings 
}: { 
  children: React.ReactNode; 
  tenantId: string;
  initialSettings?: TenantSettings;
}) => {
  const [settings, setSettings] = useState<TenantSettings>(initialSettings || defaultSettings);

  useEffect(() => {
    // Inject dynamic styles into the document
    if (settings) {
      document.documentElement.style.setProperty('--primary', settings.primaryColor);
      document.documentElement.style.setProperty('--primary-foreground', '#ffffff');
    }
  }, [settings]);

  return (
    <TenantContext.Provider value={{ tenantId, settings }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
