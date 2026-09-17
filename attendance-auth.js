document.addEventListener("DOMContentLoaded", () => {
  const gate = document.getElementById("attAuthGate");
  const userBar = document.getElementById("attUserBar");
  const mainContent = document.getElementById("attMainContent");
  const googleBtn = document.getElementById("attGoogleSignIn");
  const signOutBtn = document.getElementById("attSignOutBtn");
  const userPhoto = document.getElementById("attUserPhoto");
  const userName = document.getElementById("attUserName");
  const userAvatarFallback = document.getElementById("attUserAvatarFallback");
  const userPhotoLarge = document.getElementById("attUserPhotoLarge");
  const userAvatarFallbackLarge = document.getElementById("attUserAvatarFallbackLarge");
  const userNameFull = document.getElementById("attUserNameFull");
  const userEmail = document.getElementById("attUserEmail");
  const profileWrap = document.getElementById("attProfile");
  const profileTrigger = document.getElementById("attProfileTrigger");
  const profileDropdown = document.getElementById("attProfileDropdown");

  if (!gate || !mainContent) return;

  /* ---------------- Profile dropdown ---------------- */
  function openProfileDropdown() {
    if (!profileDropdown) return;
    profileDropdown.hidden = false;
    requestAnimationFrame(() => profileDropdown.classList.add("is-open"));
    profileTrigger?.setAttribute("aria-expanded", "true");
  }
  function closeProfileDropdown() {
    if (!profileDropdown) return;
    profileDropdown.classList.remove("is-open");
    profileTrigger?.setAttribute("aria-expanded", "false");
    window.setTimeout(() => {
      if (!profileDropdown.classList.contains("is-open")) profileDropdown.hidden = true;
    }, 160);
  }
  profileTrigger?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (profileDropdown?.classList.contains("is-open")) closeProfileDropdown();
    else openProfileDropdown();
  });
  document.addEventListener("click", (e) => {
    if (!profileWrap || !profileDropdown?.classList.contains("is-open")) return;
    if (!profileWrap.contains(e.target)) closeProfileDropdown();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeProfileDropdown();
  });

  function getInitials(name, email) {
    const source = (name || "").trim();
    if (source) {
      const parts = source.split(/\s+/).filter(Boolean);
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return "?";
  }

  function renderAvatar(imgEl, fallbackEl, photoURL, name, email) {
    if (!imgEl || !fallbackEl) return;
    fallbackEl.textContent = getInitials(name, email);
    if (photoURL) {
      imgEl.onerror = () => {
        imgEl.hidden = true;
        fallbackEl.hidden = false;
      };
      imgEl.src = photoURL;
      imgEl.alt = name || "";
      imgEl.hidden = false;
      fallbackEl.hidden = true;
    } else {
      imgEl.onerror = null;
      imgEl.removeAttribute("src");
      imgEl.hidden = true;
      fallbackEl.hidden = false;
    }
  }

  let appStarted = false;

  /* ---------------- Tabs / panel switching ---------------- */
  const tabSignIn = document.getElementById("attTabSignIn");
  const tabRegister = document.getElementById("attTabRegister");
  const signInForm = document.getElementById("attSignInForm");
  const registerForm = document.getElementById("attRegisterForm");
  const forgotForm = document.getElementById("attForgotForm");

  function showPanel(which) {
    // which: "signin" | "register" | "forgot"
    signInForm?.classList.remove("is-active");
    registerForm?.classList.remove("is-active");
    forgotForm?.classList.remove("is-active");
    if (signInForm) signInForm.hidden = true;
    if (registerForm) registerForm.hidden = true;
    if (forgotForm) forgotForm.hidden = true;

    tabSignIn?.classList.remove("is-active");
    tabRegister?.classList.remove("is-active");
    tabSignIn?.setAttribute("aria-selected", "false");
    tabRegister?.setAttribute("aria-selected", "false");

    clearMsg(signInMsg);
    clearMsg(registerMsg);
    clearMsg(forgotMsg);

    if (which === "signin") {
      if (signInForm) { signInForm.hidden = false; signInForm.classList.add("is-active"); }
      tabSignIn?.classList.add("is-active");
      tabSignIn?.setAttribute("aria-selected", "true");
    } else if (which === "register") {
      if (registerForm) { registerForm.hidden = false; registerForm.classList.add("is-active"); }
      tabRegister?.classList.add("is-active");
      tabRegister?.setAttribute("aria-selected", "true");
    } else if (which === "forgot") {
      if (forgotForm) { forgotForm.hidden = false; forgotForm.classList.add("is-active"); }
    }
  }

  tabSignIn?.addEventListener("click", () => showPanel("signin"));
  tabRegister?.addEventListener("click", () => showPanel("register"));
  document.getElementById("attGoToRegister")?.addEventListener("click", () => showPanel("register"));
  document.getElementById("attGoToSignIn")?.addEventListener("click", () => showPanel("signin"));
  document.getElementById("attForgotPasswordBtn")?.addEventListener("click", () => showPanel("forgot"));
  document.getElementById("attBackToSignIn")?.addEventListener("click", () => showPanel("signin"));

  /* ---------------- Password show/hide ---------------- */
  document.querySelectorAll(".att-auth-eye").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const input = document.getElementById(targetId);
      if (!input) return;
      const onIcon = btn.querySelector(".att-eye-on");
      const offIcon = btn.querySelector(".att-eye-off");
      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      if (onIcon) onIcon.hidden = isHidden;
      if (offIcon) offIcon.hidden = !isHidden;
      btn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
    });
  });

  /* ---------------- Helpers ---------------- */
  const signInMsg = document.getElementById("attSignInMsg");
  const registerMsg = document.getElementById("attRegisterMsg");
  const forgotMsg = document.getElementById("attForgotMsg");

  function clearMsg(el) {
    if (!el) return;
    el.textContent = "";
    el.classList.remove("is-success");
  }
  function showMsg(el, text, isSuccess) {
    if (!el) return;
    el.textContent = text;
    el.classList.toggle("is-success", Boolean(isSuccess));
  }

  function setSubmitLoading(btn, loading) {
    if (!btn) return;
    const spinner = btn.querySelector(".att-auth-spinner");
    btn.disabled = loading;
    if (spinner) spinner.hidden = !loading;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function friendlyAuthError(err) {
    const code = err && err.code ? err.code : "";
    switch (code) {
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
      case "auth/invalid-login-credentials":
        return "Incorrect email or password.";
      case "auth/email-already-in-use":
        return "This email is already registered.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/too-many-requests":
        return "Too many attempts. Please try again later.";
      case "auth/network-request-failed":
        return "Network error. Please check your connection and try again.";
      default:
        return "Something went wrong. Please try again.";
    }
  }

  /* ---------------- Sign In (email/password) ---------------- */
  signInForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMsg(signInMsg);

    const email = document.getElementById("attSignInEmail")?.value.trim() || "";
    const password = document.getElementById("attSignInPassword")?.value || "";

    if (!email) return showMsg(signInMsg, "Please enter your email address.");
    if (!isValidEmail(email)) return showMsg(signInMsg, "Please enter a valid email address.");
    if (!password) return showMsg(signInMsg, "Please enter your password.");

    const submitBtn = document.getElementById("attSignInSubmit");
    setSubmitLoading(submitBtn, true);
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
    } catch (err) {
      console.error("Email sign-in failed", err);
      showMsg(signInMsg, friendlyAuthError(err));
    } finally {
      setSubmitLoading(submitBtn, false);
    }
  });

  /* ---------------- Register (email/password) ---------------- */
  registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMsg(registerMsg);

    const firstName = document.getElementById("attRegFirstName")?.value.trim() || "";
    const lastName = document.getElementById("attRegLastName")?.value.trim() || "";
    const email = document.getElementById("attRegEmail")?.value.trim() || "";
    const password = document.getElementById("attRegPassword")?.value || "";
    const confirmPassword = document.getElementById("attRegConfirmPassword")?.value || "";

    if (!firstName || !lastName) return showMsg(registerMsg, "Please enter your first and last name.");
    if (!email) return showMsg(registerMsg, "Please enter your email address.");
    if (!isValidEmail(email)) return showMsg(registerMsg, "Please enter a valid email address.");
    if (!password) return showMsg(registerMsg, "Please enter your password.");
    if (password.length < 6) return showMsg(registerMsg, "Password should be at least 6 characters.");
    if (password !== confirmPassword) return showMsg(registerMsg, "Passwords do not match.");

    const submitBtn = document.getElementById("attRegisterSubmit");
    setSubmitLoading(submitBtn, true);
    try {
      const cred = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const user = cred.user;
      const displayName = `${firstName} ${lastName}`.trim();

      try {
        await user.updateProfile({ displayName });
      } catch (profileErr) {
        console.error("Failed to set display name", profileErr);
      }

      try {
        await firebase.firestore().collection("users").doc(user.uid).set({
          firstName,
          lastName,
          email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      } catch (profileDocErr) {
        console.error("Failed to save user profile", profileDocErr);
      }
      // onAuthStateChanged will now fire and take the user straight into the dashboard.
    } catch (err) {
      console.error("Registration failed", err);
      showMsg(registerMsg, friendlyAuthError(err));
      setSubmitLoading(submitBtn, false);
    }
  });

  /* ---------------- Forgot password ---------------- */
  document.getElementById("attForgotSubmit")?.addEventListener("click", async () => {
    clearMsg(forgotMsg);
    const email = document.getElementById("attForgotEmail")?.value.trim() || "";
    if (!email) return showMsg(forgotMsg, "Please enter your email address.");
    if (!isValidEmail(email)) return showMsg(forgotMsg, "Please enter a valid email address.");

    const submitBtn = document.getElementById("attForgotSubmit");
    setSubmitLoading(submitBtn, true);
    try {
      await firebase.auth().sendPasswordResetEmail(email);
      showMsg(forgotMsg, "A password reset link has been sent to your email.", true);
    } catch (err) {
      console.error("Password reset failed", err);
      showMsg(forgotMsg, friendlyAuthError(err));
    } finally {
      setSubmitLoading(submitBtn, false);
    }
  });

  /* ---------------- Google sign-in (unchanged) ---------------- */
  googleBtn?.addEventListener("click", async () => {
    googleBtn.disabled = true;
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await firebase.auth().signInWithPopup(provider);
    } catch (err) {
      console.error("Google sign-in failed", err);
      googleBtn.disabled = false;
    }
  });

  /* ---------------- Sign out ---------------- */
  signOutBtn?.addEventListener("click", async () => {
    closeProfileDropdown();
    try {
      await firebase.auth().signOut();
    } catch (err) {
      console.error("Sign-out failed", err);
    }
  });

  /* ---------------- Auth state ---------------- */
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      gate.hidden = true;
      userBar.hidden = false;
      mainContent.hidden = false;
      renderAvatar(userPhoto, userAvatarFallback, user.photoURL, user.displayName, user.email);
      renderAvatar(userPhotoLarge, userAvatarFallbackLarge, user.photoURL, user.displayName, user.email);
      if (userName) userName.textContent = user.displayName || user.email || "";
      if (userNameFull) userNameFull.textContent = user.displayName || "";
      if (userEmail) userEmail.textContent = user.email || "";
      if (!appStarted && typeof window.attStartAttendanceApp === "function") {
        appStarted = true;
        window.attStartAttendanceApp(user);
      }
    } else {
      gate.hidden = false;
      userBar.hidden = true;
      mainContent.hidden = true;
      if (googleBtn) googleBtn.disabled = false;
      appStarted = false;
      closeProfileDropdown();

      // Reset all auth forms back to a clean Sign In state for the next visitor.
      signInForm?.reset();
      registerForm?.reset();
      const forgotEmailInput = document.getElementById("attForgotEmail");
      if (forgotEmailInput) forgotEmailInput.value = "";
      showPanel("signin");

      if (typeof window.attResetAttendanceApp === "function") window.attResetAttendanceApp();
    }
  });
});
