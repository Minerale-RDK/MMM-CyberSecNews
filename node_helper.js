const NodeHelper = require("node_helper");
const axios = require("axios");
const Anthropic = require("@anthropic-ai/sdk");

module.exports = NodeHelper.create({
  start: function() {
    console.log("Starting MMM-CyberSecNews helper");
  },

  socketNotificationReceived: async function(notification, payload) {
    if (notification === "FETCH_HACKER_NEWS") {
      await this.processNews(payload);
    }
  },

  processNews: async function(config) {
    try {
      // 1. Fetch top stories from Hacker News
      const topStoriesRes = await axios.get(
        "https://hacker-news.firebaseio.com/v0/topstories.json"
      );
      const topStoryIds = topStoriesRes.data.slice(0, 50);

      // 2. Fetch details for top 50 stories
      const storyPromises = topStoryIds.map(id =>
        axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
      );
      const stories = await Promise.all(storyPromises);

      // 3. Filter valid stories only
      const topStories = stories
        .map(s => s.data)
        .filter(story => story && story.title);

      if (topStories.length === 0) {
        this.sendSocketNotification("NEWS_SUMMARY", 
          "<div>Error fetching news.</div>");
        return;
      }

      // 4. Phase 1: Send all titles to Claude for selection
      const newsTitles = topStories.map((story, i) => 
        `${i + 1}. ${story.title} (${story.score || 0} pts)`
      ).join('\n');

      const anthropic = new Anthropic({
        apiKey: config.apiKey
      });

      // First pass: quick selection
      const selectionMessage = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 200,
        messages: [{
          role: "user",
          content: `You are a cybersecurity expert. Here are today's top 50 Hacker News articles.

${newsTitles}

Select the 5 MOST relevant articles for a cybersecurity expert (priority: CVEs, breaches, malware, tools, attack techniques, investigations, GRC, architecture).

RESPOND ONLY with comma-separated numbers, NOTHING else.
Example: 3,7,12,19,24

If NO article is relevant, respond only: NONE`
        }]
      });

      const selectedNums = selectionMessage.content[0].text.trim();
      
      if (selectedNums === "NONE") {
        this.sendSocketNotification("NEWS_SUMMARY", 
          "<div>No major cybersecurity news today.</div>");
        return;
      }

      // Parse selected numbers
      const indices = selectedNums.split(',').map(n => parseInt(n.trim()) - 1);
      const selectedStories = indices
        .filter(i => i >= 0 && i < topStories.length)
        .map(i => topStories[i])
        .slice(0, 5);

      // Phase 2: Detailed context for selected articles
      const detailedContext = selectedStories.map((story, i) => 
        `${i + 1}. ${story.title}\n   URL: ${story.url || 'N/A'}\n   Score: ${story.score}\n   ${story.text ? 'Excerpt: ' + story.text.substring(0, 200) : ''}`
      ).join('\n\n');

      // Phase 3: Final summary with complete context
      const finalMessage = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `You are a cybersecurity expert. Here are ${selectedStories.length} cybersecurity articles:

${detailedContext}

CRITICAL INSTRUCTION: You MUST create EXACTLY ${selectedStories.length} HTML lines, one for EACH article above.

Article 1 → 1 <div> line
Article 2 → 1 <div> line
Article 3 → 1 <div> line
${selectedStories.length > 3 ? 'Article 4 → 1 <div> line' : ''}
${selectedStories.length > 4 ? 'Article 5 → 1 <div> line' : ''}

Format (WITHOUT \`\`\`html):
<div><strong>Complete original article title</strong> - Brief summary in 10-20 words</div>

For EACH article, keep the original title COMPLETE (do not shorten), then provide a concise summary in natural, professional language.

Start now with the ${selectedStories.length} lines:`
        }]
      });

      const summary = finalMessage.content[0].text;

      // Clean HTML if Claude adds unwanted tags
      const cleanedSummary = summary
        .replace(/```html\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      // Send summary to module
      this.sendSocketNotification("NEWS_SUMMARY", cleanedSummary);

    } catch (error) {
      console.error("MMM-CyberSecNews error:", error);
      this.sendSocketNotification("NEWS_SUMMARY", 
        "Error fetching news. Check your Claude API key.");
    }
  }
});