// a   url (naming it a, because it will be reused to store callbacks)
// xhr placeholder to avoid using var, not to be used
function pegasus(a, xhr) {
  xhr = new XMLHttpRequest();

  // Open url
  xhr.open('GET', a);

  // Reuse a to store callbacks
  a = [];

  // onSuccess handler
  // onError   handler
  // cb, data  placeholder to avoid using var, should not be used
  xhr.onreadystatechange = xhr.then = function(onSuccess, onError, cb, data) {

    // Test if onSuccess is a function
    if (onSuccess && onSuccess.call) a = [,onSuccess, onError];

    // Test if request is complete
    if (xhr.readyState == 4) {

      // index will be:
      // 0 if undefined
      // 1 if status is between 200 and 399
      // 2 if status is over
      cb = a[0|xhr.status / 200];

      // Safari doesn't support xhr.responseType = 'json'
      // so the response is parsed
      if (cb) {
        try {
          data = JSON.parse(xhr.responseText)
        } catch (e) {
          data = null
        }
        cb(data, xhr);
      }
    }
  };
  xhr.setRequestHeader("Origin", "file:///C:/Users/Maaike/Documents/GitHub/MWD-WebAppFromScratch/week3/index.html");
  xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
  
  // Send
  xhr.send();

  // Return request
  return xhr;
}
