/* eslint-env browser */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker
      .register('/gina_web_app/expo-service-worker.js', { scope: '/gina_web_app/' })
      .then(function(info) {
        // console.info('Registered service-worker', info);
      })
      .catch(function(error) {
        console.info('Failed to register service-worker', error);
      });
  });
}
