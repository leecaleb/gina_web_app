import Constants from 'expo-constants';

// export const prodUrl = "https://someapp.herokuapp.com";

// const ENV = {
//   dev: {
//     apiUrl: "http://localhost:3000"
//   },
//   staging: {
//     apiUrl: prodUrl
//   },
//   prod: {
//     apiUrl: prodUrl
//   }
// };

function getEnvVars(env = "") {
  if (env === null || env === undefined || env === "") return "prod";
  if (env.indexOf("dev") !== -1) return "prod";
  if (env.indexOf("staging") !== -1) return "staging";
  if (env.indexOf("prod") !== -1) return "prod";
}

export default getEnvVars(Constants.manifest.releaseChannel);
