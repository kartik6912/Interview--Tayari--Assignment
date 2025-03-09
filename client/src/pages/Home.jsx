import { useState , useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { chatSession } from "../GeminiAIModal";
import axios from "axios";
import { FaPlus } from "react-icons/fa";


const Home = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mockTests, setMockTests] = useState([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    experience: "",
    ctc: "",
    targetCompany: "Startup",
    timeCommitment: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("Form Data:", formData);

    const InputPrompt = `Relevant experience: ${formData.experience}, 
Current CTC in INR: ${formData.ctc}, 
Target company: ${formData.targetCompany}, 
Time commitment: ${formData.timeCommitment}. 

Based on the given experience, current CTC, target company, and time commitment, generate a structured learning plan for SQL as a Data Engineer. The response must be in **valid JSON format** with the following structure:

{
  "plan": {
    "phase_1": {
      "name": "Phase 1 Name",
      "tasks": ["Task 1", "Task 2", "Task 3"]
    },
    "phase_2": {
      "name": "Phase 2 Name",
      "tasks": ["Task 1", "Task 2"]
    },
    ...
  },
  "sql_queries": [
    {
      "question": "SQL question here",
      "difficulty": "Easy/Medium/Hard"
    },
    ...
  ]
}

The **plan** should be structured into multiple phases, each containing a **name** and an array of **tasks** for learning SQL concepts step by step.

The **sql_queries** array should contain **at least 25 SQL-related questions**, each having a **question text** and a **difficulty level** (Easy, Medium, or Hard). 

Ensure the JSON is properly formatted and contains no extra text outside the JSON structure.
`;

    try {
      // Get AI response
      const result = await chatSession.sendMessage(InputPrompt);
      const aiResponse = (await result.response.text()).replace('```json','').replace('```','')
      console.log(JSON.parse(aiResponse));
      
      const userId = localStorage.getItem("userId"); 
      console.log(userId)
        if (!userId) {
            alert("User ID not found. Please log in again.");
            return;
        }

      // Store in database
      const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/create-mock`, {
        totalExperience: formData.experience,
        totalCTC: formData.ctc,
        totalTimeCommitment: formData.timeCommitment,
        targetCompany: formData.targetCompany,
        aiResponse:aiResponse,
        userId: userId
      }, { withCredentials: true });




      // Navigate to mockId page 
      navigate(`/${res.data.mockTest.mockId}`);
    } catch (err) {
      alert(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  const fetchMockTests = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("User ID not found. Please log in again.");
      return;
    }

    try {
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/mocks/${userId}`, { withCredentials: true });
      setMockTests(res.data);
    } catch (err) {
      console.error("Error fetching mock tests:", err);
    }
  };

  useEffect(() => {
    fetchMockTests();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-300 p-8 bg-gradient-to-br from-blue-500 to-indigo-600">
      <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-8">Start Your SQL Learning</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* card for add new sql kit  */}
        <div
          className="bg-white bg-opacity-80 shadow-lg backdrop-blur-lg rounded-lg flex flex-col items-center justify-center p-8 cursor-pointer hover:shadow-2xl transition transform hover:scale-105"
          onClick={() => setShowModal(true)}
        >
          <FaPlus className="text-5xl text-gray-700" />
          <p className="mt-3 text-lg text-gray-700 font-semibold">Create New Kit</p>
        </div>
      </div>

      {/* Previous SQL Kits Section */}
      <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4">Your Previous SQL Kits</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockTests.map((mock) => (
          <div
            key={mock.mockId}
            className="bg-white bg-opacity-80 shadow-lg backdrop-blur-lg rounded-lg p-6 cursor-pointer hover:shadow-2xl transition transform hover:scale-105"
            onClick={() => navigate(`/${mock.mockId}`)}
          >
            <h2 className="text-xl font-semibold text-gray-900">{mock.targetCompany}</h2>
            <p className="text-gray-700">Experience: {mock.totalExperience} years</p>
            <p className="text-gray-700">Commitment: {mock.totalTimeCommitment} hours/day</p>
            <p className="text-gray-700">Current CTC: {mock.totalCTC} LPA</p>
          </div>
        ))}
      </div>

      {/* Modal for new kit creation */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-semibold mb-4">Add Your Details</h2>
            <form onSubmit={handleSubmit}>
              <label className="block mb-2">Experience (years):
                <input type="number" name="experience" value={formData.experience} onChange={handleChange} className="w-full p-2 border rounded mt-1" required />
              </label>
              <label className="block mb-2">CTC (in LPA):
                <input type="number" name="ctc" value={formData.ctc} onChange={handleChange} className="w-full p-2 border rounded mt-1" required />
              </label>
              <label className="block mb-2">Target Company:
                <select name="targetCompany" value={formData.targetCompany} onChange={handleChange} className="w-full p-2 border rounded mt-1" required>
                  <option value="Startup">Startup</option>
                  <option value="Large Corporation">Large Corporation</option>
                </select>
              </label>
              <label className="block mb-4">Time Commitment (hours/day):
                <input type="number" name="timeCommitment" value={formData.timeCommitment} onChange={handleChange} className="w-full p-2 border rounded mt-1" required />
              </label>
              <div className="flex justify-end gap-2">
                <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" disabled={loading} className="bg-green-500 text-white px-4 py-2 rounded">{loading ? "Generating..." : "Submit"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
