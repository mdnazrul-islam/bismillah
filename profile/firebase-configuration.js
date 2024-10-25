

const firebaseConfig = {
      apiKey: "AIzaSyD9B-Snpa2ME9vlADWpX5IPVrGpsSpQ4hw",
  authDomain: "bismilla-h.firebaseapp.com",
  databaseURL: "https://bismilla-h-default-rtdb.firebaseio.com",
  projectId: "bismilla-h",
  storageBucket: "bismilla-h.appspot.com",
  messagingSenderId: "377042653016",
  appId: "1:377042653016:web:885758cec76883f8581f2d"
    };



    const app = firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.database();
    const storage = firebase.storage();

    // Configuration for the second Firebase project
    const secondFirebaseConfig = {
      apiKey: "AIzaSyAOwQgpC4ebDiRpogM3AJMJBmjshS8DzNA",
      authDomain: "nazrul-islam1.firebaseapp.com",
      databaseURL: "https://nazrul-islam1-default-rtdb.firebaseio.com",
      projectId: "nazrul-islam1",
      storageBucket: "nazrul-islam1.appspot.com",
      messagingSenderId: "84306575668",
      appId: "1:84306575668:web:a35617eda51ec990932561"
      
    };

    const secondFirebaseApp = firebase.initializeApp(secondFirebaseConfig, "secondFirebaseApp"); // Name for the second app
    const secondStorage = firebase.storage(secondFirebaseApp); // Storage instance for the second app