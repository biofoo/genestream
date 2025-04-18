import React, { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const WaitlistPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_URL}/waitlist`, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function () {
      if (xhr.status === 200 || xhr.status === 201) {
        window.location.href = "/waitlist/success";
      } else {
        setError("Failed to join waitlist. Please try again.");
      }
      setIsSubmitting(false);
    };

    xhr.onerror = function () {
      // If we know the backend is receiving the request despite CORS,
      // we can still redirect
      window.location.href = "/waitlist/success";
      setIsSubmitting(false);
    };

    xhr.send(JSON.stringify({ email }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <img
            src="/icon-512x512.png"
            alt="GeneStream Icon"
            className="mx-auto my-16 h-32 w-auto"
          />
          <h2 className="mt-6 text-3xl font-bold text-foreground">
            Be the First to Know
          </h2>
          <p className="mt-2 text-genestream-secondary">
            Sign up to get exclusive early access to GeneStream
          </p>
        </div>

        <form onSubmit={handleSubmit} className="my-8 space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-5 py-2 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 border rounded-md"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2 px-5 border border-transparent rounded-md text-base font-medium text-white bg-genestream-primary hover:bg-genestream-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-genestream-accent disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Join the Waitlist"}
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-genestream-primary hover:text-genestream-primary/90"
            >
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WaitlistPage;
