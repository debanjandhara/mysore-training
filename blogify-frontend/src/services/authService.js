
/**
 * Mock Auth Service
 * Simulates async API calls with a delay.
 */

export const authService = {
  login: async (credentials) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Basic fake validation
        if (credentials.email === "test@example.com" && credentials.password === "password") {
          resolve({
            success: true,
            user: {
              id: 1,
              name: "Test User",
              email: "test@example.com",
              token: "fake-jwt-token",
            },
            message: "Login successful!",
          });
        } else {
          reject({
            success: false,
            message: "Invalid email or password.",
          });
        }
      }, 1500); // 1.5s simulated delay
    });
  },

  register: async (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Basic fake validation
        if (userData.email === "exists@example.com") {
          reject({
            success: false,
            message: "Email already registered.",
          });
        } else {
          resolve({
            success: true,
            user: {
              id: Date.now(),
              name: userData.name,
              email: userData.email,
              token: "fake-jwt-token-new",
            },
            message: "Registration successful! You can now log in.",
          });
        }
      }, 1500); // 1.5s simulated delay
    });
  },
};
