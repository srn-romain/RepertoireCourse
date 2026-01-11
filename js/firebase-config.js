const firebaseConfig = {
    apiKey: "AIzaSyAQl3f8x9uafRTFIDvf6WtZPbjZtPbzU9M",
    authDomain: "macollectiondecourses.firebaseapp.com",
    projectId: "macollectiondecourses",
    storageBucket: "macollectiondecourses.firebasestorage.app",
    messagingSenderId: "749698169073",
    appId: "1:749698169073:web:a3e784c97af0151eb49150"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
