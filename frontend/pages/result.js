'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import "../app/globals.css";
import "tailwindcss/tailwind.css";

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-2">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-4 h-4 bg-white rounded-full"
            animate={{
              y: ["0%", "-100%", "0%"],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.15
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default function Result() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isMessageSending, setIsMessageSending] = useState(false);

  const requestAIRewrite = async (errorMessage, originalCode) => {
    setIsLoading(true);
    const retryPrompt = `
      The previous visualization code encountered an error:
      Error: ${errorMessage}

      Original code that failed:
      ${originalCode}

      Please rewrite the visualization code to fix this error and ensure it works properly.
      Follow the same output format as before, but focus on addressing the specific error.
      
      ## Response Format Rules
      Return ONLY a JSON object with no additional text. Must start with '{' and end with '}'.
      {
        "chain-of-thought": [
          "Error analysis and fix steps..."
        ],
        "js-code": "// Fixed visualization code"
      }
    `;

    try {
      const response = await fetch('http://localhost:5000/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: retryPrompt })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const generated = JSON.parse(result.data.response);
      console.log('AI Rewrite:', generated);
      setGeneratedCode(generated["js-code"]);
    } catch (error) {
      console.error('Error requesting AI rewrite:', error);
      alert('Failed to get AI rewrite: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeData = async (data) => {
    const analysisPrompt = `
      ## Task: Data Analysis
      Analyze the provided dataset and recommend the best visualization approaches.
      
      ## Data Context
      The data provided is stored in sessionStorage and contains the following structure:
      ${JSON.stringify(data, null, 2).substring(0, 10000)}

      ## Analysis Requirements
      1. Data Structure Analysis:
         - Identify the type and structure of the data
         - Detect any patterns or hierarchies
         - Note any potential data quality issues
         - Identify the most/least/mean/median/max/min count of the data.

      2. Visualization Recommendations:
         - Suggest the most effective types of visualizations for this data
         - Explain why each visualization type would be valuable
         - Consider multiple aspects of the data that could be visualized

      3. Technical Considerations:
         - Note any data transformations needed
         - Identify potential challenges in visualization
         - Suggest performance optimizations

      ## Response Format
      Return a JSON object with the following structure:
      {
        "data_analysis": {
          "structure": "Description of data structure",
          "patterns": ["List of identified patterns"],
          "quality_issues": ["List of potential issues"]
        },
        "visualization_recommendations": [
          {
            "type": "Name of visualization",
            "rationale": "Why this visualization is appropriate",
            "data_requirements": ["What data transformations are needed"],
            "expected_insights": ["What insights this could reveal"]
          }
        ],
        "technical_notes": {
          "transformations": ["Required data transformations"],
          "challenges": ["Potential technical challenges"],
          "optimizations": ["Recommended optimizations"]
        }
      }
    `;

    try {
      const response = await fetch('http://localhost:5000/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: analysisPrompt })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return JSON.parse(result.data.response);
    } catch (error) {
      console.error('Error analyzing data:', error);
      throw error;
    }
  };

  const generateVisualizationCode = async (analysis) => {
    const codePrompt = `
      ## Task: Visualization Code Generation
      Generate visualization code based on the provided analysis.

      ## Analysis Results
      ${JSON.stringify(analysis, null, 2)}

      1. Data Source:
      Read data from sessionStorage using key: "data"
      Handle potential data format issues and missing data gracefully
      Assume the data structure is: 
        + The sessionStorage contains an array of objects, each object with key "filename" and "content", which is the raw content of the csv or json.
        + You will only analyze the first file of the array.

      2. Implementation:
         - Use the recommended visualizations from the analysis
         - Implement all necessary data transformations
         - Include interactive features (tooltips, zoom, pan)
         - Handle errors gracefully

      3. Technical Requirements:
         - Use D3 (already imported, no need to import)
         - Implement responsive design
         - Optimize for performance
         - Include error handling
         - Do not include external graphics or import paths
         - All charts must be rendered in the div with id "renderCharts"
         - Calculate all the measurements (e.g., count, mean, standard deviation)

      4. Visual Apperance:
         - Use white text for labels, and make sure background is transparent.
         - For box and other charts, be colorful and avoid purple.
         - Center the graphs on the screen
         - Make sure all the legends, text label has plenty of space and padding. Avoid overlaps.
         - Ensure readability
         - Smooth and ease animation
         - Only allow hover interaction (displays information), disable pan and zoom.
         - Include the measurements

      ## Response Format
      Return a JSON object with:
      {
        "chain-of-thought": ["Implementation steps..."],
        "js-code": "// The visualization code"
      }
      Do not use code blocks such as \`\`\` or triple quotes in the response.

      ## Example Response Structure
      Example of exact response format (notice how it starts directly with '{' with no other text):
      {
        "chain-of-thought": [
          "1. Data Retrieval: First, I'll safely access sessionStorage using try-catch...",
          "2. Validation: I'll verify the data structure matches expected format...",
          "3. Processing: Transform the data into the format required by the charting library...",
          "4. Visualization: Implement responsive charts with interaction handlers...",
          "5. Error Handling: Add comprehensive error boundaries and user feedback..."
        ],
        "js-code": \`
          // no need to import D3, as it is already done automatically.
          <script>
          (() => {
            try {
              const data = JSON.parse(sessionStorage.getItem('salesData'));
              // ... rest of the implementation
            } catch (error) {
              console.error('Failed to load or process data:', error);
            }
          })();
          <script/>
        \`
      }

    `;

    try {
      const response = await fetch('http://localhost:5000/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: codePrompt })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return JSON.parse(result.data.response);
    } catch (error) {
      console.error('Error generating visualization code:', error);
      throw error;
    }
  };

  const generateVisualization = async () => {
    const storedData = sessionStorage.getItem('data');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setData(parsedData);
        console.log('Data from session storage:', parsedData);

        const analysis = await analyzeData(parsedData);
        console.log('Data Analysis:', analysis);
        setAnalysisResult(analysis);

        const visualization = await generateVisualizationCode(analysis);
        console.log('Generated Visualization:', visualization);
        setGeneratedCode(visualization["js-code"]);
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to generate visualization: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    generateVisualization();
  }, []);

  useEffect(() => {
    if (generatedCode) {
      try {
        const scriptContent = generatedCode.replace(/<\/?script[^>]*>/g, '').trim();
        
        const script = document.createElement('script');
        const d3Script = document.createElement('script');
        const chartjsScript = document.createElement('script');
        try {
          // Use CDN URLs for more reliable loading
          d3Script.src = 'https://d3js.org/d3.v7.min.js';
          chartjsScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
          
          // Wait for both libraries to load before running the visualization
          Promise.all([
            new Promise(resolve => d3Script.onload = resolve),
            new Promise(resolve => chartjsScript.onload = resolve)
          ]).then(() => {
            script.text = scriptContent;
            document.body.appendChild(script);
          }).catch(error => {
            console.error('Error loading libraries:', error);
            requestAIRewrite(error.message, scriptContent);
          });

          document.body.appendChild(d3Script);
          document.body.appendChild(chartjsScript);
        } catch (scriptError) {
          console.error('Error setting up script:', scriptError);
          requestAIRewrite(scriptError.message, scriptContent);
        }
      } catch (error) {
        console.error('Error setting up visualization container:', error);
        requestAIRewrite(error.message, generatedCode);
      }
    }
  }, [generatedCode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <div className="relative">
          {/* Existing content */}
          <div className="w-full h-full flex justify-center items-center">
            {isLoading ? <LoadingScreen className="mb-24" /> : 
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-8"
              >
                <h1 className="text-4xl font-bold text-white mb-4 pt-32 p-8">Analysis Results</h1>
                <div id="renderCharts" className="w-full h-full flex flex-col justify-center items-center gap-y-4">
                  
                </div>
                <p className="text-gray-300">
                  {data ? `Analyzing ${data.length} file${data.length !== 1 ? 's' : ''}` : 'No data available'}
                </p>
              </motion.div>}
          </div>
          
          {/* Chat Icon */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 rounded-full p-3 shadow-lg transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </button>

          {/* Chat Interface */}
          {isChatOpen && (
            <div className="fixed bottom-20 right-4 w-96 bg-gray-800 rounded-lg shadow-xl">
              <div className="p-4 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Chat about your data</h3>
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`${
                      msg.type === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block p-2 rounded-lg ${
                        msg.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-700 text-white'
                      }`}
                    >
                      {msg.type === 'user' ? (
                        msg.text
                      ) : (
                        <ReactMarkdown
                          className="prose prose-invert max-w-none"
                          components={{
                            p: ({ children }) => <p className="m-0">{children}</p>,
                            strong: ({ children }) => (
                              <strong className="font-bold text-blue-300">{children}</strong>
                            ),
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                ))}
                {isMessageSending && (
                  <div className="text-left">
                    <div className="inline-block p-2 rounded-lg bg-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-gray-700">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!userInput.trim() || isMessageSending) return;

                    // Add user message
                    const newMessage = { type: 'user', text: userInput };
                    setChatMessages((prev) => [...prev, newMessage]);
                    setUserInput('');
                    setIsMessageSending(true);

                    // Get AI response
                    try {
                      const response = await fetch('http://localhost:5000/api/ai/chat', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          question: userInput,
                          context: `${JSON.stringify(data, null, 2).substring(0, 10000)}\n\n${analysisResult}`
                        }),
                      });

                      if (!response.ok) throw new Error('Failed to get response');

                      const result = await response.json();
                      setChatMessages((prev) => [
                        ...prev,
                        { type: 'ai', text: result.response },
                      ]);
                    } catch (error) {
                      console.error('Chat error:', error);
                      setChatMessages((prev) => [
                        ...prev,
                        { type: 'ai', text: 'Sorry, I encountered an error. Please try again.' },
                      ]);
                    } finally {
                      setIsMessageSending(false);
                    }
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Ask about your data..."
                    disabled={isMessageSending}
                    className="flex-1 bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={isMessageSending || !userInput.trim()}
                    className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
