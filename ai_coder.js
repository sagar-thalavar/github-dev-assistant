const { GoogleGenAI } = require('@google/generative-ai');

/**
 * AI Code Generation Component
 * Handles prompting the LLM and parsing output edits.
 */

/**
 * Generates file modifications for a given task using the Gemini API.
 * 
 * @param {string} apiKey - Gemini API Key.
 * @param {object} task - Parsed task details.
 * @param {string} repoStructure - Scanned repository structure string.
 * @param {object} fileContents - Dictionary of { filePath: content } for target files.
 * @returns {Promise<Array<object>>} List of file modifications: [{ path, content }]
 */
async function generateCodeChanges(apiKey, task, repoStructure, fileContents) {
  // Initialize the Gemini API client
  // In v1, we use the standard model client setup
  const ai = new GoogleGenAI({ apiKey });
  const model = ai.getGenerativeModel({ 
    model: 'gemini-1.5-pro',
    generationConfig: { responseMimeType: 'application/json' }
  });

  // Build target files context block
  let filesContext = '';
  for (const [filePath, content] of Object.entries(fileContents)) {
    filesContext += `\n--- FILE: ${filePath} ---\n${content}\n`;
  }

  const prompt = `
You are an expert software developer. Your task is to implement the following changes in the codebase.

TASK TITLE: ${task.title}
TASK DESCRIPTION:
${task.description}

REPOSITORY DIRECTORY STRUCTURE:
${repoStructure}

CURRENT CONTENTS OF RELEVANT FILES:
${filesContext}

Implement the requested task. Return the file modifications in a structured JSON array.
Each entry in the array must be an object with:
- "path": The relative path of the file to modify or create.
- "content": The complete, updated content of the file.

JSON Format:
[
  {
    "path": "path/to/file.js",
    "content": "updated content here..."
  }
]
`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse JSON modifications
    const modifications = JSON.parse(responseText);
    if (!Array.isArray(modifications)) {
      throw new Error('LLM response is not a valid array of file modifications');
    }

    return modifications;
  } catch (error) {
    console.error('Error during AI code generation:', error.message);
    throw error;
  }
}

module.exports = {
  generateCodeChanges
};
