'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import "../app/globals.css";
import "tailwindcss/tailwind.css";
import GridIllustration from '../components/ui/grid-illustration';
import PulseAnimation from '../components/ui/pulse-animation';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-2">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-4 h-4 bg-purple-400 rounded-full"
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
  const [requirements, setRequirements] = useState(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

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

      4. Diversity:
         - Consider different types of visualizations: parallel plot, pie chart, trendline....

      ## Response Format
      Return a JSON object with the following structure:
      {
        "data_analysis": {
          "structure": "Description of data structure, given the data object, what fields to access in order to get the data.",
        },
        "visualization_recommendations": [
          {
            "type": "Name of visualization",
            "title": "Title of the Chart",
            "interpretation": "A sentence of why this graph and what is shown",
            "data_requirements": ["What data transformations are needed"],
          }
        ]
      }

      Specific requirements from the user:
      ${requirements}
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
         - All charts must be rendered and appended in the div with id "renderCharts" directly (1st child).
         - Calculate all the measurements (e.g., count, mean, standard deviation)
         - For each chart created, console.log a message to indicate success.
         - We are using D3 v7, so certain functions are not available, such as d3.nest, which is replaced by d3.group

      4. Visual Apperance:
         - Use black and purple text for labels, and make sure background is transparent.
         - For box and other charts, be colorful and avoid purple.
         - Center the graphs on the screen
         - Must include legends
         - Make sure all the legends, text label has plenty of space and padding. Avoid overlaps.
         - Ensure readability
         - Smooth and ease animation
         - Only allow hover interaction (displays information), disable pan and zoom.
         - Include the measurements
         - Include a title for the chart
         - Include the interpretation for each chart, with a font smaller than the title.
         - Ensure the graph is 80% of window's width
         - Parallell coordinates plot must be interactive (hover highlights the line, use bright colors).

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
          .
          .
          .
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

  const validateAndFixCode = async (code) => {
    const validationPrompt = `
      ## Task: Code Validation and Bug Fixing
      Validate and fix the following D3.js visualization code for any syntax errors, undefined variables, or potential issues.

      ## Current Code
      ${code}

      ## Requirements
      1. Check for and fix:
         - Syntax errors
         - Undefined variables
         - Missing variable declarations
         - Scope issues
         - Potential null/undefined references
         - D3.js API usage errors
         - Missing error handling
      
      2. Ensure:
         - All variables are properly declared
         - All D3 selections have error handling
         - All data accessors are safe from undefined
         - Proper scoping of variables
         - All async operations are properly handled

      ## Response Format
      Return a JSON object with:
      {
        "issues_found": [
          "List of issues found and fixed..."
        ],
        "fixed_code": "// The complete fixed code"
      }
    `;

    try {
      const response = await fetch('http://localhost:5000/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: validationPrompt })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const validation = JSON.parse(result.data.response);
      console.log('Code Validation Results:', validation.issues_found);
      return validation.fixed_code;
    } catch (error) {
      console.error('Error validating code:', error);
      throw error;
    }
  };

  const generateVisualization = async () => {
    const storedData = sessionStorage.getItem('data');
    const requirements = sessionStorage.getItem('requirements');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setData(parsedData);
        setRequirements(requirements);
        console.log('Data from session storage:', parsedData);

        const analysis = await analyzeData(parsedData);
        console.log('Data Analysis:', analysis);
        setAnalysisResult(analysis);

        const visualization = await generateVisualizationCode(analysis);
        console.log('Generated Visualization:', visualization);
        
        // Add validation step before setting the code
        const validatedCode = await validateAndFixCode(visualization["js-code"]);
        console.log('Validated and Fixed Code:', validatedCode);
        setGeneratedCode(validatedCode);
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
          });

          document.body.appendChild(d3Script);
          document.body.appendChild(chartjsScript);
        } catch (scriptError) {
          console.error('Error setting up script:', scriptError);
        }
      } catch (error) {
        console.error('Error setting up visualization container:', error);
      }
    }
  }, [generatedCode]);

  const handleSendMessage = async () => {
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
  };

  return (
    <>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <div className="relative min-h-screen">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="relative py-8 lg:py-12">
              <div className="fixed inset-0 -z-10">
                <GridIllustration />
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative"
                transition={{
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1]
                }}
              >
                <div className="absolute -left-4 top-8 h-12 w-12">
                  <PulseAnimation delay={0} />
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 pt-10 sm:text-5xl">
                  Analysis <span className="text-purple-400">Results</span>
                </h1>

                {/* Analysis Results */}
                {analysisResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-8 space-y-6"
                  >
                    {/* Data Analysis Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="card p-6 bg-white rounded-xl shadow-sm border border-gray-200"
                    >
                      <h3 className="text-xl font-semibold mb-4">Data Structure Analysis</h3>
                      <ReactMarkdown>{analysisResult.data_analysis.structure}</ReactMarkdown>
                    </motion.div>

                    {/* Visualization Recommendations Section */}
                    {analysisResult.visualization_recommendations.map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * (index + 1) }}
                        className="card p-6 bg-white rounded-xl shadow-sm border border-gray-200"
                      >
                        <h3 className="text-xl font-semibold mb-4">{rec.title}</h3>
                        <div className="space-y-2">
                          <p><strong>Type:</strong> {rec.type}</p>
                          <p><strong>Interpretation:</strong> {rec.interpretation}</p>
                          <div>
                            <strong>Data Requirements:</strong>
                            <ul className="list-disc pl-5 mt-1">
                              {rec.data_requirements.map((req, reqIndex) => (
                                <li key={reqIndex}>{req}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Generated Code */}
                {generatedCode && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8"
                  >
                    <div className="card p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                      <h2 className="text-xl font-semibold mb-4">Generated Visualization</h2>
                      <div id="renderCharts" className="w-full h-full flex flex-col justify-center items-center gap-y-4 p-2"></div>
                    </div>
                  </motion.div>
                )}

                {/* Chat Interface */}
                <div className="fixed bottom-6 right-6 z-50">
                  <button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className="w-14 h-14 rounded-full bg-purple-400 text-white hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 shadow-lg flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
                    </svg>
                  </button>

                  {isChatOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.95 }}
                      className="absolute bottom-20 right-0 w-96 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-200 bg-purple-50 flex justify-between items-center">
                        <h3 className="font-semibold text-purple-900">Dataset Assistant</h3>
                        <button
                          onClick={() => setIsChatOpen(false)}
                          className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="p-4">
                        <div ref={chatContainerRef} className="h-96 overflow-y-auto space-y-4 mb-4 scroll-smooth">
                          {chatMessages.map((msg, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: msg.isUser ? 20 : -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`p-3 rounded-lg ${
                                msg.type == "user"
                                  ? 'bg-purple-100 ml-12 text-purple-700'
                                  : 'bg-gray-100 mr-12'
                              } max-w-[80%] ${
                                msg.type == "user" ? 'ml-auto' : 'mr-auto'
                              }`}
                            >
                              <ReactMarkdown className={msg.isUser ? 'text-purple-700' : ''}>{msg.text}</ReactMarkdown>
                            </motion.div>
                          ))}
                          {isMessageSending && (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="bg-gray-100 mr-12 p-3 rounded-lg max-w-[80%] mr-auto"
                            >
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                            </motion.div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && userInput.trim() && !isMessageSending) {
                                handleSendMessage();
                              }
                            }}
                            placeholder="Ask a question about the analysis..."
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-50 disabled:text-gray-500"
                            disabled={isMessageSending}
                          />
                          <button
                            onClick={handleSendMessage}
                            disabled={!userInput.trim() || isMessageSending}
                            className="rounded-lg bg-purple-400 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
