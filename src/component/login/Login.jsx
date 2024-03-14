import React from 'react';
import "./Login.css"
const Login = () => {
    return (
        <>
        <div class="wrapper">
    <form action="">
      <h1>Login</h1>
      <div class="input-box">
        <input type="text" placeholder="Username" required/>
        <i class="fa-solid fa-user"></i>
      </div>
      <div class="input-box">
        <input type="password" placeholder="Password" required/>
        <i class="fa-solid fa-lock"></i>
      </div>
      <div class="remember-forgot">
        <label><input type="checkbox"/>Remember Me</label>
        <a href="#">Forgot Password</a>
      </div>
      <button type="submit" class="btn">Login</button>
      <div class="register-link">
        <p>Dont have an account? <a href="#">Register</a></p>
      </div>
    </form>
  </div>
        </>
    );
};

export default Login;