import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Customize from "./pages/Customize";
import { userDataContext } from "./context/userContext";
import { Navigate } from "react-router-dom";

function App() {
  const { userData, setUserData } = useContext(userDataContext);
  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={
            userData?.assistantImage && userData?.assistantName ? (
              <Home />
            ) : (
              <Navigate to="/customize" />
            )
          }
        />
        <Route
          path="/signup"
          element={!userData ? <SignUp /> : <Navigate to="/" />}
        />
        <Route
          path="/signin"
          element={!userData ? <SignIn /> : <Navigate to="/" />}
        />
        <Route
          path="/customize"
          element={userData ? <Customize /> : <Navigate to="/signin" />}
        />
      </Routes>
    </div>
  );
}

export default App;
