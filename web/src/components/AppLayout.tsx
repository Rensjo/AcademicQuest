import React from 'react';
import { useTheme } from '@/store/theme';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  
  // Apply theme settings to document
  React.useEffect(() => {
    // Apply dark mode class to root HTML element
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme.mode === 'dark' || (theme.mode === 'system' && prefersDark);
    document.documentElement.classList.toggle('dark', isDark);
    
    // Apply font family to body
    const fontMap: Record<string, string> = {
      'Inter': "'Inter', ui-sans-serif, system-ui, sans-serif",
      'Poppins': "'Poppins', ui-sans-serif, system-ui, sans-serif",
      'Nunito': "'Nunito', ui-sans-serif, system-ui, sans-serif",
      'Outfit': "'Outfit', ui-sans-serif, system-ui, sans-serif", 
      'Roboto': "Roboto, ui-sans-serif, system-ui, sans-serif",
      'Lato': "Lato, ui-sans-serif, system-ui, sans-serif",
      'Montserrat': "Montserrat, ui-sans-serif, system-ui, sans-serif",
      'Source Sans 3': "'Source Sans 3', ui-sans-serif, system-ui, sans-serif"
    };
    
    document.body.style.fontFamily = fontMap[theme.font] || fontMap['Inter'];
  }, [theme.mode, theme.font]);

  return <>{children}</>;
}