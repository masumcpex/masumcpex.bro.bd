document.addEventListener("DOMContentLoaded", () => {
  const gate = document.getElementById("attAuthGate");
  const userBar = document.getElementById("attUserBar");
  const mainContent = document.getElementById("attMainContent");
  const googleBtn = document.getElementById("attGoogleSignIn");
  const signOutBtn = document.getElementById("attSignOutBtn");
  const userPhoto = document.getElementById("attUserPhoto");
  const userName = document.getElementById("attUserName");

  if (!gate || !mainContent) return;

  let appStarted = false;

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

  signOutBtn?.addEventListener("click", async () => {
    try {
      await firebase.auth().signOut();
    } catch (err) {
      console.error("Sign-out failed", err);
    }
  });

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      gate.hidden = true;
      userBar.hidden = false;
      mainContent.hidden = false;
      if (userPhoto) {
        userPhoto.src = user.photoURL || "yellow.webp";
        userPhoto.alt = user.displayName || "";
      }
      if (userName) userName.textContent = user.displayName || user.email || "";
      if (!appStarted && typeof window.attStartAttendanceApp === "function") {
        appStarted = true;
        window.attStartAttendanceApp();
      }
    } else {
      gate.hidden = false;
      userBar.hidden = true;
      mainContent.hidden = true;
      if (googleBtn) googleBtn.disabled = false;
    }
  });
});
