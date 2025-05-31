export const authenticate = (data, next) => {
  if (window !== "undefined") {
    sessionStorage.setItem("token", JSON.stringify(data.token));
    sessionStorage.setItem("user", JSON.stringify(data.user));
  }
  next();
};

export const getToken = () => {
  if (window !== "undefined") {
    if (sessionStorage.getItem("token")) {
      return JSON.parse(sessionStorage.getItem("token"));
    } else {
      return false;
    }
  }
};

export const getUser = () => {
  if (typeof window !== "undefined") {
    const user = sessionStorage.getItem("user");

    // Check if the 'user' exists in sessionStorage and is a valid JSON string
    if (user) {
      try {
        return JSON.parse(user); // Parse the user data if it exists
      } catch (error) {
        console.error("Error parsing user from sessionStorage:", error);
        return false;
      }
    } else {
      return false; // Return false if user does not exist
    }
  }
};

export const logout = (next) => {
  if (window !== "undefined") {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  }
  if (next && typeof next === "function") {
    next();
  }
};