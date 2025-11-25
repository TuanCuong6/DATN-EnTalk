// admin/src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout/Layout";

// Pages
import Login from "./pages/Auth/Login";
import Dashboard from "./pages/Dashboard";
import UserList from "./pages/Users/UserList";
import UserAdd from "./pages/Users/UserAdd";
import UserEdit from "./pages/Users/UserEdit";
import ReadingList from "./pages/Readings/ReadingList";
import ReadingAdd from "./pages/Readings/ReadingAdd";
import ReadingEdit from "./pages/Readings/ReadingEdit";
import TopicList from "./pages/Topics/TopicList";
import TopicAdd from "./pages/Topics/TopicAdd";
import TopicEdit from "./pages/Topics/TopicEdit";
import RecordList from "./pages/Records/RecordList";
import FeedbackList from "./pages/Feedbacks/FeedbackList";
import FeedbackDetail from "./pages/Feedbacks/FeedbackDetail";
import EmailMarketing from "./pages/EmailMarketing/EmailMarketing";
import CampaignHistory from "./pages/EmailMarketing/CampaignHistory";

// Loading Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div>Loading...</div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return admin ? children : <Navigate to="/login" />;
};

function AppContent() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Users Routes */}
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Layout>
                <UserList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/add"
          element={
            <ProtectedRoute>
              <Layout>
                <UserAdd />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/edit/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <UserEdit />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Readings Routes */}
        <Route
          path="/readings"
          element={
            <ProtectedRoute>
              <Layout>
                <ReadingList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/readings/add"
          element={
            <ProtectedRoute>
              <Layout>
                <ReadingAdd />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/readings/edit/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ReadingEdit />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Topics Routes */}
        <Route
          path="/topics"
          element={
            <ProtectedRoute>
              <Layout>
                <TopicList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/topics/add"
          element={
            <ProtectedRoute>
              <Layout>
                <TopicAdd />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/topics/edit/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <TopicEdit />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Records Routes */}
        <Route
          path="/records"
          element={
            <ProtectedRoute>
              <Layout>
                <RecordList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedbacks"
          element={
            <ProtectedRoute>
              <Layout>
                <FeedbackList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedbacks/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <FeedbackDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/email-marketing"
          element={
            <ProtectedRoute>
              <Layout>
                <EmailMarketing />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/email-marketing/history"
          element={
            <ProtectedRoute>
              <Layout>
                <CampaignHistory />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Catch all route - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
