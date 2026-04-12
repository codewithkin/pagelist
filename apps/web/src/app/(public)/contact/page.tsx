"use client";

import { useState } from "react";

const CONTACT_REASONS = [
  "General enquiry",
  "Author support",
  "Reader support",
  "Report an issue",
  "Press & media",
  "Partnership",
  "Other",
] as const;

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", reason: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate async send — replace with real API call when email service is wired up
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      {/* Header */}
      <div className="mb-16 max-w-xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-accent)]">
          Get in touch
        </p>
        <h1
          className="text-5xl font-normal leading-tight tracking-tight text-[var(--color-brand-primary)] sm:text-6xl"
          style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
        >
          We would love
          <br />
          to hear from you.
        </h1>
        <p className="mt-6 text-base leading-relaxed text-[var(--color-brand-muted)]">
          Whether you are an author looking for support, a reader with a question, or just someone
          curious about Pagelist — drop us a note and we will respond within one business day.
        </p>
      </div>

      {/* Divider */}
      <div className="mb-16 border-t border-[var(--color-brand-border)]" />

      <div className="grid gap-16 sm:grid-cols-3">
        {/* Sidebar info */}
        <div className="flex flex-col gap-8 sm:col-span-1">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-primary)]">
              Email
            </p>
            <a
              href="mailto:hello@pagelist.co"
              className="text-sm text-[var(--color-brand-muted)] transition-colors hover:text-[var(--color-brand-primary)]"
            >
              hello@pagelist.co
            </a>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-primary)]">
              Response time
            </p>
            <p className="text-sm text-[var(--color-brand-muted)]">Within one business day</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-primary)]">
              Author support
            </p>
            <p className="text-sm text-[var(--color-brand-muted)]">
              Questions about publishing, royalties, or your account — we are happy to help.
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-primary)]">
              Reader support
            </p>
            <p className="text-sm text-[var(--color-brand-muted)]">
              Issues with a purchase or download — reach out and we will sort it out.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="sm:col-span-2">
          {submitted ? (
            <div className="flex flex-col items-start justify-center rounded-2xl border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-raised)] px-8 py-12">
              <p
                className="mb-3 text-2xl font-normal text-[var(--color-brand-primary)]"
                style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
              >
                Message received.
              </p>
              <p className="text-sm leading-relaxed text-[var(--color-brand-muted)]">
                Thank you for reaching out. We will get back to you at{" "}
                <span className="font-medium text-[var(--color-brand-primary)]">{form.email}</span>{" "}
                within one business day.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({ name: "", email: "", reason: "", message: "" });
                }}
                className="mt-6 text-sm font-medium text-[var(--color-brand-accent)] transition-opacity hover:opacity-70"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="name"
                    className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-primary)]"
                  >
                    Your name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Jane Smith"
                    className="rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-raised)] px-4 py-3 text-sm text-[var(--color-brand-primary)] placeholder-[var(--color-brand-muted)] outline-none transition-colors focus:border-[var(--color-brand-primary)]"
                  />
                </div>
                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="email"
                    className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-primary)]"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="jane@example.com"
                    className="rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-raised)] px-4 py-3 text-sm text-[var(--color-brand-primary)] placeholder-[var(--color-brand-muted)] outline-none transition-colors focus:border-[var(--color-brand-primary)]"
                  />
                </div>
              </div>

              {/* Reason */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="reason"
                  className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-primary)]"
                >
                  Reason for contact
                </label>
                <select
                  id="reason"
                  name="reason"
                  required
                  value={form.reason}
                  onChange={handleChange}
                  className="rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-raised)] px-4 py-3 text-sm text-[var(--color-brand-primary)] outline-none transition-colors focus:border-[var(--color-brand-primary)]"
                >
                  <option value="" disabled>
                    Select a reason…
                  </option>
                  {CONTACT_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="message"
                  className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-primary)]"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us what's on your mind…"
                  className="resize-none rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-raised)] px-4 py-3 text-sm text-[var(--color-brand-primary)] placeholder-[var(--color-brand-muted)] outline-none transition-colors focus:border-[var(--color-brand-primary)]"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-[var(--color-brand-primary)] px-7 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Sending…" : "Send message"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
