
// This script runs before React hydration to set the initial theme
export const themeScript = `
  (function() {
    try {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-mode');
      }
    } catch (e) {
      console.error('Theme initialization failed:', e);
    }
  })();
`;
