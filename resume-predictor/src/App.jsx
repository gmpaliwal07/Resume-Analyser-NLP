import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';  // Import the CSS file
import { LuUpload } from "react-icons/lu";
import { GiCancel } from "react-icons/gi";

function App() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');  // New state for the file name
  const [category, setCategory] = useState('');
  const [atsScore, setAtsScore] = useState(null);
  const [highlightedSkills, setHighlightedSkills] = useState([]);
  const [suggestedRole, setSuggestedRole] = useState('');
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile.name);  

    setError('');
    setShowError(false);
  };

  const handleFileRemove = () => {
    setFile(null);
    setFileName('');  
    setError('');
    setShowError(false);
  };

  const handleSubmit = async () => {
  
    setError('');
    setShowError(false);

    if (!file) {
      setError('Please upload a PDF file.');
      setShowError(true);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:3000/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { category, ats_score, highlighted_skills, suggested_role} = response.data;

      setCategory(category);
      setAtsScore(ats_score);
      setHighlightedSkills(highlighted_skills);
      setSuggestedRole(suggested_role);

      setError('');
      setShowError(false);  
    } catch (err) {
      setError('Error processing request.');
      setShowError(true);
    }
  };

  // Smooth error message transition
  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => {
        setShowError(false);
      }, 1000); 
      return () => clearTimeout(timer);
    }
  }, [showError]);

  return (
    <div className="flex flex-col bg-[#021526] p-9 h-screen ">
      <div className="">
        <h1 className="font-sans text-5xl text-white pb-6 font-semibold">Resume Analyzer</h1>
        <h2 className="font-sans text-2xl text-white pb-8">Upload your resume to predict the Category</h2>
      </div>

      <div className="bg-gray-500 rounded-lg p-8 flex md:flex-row justify-between m-4 border-2 border-blue-400 flex-col ">
        <div>
          <label className="flex items-center space-x-4 cursor-pointer ">
          <LuUpload size="8%" color='white' />
            <input type="file" onChange={handleFileChange} className="hidden" />
            <span className="border-4 border-[#021526] text-white font-semibold bg-gray-700 md:text-xl text-sm px-4 py-2 md:px-6 md:py-4 rounded-lg hover:bg-slate-800 hover:shadow-lg transition-all duration-300 ease-in-out">
              Choose File
            </span>
          </label>
          {fileName && (
            <div className="flex items-center space-x-2 mt-5">
            <p className="text-white md:text-2xl font-semibold text-xl">Selected file: {fileName}</p>
            <button
              onClick={handleFileRemove}
              className="text-white focus:outline-none"
            >
              <GiCancel
                size={"15%"}  
                className="transition-transform duration-300 ease-in-out transform hover:scale-90 hover:text-red-500 pb-4  rounded-full md:p-2 "
              />
            </button>
          </div>
          )}
        </div>
        <div className='pt-10'>
          <button onClick={handleSubmit} className="text-white font-semibold bg-gray-700  md:px-6 md:py-4  text-xl px-4 py-2 rounded-lg hover:bg-slate-800 hover:shadow-lg transition-all duration-300 ease-in-out border-4 border-[#021526] ">
            Analyze Resume
          </button>
        </div>
      </div>

      <div className={`transition-opacity duration-300 ${showError ? 'opacity-100' : 'opacity-0'} ${error ? 'block' : 'hidden'}`}>
        {error && <p className="font-sans text-xl text-red-600 font-semibold px-4 pt-4">{error}</p>}
      </div>

      <div className='bg-gray-500 m-4 p-4 rounded-lg h-1/2 border-2 border-blue-400'>
        {category && (
          <div>
            
            <h2 className='font-sans font-semibold text-white text-2xl md:text-3xl mb-4'>Category : {category}</h2>
            <h2 className='font-sans font-semibold text-white text-2xl md:text-3xl mb-4'>
  ATS Score : {atsScore ? (atsScore * 100).toFixed(2) + '%' : 'N/A'}
</h2>

            <div className='flex flex-col '>
            <h2 className='font-sans font-semibold text-white text-2xl md:text-3xl mb-4'>Highlighted Skills :</h2>
            <ul>
              {highlightedSkills.map((skill, index) => (
                <li key={index} className='font-sans font-semibold text-white text-2xl mb-2 uppercase'>{skill}</li>
              ))}
            </ul>
              </div>
           
            <h2 className='font-sans font-semibold text-white text-2xl md:text-3xl mb-4 uppercase mt-6'>Suggested Role : {suggestedRole} </h2>

          </div>
        )}
      </div>
    </div>
  );
}

export default App;
