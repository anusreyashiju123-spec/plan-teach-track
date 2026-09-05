import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { GlowBackdrop } from "@/components/acadify/primitives";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Acadify — Teacher Login | Smart Syllabus Management" },
      {
        name: "description",
        content:
          "Sign in to Acadify to plan your syllabus, split it into modules and topics, record classes and track whether you are ahead or behind schedule.",
      },
      { property: "og:title", content: "Acadify — Smart Syllabus Management for Teachers" },
      {
        property: "og:description",
        content: "Plan. Teach. Track. Complete. Syllabus pacing built for teachers.",
      },
    ],
  }),
  component: LoginPage,
});

const REMEMBER_KEY = "acadify.remember";

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as { name?: string; email?: string };
      setName(parsed.name ?? "");
      setEmail(parsed.email ?? "");
    }
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      toast.error("Please fill in your name, email and password.");
      return;
    }
    setBusy(true);
    try {
      if (remember) {
        localStorage.setItem(REMEMBER_KEY, JSON.stringify({ name, email }));
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { name: name.trim() } },
        });
        if (error) throw error;
        const signIn = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signIn.error) {
          toast.success("Account created. Please check your email, then log in.");
          setMode("login");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }

      await supabase
        .from("teachers")
        .update({ name: name.trim() })
        .eq("email", email.trim().toLowerCase());

      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleForgot() {
    if (!email.trim()) {
      toast.error("Enter your email first, then choose Forgot Password.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset link sent to your email.");
  }

  const inputClass =
    "w-full rounded-lg bg-input px-3 py-2.5 text-sm ring-1 ring-border placeholder:text-fog focus:ring-ring focus:outline-none";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <GlowBackdrop />
      <section className="relative z-10 grid min-h-screen place-items-center px-4 py-12">
        <div className="rise-in w-full max-w-sm">
          <div className="glass rounded-[20px] p-8">
            <div className="mb-8">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-lg bg-primary/20 font-display text-lg font-semibold text-primary ring-1 ring-primary/40">
                  A
                </div>
                <span className="font-display text-2xl font-semibold tracking-tight">ACADIFY</span>
              </div>
              <p className="mt-2 text-sm tracking-wide text-muted-foreground">
                Plan. Teach. Track. Complete.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Teacher Name
                </label>
                <input
                  id="name"
                  className={inputClass}
                  placeholder="Enter your name"
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={inputClass}
                  placeholder="Enter your email"
                  maxLength={255}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-xs font-medium text-muted-foreground"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className={inputClass}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    className="size-3.5 rounded accent-primary"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={handleForgot}
                  className="text-xs text-primary/80 hover:text-primary"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground ring-1 ring-primary/50 transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {busy ? "Please wait…" : mode === "login" ? "LOGIN" : "CREATE ACCOUNT"}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              {mode === "login" ? "New teacher?" : "Already have an account?"}{" "}
              <button
                type="button"
                className="font-medium text-primary hover:underline"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
              >
                {mode === "login" ? "Create your account" : "Log in instead"}
              </button>
            </p>
          </div>
          <p className="mt-4 text-center text-[11px] text-fog">
            Faculty tool — syllabus pacing only
          </p>
        </div>
      </section>
    </div>
  );
}
