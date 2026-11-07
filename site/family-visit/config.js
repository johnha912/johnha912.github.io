// Family Visit: the one file to change when switching between the local emulator and production.

export const firebaseConfig = {
  apiKey: "AIzaSyB0TMLYcQR3d1RZqolgSdYkMxb-S4dSVQI",
  authDomain: "family-visit-81a60.firebaseapp.com",
  projectId: "family-visit-81a60",
  storageBucket: "family-visit-81a60.firebasestorage.app",
  messagingSenderId: "955049061597",
  appId: "1:955049061597:web:6c0ac39d085fb5c00c3f34"
};

// Firebase JS SDK, loaded as ES modules from the official CDN (pinned).
export const FIREBASE_SDK_VERSION = "11.10.0";
export const FIREBASE_CDN = `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}`;

// "auto": the Local Emulator Suite when the page is served from localhost / 127.0.0.1,
// the live project everywhere else. Set to "emulator" or "production" to force one.
export const MODE = "auto";

// The emulator runs under its own demo project id, so emulator traffic can never reach live data.
export const EMULATOR = {
  host: "127.0.0.1",
  authPort: 9099,
  firestorePort: 8080,
  projectId: "demo-family-visit"
};

export function usingEmulator() {
  if (MODE === "emulator") return true;
  if (MODE === "production") return false;
  return location.hostname === "localhost" || location.hostname === "127.0.0.1";
}

// Family members, keyed by the SHA-256 (hex) of the lower-cased Google account email.
// Same list as firestore.rules; only hashes are stored, never the addresses.
const PRODUCTION_MEMBERS = {
  "00bf810ca0ed05688d618c2f2c3573d2a487887e22cee01a2caf6dfde925c9cd": "john",
  "5af8fd04c96a50555c327d02126e91e52a59cd61f25a455d892a1b45f3c3b654": "nickie",
  "f304080787bd9b5e0ae99b33853c52c2a952924a14d2e521ab765aaa9a54bcdb": "johnny"
};

// Fake accounts that exist only in the emulator tests (john@ / nickie@ / johnny@family-visit.test).
const EMULATOR_MEMBERS = {
  "9c1d7432556c04f6d7719c7668feca08499c525c6a4e4560b4bcbebc6a8b1a9d": "john",
  "dfc61e536649a239b02b69d21f2eaf89865ec52b20ba92e6b5847a4aa6812da9": "nickie",
  "ae408809dfc5edde365b799c025fb8f701a4802c06839aa68f68cee30d1366ea": "johnny"
};

export function memberTable() {
  return usingEmulator() ? EMULATOR_MEMBERS : PRODUCTION_MEMBERS;
}
