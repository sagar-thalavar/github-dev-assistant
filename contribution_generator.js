const { GoogleGenAI } = require('@google/generative-ai');

/**
 * Daily Contribution Generator Component
 * Generates fallback content (learning logs, reusable components, utils) when no tasks are queued.
 */

/**
 * Generates a clean markdown learning log using the Gemini API.
 * 
 * @param {string} apiKey - Gemini API Key.
 * @returns {Promise<object>} File payload object: { path, content }
 */
async function generateDailyLog(apiKey) {
  const ai = new GoogleGenAI({ apiKey });
  const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const topics = [
    'Next.js 14 App Router optimization techniques',
    'Advanced React design patterns (Compound Components, Render Props)',
    'TypeScript utility types and safe type assertion best practices',
    'TailwindCSS responsive layout tricks and custom themes',
    'Writing clean, asynchronous unit tests in Node.js'
  ];
  
  // Pick a random topic for variety
  const topic = topics[Math.floor(Math.random() * topics.length)];

  const prompt = `
You are an expert software developer writing a daily technical note for your repository.
Write a detailed, clean markdown note explaining: "${topic}".

Format requirements:
- Use clear markdown headers.
- Include practical code examples.
- Keep it concise, educational, and high-quality.

The output must be the raw markdown content. Do not include markdown code block wrapper (\`\`\`markdown) around the entire output.
`;

  try {
    console.log(`Generating daily learning note on topic: "${topic}"...`);
    const result = await model.generateContent(prompt);
    const content = result.response.text().trim();

    // Define a filename based on current date
    const dateStr = new Date().toISOString().split('T')[0];
    const cleanTopicName = topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
      
    const filePath = `notes/learning-log-${dateStr}-${cleanTopicName}.md`;

    return {
      path: filePath,
      content
    };
  } catch (error) {
    console.error('Error generating daily contribution:', error.message);
    throw error;
  }
}

module.exports = {
  generateDailyLog
};
