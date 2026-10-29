"use client";

import React, { useState } from "react";
import { Button, Input, Label, Notice } from "@/components/ui";

export function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ password }),
      });

      if (res.status === 401) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Invalid credentials");
      } else if (res.status === 429) {
        setError("Too many attempts. Please try again later.");
      } else if (res.status === 503) {
        setError("Admin access is currently disabled.");
      } else if (!res.ok) {
        setError("Sign in failed. Please check your credentials.");
      } else {
        window.location.href = "/admin";
      }
    } catch {
      setError("Network or server error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} action="/api/admin/login" method="post" className="space-y-4">
      {error && (
        <Notice type="safety" title="Authentication error">
          <div role="alert">{error}</div>
        </Notice>
      )}

      <div>
        <Label htmlFor="password" required>
          Admin Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          hasError={!!error}
          aria-describedby={error ? "password-error" : undefined}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full font-semibold"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing in..." : "Sign in to portal"}
      </Button>
    </form>
  );
}
