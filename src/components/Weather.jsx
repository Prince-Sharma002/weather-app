import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style/weather.scss"
import ReactAnimatedWeather from "react-animated-weather"
import myLoc from "../assets/my_loc.png";
import { auth } from "../firebase-config";
import { signOut } from 'firebase/auth';

import mic from "../assets/mic.png";



const Weather = () => {
  const history = useNavigate();
  const [transcript, setTranscript] = useState("eg- weather in delhi, clouds in delhi...");
  const [listening, setListening] = useState(true);
  const [search, setSearch] = useState("ghaziabad");
  const [weather, setWeather] = useState({});
  const api = {
    key: "2438ecf57da1f65c942697fb24898b31",
    base: "https://api.openweathermap.org/data/2.5/",
  };

  const [icon , setIcon] = useState("");
  
    const [location, setLocation] = useState(null);
    const [userLocation, setUserLocation] = useState('');
    const [error, setError] = useState(null);
  
  useEffect(() => {
    if (listening) {
      startListening();
    } else {
      stopListening();
    }
  }, [listening , weather.wind , location]);
  
  useEffect(() => {
    if (search) {
      searchPressed();
    }

  }, [search , location]);
  

  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [formattedDate, setFormattedDate] = useState('');
  const [formattedTime, setFormattedTime] = useState('');
  const [timeState, setTimeState] = useState({ });
  
  const defaults = {
    color: "white",
    size: 40,
    animate: true,
  };



  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentDateTime(now);
      setFormattedDate(now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
      setFormattedTime(now.toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: 'numeric', second: 'numeric' }));
      
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  



    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ latitude, longitude });
            console.log(location)
          },
          (error) => {
            setError(error.message);
          }
        );
      } else {
        setError('Geolocation is not supported by your browser');
      }
    };





  const extractPlaceName = (sentence) => {
    const regex = /(?:what is weather in|weather in) ([\w\s]+)/i;
    const match = sentence.match(regex);
    if (match && match.length > 1) {
      setSearch(match[1].trim());
      setLocation(null);
      // speak(`there is ${weather.main.temp} degree celsius temperature and ${weather.weather[0].main} in ${weather.name} `)
    }
  };

  const startListening = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      const currentTranscript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      setTranscript(currentTranscript);

      
     extractPlaceName(currentTranscript); 

      if (currentTranscript.includes('wake up')) {
        speak('Hello sir!');
      }
        else if (currentTranscript.includes('home')) {
          history("/home");
      }
      else if(weather && currentTranscript.includes('wind')){
          speak(`wind speed is ${weather.wind.speed} kilometer per hour , in ${weather.wind.deg} degree`);
      }
      else if(weather && currentTranscript.includes('temperature')){
          speak(`temperature is ${weather.main.temp} degree celsius`);
      }
      else if(weather && currentTranscript.includes('humidity')){
          speak(`there is ${weather.main.humidity} percent humidity`);
      }
      else if(weather && ( currentTranscript.includes('clouds') || currentTranscript.includes('cloud') ) ){
          speak(`there is ${weather.clouds.all} percent clouds in the sky`);
      }
      else if(weather && (currentTranscript.includes('coordinates') || currentTranscript.includes('coordinate') || currentTranscript.includes('position') ) ){
          speak(`latitude ${weather.coord.lat},longitude ${weather.coord.lon}`);
      }
      else if(weather && ( currentTranscript.includes('air pressure') || currentTranscript.includes('pressure') ) ){
          speak(`air pressure is ${weather.main.pressure} from sea level`);
      }
      else if( currentTranscript.includes('time') ){
          speak(`its ${formattedTime} `);     
      }

    
    };
    recognition.start();
  };


  const speak = (message) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(message);
    synth.speak(utterance);
  };

  const stopListening = () => {
    // Stop the recognition instance
  };



  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setSearch(transcript);
      searchPressed();
      setLocation(null);
    }
  };

  const searchPressed = () => {

    console.log("loca" ,location)

    var loc = `${api.base}weather?q=${search}&units=metric&APPID=${api.key}`;

    if(location !== null)
    {
      loc = `${api.base}weather?&lat=${location.latitude}&lon=${location.longitude}&units=metric&APPID=${api.key}`
    }

    fetch(loc)
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        switch (result.weather[0].main) {
          case "Haze":
            setIcon("CLEAR_DAY");
            break;
          case "Clouds":
            setIcon("CLOUDY");
            break;
          case "Rain":
            setIcon("RAIN");
            break;
          case "Snow":
            setIcon("SNOW");
            break;
          case "Dust":
            setIcon("WIND");
            break;
          case "Drizzle":
            setIcon("SLEET");
            break;
          case "Fog":
            setIcon("FOG");
            break;
          case "Smoke":
            setIcon("FOG");
            break;
          case "Tornado":
            setIcon("WIND");
            break;
          default:
            setIcon("CLEAR_DAY");
        }
      
        setWeather(result);  
      });

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
    <div className="weather">
      <button className='signout' onClick={handleClick}>SignOut</button>
      <header className="App-header">
      {Object.keys(weather).length > 0 && (
          <div className="firstDiv">
            <button className="locButton" onClick={getLocation}> <img src={myLoc} /> </button>
            <p>{weather.name}</p>
            <p className="posDiv"> {weather.coord.lat} - {weather.coord.lon} </p>
            <div>
              <div>
                <p> {formattedTime} </p>
                <p> {formattedDate} </p>
              </div>
              <p>{Math.round(weather.main.temp)}°C</p>
            </div>
          </div>
      )}
          <div className="secDiv">
                <input
                  type="text"
                  placeholder="Enter city/town..."
                  onChange={(e) => setTranscript(e.target.value)}
                  onKeyPress={handleKeyPress}
                />

{/* <button onClick={searchPressed}> Find </button> */}
                
        
              {Object.keys(weather).length > 0 && (
                <div>
                  <div className="weatherDetails">
                    <p>{weather.weather[0].main}</p>
                    {/* <p>{weather.weather[0].description}</p> */}
                    <ReactAnimatedWeather
                      icon={icon}
                      color={defaults.color}
                      size={defaults.size}
                      animate={defaults.animate}
                    />
                  </div>

                  <div className="weatherDiv">
                    <p> Air Pressure </p>
                    <p>{weather.main.pressure} P</p>
                  </div>
                  <div className="weatherDiv">
                    <p> Wind </p>
                    <p> {weather.wind.speed }  km/h </p>
                  </div>
                  <div className="weatherDiv">
                    <p> Clouds </p>
                    <p>{weather.clouds.all} %</p>
                
                  </div>
                  <div className="weatherDiv">
                    <p> Humidity </p>
                    <p> {weather.main.humidity} %</p>
                    
                  </div>

                </div>
              )}
          </div>

      </header>
      {/* <div className="listenDiv">
        
          <p>{transcript}</p>
          <button onClick={() => setListening(!listening)}>
            {listening ? "Stop Listening" : "Start Listening"}
          </button>
      </div> */}

        <div className="listenDiv">
          <button onClick={() => setListening(!listening)}>
            <img src={mic} alt="mic" />
          </button>
          <div className={`sidebar ${!listening ? '' : 'open'}`}>
            <p className="trans">{transcript}</p>
            
          </div>
        </div>



    </div>
  );
};

export default Weather;
