<div align="center">

# AssignMate
### Empowering Academic Success via Peer-to-Peer Support

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)](https://deepmind.google/technologies/gemini/)

</div>

---

## 🚀 Overview

**AssignMate** is a revolutionary peer-to-peer academic assistance platform designed to connect students who need help with verified seniors and peers from their own college. By bridging the gap between those who need academic support and those who have mastered the curriculum, AssignMate creates a safe, trusted, and efficient marketplace for academic success.

Unlike generic freelancing platforms, AssignMate focuses on **hyper-local trust**, ensuring that the person helping you understands your specific professor's requirements and college's standards.

## ✨ Key Features

- **🛡️ Secure Escrow System**: Payments are held safely in escrow and only released when the student is 100% satisfied with the work.
- **✅ Verified Profiles**: Strict college ID verification ensures all writers are legitimate seniors from your institution.
- **💬 Real-Time Chat**: Seamlessly negotiate terms, share files, and discuss requirements with instant messaging.
- **🤖 Gemini AI Integration**: A smart AI assistant (Gemini) helps draft support tickets, answers FAQs, and provides 24/7 assistance.
- **📍 Milestone Tracking**: Break down large assignments into manageable milestones with tracked progress and payments.
- **📝 Plagiarism Checks**: Integrated checks to ensuring all delivered work is original and academically sound.

## 🛠️ Tech Stack

This project is built with a modern, robust technology stack ensuring speed, security, and scalability.

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | [React](https://react.dev/) + [Vite](https://vitejs.dev/) | High-performance user interface. |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Modern, utility-first CSS framework. |
| **Backend** | [Firebase](https://firebase.google.com/) | Auth, Firestore (Database), and Storage. |
| **AI Layer** | [Gemini API](https://deepmind.google/technologies/gemini/) | Intelligence for chat and support. |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) | Smooth UI transitions and effects. |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, consistent iconography. |
| **Testing** | [Playwright](https://playwright.dev/) | End-to-end testing framework. |

## 🏁 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- A **Firebase** project with Auth, Firestore, and Storage enabled.
- A **Google Gemini API Key**.

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/assignmate.git
    cd assignmate
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment Variables**
    Create a `.env.local` file in the root directory and add your keys:
    ```env
    VITE_FIREBASE_API_KEY=your_firebase_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    
    VITE_GEMINI_API_KEY=your_gemini_api_key
    ```

4.  **Run the application**
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` in your browser to view the app.

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to get started, our code of conduct, and the process for submitting pull requests.

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Made with ❤️ by the AssignMate Team</p>
</div>
