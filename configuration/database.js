import firebase from 'firebase'
require("firebase/firestore")

const firebaseConfig = {
    apiKey: "API_KEY",
    authDomain: "AUTH_DOMAIN",
    projectId: "PROJECT_ID"
}

firebase.initializeApp(firebaseConfig)
let database = firebase.firestore()

// Disable deprecated features
database.settings({
    timestampsInSnapshots: true
});

export const db = database
