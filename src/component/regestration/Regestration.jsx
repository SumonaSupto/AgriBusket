import React from 'react';
import "./Regestration"
const Regestration = () => {
    return (
        <>
        <div class="wrapper">
    <form action="">
      <h1>Sign Up</h1>
      
      <div class="input-box">
        <input type="text" placeholder="First Name" required/>
      </div>
      <div class="input-box">
        <input type="text" placeholder="Last Name" required/>
        </div>
      <div class="input-box">
        <input type="text" placeholder="Username" required/>
        <i class="fa-solid fa-user"></i>
      </div>
      <div class="input-box">
        <input type="password" placeholder="Password" required/>
        <i class="fa-solid fa-lock"></i>
       </div>
      <div class="input-box">
        <input type="password" placeholder="Confirm Password" required/> 
        <i class="fa-solid fa-shield-halved"></i>
      </div>
      
      <button type="submit" class="btn">Register Now</button>
      <div class="register-link">
        <p>Already have an account? <a href="#">Login</a></p>
      </div>
    </form>
  </div>
        </>
    );
};

export default Regestration;