import { useState } from 'react';
import { Upload, FileText, X, ChevronRight, Sparkles } from "lucide-react";

const App = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [category, setCategory] = useState('');
  const [atsScore, setAtsScore] = useState(null);
  const [highlightedSkills, setHighlightedSkills] = useState([]);
  const [suggestedRole, setSuggestedRole] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile.name);
  };

  const handleSubmit = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3000/predict', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      setCategory(data.category);
      setAtsScore(data.ats_score);
      setHighlightedSkills(data.highlighted_skills);
      setSuggestedRole(data.suggested_role);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-cyan-500/10 animate-gradient-x" />
      
      <div className="relative max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <div className="inline-block">
            <h1 className="text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 animate-gradient-x pb-2">
              Resume Flow
            </h1>
            <div className="h-1 w-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-full animate-gradient-x" />
          </div>
          <p className="text-gray-400 text-xl mt-4">Analyze your Resume</p>
        </div>

        {/* Upload Section */}
        <div className="bg-gray-800/50 backdrop-blur-xl border-0 relative overflow-hidden mb-8 p-8 rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-cyan-500/5 animate-gradient-x" />
          <div className="flex flex-col items-center space-y-6 relative">
            <label className="w-full max-w-md flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl cursor-pointer border-gray-600 hover:border-gray-500 transition-all relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-cyan-500/5 animate-gradient-x" />
              <div className="flex flex-col items-center justify-center space-y-2">
                <Sparkles className="w-12 h-12 text-gray-400 transition-colors" />
                <p className="text-gray-400 transition-colors">
                  {fileName || "Drop your resume here"}
                </p>
              </div>
              <input type="file" onChange={handleFileChange} className="hidden" accept=".pdf" />
            </label>

            {fileName && (
              <button
                onClick={handleSubmit}
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 animate-gradient-x text-white font-medium"
              >
                <span className="flex items-center space-x-2">
                  <span>Analyze Resume</span>
                  <ChevronRight className="w-4 h-4 transition-transform" />
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Results Section */}
        {category && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* ATS Score */}
            <div className="bg-gray-800/50 backdrop-blur-xl border-0 relative overflow-hidden p-6 rounded-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-cyan-500/5 animate-gradient-x" />
              <h3 className="text-xl font-semibold text-gray-200 mb-4">Match Score</h3>
              <div className="space-y-4">
                <div className="h-4 bg-gray-700/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 animate-gradient-x"
                    style={{ width: `${atsScore * 100}%` }}
                  />
                </div>
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 animate-gradient-x">
                  {(atsScore * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Category & Role */}
            <div className="bg-gray-800/50 backdrop-blur-xl border-0 relative overflow-hidden p-6 rounded-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-cyan-500/5 animate-gradient-x" />
              <h3 className="text-xl font-semibold text-gray-200 mb-4">Profile</h3>
              <div className="space-y-4">
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <p className="text-gray-400">Category</p>
                  <p className="text-xl font-semibold text-gray-200">{category}</p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <p className="text-gray-400">Best Fit Role</p>
                  <p className="text-xl font-semibold text-gray-200">{suggestedRole}</p>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="md:col-span-2 bg-gray-800/50 backdrop-blur-xl border-0 relative overflow-hidden p-6 rounded-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-cyan-500/5 animate-gradient-x" />
              <h3 className="text-xl font-semibold text-gray-200 mb-4">Key Skills</h3>
              <div className="flex flex-wrap gap-2">
                {highlightedSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 rounded-lg bg-gray-900/50 text-gray-300 hover:text-gray-100 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
