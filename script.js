/**
 * KENYAN ACADEMY — CENTRAL MANAGEMENT ENGINE (2026)
 * Complete Bulletproof Cloud Database Storage & Production Auth Pipeline
 */

// GLOBAL INITIALIZATION & CDN PROTECTION NETWORK
const SUPABASE_URL = "https://yztdkzwkdvvvnwgxhqhl.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6dGRrendrZHZ2dm53Z3hocWhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NzcxMjMsImV4cCI6MjA5NDU1MzEyM30.iFP77TiIpMNYSY7IaAJPz_rH3ADD4ymVp5iiPOje6kY";

let supabase = null;

try {
  if (window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } else {
    console.error(
      "Initialization Alert: Supabase library object is missing from the global window scope.",
    );
  }
} catch (initError) {
  console.error(
    "Critical Exception caught during global client creation:",
    initError,
  );
}

document.addEventListener("DOMContentLoaded", async () => {
  const studentForm = document.getElementById("studentForm");
  const targetLoginForm = document.getElementById("loginForm");
  const targetSignUpForm = document.getElementById("signUpForm");

  const isSignUpPage = document.title.includes("Sign Up");
  const isLoginPage = document.title.includes("Login");
  const isDashboardPage = document.title.includes("Dashboard");

  const loginLink = document.getElementById("loginLink");
  const signupLink = document.getElementById("signupLink");
  const authAction = document.getElementById("authAction");

  let session = null;
  if (supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      session = data?.session || null;
    } catch (sessionError) {
      console.error(
        "Failed to recover active authentication session token:",
        sessionError,
      );
    }
  }

  // NAVBAR UI STATE CONTROLLER
  if (session) {
    if (loginLink) loginLink.classList.add("hidden");
    if (signupLink) signupLink.classList.add("hidden");
    if (authAction) {
      authAction.classList.remove("hidden");
      authAction.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!supabase) return;
        try {
          await supabase.auth.signOut();
          alert("You have been securely logged out of your session.");
          window.location.replace("login.html");
        } catch (signOutError) {
          alert(`Sign Out Error: ${signOutError.message}`);
        }
      });
    }
  }

  // SECURITY GUARD: SESSION PROTECTION GATE
  if (isDashboardPage) {
    if (!session) {
      console.warn(
        "Unauthorized access flagged. Redirecting to authentication gate...",
      );
      window.location.replace("login.html");
      return;
    }
  }

  // CLOUD DATABASE ROSTER CONTROLLER (DASHBOARD)
  if (studentForm && session && supabase) {
    const studentNameInput = document.getElementById("studentName");
    const studentRoleInput = document.getElementById("studentRole");
    const rosterGrid = document.getElementById("rosterGrid");
    const emptyState = document.getElementById("emptyState");
    const rosterCount = document.getElementById("rosterCount");

    async function fetchCloudRoster() {
      try {
        const { data: students, error } = await supabase
          .from("students")
          .select("id, student_name, student_course")
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (!students || students.length === 0) {
          emptyState.classList.remove("hidden");
          rosterGrid.classList.add("hidden");
          rosterCount.innerText = "0 records";
          return;
        }

        emptyState.classList.add("hidden");
        rosterGrid.classList.remove("hidden");
        rosterCount.innerText = `${students.length} record${students.length > 1 ? "s" : ""}`;
        rosterGrid.innerHTML = "";

        students.forEach((student) => {
          const itemCard = document.createElement("div");
          itemCard.className =
            "bg-white border border-slate-200 p-6 flex items-center justify-between shadow-sm hover:border-slate-400 transition-all";
          itemCard.innerHTML = `
                        <div class="space-y-1">
                            <h3 class="text-base font-medium text-slate-900 tracking-tight">${student.student_name}</h3>
                            <p class="text-xs font-mono text-slate-400 uppercase tracking-wider">${student.student_course}</p>
                        </div>
                        <button onclick="deleteCloudRecord('${student.id}')" 
                            class="text-xs font-mono text-slate-400 hover:text-red-600 transition-colors uppercase tracking-widest border border-slate-100 hover:border-red-100 px-3 py-1.5 bg-slate-50">
                            Purge
                        </button>
                    `;
          rosterGrid.appendChild(itemCard);
        });
      } catch (err) {
        console.error("Data reading exception caught:", err.message);
      }
    }

    studentForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      e.stopPropagation();

      const nameValue = studentNameInput.value.trim();
      const courseValue = studentRoleInput.value.trim();
      const submitBtn = studentForm.querySelector('button[type="submit"]');

      submitBtn.innerText = "Transmitting to Cloud...";
      submitBtn.disabled = true;

      try {
        const { error } = await supabase
          .from("students")
          .insert([{ student_name: nameValue, student_course: courseValue }]);

        if (error) throw error;

        studentForm.reset();
        await fetchCloudRoster();
        studentNameInput.focus();
      } catch (err) {
        alert(`Database Write Failure: ${err.message}`);
      } finally {
        submitBtn.innerText = "Commit Record to Memory";
        submitBtn.disabled = false;
      }
    });

    window.deleteCloudRecord = async function (recordId) {
      if (
        !confirm(
          "Are you certain you want to purge this record permanently from the cloud?",
        )
      )
        return;

      try {
        const { error } = await supabase
          .from("students")
          .delete()
          .eq("id", recordId);

        if (error) throw error;

        await fetchCloudRoster();
      } catch (err) {
        alert(`Database Deletion Failure: ${err.message}`);
      }
    };

    await fetchCloudRoster();
  }

  // LOGIN FLOW HANDLER
  if (targetLoginForm && isLoginPage) {
    targetLoginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!supabase) {
        alert("Database engine down. Please reload the webpage.");
        return;
      }

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const submitBtn = targetLoginForm.querySelector('button[type="submit"]');

      submitBtn.innerText = "Processing secure request...";
      submitBtn.disabled = true;

      try {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (signInError) throw signInError;

        window.location.replace("dashboard.html");
      } catch (err) {
        alert(`Authentication Exception: ${err.message}`);
        submitBtn.innerText = "Sign In";
        submitBtn.disabled = false;
      }
    });
  }

  // SIGN UP FLOW HANDLER
  if (targetSignUpForm && isSignUpPage) {
    targetSignUpForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!supabase) {
        alert("Database engine down. Please reload the webpage.");
        return;
      }

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const name = document.getElementById("name").value.trim();
      const submitBtn = targetSignUpForm.querySelector('button[type="submit"]');

      submitBtn.innerText = "Processing secure request...";
      submitBtn.disabled = true;

      try {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: { full_name: name },
          },
        });

        if (signUpError) throw signUpError;

        alert("Account provisioned successfully! Check your inbox or sign in.");
        window.location.replace("login.html");
      } catch (err) {
        alert(`Authentication Exception: ${err.message}`);
        submitBtn.innerText = "Register Credentials";
        submitBtn.disabled = false;
      }
    });
  }
});
