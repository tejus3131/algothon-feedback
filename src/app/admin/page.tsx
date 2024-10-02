'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '';

// Login Component
function Login({ onLogin }: { onLogin: () => void }) {
  const [inputPassword, setInputPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword === ADMIN_PASSWORD) {
      localStorage.setItem('admin_password', inputPassword);
      onLogin();
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Admin Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-64">
        <input
          type="password"
          placeholder="Enter Admin Password"
          value={inputPassword}
          onChange={(e) => setInputPassword(e.target.value)}
          className="p-3 border rounded-md focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="py-3 px-5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Login
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}

// Admin Page Component
export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  interface Feedback {
    id: number;
    feedback_text: string;
    created_at: string;
    checked: boolean;
  }

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedPassword = localStorage.getItem('admin_password');
    if (savedPassword === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_password');
    setIsLoggedIn(false);
  };

  const fetchFeedbacks = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
    if (error) {
      setError('Error fetching feedbacks.');
    } else {
      setFeedbacks(data);
    }
    setLoading(false);
  };

  const handleCheck = async (id: number, checked: boolean) => {
    const { error } = await supabase
      .from('feedback')
      .update({ checked: !checked })
      .eq('id', id);

    if (!error) {
      fetchFeedbacks();  // Refetch after updating
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this feedback?');
    if (confirmDelete) {
      const { error } = await supabase.from('feedback').delete().eq('id', id);

      if (!error) {
        fetchFeedbacks();  // Refetch after deletion
      } else {
        setError('Error deleting feedback.');
      }
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchFeedbacks();
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading feedback...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Feedback</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white py-2 px-4 rounded-md">
          Logout
        </button>
      </div>

      {feedbacks.length === 0 ? (
        <p className="text-center">No feedback available.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {feedbacks.map((feedback) => (
            <div
              key={feedback.id}
              className={`p-4 border rounded-md ${feedback.checked ? 'bg-green-100' : 'bg-gray-100'}`}
            >
              <p className="text-lg">{feedback.feedback_text}</p>
              <p className="text-sm text-gray-500 mt-2">Submitted on: {new Date(feedback.created_at).toLocaleString()}</p>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleCheck(feedback.id, feedback.checked)}
                  className={`py-2 px-4 rounded-md ${feedback.checked ? 'bg-gray-400' : 'bg-blue-500 text-white'}`}
                >
                  {feedback.checked ? 'Mark as Unchecked' : 'Mark as Checked'}
                </button>
                <button
                  onClick={() => handleDelete(feedback.id)}
                  className="py-2 px-4 bg-red-500 text-white rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
