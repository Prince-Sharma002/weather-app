import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase-config';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import '../style/login.scss';

const Login = () => {
  const [login, setLogin] = useState(false);
  const history = useNavigate();
  const [error, setError] = useState(null);
  const [userLocation , setUserLocation ] = useState(null);

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation(`${latitude}, ${longitude}`);
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
  }, []); // Empty dependency array to ensure this runs only once on component mount

  const handleSubmit = (e, type) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    if (type === 'signin') {
      createUserWithEmailAndPassword(auth, email, password)
        .then((result) => {
          try {
            const ref = doc(db, 'userinfo', result.user.uid);
            const docRef = setDoc(ref, {
              name: '',
              email : email,
              // location: userLocation,
              // password: password,
            });
            alert('Welcome! New user created successfully');
            console.log('Document written with ID: ', docRef.id);
            history('/weather');
          } catch (e) {
            console.error('Error adding document: ', e);
          }
        })
        .catch((err) => {
          alert(err.code);
          setLogin(true);
        });
    } else {
      signInWithEmailAndPassword(auth, email, password)
        .then((data) => {
          console.log('signin');
          history('/weather');
        })
        .catch((err) => {
          alert(err.code);
        });
    }
  };

  return (
    <div className='login'>
      <form onSubmit={e => handleSubmit(e, !login ? 'signin' : 'signup')}>
        <h1>SignIn/SignUp</h1>
        <input name="email" placeholder="Email" />
        <input name="password" type="password" placeholder="Password" />
        <button>{login ? 'Sign In' : 'Sign Up'}</button>
      </form>
    </div>
  );
};

export default Login;
