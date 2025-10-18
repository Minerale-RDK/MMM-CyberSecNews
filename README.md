# MMM-CyberSecNews

A MagicMirror² module that displays AI-curated cybersecurity news from Hacker News, powered by Claude AI.

## Features

- **Intelligent filtering**: Claude AI automatically selects the most relevant cybersecurity articles from Hacker News
- **Smart summarization**: AI-generated concise summaries optimized for quick reading
- **Focus**: Prioritizes CVEs, breaches, malware analysis, tooling, GRC and architecture
- **Clean design**: Minimalist interface that matches default MagicMirror² aesthetics
- **Low cost**: Updates once per 24 hours (~$0.02/day with Claude API)

## Installation

1. Navigate to your MagicMirror's modules folder:
```bash
cd ~/MagicMirror/modules
```

2. Clone this repository:
```bash
git clone https://github.com/Minerale-RDK/MMM-CyberSecNews.git
cd MMM-CyberSecNews
```

3. Install dependencies:
```bash
npm install
```

4. Get your Claude API key from [Anthropic Console](https://console.anthropic.com/)

## Configuration

Add the module to your `config/config.js`:

```javascript
{
    module: "MMM-CyberSecNews",
    position: "top_right", // or any position you prefer
    config: {
        anthropicApiKey: "YOUR_CLAUDE_API_KEY_HERE",
        updateInterval: 86400000, // 24 hours in ms
    }
}
```

### Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `anthropicApiKey` | Your Anthropic Claude API key (required) | `""` |
| `updateInterval` | How often to fetch news (milliseconds) | `86400000` (24 hours) |

## Customizing the AI Prompts

The module uses Claude AI with two main prompts that you can customize in `node_helper.js`:

### Phase 1: Article Selection

Located around **line 56**, this prompt tells Claude which articles to select:

```javascript
content: `You are a cybersecurity expert. Here are today's top 50 Hacker News articles.
...
Select the 5 MOST relevant articles for a cybersecurity expert (priority: CVEs, breaches, malware, tools, attack techniques, investigations, GRC, architecture).`
```

**Customize to:**
- Change expertise focus (e.g., "penetration testing expert", "malware analyst")
- Adjust number of articles selected (change "5" to your preference)
- Modify priority keywords (CVEs, breaches, etc.)

### Phase 2: Summary Generation

Located around **line 100**, this prompt controls the summary format:

```javascript
content: `You are a cybersecurity expert. Here are ${selectedStories.length} cybersecurity articles:
...
Format (WITHOUT \`\`\`html):
<div><strong>Complete original article title</strong> - Brief summary in 10-20 words</div>`
```

**Customize to:**
- Change summary length (e.g., "5-10 words" for shorter, "20-30 words" for more detail)
- Adjust tone (e.g., "technical jargon", "beginner-friendly")
- Modify format (change HTML structure)
- Keep or remove original titles

**Example: More technical focus**
```javascript
content: `You are a malware reverse engineer. Focus on technical IOCs, TTPs, and CVE details...`
```

### Adjusting Token Limits

If you want longer, more detailed summaries, increase the `max_tokens` parameter in **Phase 2** (around line 98):

```javascript
max_tokens: 1000,  // Default - good for 5 articles with 10-20 word summaries
```

**Recommended token limits:**
- **500-800 tokens**: Short summaries (5-10 words per article)
- **1000 tokens**: Standard (10-20 words) - current default
- **1500-2000 tokens**: Detailed summaries (30-50 words per article)
- **2500+ tokens**: Very detailed with technical analysis

**Note:** Higher token limits = slightly higher API costs. With 24-hour refresh, impact is minimal (~$0.01-0.03/day even at 2000 tokens).

After modifying prompts, restart MagicMirror:
```bash
pm2 restart MagicMirror
```

## How It Works

1. **Fetches** top 50 stories from Hacker News API
2. **Phase 1**: Claude AI selects the 5 most relevant cybersecurity articles
3. **Phase 2**: Retrieves full context for selected articles
4. **Phase 3**: Claude generates clean, readable summaries optimized for mirror display

## API Costs

With default settings (24-hour refresh):
- Approximately **$0.02 per day** with Claude Sonnet 4.5
- ~$0.60 per month
- First-time users get $5 free credit from Anthropic

## Customization

### CSS Styling

Edit `MMM-CyberSecNews.css` to customize:
- Font sizes
- Colors
- Spacing
- Module width

### Keywords Priority

The module automatically prioritizes:
- CVEs and vulnerabilities
- Data breaches
- Malware analysis
- Tools
- Attack techniques
- GRC
- Architecture

## Dependencies

- [Anthropic SDK](https://www.npmjs.com/package/@anthropic-ai/sdk) - Claude AI integration
- [Axios](https://www.npmjs.com/package/axios) - HTTP requests

## License

MIT

## Credits

- Powered by [Claude AI](https://www.anthropic.com/) by Anthropic
- News from [Hacker News](https://news.ycombinator.com/)
- Built for [MagicMirror²](https://magicmirror.builders/)

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/Minerale-RDK/MMM-CyberSecNews).
