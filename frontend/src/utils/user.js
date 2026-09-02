export function getCurrentUser() {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const rawName = user.username || user.name || (user.email ? user.email.split('@')[0] : 'Investor');
      
      // Get the first word of the username
      const firstWord = rawName.trim().split(/\s+/)[0] || 'Investor';
      
      // Capitalize first letter properly (e.g. tanish -> Tanish)
      const firstName = firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
      
      // Initial letter for the avatar circle (e.g. 'T')
      const initial = firstName.charAt(0).toUpperCase();

      return { firstName, initial, rawName, email: user.email || '' };
    }
  } catch (e) {
    console.error('Failed to parse user from localStorage:', e);
  }
  return { firstName: 'Investor', initial: 'I', rawName: 'Investor', email: '' };
}
