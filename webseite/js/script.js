// ===== SLIDER (Startseite) =====

function initSlider() {
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.querySelector('.slider-btn.prev');
  const nextBtn = document.querySelector('.slider-btn.next');

  if (slides.length === 0) return; // Nicht auf der Startseite

  let aktuellerSlide = 0;

  function zeigeSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    aktuellerSlide = (index + slides.length) % slides.length;
    slides[aktuellerSlide].classList.add('active');
  }

  prevBtn.addEventListener('click', () => zeigeSlide(aktuellerSlide - 1));
  nextBtn.addEventListener('click', () => zeigeSlide(aktuellerSlide + 1));

  // Automatisches Weiterschalten alle 5 Sekunden
  setInterval(() => zeigeSlide(aktuellerSlide + 1), 5000);
}


// ===== KALENDER =====

let aktuellerMonat = new Date().getMonth();
let aktuellesJahr = new Date().getFullYear();
let termine = JSON.parse(localStorage.getItem('termine')) || [];

const monatsNamen = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

function initKalender() {
  const kalenderTage = document.getElementById('kalenderTage');
  if (!kalenderTage) return; // Nicht auf der Kalender-Seite

  renderKalender();

  // Monat-Navigation
  document.getElementById('btnVorherigerMonat').addEventListener('click', () => {
    aktuellerMonat--;
    if (aktuellerMonat < 0) {
      aktuellerMonat = 11;
      aktuellesJahr--;
    }
    renderKalender();
  });

  document.getElementById('btnNaechsterMonat').addEventListener('click', () => {
    aktuellerMonat++;
    if (aktuellerMonat > 11) {
      aktuellerMonat = 0;
      aktuellesJahr++;
    }
    renderKalender();
  });

  // Modal öffnen/schliessen
  document.getElementById('btnTerminHinzufuegen').addEventListener('click', () => {
    oeffneModal();
  });

  document.getElementById('btnAbbrechen').addEventListener('click', schliesseModal);

  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) schliesseModal();
  });

  // Termin speichern
  document.getElementById('btnSpeichern').addEventListener('click', terminSpeichern);
}

function renderKalender() {
  const kalenderTage = document.getElementById('kalenderTage');
  const monatLabel = document.getElementById('monatLabel');

  monatLabel.textContent = `${monatsNamen[aktuellerMonat]} ${aktuellesJahr}`;

  // Erster Tag des Monats (0 = Sonntag, 1 = Montag, ...)
  const ersterTag = new Date(aktuellesJahr, aktuellerMonat, 1).getDay();
  // Umrechnung: Sonntag (0) wird zu 6, Montag (1) wird zu 0, etc.
  const startTag = ersterTag === 0 ? 6 : ersterTag - 1;

  // Anzahl Tage im Monat
  const anzahlTage = new Date(aktuellesJahr, aktuellerMonat + 1, 0).getDate();

  // Heutiges Datum
  const heute = new Date();
  const heuteTag = heute.getDate();
  const heuteMonat = heute.getMonth();
  const heuteJahr = heute.getFullYear();

  let html = '';

  // Leere Zellen vor dem ersten Tag
  for (let i = 0; i < startTag; i++) {
    html += '<div class="kalender-tag leer"></div>';
  }

  // Tage des Monats
  for (let tag = 1; tag <= anzahlTage; tag++) {
    const istHeute = tag === heuteTag && aktuellerMonat === heuteMonat && aktuellesJahr === heuteJahr;
    const datumStr = `${aktuellesJahr}-${String(aktuellerMonat + 1).padStart(2, '0')}-${String(tag).padStart(2, '0')}`;

    // Termine für diesen Tag finden
    const tagesTermine = termine.filter(t => t.datum === datumStr);

    html += `
      <div class="kalender-tag ${istHeute ? 'heute' : ''}" data-datum="${datumStr}">
        <div class="tag-nummer">${tag}</div>
        ${tagesTermine.map(t => `<div class="termin-marker" title="${t.zeit ? t.zeit + ' – ' : ''}${t.titel}">${t.titel}</div>`).join('')}
      </div>
    `;
  }

  kalenderTage.innerHTML = html;

  // Klick auf einen Tag öffnet Modal mit vorbefülltem Datum
  document.querySelectorAll('.kalender-tag:not(.leer)').forEach(tag => {
    tag.addEventListener('click', () => {
      oeffneModal(tag.dataset.datum);
    });
  });
}

function oeffneModal(datum) {
  const modal = document.getElementById('modalOverlay');
  const datumInput = document.getElementById('terminDatum');

  if (datum) {
    datumInput.value = datum;
  } else {
    // Standardmässig heutiges Datum setzen
    const heute = new Date();
    datumInput.value = `${heute.getFullYear()}-${String(heute.getMonth() + 1).padStart(2, '0')}-${String(heute.getDate()).padStart(2, '0')}`;
  }

  document.getElementById('terminTitel').value = '';
  document.getElementById('terminZeit').value = '';
  modal.classList.add('active');
}

function schliesseModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

function terminSpeichern() {
  const datum = document.getElementById('terminDatum').value;
  const titel = document.getElementById('terminTitel').value.trim();
  const zeit = document.getElementById('terminZeit').value;

  if (!datum || !titel) {
    alert('Bitte Datum und Titel eingeben.');
    return;
  }

  termine.push({ datum, titel, zeit });

  // Im localStorage speichern
  localStorage.setItem('termine', JSON.stringify(termine));

  schliesseModal();
  renderKalender();
}


// ===== LOGIN =====

const LOGIN_BENUTZER = 'lucas';
const LOGIN_PASSWORT = 'wochende123';

function initLogin() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const benutzername = document.getElementById('loginBenutzername').value.trim();
    const passwort = document.getElementById('loginPasswort').value;
    const fehler = document.getElementById('loginFehler');

    if (benutzername === LOGIN_BENUTZER && passwort === LOGIN_PASSWORT) {
      sessionStorage.setItem('eingeloggt', 'true');
      window.location.href = 'index.html';
    } else {
      fehler.classList.add('sichtbar');
    }
  });
}

function initAbmelden() {
  const btn = document.getElementById('btnAbmelden');
  if (!btn) return;
  btn.addEventListener('click', () => {
    sessionStorage.removeItem('eingeloggt');
    window.location.href = 'login.html';
  });
}

function pruefLogin() {
  const istLoginSeite = !!document.getElementById('loginForm');
  const eingeloggt = sessionStorage.getItem('eingeloggt') === 'true';

  if (!istLoginSeite && !eingeloggt) {
    window.location.href = 'login.html';
  }
}


// ===== INITIALISIERUNG =====
document.addEventListener('DOMContentLoaded', () => {
  pruefLogin();
  initLogin();
  initAbmelden();
  initSlider();
  initKalender();
});
