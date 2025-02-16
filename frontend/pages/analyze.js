import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import "../app/globals.css";
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import GridIllustration from '../components/ui/grid-illustration';
import PulseAnimation from '../components/ui/pulse-animation';

export default function Analyze() {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [requirements, setRequirements] = useState('');

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      setError('Please only upload CSV or JSON files');
      return;
    }

    // Add new files to the existing array
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json']
    },
    multiple: true
  });

  const removeFile = (fileToRemove) => {
    setFiles(files.filter(file => file !== fileToRemove));
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        resolve({
          filename: file.name,
          content: event.target.result
        });
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsText(file);
    });
  };

  const handleAnalysis = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const fileContents = await Promise.all(
        files.map(file => readFileContent(file))
      );
      
      // Store the data and requirements in sessionStorage
      sessionStorage.setItem('data', JSON.stringify(fileContents));
      sessionStorage.setItem('requirements', requirements);
      
      // Navigate to the result page
      router.push('/result');
      
    } catch (err) {
      setError('Error reading files: ' + err.message);
      console.error('Error reading files:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 -z-10">
        <GridIllustration />
      </div>
      
      <div className="relative min-h-screen">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative py-8 lg:py-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              <div className="absolute -left-4 top-8 h-12 w-12">
                <PulseAnimation delay={0} />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 pt-10 sm:text-5xl">
                Data <span className="text-purple-400">Analysis</span>
              </h1>
              <p className="mt-4 text-lg leading-7 text-gray-600">
                Upload your CSV or JSON files to begin analysis
              </p>

              {/* Dropzone */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8"
              >
                <div
                  {...getRootProps()}
                  className={`card p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                    isDragActive ? 'border-gray-300 bg-white' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        {isDragActive ? "Drop files here" : "Drag & drop files here"}
                      </p>
                      <p className="text-sm text-gray-500">or click to select files</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* File List */}
              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 space-y-4"
                >
                  {files.map((file, index) => (
                    <motion.div
                      key={file.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="card flex items-center justify-between p-4 bg-white rounded-lg"
                    >
                      <span className="text-sm text-gray-600">📊 {file.name}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</span>
                        <button
                          onClick={() => removeFile(file)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Requirements Input */}
              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6"
                >
                  <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
                    Analysis Requirements (Optional)
                  </label>
                  <textarea
                    id="requirements"
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    rows={4}
                    placeholder="Enter any specific requirements or questions for the analysis..."
                  />
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 text-sm text-red-600"
                >
                  {error}
                </motion.p>
              )}

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6"
              >
                <button
                  onClick={handleAnalysis}
                  disabled={files.length === 0 || isProcessing}
                  className={`w-full rounded-lg px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    files.length > 0 
                      ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-600' 
                      : 'bg-gray-400 hover:bg-gray-500 focus:ring-gray-400'
                  } disabled:opacity-50`}
                >
                  {isProcessing ? 'Processing...' : 'Analyze Data'}
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
