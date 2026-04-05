// Authentication Service - Ready for Firebase Auth integration

// Mock user data (replace with Firebase Auth later)
const mockUsers = [
  {
    id: '1',
    email: 'admin@fluxone.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin'
  }
];

let currentUser = null;

// Authentication functions
export const login = async (email, password) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const user = mockUsers.find(u => u.email === email && u.password === password);
  
  if (user) {
    currentUser = { ...user };
    delete currentUser.password; // Remove password from user object
    localStorage.setItem('fluxone_user', JSON.stringify(currentUser));
    return { success: true, user: currentUser };
  }
  
  return { success: false, error: 'Invalid email or password' };
};

export const logout = () => {
  currentUser = null;
  localStorage.removeItem('fluxone_user');
  return { success: true };
};

export const getCurrentUser = () => {
  if (currentUser) {
    return currentUser;
  }
  
  // Check localStorage for persisted session
  const storedUser = localStorage.getItem('fluxone_user');
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
    return currentUser;
  }
  
  return null;
};

export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

export const requireAuth = () => {
  if (!isAuthenticated()) {
    return false;
  }
  return true;
};

// For future Firebase integration
export const signUp = async (email, password, name) => {
  // This would integrate with Firebase Auth
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check if user already exists
  const existingUser = mockUsers.find(u => u.email === email);
  if (existingUser) {
    return { success: false, error: 'User already exists' };
  }
  
  // Create new user (in real app, this would be Firebase)
  const newUser = {
    id: Date.now().toString(),
    email,
    password,
    name,
    role: 'user'
  };
  
  mockUsers.push(newUser);
  
  return { success: true, user: { ...newUser, password: undefined } };
};

export const resetPassword = async (email) => {
  // This would send password reset email via Firebase
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const user = mockUsers.find(u => u.email === email);
  if (user) {
    return { success: true, message: 'Password reset link sent to your email' };
  }
  
  return { success: false, error: 'Email not found' };
};
