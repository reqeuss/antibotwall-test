(() => {
  const $ = (id) => document.getElementById(id);
  const providers = { discord: "Discord", github: "GitHub", google: "Google", epsilonsocial: "Epsilon Social" };
  const key = (localStorage.getItem("abw_test_site_key") || "").trim();
  const storedTheme = localStorage.getItem("abw_test_theme");
  if (storedTheme === "dark") document.body.classList.add("dark");
  $("themeToggle")?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("abw_test_theme", document.body.classList.contains("dark") ? "dark" : "light");
  });
  document.querySelectorAll("[data-provider]").forEach((link) => {
    const provider = link.dataset.provider;
    link.href = key
      ? "https://antibotwall.reqeuss.com/oauth/" + encodeURIComponent(provider) + "/start?site=" + encodeURIComponent(key)
      : "#";
    link.addEventListener("click", (event) => {
      if (!key) {
        event.preventDefault();
        $("profileError").textContent = "Clé publique manquante. Retournez à l’accueil et enregistrez votre siteKey.";
      }
    });
  });
  function showSignedOut() {
    $("pageTitle").textContent = "Votre espace compte";
    $("pageSubtitle").textContent = "Connectez-vous pour afficher les informations de votre profil.";
    $("signedOut").classList.remove("hidden");
    $("signedIn").classList.add("hidden");
  }
  fetch("/auth/antibotwall/me", { credentials: "same-origin", cache: "no-store" })
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Impossible de vérifier la session.");
      if (!data.authenticated || !data.user) { showSignedOut(); return; }
      const user = data.user;
      $("pageTitle").textContent = "Ravi de vous revoir, " + (user.name || "utilisateur") + " !";
      $("pageSubtitle").textContent = "Votre connexion AntiBotWall est active.";
      $("userName").textContent = user.name || "Utilisateur";
      $("userEmail").textContent = user.email || "Adresse e-mail non fournie par le fournisseur";
      $("providerValue").textContent = providers[user.provider] || user.provider || "Inconnu";
      $("userId").textContent = user.id || user.sub || "Non fourni";
      $("sessionExpiry").textContent = data.expiresAt ? new Date(data.expiresAt * 1000).toLocaleString("fr-FR") : "—";
      $("avatarFallback").textContent = (user.name || "A").trim().slice(0, 1).toUpperCase();
      if (user.avatar && /^https:\/\//i.test(user.avatar)) {
        $("avatar").src = user.avatar;
        $("avatar").classList.remove("hidden");
        $("avatarFallback").classList.add("hidden");
        $("avatar").onerror = () => { $("avatar").classList.add("hidden"); $("avatarFallback").classList.remove("hidden"); };
      }
      $("signedIn").classList.remove("hidden");
      $("signedOut").classList.add("hidden");
    })
    .catch((error) => {
      showSignedOut();
      $("profileError").textContent = error.message || "Erreur de session.";
    });
  $("logoutButton")?.addEventListener("click", async () => {
    $("logoutButton").disabled = true;
    try { await fetch("/auth/antibotwall/logout", { method: "POST", credentials: "same-origin" }); }
    finally { location.href = "./profile.html"; }
  });
})();
