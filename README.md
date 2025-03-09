Interview-Tayari-Assignment-


Setup Instructions for Local system :

Set up backend

	1	Clone the repository -> git clone 
	2	move to server folder -> cd server
	3	create a .env file inside server folder
	4	inside .env put following keys -> MONGO_URI=use your mongoDB URI JWT_SECRET=use your mongoURI
	5	Run -> npm install
	6	Start Backend server -> npx nodemon index.js
SET UP Frontend

	7	Move to client folder -> cd .. cd client
	8	create a .env inside client folder -> REACT_APP_BASE_URL=http://localhost:5000
	9	RUN following command -> npm install
	10	Start front end server -> npm start
Tech Stack

Frontend: React + Tailwind CSS
Backend: Node.js + Express
AI Model: Gemini API (Google’s LLM)
Database: MongoDB
Hosting:
Frontend: Render (Static Web Service)
Backend: Render (Web Service)
Design Choices

	1	AI Model Selection: Gemini API: -> Used Google’s Gemini API instead of training a custom model to ensure high accuracy and minimal setup. -> NLP-based processing enables context-aware analysis of questionnaire responses.
	2	Frontend: -> React : Ensures a fast and efficient frontend with a modular component structure. -> Tailwind CSS: Provides clean, utility-based styling for better maintainability.
	3	Backend : -> Node.js + Express: Lightweight and scalable backend for handling API requests efficiently.
How your AI model would use the questionnaire data ?

My AI model utilizes the Gemini API, a Large Language Model (LLM), to process and analyze the questionnaire data. When a user submits their responses, the model:
	1	The AI processes the textual answers using Natural Language Processing (NLP) techniques, extracting key insights, sentiments, and patterns.
	2	Based on the input, Gemini provides relevant feedback, suggestions, or classifications tailored to the user's responses.
	3	Since Gemini is trained on a vast dataset, it understands nuances and provides high-quality responses aligned with human-like reasoning.
Justification

	1	Gemini is a pre-trained LLM that excels at understanding, generating, and summarizing human-like text.
	2	The model uses NLP to comprehend questionnaire responses, extract meaning, and generate relevant insights.
	3	No need to build and train a custom AI model, which saves time and computational resources.
Alternative Approach

If training a custom AI model were necessary, we could use a fine-tuned Transformer-based model (e.g., BERT, GPT) to classify responses or extract key insights. However, leveraging Gemini eliminates the need for training and ensures high-quality outputs with minimal setup.
