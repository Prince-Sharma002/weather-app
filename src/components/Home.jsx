import React, { useState, useEffect } from 'react';
import { auth } from "../firebase-config";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from 'firebase/auth';
import axios from 'axios';
import "../style/home.scss"
import img from "../assets/WeatherIcons.gif";


const Home = () => {
  const history = useNavigate();
  const [location, setLocation] = useState(null);
  const [userLocation, setUserLocation] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ latitude, longitude });
            console.log(latitude)
          },
          (error) => {
            setError(error.message);
          }
        );
      } else {
        setError('Geolocation is not supported by your browser');
      }
    };

    getLocation();
  }, []);

  const handleContinue = () => {
    if (location) {
      const { latitude, longitude } = location;

      // Redirect to weather page with geolocation data
      history(`/weather?latitude=${latitude}&longitude=${longitude}`);
      
    } else {
      // Redirect to weather page with user-input location
      history(`/weather?location=${encodeURIComponent(userLocation)}`);
    }
  };

  const handleClick = () => {
    signOut(auth)
      .then(() => {
        console.log("User signed out successfully");
        history("/");
      })
      .catch(error => {
        console.error("Error signing out:", error);
      });
  };

  return (
    <div className='home'>
      <button className='signout' onClick={handleClick}>SignOut</button>
      <div className='container'>
        <img src={img} alt='location img' />
      </div>
      <p>Extracting your current location</p>
      <input
        type='text'
        placeholder='Enter Location'
        value={userLocation}
        onChange={(e) => setUserLocation(e.target.value)}
      />
      <button className='continue' onClick={handleContinue}>Continue</button>
    </div>
  )
}

export default Home;
