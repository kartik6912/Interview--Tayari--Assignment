import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { chatSession } from "../GeminiAIModal";
import { ClipLoader } from "react-spinners";

function MockTestPage() {
    const { mockId } = useParams();
    const [plan, setPlan] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState({});
    const username = localStorage.getItem("name");
    const [filterLevel, setFilterLevel] = useState("All");

    useEffect(() => {
        const fetchMockData = async () => {
            try {
                const response_getPlan = await axios.get(`${process.env.REACT_APP_BASE_URL}/${mockId}`);
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/trackProgress/${mockId}`);
                console.log("response is", response.data)
                setQuestions(response.data || []);

                if (response_getPlan.data && response_getPlan.data.aiResponse) {
                    let parsedResponse;
                    try {
                        parsedResponse = JSON.parse(response_getPlan.data.aiResponse);
                        console.log("Parsed response", parsedResponse);
                    } catch (error) {
                        console.error("Error parsing aiResponse:", error);
                        parsedResponse = {};
                    }

                    setPlan(parsedResponse.plan || {});
                } else {
                    setPlan({});
                }
            } catch (error) {
                console.error("Error fetching questions:", error);
            }
        };

        if (mockId) fetchMockData();
    }, [mockId]);

    const handleAnswerChange = (index, value) => {
        setQuestions((prev) => {
            const updated = [...prev];
            updated[index].userAnswer = value;
            return updated;
        });
    };

    const handleGetFeedback = async (question, userAnswer, questionId) => {
        
        try {
            setLoading((prev) => ({ ...prev, [questionId]: true }));
            const inputPrompt = `For the following question: ${question}, my answer is ${userAnswer}. Please give your feedback in a paragraph.`;
            const result = await chatSession.sendMessage(inputPrompt);
            const aiFeedback = await result.response.text();

            await axios.patch(`${process.env.REACT_APP_BASE_URL}/update-feedback/${questionId}`, {
                aiFeedback, userAnswer
            });

            setQuestions((prev) =>
                prev.map((q) =>
                    q._id === questionId ? { ...q, aiFeedback, userAnswer } : q
                )
            );
           
        } catch (error) {
            console.error("Error getting feedback:", error);
        }finally {
            // Reset loading 
            setLoading((prev) => ({ ...prev, [questionId]: false }));
        }
    };

    const handleMarkAsDone = async (questionId) => {
        try {
            await axios.patch(`${process.env.REACT_APP_BASE_URL}/update-status/${questionId}`, {
                questionStatus: "done",
            });

            setQuestions((prev) =>
                prev.map((q) =>
                    q._id === questionId ? { ...q, questionStatus: "done" } : q
                )
            );
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const filteredQuestions = filterLevel === "All" ? questions : questions.filter(q => q.level === filterLevel);
    const uniqueLevels = [...new Set(questions.map(q => q.level))];

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center p-6 relative ">
            {/* Progress Counter */}
            <div className="absolute top-6 right-6 w-20 h-20 flex items-center justify-center bg-blue-500 text-white text-xl font-bold rounded-full shadow-md">
                {questions.filter((q) => q.questionStatus === "done").length} / {questions.length}
            </div>

            <div className="max-w-3xl w-full">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
                    Great {username}, Here is your AI-curated SQL Plan
                </h1>

                {/* Learning Plan */}
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

                {/* Practice Questions */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">SQL Practice Questions</h2>
                    <select
                        className="p-2 border rounded-md"
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                    >
                        <option value="All">All Levels</option>
                        {uniqueLevels.map(level => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </select>
                </div>
                {filteredQuestions.length > 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300">
                        <ul className="space-y-4">
                            {filteredQuestions.map((q, index) => (
                                <li key={q._id} className="p-4 bg-gray-50 rounded-md border-l-4 border-blue-500">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-800 font-semibold">{q.question}</span>
                                        <span className={`px-2 py-1 text-xs font-bold uppercase rounded-full ${
                                            q.level === "Easy" ? "bg-green-200 text-green-800" :
                                            q.level === "Medium" ? "bg-yellow-200 text-yellow-800" :
                                            "bg-red-200 text-red-800"
                                        }`}>
                                            {q.level}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleMarkAsDone(q._id)}
                                        className={`px-3 py-1 text-white rounded-md transition ${q.questionStatus === "done" ? "bg-green-500" : "bg-gray-500"}`}
                                    >
                                        {q.questionStatus === "done" ? "✔ Done" : "Mark as Done"}
                                    </button>
                                </div>

                                {/* User's Previous Answer */}
                                {q.userAnswer && (
                                    <div className="mt-3 p-3 bg-blue-100 border border-dashed border-blue-400 rounded-md">
                                        <strong className="text-blue-700">Your Previous Answer:</strong>
                                        <p className="text-gray-700">{q.userAnswer}</p>
                                    </div>
                                )}

                                {/* AI Feedback */}
                                {q.aiFeedback && (
                                    <div className="mt-3 p-3 bg-green-100 border border-dashed border-green-400 rounded-md">
                                        <strong className="text-green-700">AI Feedback:</strong>
                                        <p className="text-gray-700">{q.aiFeedback}</p>
                                    </div>
                                )}

                                {/* Answer Input */}
                                <textarea
                                    className="w-full p-2 border rounded-md mt-2"
                                    rows="3"
                                    placeholder="Write your answer here..."
                                    value={q.userAnswer || ""}
                                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                                />
                                <button
                                    onClick={() => handleGetFeedback(q.question, q.userAnswer, q._id)}
                                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md transition hover:bg-blue-700"
                                >
                                    {loading[q._id] ? <ClipLoader color="#fff" size={20} /> : "Get Feedback"}
                                </button>
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
