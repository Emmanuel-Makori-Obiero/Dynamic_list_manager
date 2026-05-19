/**
 * KENYAN ACADEMY — CENTRAL MANAGEMENT ENGINE (2026)
 * Optimized to prevent global variable collision
 */

const SUPABASE_URL = "https://yztdkzwkdvvvnwgxhqhl.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6dGRrendrZHZ2dm53Z3hocWhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NzcxMjMsImV4cCI6MjA5NDU1MzEyM30.iFP77TiIpMNYSY7IaAJPz_rH3ADD4ymVp5iiPOje6kY";

// Use 'var' or check for existence to prevent "Already Declared" errors
if (typeof window.mySupabase === "undefined") {
  window.mySupabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
const client = window.mySupabase;

document.addEventListener("DOMContentLoaded", async () => {
  // UI Selectors
  const studentForm = document.getElementById("studentForm");
  const targetLoginForm = document.getElementById("loginForm");
  const targetSignUpForm = document.getElementById("signUpForm");

  // ... rest of your logic remains the same,
  // just change 'supabase' to 'client' in your calls:
  // e.g., await client.auth.getSession();

  // LOGIN FLOW HANDLER EXAMPLE
  if (targetLoginForm) {
    targetLoginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      try {
        const { error } = await client.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.replace("dashboard.html");
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // SIGN UP FLOW HANDLER EXAMPLE
  if (targetSignUpForm) {
    targetSignUpForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const name = document.getElementById("name").value.trim();

      try {
        const { error } = await client.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        alert("Success! Please sign in.");
        window.location.replace("login.html");
      } catch (err) {
        alert(err.message);
      }
    });
  }
});
