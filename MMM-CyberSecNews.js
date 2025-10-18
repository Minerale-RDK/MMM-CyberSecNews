Module.register("MMM-CyberSecNews", {
  defaults: {
    updateInterval: 86400000, // 24 hours
    anthropicApiKey: "", // Configure your API key
  },

  start: function() {
    this.stories = [];
    this.summary = "Loading cybersecurity news...";
    this.loaded = false;
    this.scheduleUpdate();
  },

  getDom: function() {
    const wrapper = document.createElement("div");
    wrapper.className = "MMM-CyberSecNews";

    const title = document.createElement("header");
    title.innerHTML = "Cyber Security News";
    title.className = "module-header";
    wrapper.appendChild(title);

    if (!this.loaded) {
      const loading = document.createElement("div");
      loading.innerHTML = "Analyzing news...";
      loading.className = "dimmed light small";
      wrapper.appendChild(loading);
      return wrapper;
    }

    const summaryDiv = document.createElement("div");
    summaryDiv.className = "summary";
    summaryDiv.innerHTML = this.summary;
    wrapper.appendChild(summaryDiv);

    return wrapper;
  },

  getStyles: function() {
    return ["MMM-CyberSecNews.css"];
  },

  scheduleUpdate: function() {
    const self = this;
    setInterval(function() {
      self.fetchNews();
    }, this.config.updateInterval);
    this.fetchNews();
  },

  fetchNews: function() {
    this.sendSocketNotification("FETCH_HACKER_NEWS", {
      maxStories: this.config.maxStories,
      apiKey: this.config.anthropicApiKey
    });
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "NEWS_SUMMARY") {
      this.summary = payload;
      this.loaded = true;
      this.updateDom(300);
    }
  }
});