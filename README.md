# 🌍 WanderAI – AI Travel Itinerary Generator

WanderAI is a full-stack AI-powered travel itinerary generator that creates personalized travel plans based on a user's destination, trip duration, budget, and travel style.

The project is currently under active development as I continue learning and implementing modern AI application development concepts.

---

## 🚧 Project Status

> **In Development**

WanderAI is an ongoing learning project where I am exploring how to build production-style AI-powered web applications using React, Node.js, Express, and the OpenAI API.

New features and improvements are continuously being added as I progress through my AI learning journey.

---

## ✨ Current Features

- Generate personalized AI travel itineraries
- Input destination, trip duration, budget, and travel style
- Real-time streaming itinerary generation
- Follow-up AI travel assistant ("Ask")
- Streaming responses for follow-up questions
- Multi-turn conversation context
- Responsive React user interface
- Loading and error states
- RESTful Express backend
- Controller-Service architecture
- Secure server-side OpenAI API integration
- Environment variable management

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript (ES6+)
- CSS

### Backend

- Node.js
- Express.js
- REST APIs

### AI

- OpenAI API
- Prompt Engineering

### Development Tools

- Git
- GitHub
- Postman

---

## 📁 Project Structure

```
wanderai/
│
├── client/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── assets/
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── config/
│   └── server.js
│
└── README.md
```

---

## ⚙️ How It Works

1. User enters:
   - Destination
   - Number of days
   - Budget
   - Travel style

2. React sends the request to the Express backend.

3. The backend securely communicates with the OpenAI API.

4. AI generates a personalized travel itinerary.

5. The itinerary is returned and displayed in the frontend.

6. After the itinerary is generated, the user can ask follow-up
   questions related to the trip.

7. Previous conversation context is included so the AI can respond
   based on the generated itinerary and earlier questions.

---

## 🎯 Learning Goals

This project is helping me gain hands-on experience with:

- Building AI-powered full-stack applications
- OpenAI API integration
- Prompt engineering
- Multi-turn AI conversations
- Managing conversational context with LLM APIs
- REST API development
- Secure server-side API communication
- Component-based React architecture
- Error and loading state handling
- Environment variable management
- Scalable backend architecture

---

## 🚀 Planned Improvements

The project is still evolving. Planned enhancements include:

- Save and manage trips
- User authentication
- Trip history
- PDF itinerary export

---

## 📸 Screenshots

Screenshots will be added as the UI continues to evolve.

---

## 📝 Note

This project is currently under active development as part of my journey into AI-powered application development.

The focus is on learning best practices while building a production-style full-stack application using modern web technologies and LLM APIs.

---
