"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { Field, Input } from "@/components/ui/form";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setSubmitting(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const d = await r.json();
      if (!r.ok) {
        setMessage(d.error?.message ?? "Invalid email or password.");
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
      <section className="card auth-card" aria-label="Sign in form">
        <div className="card__header">
          <span className="eyebrow">LogicLab Authentication</span>
          <h1>Welcome Back</h1>
          <p className="text-muted">
            Sign in to sync your algorithm progress and laboratory preferences.
          </p>
        </div>

        <form onSubmit={submit} className="auth-form">
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
          <Field label="Password">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoComplete="current-password"
            />
          </Field>

          {message && (
            <div className="status-message status-message--error" role="alert">
              {message}
            </div>
          )}

          <button className="button button--primary" type="submit" disabled={submitting}>
            {submitting ? "Signing In…" : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <p className="text-caption text-muted">
            New to LogicLab?{" "}
            <Link href="/register" className="link-highlight">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
