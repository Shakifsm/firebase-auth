import './App.css';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
import { useState } from 'react';



if(!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

function App() {
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignedIn : false,
    name : "",
    email : "",
    photo : ""
  })

  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();
  const handleSingIn = () => {
    firebase.auth().signInWithPopup(googleProvider)
    .then(res => {
      const {displayName, email, photoURL} = res.user;
      const signedInUser = {
        isSignedIn : true,
        name : displayName,
        email : email,
        password : "",
        photo : photoURL
      } 
      setUser(signedInUser)
    })
    .catch(err => {
      console.log(err);
      console.log(err.message);
    })
  }

  const handleFbSignIn = () => {
    firebase
    .auth()
    .signInWithPopup(fbProvider)
    .then((result) => {
      /** @type {firebase.auth.OAuthCredential} */
      var credential = result.credential;

      // The signed-in user info.
      var user = result.user;
      console.log("fb user", user);

      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var accessToken = credential.accessToken;

      // ...
    })
    .catch((error) => {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;

      // ...
    });
  }

  const handleSignOut = () => {
    firebase.auth().signOut()
    .then(res => {
      const signedOutUser = {
        isSignedIn : false,
        name : "",
        email : "",
        photo : "",
        error : "",
        success : false
      }
      setUser(signedOutUser)
    })
    .catch(err => {

    })
  }

  const handleBlur = (e) => {
    // console.log(e.target.name, e.target.value);
    let isFormValid;
    if(e.target.name === "email"){
      const re = /\S+@\S+\.\S+/;
      isFormValid = re.test(e.target.value);
    }
    if(e.target.name === "password"){
      const isPasswordValid = e.target.value.length >= 6;
      const reg = /\d{1}/;
      const passwordHasNumber = reg.test(e.target.value);

      isFormValid = isPasswordValid && passwordHasNumber;
    }
    if(isFormValid){
      const newUserInfo = {...user};
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo);
    }
  }

  const handleSubmit = (e) => {
    if(newUser && user.email && user.password){
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
  //     .then((userCredential) => {
  //   // Signed in 
  //     var user = userCredential.user;
  //   // ...
  // })
      .then(res => {
        const newUserInfo = {...user};
        newUserInfo.error = "";
        newUserInfo.success = true;
        setUser(newUserInfo);
        updateUserInfo(user.name);

      })
      .catch((error) => {
        const newUserInfo = {...user};
        newUserInfo.error = error.message;
        newUserInfo.success = false;
        setUser(newUserInfo);
      // ..
  });
    }

    if(!newUser && user.email && user.password){
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
  //       .then((userCredential) => {
  //   // Signed in
  //       var user = userCredential.user;
  //   // ...
  // })
        .then(res => {
          const newUserInfo = {...user};
          newUserInfo.error = "";
          newUserInfo.success = true;
          setUser(newUserInfo);
          console.log("Sign in user imfo", res.user);
        })
        .catch((error) => {
          const newUserInfo = {...user};
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
    });
    }

    e.preventDefault();
  }

  const updateUserInfo = name => {
    const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name,
    }).then(function() {
      console.log("User name updated successfully")
    }).catch(function(error) {
      console.log(error);
    });
  }

  return (
    <div className="App">
      <header className="App-header">
          {
            user.isSignedIn ? <button onClick={handleSignOut}>Sign Out</button> 
            : <button onClick={handleSingIn}>Sign In</button>
          }
          <br/>
          <button onClick={handleFbSignIn}>Sign in using Facebook</button>
          {
            user.isSignedIn && <div>
              <p>Welcome : {user.name}</p>
              <img src={user.photo} alt=""/>
            </div>
          }
          <h1>Our Own Authentication</h1>
          <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id=""/>
          <label htmlFor="newUser">New User Sign Up</label>
          <form onSubmit={handleSubmit}>
            { newUser && <input onBlur={handleBlur} type="text" placeholder="Enter Your Name"/>}
            <br/>
            <input onBlur={handleBlur} type="text" name="email" placeholder="Enter Your Email" required/>
            <br/>
            <input onBlur={handleBlur} type="password" name="password" placeholder="Enter Your Password" required/>
            <br/>
            <input type="submit" value="Submit"/>
          </form>
          <p style={{color:"red"}}>{user.error}</p>
          {user.success && <p style={{color:"green"}}>User { newUser ? "Created" : "logged In" } Successfully</p>}
      </header>
    </div>
  );
}

export default App;
