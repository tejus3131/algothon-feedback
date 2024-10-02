'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<string>('');
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (feedback.trim() === '') {
      setStatus('Feedback cannot be empty!');
      return;
    }

    const { error } = await supabase.from('feedback').insert([{ feedback }]);

    if (error) {
      setStatus(`Error submitting feedback. Please try again.\n ${error.message}`);
    } else {
      setStatus('Thank you for your feedback!');
      setFeedback('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <h1 className="text-4xl font-bold mb-4">Anonymous Feedback</h1>
      <p className="text-center mb-6 text-lg">We value your feedback. Please provide your comments on the recent event.</p>

      <form onSubmit={handleSubmit} className="w-full max-w-lg flex flex-col gap-4">
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Enter your feedback here..."
          rows={6}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
        ></textarea>
        <button
          type="submit"
          className="py-3 px-5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Submit Feedback
        </button>
      </form>

      {status && (
        <p className={`mt-4 text-center ${status.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
          {status}
        </p>
      )}
    </div>
  );
}
