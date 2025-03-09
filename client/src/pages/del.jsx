import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function MockTestPage() {
    const { mockId } = useParams();
    const [plan, setPlan] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [progress, setProgress] = useState({});
    const username = localStorage.getItem("name");

    useEffect(() => {
        const fetchMockData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/${mockId}`);
                console.log("Raw API Response:", response.data);

                if (response.data && response.data.aiResponse) {
                    let parsedResponse;
                    try {
                        parsedResponse = JSON.parse(response.data.aiResponse);
                        console.log("Parsed response", parsedResponse);
                    } catch (error) {
                        console.error("Error parsing aiResponse:", error);
                        parsedResponse = {};
                    }

                    setPlan(parsedResponse.plan || {});
                    setQuestions(parsedResponse.sql_queries || []);
                    setProgress({});
                } else {
                    setPlan({});
                    setQuestions([]);
                    setProgress({});
                }
            } catch (error) {
                console.error("Error fetching mock test:", error);
            }
        };

        if (mockId) fetchMockData();
    }, [mockId]);

    const handleMarkAsDone = (index) => {
        setProgress((prev) => ({ ...prev, [index]: { ...prev[index], done: !prev[index]?.done } }));
    };

    const handleAnswerChange = (index, value) => {
        setProgress((prev) => ({ ...prev, [index]: { ...prev[index], answer: value } }));
    };

    const toggleAnswerBox = (index) => {
        setProgress((prev) => ({ ...prev, [index]: { ...prev[index], showAnswerBox: !prev[index]?.showAnswerBox } }));
    };

    const getTotalDone = () => {
        return Object.values(progress).filter((p) => p.done).length;
    };

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center p-6 relative">
            {/* Progress Circle */}
            <div className="absolute top-6 right-6 w-20 h-20 flex items-center justify-center bg-blue-500 text-white text-xl font-bold rounded-full shadow-md">
                {getTotalDone()} / {questions.length}
            </div>

            <div className="max-w-3xl w-full">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
                    Great {username}, Here is your AI-curated SQL Plan
                </h1>

                {plan && Object.keys(plan).length > 0 ? (
                    <div className="bg-green-100 p-6 rounded-lg shadow-md mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">SQL Learning Plan</h2>
                        {Object.entries(plan).map(([phaseKey, phase]) => (
                            <div key={phaseKey} className="mb-6 p-4 border border-green-300 rounded-md">
                                <h3 className="text-xl font-semibold text-gray-700">{phase?.name || "No Title"}</h3>

                                <h4 className="text-lg font-medium text-gray-600 mt-2">Activities:</h4>
                                <ul className="list-disc pl-5 text-gray-700">
                                    {phase?.tasks?.length > 0 ? (
                                        phase.tasks.map((task, i) => <li key={i}>{task}</li>)
                                    ) : (
                                        <li>No activities available</li>
                                    )}
                                </ul>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-600">Loading or No Data Available...</p>
                )}

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">SQL Practice Questions</h2>
                {questions.length > 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300">
                        <ul className="space-y-4">
                            {questions.map((q, index) => (
                                <li key={index} className="p-4 bg-gray-50 rounded-md border-l-4 border-blue-500">
                                    <div className="flex justify-between items-center">
                                        <span>
                                            <strong className="text-blue-600">({q.difficulty})</strong> {q.question}
                                        </span>
                                        <button
                                            onClick={() => handleMarkAsDone(index)}
                                            className={`px-3 py-1 text-white rounded-md transition ${
                                                progress[index]?.done ? "bg-green-500" : "bg-gray-500"
                                            }`}
                                        >
                                            {progress[index]?.done ? "✔ Done" : "Mark as Done"}
                                        </button>
                                    </div>

                                    {/* Answer Toggle Button */}
                                    <button
                                        onClick={() => toggleAnswerBox(index)}
                                        className="mt-2 text-sm text-blue-600 underline"
                                    >
                                        {progress[index]?.showAnswerBox ? "Hide Answer Box" : "Write Your Answer"}
                                    </button>

                                    {/* Answer Input & Get Feedback Button */}
                                    {progress[index]?.showAnswerBox && (
                                        <div className="mt-3">
                                            <textarea
                                                className="w-full p-2 border rounded-md"
                                                rows="3"
                                                placeholder="Write your answer here..."
                                                value={progress[index]?.answer || ""}
                                                onChange={(e) => handleAnswerChange(index, e.target.value)}
                                            />
                                            <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md">
                                                Get Feedback
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p className="text-center text-gray-600">No questions available</p>
                )}
            </div>
        </div>
    );
}

export default MockTestPage;
