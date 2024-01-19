<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('{% static "registerApp/sw.js" %}')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Error registering Service Worker:', error);
      });
  }
</script>
