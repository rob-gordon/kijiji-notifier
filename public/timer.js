let timeout;
// eslint-disable-next-line
self.addEventListener(
  "message",
  function(e) {
    const [message, interval] = e.data;
    switch (message) {
      case "start":
        this.setTimeout(() => {
          // eslint-disable-next-line
          self.postMessage("UPDATE");
        }, interval);

        break;
      case "stop":
        clearTimeout(timeout);
        break;
      default:
    }
  },
  false
);
