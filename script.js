// /**
//  * KENYAN ACADEMY — CENTRAL MANAGEMENT ENGINE (2026)
//  * Optimized to prevent global variable collision
//  */

// const SUPABASE_URL = "https://yztdkzwkdvvvnwgxhqhl.supabase.co";
// const SUPABASE_ANON_KEY =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6dGRrendrZHZ2dm53Z3hocWhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NzcxMjMsImV4cCI6MjA5NDU1MzEyM30.iFP77TiIpMNYSY7IaAJPz_rH3ADD4ymVp5iiPOje6kY";

// // Use 'var' or check for existence to prevent "Already Declared" errors
// if (typeof window.mySupabase === "undefined") {
//   window.mySupabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// }
// const client = window.mySupabase;

// document.addEventListener("DOMContentLoaded", async () => {
//   // UI Selectors
//   const studentForm = document.getElementById("studentForm");
//   const targetLoginForm = document.getElementById("loginForm");
//   const targetSignUpForm = document.getElementById("signUpForm");

//   // ... rest of your logic remains the same,
//   // just change 'supabase' to 'client' in your calls:
//   // e.g., await client.auth.getSession();

//   // LOGIN FLOW HANDLER EXAMPLE
//   if (targetLoginForm) {
//     targetLoginForm.addEventListener("submit", async (e) => {
//       e.preventDefault();
//       const email = document.getElementById("email").value.trim();
//       const password = document.getElementById("password").value;

//       try {
//         const { error } = await client.auth.signInWithPassword({
//           email,
//           password,
//         });
//         if (error) throw error;
//         window.location.replace("dashboard.html");
//       } catch (err) {
//         alert(err.message);
//       }
//     });
//   }

//   // SIGN UP FLOW HANDLER EXAMPLE
//   if (targetSignUpForm) {
//     targetSignUpForm.addEventListener("submit", async (e) => {
//       e.preventDefault();
//       const email = document.getElementById("email").value.trim();
//       const password = document.getElementById("password").value;
//       const name = document.getElementById("name").value.trim();

//       try {
//         const { error } = await client.auth.signUp({
//           email,
//           password,
//           options: { data: { full_name: name } },
//         });
//         if (error) throw error;
//         alert("Success! Please sign in.");
//         window.location.replace("login.html");
//       } catch (err) {
//         alert(err.message);
//       }
//     });
//   }
// });
/**
 * KENYAN ACADEMY — CENTRAL MANAGEMENT ENGINE (2026)
 * Optimized to prevent global variable collision
 * Includes: Email/Password Auth + Google OAuth via Supabase
 */

const SUPABASE_URL = "https://yztdkzwkdvvvnwgxhqhl.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6dGRrendrZHZ2dm53Z3hocWhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NzcxMjMsImV4cCI6MjA5NDU1MzEyM30.iFP77TiIpMNYSY7IaAJPz_rH3ADD4ymVp5iiPOje6kY";

if (typeof window.mySupabase === "undefined") {
  window.mySupabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
const client = window.mySupabase;

// ─── GOOGLE OAUTH HELPER ────────────────────────────────────────────────────
// Call this from any "Sign in with Google" button click.
// redirectTo must match an Authorized Redirect URI in your Google Cloud Console.
// The one already set — https://lgeerpscqwhozfnmhaor.supabase.co/auth/v1/callback — is correct.
// After Google auth, Supabase redirects the user to the URL in `redirectTo` below.
// Change "dashboard.html" to wherever you want users to land after login.
async function signInWithGoogle() {
  const { error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/dashboard.html",
    },
  });
  if (error) alert(error.message);
}

// Expose globally so onclick="signInWithGoogle()" works in HTML
window.signInWithGoogle = signInWithGoogle;

// ─── AUTH STATE LISTENER ─────────────────────────────────────────────────────
// Handles the OAuth callback automatically — no extra code needed.
// When Supabase detects a session from the URL hash, this fires.
client.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_IN" && session) {
    // Only redirect if we're NOT already on the dashboard
    if (!window.location.pathname.includes("dashboard")) {
      window.location.replace("dashboard.html");
    }
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  const targetLoginForm = document.getElementById("loginForm");
  const targetSignUpForm = document.getElementById("signUpForm");
  const authActionLink = document.getElementById("authAction");
  const loginLink = document.getElementById("loginLink");
  const signupLink = document.getElementById("signupLink");

  // ─── SESSION CHECK ──────────────────────────────────────────────────────────
  // Show/hide Logout link based on active session
  const {
    data: { session },
  } = await client.auth.getSession();

  if (session) {
    if (authActionLink) authActionLink.classList.remove("hidden");
    if (loginLink) loginLink.classList.add("hidden");
    if (signupLink) signupLink.classList.add("hidden");
  }

  if (authActionLink) {
    authActionLink.addEventListener("click", async (e) => {
      e.preventDefault();
      await client.auth.signOut();
      window.location.replace("login.html");
    });
  }

  // ─── LOGIN FLOW ─────────────────────────────────────────────────────────────
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

    // Inject Google Sign-In button into login form
    injectGoogleButton(targetLoginForm);
  }

  // ─── SIGN UP FLOW ────────────────────────────────────────────────────────────
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
        alert(
          "Account created! Please check your email to confirm, then sign in.",
        );
        window.location.replace("login.html");
      } catch (err) {
        alert(err.message);
      }
    });

    // Inject Google Sign-In button into sign up form
    injectGoogleButton(targetSignUpForm);
  }
});

// ─── GOOGLE BUTTON INJECTOR ──────────────────────────────────────────────────
// Inserts a styled "Continue with Google" button + divider above the submit button.
function injectGoogleButton(form) {
  const submitWrapper = form.querySelector(".pt-2");
  if (!submitWrapper) return;

  const divider = document.createElement("div");
  divider.className = "relative my-2";
  divider.innerHTML = `
    <div class="absolute inset-0 flex items-center">
      <div class="w-full border-t border-slate-200"></div>
    </div>
    <div class="relative flex justify-center text-xs uppercase">
      <span class="bg-white px-3 text-slate-400 font-light tracking-wider">or</span>
    </div>
  `;

  const googleBtn = document.createElement("button");
  googleBtn.type = "button";
  googleBtn.onclick = signInWithGoogle;
  googleBtn.className =
    "flex w-full items-center justify-center gap-3 border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors tracking-wide";
  googleBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
    Continue with Google
  `;

  form.insertBefore(divider, submitWrapper);
  form.insertBefore(googleBtn, submitWrapper);
}
