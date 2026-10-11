"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { Field, Input } from "@/components/ui/form";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (password.length < 10) {
      setMessage("Password must contain at least 10 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });
      const d = await r.json();
      if (!r.ok) {
        setMessage(d.error?.message ?? "Registration failed.");
        return;
      }
      window.location.href = "/progress";
    } catch {
      setMessage("Unable to connect to authentication server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="card auth-card" aria-label="Registration form">
        <div className="card__header">
          <span className="eyebrow">LogicLab Registration</span>
          <h1>Create Your Account</h1>
          <p className="text-muted">
            Save progress, settings, and challenge evaluations across sessions.
          </p>
        </div>

        <form onSubmit={submit} className="auth-form">
          <Field label="Username" hint="3 to 50 characters, letters and numbers.">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              maxLength={50}
              placeholder="algolearner"
              required
              autoComplete="username"
            />
          </Field>
          <Field label="Email Address">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              autoComplete="email"
            />
          </Field>
          <Field label="Password" hint="Use at least 10 characters with mixed cases.">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={10}
              maxLength={200}
              placeholder="••••••••••••"
              required
              autoComplete="new-password"
            />
          </Field>

          {message && (
            <div className="status-message status-message--error" role="alert">
              {message}
            </div>
          )}

          <button className="button button--primary" type="submit" disabled={submitting}>
            {submitting ? "Creating Account…" : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          <p className="text-caption text-muted">
            Already have an account?{" "}
            <Link href="/login" className="link-highlight">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
