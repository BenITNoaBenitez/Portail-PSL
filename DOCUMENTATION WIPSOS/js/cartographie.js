/* =========================================================================
   CARTOGRAPHIE — Passage en production d'un client
   -------------------------------------------------------------------------
   Page ouverte par l'icône « carte » à côté de la recherche (adresse #cartographie).
   Schéma des points à vérifier, dans l'ordre, pour un client.

   Pour MODIFIER le schéma : éditez CARTO ci-dessous.
     Étape    : { title, where, icon, checks, links }
     Question : { q, yes: { title, where, icon, checks, links } }
                (Oui = branche à droite qui rejoint le parcours ; Non = on continue)
     icon     : user | wallet | tag | box | doc | gear | list | calendar
     links    : [id de la formation (content.js), libellé]
   ========================================================================= */

const CARTO = [
  { q: "Payé par un autre client ?",
    yes: { title: "Fiche du payeur", where: "Client › Fiche", icon: "wallet",
           checks: ["Créée avant le site", "Adresse de facturation", "SIRET et code pays", "Code règlement"],
           links: [["notion-payeur", "La notion de payeur"]] } },

  { title: "Fiche client", where: "Client › Fiche", icon: "user",
    checks: ["Adresse, code pays, SIRET", "Famille, commercial, agence", "Secteur géographique, code règlement",
             "Validée en client", "Payeur rattaché", "Contact principal"],
    links: [["creer-client-prospect", "Créer un client"], ["creer-contact", "Créer un contact"]] },

  { q: "Prix négociés ?",
    yes: { title: "Tarif particulier", where: "Article › Tarif particulier", icon: "tag",
           checks: ["Lot créé, dates en cours", "Articles et prix du lot", "Rattaché au client (Éléments financiers › Tarif)"],
           links: [["tarifs-particuliers", "Tarifs particuliers"]] } },

  { title: "Articles", where: "Article › Fiche", icon: "box",
    checks: ["Matériel installé", "Main-d'œuvre et déplacement", "Prestations de visite", "Prix à jour"],
    links: [["base-article-prix", "Base article"]] },

  { title: "Contrat", where: "Contrat › Fiche", icon: "doc",
    checks: ["Type et activité", "Généralités et Facturation", "Signature et mise en service", "À la visite ou abonnement"],
    links: [["contrat-creer", "Créer un contrat"], ["contrat-abonnement-visite", "Abonnement ou à la visite"]] },

  { title: "Fiche technique", where: "Contrat › codifier l'installation", icon: "gear",
    checks: ["Une par activité", "Rattachée au contrat", "Date de mise en service"],
    links: [["contrat-codification", "Codifier une installation"]] },

  { title: "Parc matériel", where: "Fiche technique › parc matériel", icon: "list",
    checks: ["Articles et quantités", "Étage et emplacement", "Date de mise en service"],
    links: [["contrat-parc-materiel", "Alimenter le parc"], ["contrat-reprise-parc", "Reprise de parc"]] },

  { q: "Visites d'entretien ?",
    yes: { title: "Gestion des visites", where: "Contrat › gestion des visites", icon: "calendar",
           checks: ["Code visite et mois", "Parc affecté à la visite"],
           links: [["contrat-creer-visite", "Créer une visite"], ["contrat-affecter-parc-visite", "Affecter le parc"]] } }
];

const CARTO_FIN = [
  { title: "Visites d'entretien", path: ["Générer", "Bons de visite", "Planifier"], link: ["contrat-generation-visites", "Générer les visites"] },
  { title: "Dépannages", path: ["Bon SAV", "Planifier"], link: ["sav-creer-bon-gravite", "Créer un bon"] }
];

const CARTO_ICONS = {
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  wallet: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18"/><circle cx="16" cy="15" r="1.3"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8L3 12z"/><circle cx="7.5" cy="8.5" r="1.4"/>',
  box: '<path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/>',
  doc: '<path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6"/><path d="M9 13h8M9 17h6"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  list: '<path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4.5" cy="6" r="1.3"/><circle cx="4.5" cy="12" r="1.3"/><circle cx="4.5" cy="18" r="1.3"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'
};

/* ---------- Rendu ---------- */
function renderCartographie(docEl) {
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const icon = n => '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (CARTO_ICONS[n] || "") + "</svg>";
  let k = 0;
  const box = (s, cls) => {
    const id = "cbx-" + (k++);
    return '<div class="cbox ' + (cls || "") + '">' +
      '<button type="button" class="cbox-head" aria-expanded="false" aria-controls="' + id + '">' +
        '<span class="cbox-ic">' + icon(s.icon) + "</span>" +
        '<span class="cbox-txt"><strong>' + esc(s.title) + "</strong><small>" + esc(s.where) + "</small></span>" +
        '<span class="cbox-plus" aria-hidden="true">+</span>' +
      "</button>" +
      '<div class="cbox-body" id="' + id + '" hidden><ul>' + s.checks.map(c => "<li>" + esc(c) + "</li>").join("") + "</ul>" +
        (s.links || []).map(([lid, t]) => '<a href="#' + lid + '">' + esc(t) + "</a>").join("") +
      "</div></div>";
  };

  let html =
    '<div class="doc-breadcrumb">Cartographie<span class="sep">/</span><span class="current">Passage en production d\'un client</span></div>' +
    "<h1>Passage en production d'un client</h1>" +
    '<p class="lead">Les points à vérifier, dans l\'ordre, avant de planifier les interventions d\'un client. Cliquez sur une case pour voir le détail.</p>' +
    '<div class="cmap">';

  CARTO.forEach(s => {
    if (s.q) {
      html += '<div class="crow crow-q">' +
        '<div class="cmain"><div class="cdiamond"><span>' + esc(s.q) + "</span></div><span class=\"cno\">Non</span></div>" +
        '<div class="cyes" aria-hidden="true"><span>Oui</span></div>' +
        '<div class="cside">' + box(s.yes, "cbox-opt") + '<span class="crejoin-v" aria-hidden="true"></span></div>' +
        '<span class="crejoin-h" aria-hidden="true"></span>' +
      "</div>";
    } else {
      html += '<div class="crow"><div class="cmain">' + box(s) + "</div></div>";
    }
  });

  html += '<div class="crow crow-end"><div class="cmain"><div class="cready">✓ Client prêt</div></div></div>' +
    '<div class="cfin">' + CARTO_FIN.map(f =>
      '<div class="cfin-card"><strong>' + esc(f.title) + '</strong><div class="cfin-path">' +
        f.path.map(p => "<span>" + esc(p) + "</span>").join('<i aria-hidden="true">›</i>') + "</div>" +
        '<a href="#' + f.link[0] + '">' + esc(f.link[1]) + "</a></div>").join("") +
    "</div></div>";

  docEl.innerHTML = html;
  docEl.querySelectorAll(".cbox-head").forEach(b => b.addEventListener("click", () => {
    const open = b.getAttribute("aria-expanded") === "true";
    b.setAttribute("aria-expanded", String(!open));
    document.getElementById(b.getAttribute("aria-controls")).hidden = open;
  }));
  document.title = "Cartographie : passage en production — Documentation WIPSOS";
}
