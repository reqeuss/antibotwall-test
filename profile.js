(() => {
  const $ = (id) => document.getElementById(id);
  const providers = { discord: "Discord", github: "GitHub", google: "Google", epsilonsocial: "Epsilon Social" };
  const storedTheme = localStorage.getItem("abw_test_theme");
  if (storedTheme === "dark") document.body.classList.add("dark");
  $("themeToggle")?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("abw_test_theme", document.body.classList.contains("dark") ? "dark" : "light");
  });

  document.querySelectorAll("[data-provider]").forEach((link) => {
    link.href = "#";
    link.setAttribute("aria-disabled", "true");
    link.title = "Connexion réelle disponible après configuration de l'intégration";
    link.addEventListener("click", (event) => {
      event.preventDefault();
      $("profileError").textContent = "La connexion réelle n’est pas encore configurée. Utilisez l’aperçu démo pour tester l’interface.";
    });
  });

  function showSignedOut() {
    $("pageTitle").textContent = "Votre espace compte";
    $("pageSubtitle").textContent = "Prévisualisez le profil ou configurez ensuite une connexion réelle.";
    $("signedOut").classList.remove("hidden");
    $("signedIn").classList.add("hidden");
  }

  function showProfile(user, demo = false) {
    $("pageTitle").textContent = demo ? "Aperçu de votre profil" : "Ravi de vous revoir, " + (user.name || "utilisateur") + " !";
    $("pageSubtitle").textContent = demo
      ? "Voici un aperçu visuel : aucune connexion ni donnée réelle n’a été créée."
      : "Votre connexion AntiBotWall est active.";
    $("userName").textContent = user.name || "Utilisateur";
    $("userEmail").textContent = user.email || "Adresse e-mail non fournie par le fournisseur";
    $("providerValue").textContent = providers[user.provider] || user.provider || "Inconnu";
    $("userId").textContent = user.id || user.sub || "Non fourni";
    $("sessionExpiry").textContent = demo ? "Aucune — aperçu uniquement" :
      (user.expiresAt ? new Date(user.expiresAt * 1000).toLocaleString("fr-FR") : "—");
    $("avatarFallback").textContent = (user.name || "A").trim().slice(0, 1).toUpperCase();
    $("avatar").classList.add("hidden");
    $("avatarFallback").classList.remove("hidden");
    if (!demo && user.avatar && /^https:\/\//i.test(user.avatar)) {
      $("avatar").src = user.avatar;
      $("avatar").classList.remove("hidden");
      $("avatarFallback").classList.add("hidden");
      $("avatar").onerror = () => { $("avatar").classList.add("hidden"); $("avatarFallback").classList.remove("hidden"); };
    }
    $("profileStatus").lastChild.textContent = demo ? " Aperçu démo" : " Connecté";
    $("profileStatus").style.background = demo ? "#fff4d8" : "";
    $("profileStatus").style.color = demo ? "#8a5b00" : "";
    $("profileStatus").querySelector("i").style.background = demo ? "#d99a18" : "";
    $("profileSourceNotice").textContent = demo
      ? "Profil fictif de démonstration. Il ne représente aucun compte réel et n’est pas enregistré."
      : "Ces informations proviennent de la session AntiBotWall vérifiée côté serveur. Le jeton brut n’est jamais affiché dans cette page.";
    $("logoutButton").textContent = demo ? "Quitter l’aperçu" : "Se déconnecter";
    $("logoutButton").dataset.demo = demo ? "true" : "false";
    $("signedIn").classList.remove("hidden");
    $("signedOut").classList.add("hidden");
  }

  $("demoProfileButton")?.addEventListener("click", () => {
    $("profileError").textContent = "";
    showProfile({ id: "demo_7f29a1", provider: "github", name: "Alex Morgan", email: "alex.morgan@example.test" }, true);
  });

  fetch("/auth/antibotwall/me", { credentials: "same-origin", cache: "no-store" })
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { showSignedOut(); return; }
      if (!data.authenticated || !data.user) { showSignedOut(); return; }
      showProfile({ ...data.user, expiresAt: data.expiresAt }, false);
    })
    .catch(() => showSignedOut());

  $("logoutButton")?.addEventListener("click", async () => {
    if ($("logoutButton").dataset.demo === "true") { showSignedOut(); return; }
    $("logoutButton").disabled = true;
    try { await fetch("/auth/antibotwall/logout", { method: "POST", credentials: "same-origin" }); }
    finally { location.href = "./profile.html"; }
  });
})();