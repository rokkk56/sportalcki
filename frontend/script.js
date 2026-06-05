/* const activities = [
  { sport:'Odbojka', city:'Ljubljana', date:'Jutri', time:'18:00', spots:3, level:'Srednja', gender:'Mešano', age:'18-30', emoji:'🏐', org:'Nika' },
  { sport:'Nogomet', city:'Maribor', date:'Petek', time:'20:00', spots:5, level:'Napredna', gender:'Moški', age:'18-30', emoji:'⚽', org:'Matej' },
  { sport:'Košarka', city:'Celje', date:'Sobota', time:'17:30', spots:2, level:'Srednja', gender:'Mešano', age:'15-18', emoji:'🏀', org:'Blaž' },
  { sport:'Tenis', city:'Kranj', date:'Nedelja', time:'10:00', spots:1, level:'Začetnik', gender:'Mešano', age:'30+', emoji:'🎾', org:'Sara' },
  { sport:'Tek', city:'Velenje', date:'Danes', time:'19:00', spots:0, level:'Začetnik', gender:'Mešano', age:'18-30', emoji:'🏃', org:'Jan' }
]; 
*/
let activities = [];
let vseckaniOrganizatorji = [];
let prijavljeniTermini = [];

async function naloziAktivnosti(redniTermini) {
  try {
    var odgovor = null;

    if (redniTermini == true) {
      odgovor = await fetch('http://localhost:3000/api/redniTermini');
    }
    else {
      odgovor = await fetch('http://localhost:3000/api/aktivnosti');
    }


    if (!odgovor.ok) {
      const napakaPodatki = await odgovor.json();
      console.error("Backend je vrnil napako:", napakaPodatki);
      throw new Error(napakaPodatki.napaka || "Neznana napaka na strežniku.");
    }
    const podatkiIzBaze = await odgovor.json();

    activities = podatkiIzBaze.map(a => {
      let izpisanDatum = 'Neznano';
      let izpisanaUra = 'Neznano';

      if (a.datum) {
        const d = new Date(a.datum);
        izpisanDatum = d.toLocaleDateString('sl-SI');
        izpisanaUra = d.toLocaleTimeString('sl-SI', { hour: '2-digit', minute: '2-digit' });
      }

      return {
        id: a.id_termin,
        organizatorId: a.organizator_id,
        title: a.naziv || 'Brez naziva',
        sport: a.sport || 'Aktivnost',
        venue: a.prizorisce || 'Neznano prizorišče',
        city: a.mesto || 'Neznano',
        lat: a.lat,
        lng: a.lng,
        date: izpisanDatum,
        time: izpisanaUra,
        spots: a.stevilomest !== undefined ? a.stevilomest : 0,
        description: a.opis || 'Brez opisa',
        level: a.zahtevnost || 'Srednja',
        gender: a.spol || 'Mešano',
        age: a.starostnaskupina || 'Vsi',
        komentarTekst: a.komentartekst || '',
        komentatorIme: a.komentatorime || '',
        komentatorPriimek: a.komentatorpriimek || '',
        komentarSlika: a.komentarslika || '',
        emoji: a.sport === 'Nogomet' ? '⚽' :
          a.sport === 'Tenis' ? '🎾' :
            a.sport === 'Košarka' ? '🏀' :
              a.sport === 'Odbojka' ? '🏐' :
                a.sport === 'Badminton' ? '🏸' : '🏃',
        org: a.organizatorime + ' ' + a.organizatorpriimek || 'Neznan organizator'
      };
    });

    console.log(activities);
    await pridobiVseckaneIds();
    await pridobiPrijavljeneTermine();
    renderActivities();
    prikaziAktivnostiNaZemljevidu(activities);

  } catch (napaka) {
    console.error("Ujeta napaka v aplikaciji:", napaka.message);
    const list = document.getElementById('activityList');
    if (list) {
      list.innerHTML = `<p class="empty">Napaka pri nalaganju: ${napaka.message}</p>`;
    }
  }
}

async function pridobiPrijavljeneTermine() {
  const token = localStorage.getItem("token");

  if (!token) {
    prijavljeniTermini = [];
    return;
  }

  try {
    const odgovor = await fetch(`${API_URL}/prijave/moje/aktivnosti`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!odgovor.ok) {
      prijavljeniTermini = [];
      return;
    }

    const podatki = await odgovor.json();

    prijavljeniTermini = podatki.map(function (a) {
      return a.id_termin;
    });

  } catch (err) {
    console.error(err);
    prijavljeniTermini = [];
  }
}

function renderActivities() {
  const list = document.getElementById('activityList');
  if (!list) return;

  const search = document.getElementById('search').value.toLowerCase();
  const sport = document.getElementById('sport').value;
  const level = document.getElementById('level').value;
  const gender = document.getElementById('gender').value;
  const age = document.getElementById('age').value;
  const available = document.getElementById('available').checked;

  const filtered = activities.filter(a =>
    (a.sport.toLowerCase().includes(search) || a.city.toLowerCase().includes(search)) &&
    (!sport || a.sport === sport) &&
    (!level || a.level === level) &&
    (!gender || a.gender === gender) &&
    (!age || a.age === age) &&
    (!available || a.spots > 0)
  );
  list.innerHTML = filtered.map((a, index) => {
  let komentarHTML = '';
    if (a.komentarTekst) {
      let slikaHTML = '';
      if (a.komentarSlika) {
        slikaHTML = `
          <div class="comment-image-container" style="margin-right: 15px; flex-shrink: 0;">
            <img src="${a.komentarSlika}" alt="Slika komentarja" style="width: 120px; height: 120px; object-fit: cover; border-radius: 8px;">
          </div>
        `;
      }
      komentarHTML = `
        <div class="feedback-box" style="display: flex; align-items: flex-start; margin-top: 8px;">
          ${slikaHTML} <div class="comment-content">
            <h6>Povratne informacije:</h6>
            <p class="comment-text">
              <strong>${a.komentatorIme} ${a.komentatorPriimek}:</strong> "${a.komentarTekst}"
            </p>
          </div>
        </div>
      `;
    }
   
    const jeVseckan = vseckaniOrganizatorji.includes(a.organizatorId);
    const jePrijavljen = prijavljeniTermini.includes(a.id);

    return `
    <article class="activity-card">
      <div class="emoji">${a.emoji}</div>
      <div class="activity-info">
        <h2>
          <a href="aktivnost.html?id=${a.id}&redni=${prikazRednihTerminov}" class="activity-title-link">
          ${a.title} (${a.sport})
          </a>
        </h2>
        <p>${a.date} ob ${a.time} · <strong>Lokacija:</strong> ${a.venue}, ${a.city} · <strong>Organizator:</strong> ${a.org}</p>
        <p class="activity-desc" style="font-style: italic; color: #555; margin-top: 5px;">${a.description}</p>
        <div class="tags" style="margin-top: 10px;">
          <span>${a.level}</span>
          <span>${a.gender}</span>
          <span>${a.age}</span>
          <span>${a.spots} prostih mest</span>
        </div>
        ${komentarHTML}
      </div>
      <div class="activity-buttons">
        <button onclick="toggleJoin(this, ${a.id})" class="btn ${jePrijavljen ? 'danger' : (a.spots > 0 ? 'primary' : 'disabled')} small" ${a.spots === 0 && !jePrijavljen ? 'disabled' : ''}>
          ${jePrijavljen ? 'Odjavi se' : (a.spots > 0 ? 'Prijavi se' : 'Polno')}
        </button>
   
      </div>
       <button onclick="toggleHeart(this, ${a.organizatorId})" class="heart-btn ${jeVseckan ? 'liked' : ''}">${jeVseckan ? '♥' : '♡'}</button>
    </article>`;
  }).join('') || '<p class="empty">Ni najdenih aktivnosti za izbrane filtre.</p>';
}

function prikaziSporociloNaStrani(besedilo, tip = "success") {
  let container = document.getElementById("toastMessage");

  if (!container) {
    container = document.createElement("div");
    container.id = "toastMessage";
    document.body.appendChild(container);
  }

  container.className = `toast-message ${tip}`;
  container.textContent = besedilo;
  container.classList.add("show");

  setTimeout(() => {
    container.classList.remove("show");
  }, 3500);
}

async function toggleJoin(button, terminId) {
  const token = localStorage.getItem("token");

  if (!token) {
    prikaziSporociloNaStrani("Za prijavo na aktivnost se moraš najprej prijaviti.", "error");
    setTimeout(() => {
      window.location.href = "prijava.html";
    }, 1200);
    return;
  }

  if (!terminId) {
    prikaziSporociloNaStrani("Napaka: manjka ID termina.", "error");
    return;
  }

  const jeOdjava = button.textContent.trim() === "Odjavi se";

  try {
    const odgovor = await fetch(`${API_URL}/prijave/${terminId}`, {
      method: jeOdjava ? "DELETE" : "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const podatki = await odgovor.json();

    if (!odgovor.ok) {
      prikaziSporociloNaStrani(podatki.napaka || "Prišlo je do napake.", "error");
      return;
    }

    await naloziAktivnosti(false);

    if (document.getElementById("mojePrijavljeneAktivnosti")) {
      await naloziMojePrijavljeneAktivnosti();
    }

prikaziSporociloNaStrani(podatki.sporocilo, "success");

  } catch (err) {
    console.error(err);
    prikaziSporociloNaStrani("Napaka pri povezavi s strežnikom.", "error");
  }
}

function showSuccess(event) {
  event.preventDefault();
  document.getElementById('success').classList.remove('hidden');
}

document.querySelectorAll('#search, #sport, #level, #gender, #age, #available').forEach(el => {
  el.addEventListener('input', renderActivities);
  el.addEventListener('change', renderActivities);
});

const API_URL = "http://localhost:3000/api";

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const message = document.getElementById("loginMessage");

    message.textContent = "";
    message.classList.add("hidden");

    try {
      const odgovor = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      const podatki = await odgovor.json();
      console.log("ODGOVOR IZ BACKENDA:", podatki);

      if (!odgovor.ok) {
        message.textContent = podatki.napaka || "Prijava ni uspela.";
        message.classList.remove("hidden");
        return;
      }

      localStorage.setItem("token", podatki.token);
      localStorage.setItem("uporabnik", JSON.stringify(podatki.uporabnik));

      const tip = podatki.uporabnik.tip.toLowerCase().trim();

      if (tip === "administrator") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "profil.html";
      }
    } catch (err) {
      console.error(err);
      message.textContent = "Napaka pri povezavi s strežnikom.";
      message.classList.remove("hidden");
    }
  });
}

//funkcijo za prijavo/odjavo na podrobni strani
async function toggleJoinNaPodrobnostih(button, terminId) {
  const token = localStorage.getItem("token");

  if (!token) {
    prikaziSporociloNaStrani("Za prijavo na aktivnost se moraš najprej prijaviti.", "error");
    setTimeout(() => {
      window.location.href = "prijava.html";
    }, 1200);
    return;
  }

  if (!terminId) {
    prikaziSporociloNaStrani("Napaka: manjka ID termina.", "error");
    return;
  }

  const jeOdjava = button.textContent.trim() === "Odjavi se";

  try {
    const odgovor = await fetch(`${API_URL}/prijave/${terminId}`, {
      method: jeOdjava ? "DELETE" : "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const podatki = await odgovor.json();

    if (!odgovor.ok) {
      prikaziSporociloNaStrani(podatki.napaka || "Prišlo je do napake.", "error");
      return;
    }

    prikaziSporociloNaStrani(podatki.sporocilo, "success");

    await naloziPodrobnostiAktivnosti();

  } catch (err) {
    console.error(err);
    prikaziSporociloNaStrani("Napaka pri povezavi s strežnikom.", "error");
  }
}

async function naloziAdminAktivnosti() {
  const adminList = document.getElementById("adminActivityList");

  if (!adminList) return;

  const token = localStorage.getItem("token");
  const uporabnik = JSON.parse(localStorage.getItem("uporabnik"));

  if (!token || !uporabnik || uporabnik.tip !== "Administrator") {
    window.location.href = "prijava.html";
    return;
  }

  try {
    const odgovor = await fetch(`${API_URL}/aktivnosti`);
    const aktivnosti = await odgovor.json();

    adminList.innerHTML = "";

    aktivnosti.forEach(a => {
      adminList.innerHTML += `
                <article class="activity-card">
                    <div class="emoji">
                        ${vrniIkonoSporta(a.sport)}
                    </div>

                    <div class="activity-info">
                        <h2>${a.naziv}</h2>
                        <p>
                            ${a.sport} · ${a.prizorisce}, ${a.mesto}
                        </p>
                        <p>
                            ${new Date(a.datum).toLocaleDateString("sl-SI")}
                        </p>

                        <div class="tags">
                            <span>${a.zahtevnost}</span>
                            <span>${a.stevilomest} prostih mest</span>
                        </div>
                    </div>

                    <div>
                        <button class="btn secondary small" onclick="urediAktivnost(${a.id_termin}, '${a.naziv}', ${a.stevilomest}, '${a.opis}', '${a.zahtevnost}')">
                            Uredi
                        </button>

                        <button class="btn danger small" onclick="izbrisiAktivnost(${a.id_termin})">
                            Izbriši
                        </button>
                    </div>
                </article>
            `;
    });

  } catch (err) {
    adminList.innerHTML = `
            <p class="empty">Napaka pri nalaganju aktivnosti.</p>
        `;
  }
}

function vrniIkonoSporta(sport) {
  if (sport === "Nogomet") return "⚽";
  if (sport === "Košarka") return "🏀";
  if (sport === "Odbojka") return "🏐";
  if (sport === "Tenis") return "🎾";
  if (sport === "Badminton") return "🏸";
  return "🏃";
}

async function izbrisiAktivnost(id) {
  const token = localStorage.getItem("token");

  if (!confirm("Ali res želiš izbrisati to aktivnost?")) {
    return;
  }

  await fetch(`${API_URL}/aktivnosti/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  naloziAdminAktivnosti();
}

async function urediAktivnost(id, starNaziv, staraMesta, starOpis, staraZahtevnost) {
  const token = localStorage.getItem("token");

  const naziv = prompt("Vnesi nov naziv:", starNaziv);
  const steviloMest = prompt("Vnesi število prostih mest:", staraMesta);
  const opis = prompt("Vnesi opis:", starOpis);
  const zahtevnost = prompt("Vnesi zahtevnost:", staraZahtevnost);

  if (!naziv || !steviloMest || !opis || !zahtevnost) {
    return;
  }

  await fetch(`${API_URL}/aktivnosti/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      naziv: naziv,
      steviloMest: steviloMest,
      opis: opis,
      zahtevnost: zahtevnost
    })
  });

  naloziAdminAktivnosti();
}
if (document.getElementById("adminActivityList")) {
  naloziAdminAktivnosti();
}


//nalozi komentarje
async function naloziKomentarje() {
  const container = document.getElementById("komentarji");
  if (!container) return;

  const odgovor = await fetch(`${API_URL}/komentarji`);
  const komentarji = await odgovor.json();

  container.innerHTML = `<div class="card" id="komentarjiCard"></div>`;

  const card = document.getElementById("komentarjiCard");

  komentarji.forEach(k => {
    card.innerHTML += `
    <div class="komentar-item">
      <p><b>${k.ime} ${k.priimek}:</b> ${k.komentar}</p>
      <small>${k.termin ? "Termin: " + k.termin : "Splošen komentar"}</small>
      </div>
      `;
  });
}

const komentarForm = document.getElementById("komentarForm");

if (komentarForm) {
  komentarForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const komentar = document.getElementById("komentarInput").value;
    const sporocilo = document.getElementById("komentarSporocilo");

    if (!token) {
      sporocilo.textContent = "Za dodajanje komentarja se moraš prijaviti.";
      return;
    }

    const odgovor = await fetch(`${API_URL}/komentarji`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        komentar: komentar,
        terminId: null,
        slika: null
      })
    });

    if (!odgovor.ok) {
      sporocilo.textContent = "Napaka pri dodajanju komentarja.";
      return;
    }

    document.getElementById("komentarInput").value = "";
    sporocilo.textContent = "Komentar dodan.";

    naloziKomentarje();
  });
}

naloziKomentarje();

async function naloziMojeKomentarje() {
  const container = document.getElementById("mojiKomentarji");
  if (!container) return;

  const token = localStorage.getItem("token");

  if (!token) {
    container.innerHTML = "<p>Za ogled komentarjev se moraš prijaviti.</p>";
    return;
  }

  const odgovor = await fetch(`${API_URL}/komentarji/moji`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const komentarji = await odgovor.json();

  container.innerHTML = "";

  komentarji.forEach(k => {
    container.innerHTML += `
    <div class="card">
      <p>${k.komentar}</p>
      <small>${k.termin ? "Termin: " + k.termin : "Splošen komentar"}</small>
      </div>
      `;
  });
}

naloziMojeKomentarje();

async function naloziVseckaneOrganizatorje() {
  const container = document.getElementById("vseckaniOrganizatorji");
  if (!container) return;

  const token = localStorage.getItem("token");

  if (!token) {
    container.innerHTML = "<p>Za ogled všečkanih organizatorjev se moraš prijaviti.</p>";
    return;
  }

  const odgovor = await fetch(`${API_URL}/organizatorji/vseckani`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const podatki = await odgovor.json();

  container.innerHTML = "";

  podatki.forEach(o => {
    container.innerHTML += `
    <div class="organizator-card">
      <b>${o.ime} ${o.priimek}</b>
      <p>@${o.username}</p>
      <div class="organizator-hover">
        <h4>Aktivnosti:</h4>
        ${o.aktivnosti.length > 0 ? o.aktivnosti.map(a => `<a href="aktivnost.html?id=${a.id}&redni=${a.redni ? 'true' : 'false'}" class="organizator-aktivnost">${a.naziv}</a>`).join("")
        : "<p>Ni aktivnosti.</p>"}
      </div>
    </div>`;
  });
}

naloziVseckaneOrganizatorje();

async function toggleHeart(button, organizatorId) {
  const token = localStorage.getItem("token");

  if (!token) {
  const sporocilo = document.getElementById("organizatorSporocilo");
  if (sporocilo) {
    sporocilo.textContent = "Za všečkanje organizatorja se moraš prijaviti.";
  }
  return;
}

  button.classList.toggle("liked");
  const jeVseckan = button.classList.contains("liked");

  button.textContent = jeVseckan ? "♥" : "♡";

  await fetch(jeVseckan
    ? `${API_URL}/organizatorji/vseckani` :
    `${API_URL}/organizatorji/vseckani/${organizatorId}`,
    {
      method: jeVseckan ? "POST" : "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: jeVseckan
      ? JSON.stringify({ organizatorId })
      : null
    }
  );
}

async function pridobiVseckaneIds() {
  const token = localStorage.getItem("token");

  if (!token) {
    vseckaniOrganizatorji = [];
    return;
  }

  try {
  const odgovor = await fetch(`${API_URL}/organizatorji/vseckani`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!odgovor.ok) {
    vseckaniOrganizatorji = [];
    return;
  }

  const podatki = await odgovor.json();

  if (!Array.isArray(podatki)) {
    vseckaniOrganizatorji = [];
    return;
  }

  vseckaniOrganizatorji = podatki.map(o => o.id_uporabnik);
} catch (err) {
  vseckaniOrganizatorji = [];
}
}
const dodajTerminForm = document.getElementById("activityForm");

if (dodajTerminForm) {
  dodajTerminForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const dateInput = document.getElementById('datum').value;
    const timeInput = document.getElementById('ura').value;
    const sqlDateTime = `${dateInput} ${timeInput}:00`;
    const successMessage = document.getElementById("successMessage");

    if (!token) {
      sporocilo.textContent = "Za objavo termina se moraš prijaviti.";
      return;
    }

    const odgovor = await fetch(`${API_URL}/aktivnosti/dodaj`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        naziv: document.getElementById("naslov").value,
        datum: sqlDateTime,
        stevilomest: document.getElementById("mesta").value,
        opis: document.getElementById("opis").value,
        zahtevnost: document.getElementById("zahtevnost").value,
        starostnaskupina: document.getElementById("starost").value,
        spol: document.getElementById("spol").value,
        prizorisceid: document.getElementById("prizorisce").value,
        sportid: 1,
        rednitermin: document.getElementById("redno").checked
      })
    });

    if (!odgovor.ok) {
      console.log(odgovor.json())
      successMessage.textContent = "Napaka pri dodajanju aktivnosti.";
      successMessage.classList.remove('hidden');
      return;
    }

    successMessage.textContent = "Aktivnost je bila uspešno objavljena.";
    successMessage.classList.remove('hidden');
    dodajTerminForm.reset();

  });
}

//prijava/odjava na termin
async function naloziMojePrijavljeneAktivnosti() {
  const container = document.getElementById("mojePrijavljeneAktivnosti");

  if (!container) return;

  const token = localStorage.getItem("token");

  if (!token) {
    container.innerHTML = "<p>Za ogled prijavljenih aktivnosti se moraš prijaviti.</p>";
    return;
  }

  try {
    const odgovor = await fetch(`${API_URL}/prijave/moje/aktivnosti`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const aktivnosti = await odgovor.json();

    if (!odgovor.ok) {
      container.innerHTML = `<p class="empty">${aktivnosti.napaka || "Napaka pri nalaganju aktivnosti."}</p>`;
      return;
    }

    if (aktivnosti.length === 0) {
      container.innerHTML = `<p class="empty">Nisi še prijavljen/a na nobeno aktivnost.</p>`;
      return;
    }

    container.innerHTML = aktivnosti.map(function (a) {
      const datum = new Date(a.datum).toLocaleDateString("sl-SI");
      const ura = new Date(a.datum).toLocaleTimeString("sl-SI", {
        hour: "2-digit",
        minute: "2-digit"
      });

      return `
        <article class="activity-card">
          <div class="emoji">${vrniIkonoSporta(a.sport)}</div>

          <div class="activity-info">
            <h2>${a.naziv} (${a.sport})</h2>
            <p>
              ${datum} ob ${ura} ·
              <strong>Lokacija:</strong> ${a.prizorisce}, ${a.mesto} ·
              <strong>Organizator:</strong> ${a.organizatorime || ""} ${a.organizatorpriimek || ""}
            </p>
            <p class="activity-desc" style="font-style: italic; color: #555; margin-top: 5px;">
              ${a.opis || "Brez opisa"}
            </p>

            <div class="tags" style="margin-top: 10px;">
              <span>${a.zahtevnost || ""}</span>
              <span>${a.spol || ""}</span>
              <span>${a.starostnaskupina || ""}</span>
            </div>
          </div>

          <div class="activity-buttons">
            <button onclick="odjaviSeIzProfila(${a.id_termin})" class="btn danger small">
              Odjavi se
            </button>
          </div>
        </article>
      `;
    }).join("");

  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="empty">Napaka pri povezavi s strežnikom.</p>`;
  }
}

async function odjaviSeIzProfila(terminId) {
  const token = localStorage.getItem("token");

  if (!token) {
    prikaziSporociloNaStrani("Za odjavo se moraš prijaviti.", "error");
    return;
  }

  const odgovor = await fetch(`${API_URL}/prijave/${terminId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const podatki = await odgovor.json();

  if (!odgovor.ok) {
    prikaziSporociloNaStrani(podatki.napaka || "Napaka pri odjavi.", "error");
    return;
  }

  await naloziMojePrijavljeneAktivnosti();

  prikaziSporociloNaStrani(podatki.sporocilo, "success");
}

naloziMojePrijavljeneAktivnosti();

//popravljen navbar
function urediNavbar() {
  const loginLink = document.getElementById("loginLink");
  const profileLink = document.getElementById("profileLink");
  const adminLink = document.getElementById("adminLink");
  const logoutLink = document.getElementById("logoutLink");
  const objaviLink = document.getElementById("objaviLink");

  const token = localStorage.getItem("token");
  const uporabnik = JSON.parse(localStorage.getItem("uporabnik"));

  if (!loginLink || !profileLink || !adminLink || !logoutLink) return;

  if (token && uporabnik) {
    loginLink.classList.add("hidden");
    logoutLink.classList.remove("hidden");

    const tip = (uporabnik.tip || "Uporabnik").toLowerCase().trim();

    if (tip === "administrator") {
      adminLink.classList.remove("hidden");
      profileLink.classList.add("hidden");

      if (objaviLink) {
        objaviLink.classList.add("hidden");
      }
    } else {
      adminLink.classList.add("hidden");
      profileLink.classList.remove("hidden");

      if (objaviLink) {
        objaviLink.classList.remove("hidden");
      }
    }

  } else {
    loginLink.classList.remove("hidden");
    profileLink.classList.add("hidden");
    adminLink.classList.add("hidden");
    logoutLink.classList.add("hidden");

    if (objaviLink) {
      objaviLink.classList.remove("hidden");
    }
  }
}

urediNavbar();

function odjava() {
  localStorage.removeItem("token");
  localStorage.removeItem("uporabnik");
  window.location.href = "prijava.html";
}


//popravljeno urejanje oglasov in prikazovanje komentarjev za admina
async function naloziAdminStran() {
  const oglasiBox = document.getElementById("adminOglasi");
  const komentarjiBox = document.getElementById("adminKomentarji");

  if (!oglasiBox || !komentarjiBox) return;

  const token = localStorage.getItem("token");
  const uporabnik = JSON.parse(localStorage.getItem("uporabnik"));

  if (!token || !uporabnik || uporabnik.tip !== "Administrator") {
    window.location.href = "prijava.html";
    return;
  }

  await naloziAdminOglase();
  await naloziAdminKomentarje();
}

function prikaziAdminSporocilo(besedilo) {
  const msg = document.getElementById("adminMessage");

  if (!msg) return;

  msg.textContent = besedilo;
  msg.classList.remove("hidden");

  setTimeout(() => {
    msg.classList.add("hidden");
  }, 3000);
}

async function naloziAdminOglase() {
  const oglasiBox = document.getElementById("adminOglasi");
  const token = localStorage.getItem("token");

  const odgovor = await fetch("http://localhost:3000/api/admin/oglasi", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const oglasi = await odgovor.json();

  if (!odgovor.ok) {
    oglasiBox.innerHTML = `<p class="empty">${oglasi.napaka}</p>`;
    return;
  }

  oglasiBox.innerHTML = oglasi.map(o => `
    <article class="activity-card" id="oglas-${o.id_termin}">
      <div class="emoji">${vrniIkonoSporta(o.sport)}</div>

      <div class="activity-info">
        <input id="naziv-${o.id_termin}" value="${o.naziv}">
        <textarea id="opis-${o.id_termin}">${o.opis || ""}</textarea>

        <p>${o.sport} · ${o.prizorisce}, ${o.mesto}</p>
        <p>${new Date(o.datum).toLocaleDateString("sl-SI")}</p>

        <div class="two">
          <input id="mesta-${o.id_termin}" type="number" value="${o.stevilomest}">
          <input id="zahtevnost-${o.id_termin}" value="${o.zahtevnost}">
        </div>

        <div class="tags">
          <span>${o.organizatorime} ${o.organizatorpriimek}</span>
        </div>
      </div>

      <div>
        <button class="btn primary small" onclick="shraniAdminOglas(${o.id_termin})">
          Shrani
        </button>

        <button class="btn danger small" onclick="izbrisiAdminOglas(${o.id_termin})">
          Izbriši
        </button>
      </div>
    </article>
  `).join("");
}

async function shraniAdminOglas(id) {
  const token = localStorage.getItem("token");

  const naziv = document.getElementById(`naziv-${id}`).value;
  const opis = document.getElementById(`opis-${id}`).value;
  const steviloMest = document.getElementById(`mesta-${id}`).value;
  const zahtevnost = document.getElementById(`zahtevnost-${id}`).value;

  const odgovor = await fetch(`http://localhost:3000/api/admin/oglasi/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      naziv,
      opis,
      steviloMest,
      zahtevnost
    })
  });

  const podatki = await odgovor.json();

  if (!odgovor.ok) {
    prikaziAdminSporocilo(podatki.napaka || "Napaka pri urejanju oglasa.");
    return;
  }

  prikaziAdminSporocilo("Oglas je bil uspešno posodobljen.");
  naloziAdminOglase();
}

async function izbrisiAdminOglas(id) {
  const token = localStorage.getItem("token");

  const oglas = document.getElementById(`oglas-${id}`);

  oglas.innerHTML = `
    <div class="activity-info">
      <h2>Ali res želiš izbrisati ta oglas?</h2>
      <p>To dejanje bo odstranilo oglas iz baze.</p>
    </div>

    <div>
      <button class="btn danger small" onclick="potrdiBrisanjeOglasa(${id})">
        Da, izbriši
      </button>

      <button class="btn secondary small" onclick="naloziAdminOglase()">
        Prekliči
      </button>
    </div>
  `;
}

async function potrdiBrisanjeOglasa(id) {
  const token = localStorage.getItem("token");

  const odgovor = await fetch(`http://localhost:3000/api/admin/oglasi/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const podatki = await odgovor.json();

  if (!odgovor.ok) {
    prikaziAdminSporocilo(podatki.napaka || "Napaka pri brisanju oglasa.");
    return;
  }

  prikaziAdminSporocilo("Oglas je bil izbrisan.");
  naloziAdminOglase();
}

async function naloziAdminKomentarje() {
  const komentarjiBox = document.getElementById("adminKomentarji");
  const token = localStorage.getItem("token");

  const odgovor = await fetch("http://localhost:3000/api/admin/komentarji", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const komentarji = await odgovor.json();

  if (!odgovor.ok) {
    komentarjiBox.innerHTML = `<p class="empty">${komentarji.napaka}</p>`;
    return;
  }

  if (komentarji.length === 0) {
    komentarjiBox.innerHTML = `<p class="empty">Trenutno ni komentarjev.</p>`;
    return;
  }

  komentarjiBox.innerHTML = komentarji.map(k => `
    <article class="activity-card" id="komentar-${k.id_komentar}">
      <div class="emoji">💬</div>

      <div class="activity-info">
        <h2>${k.username}</h2>
        <p>${k.komentar}</p>
<p>Aktivnost: ${k.termin || "Splošen komentar"}</p>
      </div>

      <div>
        <button class="btn danger small" onclick="izbrisiAdminKomentar(${k.id_komentar})">
          Izbriši
        </button>
      </div>
    </article>
  `).join("");
}

function izbrisiAdminKomentar(id) {
  const komentar = document.getElementById(`komentar-${id}`);

  komentar.innerHTML = `
    <div class="activity-info">
      <h2>Ali res želiš izbrisati komentar?</h2>
      <p>Komentar bo odstranjen iz baze.</p>
    </div>

    <div>
      <button class="btn danger small" onclick="potrdiBrisanjeKomentarja(${id})">
        Da, izbriši
      </button>

      <button class="btn secondary small" onclick="naloziAdminKomentarje()">
        Prekliči
      </button>
    </div>
  `;
}

async function potrdiBrisanjeKomentarja(id) {
  const token = localStorage.getItem("token");

  const odgovor = await fetch(`http://localhost:3000/api/admin/komentarji/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const podatki = await odgovor.json();

  if (!odgovor.ok) {
    prikaziAdminSporocilo(podatki.napaka || "Napaka pri brisanju komentarja.");
    return;
  }

  prikaziAdminSporocilo("Komentar je bil izbrisan.");
  naloziAdminKomentarje();
}

if (document.getElementById("adminOglasi")) {
  naloziAdminStran();
}

//prikaz mojih aktivnosti
async function naloziMojeAktivnosti() {
  const box = document.getElementById("mojeAktivnosti");
  if (!box) return;

  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "prijava.html";
    return;
  }

  const odgovor = await fetch("http://localhost:3000/api/organizatorji/moje-aktivnosti", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const aktivnosti = await odgovor.json();
  console.log("MOJE AKTIVNOSTI:", aktivnosti);
  console.log("STATUS:", odgovor.status);

  if (!odgovor.ok) {
    box.innerHTML = `<p class="empty">${aktivnosti.napaka}</p>`;
    return;
  }

  if (aktivnosti.length === 0) {
    box.innerHTML = `<p class="empty">Nisi še objavil nobene aktivnosti.</p>`;
    return;
  }

  box.innerHTML = aktivnosti.map(a => `
    <article class="activity-card" id="moja-aktivnost-${a.id_termin}">
      <div class="emoji">${vrniIkonoSporta(a.sport)}</div>

      <div class="activity-info">
        <input id="moja-naziv-${a.id_termin}" value="${a.naziv}">
        <textarea id="moja-opis-${a.id_termin}">${a.opis || ""}</textarea>

        <p>${a.sport} · ${a.prizorisce}, ${a.mesto}</p>
        <p>${new Date(a.datum).toLocaleDateString("sl-SI")}</p>

        <div class="two">
          <input id="moja-mesta-${a.id_termin}" type="number" value="${a.stevilomest}">
          <input id="moja-zahtevnost-${a.id_termin}" value="${a.zahtevnost}">
        </div>

        <div id="prijave-${a.id_termin}" class="comments"></div>
      </div>

      <div>
        <button class="btn primary small" onclick="shraniMojoAktivnost(${a.id_termin})">
          Shrani
        </button>

        <button class="btn secondary small" onclick="naloziPrijaveNaAktivnost(${a.id_termin})">
          Prijave
        </button>

        <button class="btn danger small" onclick="izbrisiMojoAktivnost(${a.id_termin})">
          Izbriši
        </button>
      </div>
    </article>
  `).join("");
}

function prikaziProfilSporocilo(besedilo) {
  const msg = document.getElementById("profilMessage");
  if (!msg) return;

  msg.textContent = besedilo;
  msg.classList.remove("hidden");

  setTimeout(() => {
    msg.classList.add("hidden");
  }, 3000);
}

async function shraniMojoAktivnost(id) {
  const token = localStorage.getItem("token");

  const naziv = document.getElementById(`moja-naziv-${id}`).value;
  const opis = document.getElementById(`moja-opis-${id}`).value;
  const steviloMest = document.getElementById(`moja-mesta-${id}`).value;
  const zahtevnost = document.getElementById(`moja-zahtevnost-${id}`).value;

  const odgovor = await fetch(`http://localhost:3000/api/organizatorji/moje-aktivnosti/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      naziv,
      opis,
      steviloMest,
      zahtevnost
    })
  });

  const podatki = await odgovor.json();

  if (!odgovor.ok) {
    prikaziProfilSporocilo(podatki.napaka || "Napaka pri urejanju aktivnosti.");
    return;
  }

  prikaziProfilSporocilo("Aktivnost je bila posodobljena.");
  naloziMojeAktivnosti();
}

function izbrisiMojoAktivnost(id) {
  const kartica = document.getElementById(`moja-aktivnost-${id}`);

  kartica.innerHTML = `
    <div class="activity-info">
      <h2>Ali res želiš izbrisati svojo aktivnost?</h2>
      <p>Aktivnost bo odstranjena iz baze.</p>
    </div>

    <div>
      <button class="btn danger small" onclick="potrdiBrisanjeMojeAktivnosti(${id})">
        Da, izbriši
      </button>

      <button class="btn secondary small" onclick="naloziMojeAktivnosti()">
        Prekliči
      </button>
    </div>
  `;
}

async function potrdiBrisanjeMojeAktivnosti(id) {
  const token = localStorage.getItem("token");

  const odgovor = await fetch(`http://localhost:3000/api/organizatorji/moje-aktivnosti/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const podatki = await odgovor.json();

  if (!odgovor.ok) {
    prikaziProfilSporocilo(podatki.napaka || "Napaka pri brisanju aktivnosti.");
    return;
  }

  prikaziProfilSporocilo("Aktivnost je bila izbrisana.");
  naloziMojeAktivnosti();
}

async function naloziPrijaveNaAktivnost(id) {
  const token = localStorage.getItem("token");
  const prijaveBox = document.getElementById(`prijave-${id}`);

  const odgovor = await fetch(`http://localhost:3000/api/organizatorji/moje-aktivnosti/${id}/prijave`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const prijave = await odgovor.json();

  if (!odgovor.ok) {
    prijaveBox.innerHTML = `<p>${prijave.napaka}</p>`;
    return;
  }

  if (prijave.length === 0) {
    prijaveBox.innerHTML = `<p>Na to aktivnost še ni prijavljenih uporabnikov.</p>`;
    return;
  }

  prijaveBox.innerHTML = `
    <h3>Prijavljeni uporabniki</h3>
    ${prijave.map(p => `
      <p>
        👤 ${p.ime} ${p.priimek} 
        <strong>(${p.username})</strong> · ${p.email}
      </p>
    `).join("")}
  `;
}

if (document.getElementById("mojeAktivnosti")) {
  naloziMojeAktivnosti();
}

//preverjanje dolžine in posebnih znakov pri geslih novih uporabnikov
function preveriGeslo(geslo) {
  const dovoljDolgo = geslo.length >= 8;
  const imaStevilkoAliZnak = /[0-9!@#$%^&*]/.test(geslo);

  return dovoljDolgo && imaStevilkoAliZnak;
}

const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const ime = document.getElementById("regIme").value;
    const priimek = document.getElementById("regPriimek").value;
    const username = document.getElementById("regUsername").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    const datumRojstva = document.getElementById("regDatumRojstva").value;
    const spol = document.getElementById("regSpol").value;
    const message = document.getElementById("registerMessage");

    message.textContent = "";
    message.classList.remove("success-message", "error-message");

    if (!preveriGeslo(password)) {
      message.textContent = "Geslo mora imeti 8 znakov in vsebovati število ali posebni znak.";
      message.classList.add("error-message");
      return;
    }

    try {
      const odgovor = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
       },
        body: JSON.stringify({
          ime,
          priimek,
          username,
          email,
          password,
          datumRojstva,
          spol
        })
      });

      const podatki = await odgovor.json();

      if (!odgovor.ok) {
        message.textContent = podatki.napaka || "Registracija ni uspela.";
        message.classList.add("error-message");
        return;
      }

      message.textContent = "Registracija uspešna. Zdaj se lahko prijaviš.";
      message.classList.add("success-message");

      setTimeout(() => {
        window.location.href = "prijava.html";
      }, 1500);

    } catch (err) {
      message.textContent = "Napaka pri povezavi s strežnikom."
      message.classList.add("error-message");
    }
  });
}

//za nalaganje podatkov uporabnika na profil.html
async function naloziProfil() {
  const profileName = document.getElementById("profileName");
  if (!profileName) return;

  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "prijava.html";
    return;
  }

  const odgovor = await fetch(`${API_URL}/auth/me`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const uporabnik = await odgovor.json();
  document.getElementById("editIme").value = uporabnik.ime;
  document.getElementById("editPriimek").value = uporabnik.priimek;
  document.getElementById("editUsername").value = uporabnik.username;
  document.getElementById("editEmail").value = uporabnik.email;

  document.getElementById("profileName").textContent = `${uporabnik.ime} ${uporabnik.priimek}`;
  document.getElementById("profileInfo").innerHTML = `@${uporabnik.username}<br>${uporabnik.email} `;
  document.getElementById("profileAvatar").textContent = uporabnik.ime[0].toUpperCase();

   if (uporabnik.profilnaslika) {
    const img = document.getElementById("profileImage");
    const avatar = document.getElementById("profileAvatar");

    img.src = uporabnik.profilnaslika;

    img.style.display = "block";
    avatar.style.display = "none";
  }
}
naloziProfil();

//dodajanje profilne slike
const profileImageInput = document.getElementById("profileImageInput");

if (profileImageInput) {
  profileImageInput.addEventListener("change", function () {
    const file = profileImageInput.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async function (e) {
      const token = localStorage.getItem("token");

      await fetch(`${API_URL}/auth/profilna-slika`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          profilnaSlika: e.target.result
        })
      });

      document.getElementById("profileImage").src = e.target.result;
      document.getElementById("profileImage").style.display = "block";
      document.getElementById("profileAvatar").style.display = "none";
    };

    reader.readAsDataURL(file);
  });
}

//prikaz rednih terminov(Aktivnosti)
let prikazRednihTerminov = false;

function prikaziRedneTermine() {
  prikazRednihTerminov = !prikazRednihTerminov;

  const gumb = document.getElementById("redniTerminiBtn");

  if (prikazRednihTerminov) {
    if (gumb) gumb.textContent = "Prikaži aktivnosti";
    naloziAktivnosti(true);
  } else {
    if (gumb) gumb.textContent = "Redni termini";
    naloziAktivnosti(false);
  }
}

//urejanje podatkov uporabnika
const editProfileForm = document.getElementById("editProfileForm");

if (editProfileForm) {
  editProfileForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const ime = document.getElementById("editIme").value;
    const priimek = document.getElementById("editPriimek").value;
    const username = document.getElementById("editUsername").value;
    const email = document.getElementById("editEmail").value;
    const password = document.getElementById("editPassword").value;
    const message = document.getElementById("editProfileMessage");

    const odgovor = await fetch(`${API_URL}/auth/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },

    body: JSON.stringify({
      ime,
      priimek,
      username,
      email,
      password
    })
    });

    const podatki = await odgovor.json();

    if (!odgovor.ok) {
      message.textContent = podatki.napaka;
      message.className = "error-message";
      return;
    }
    message.textContent = "Profil uspešno posodobljen."
    message.className = "success-message";
    naloziProfil();
  });
}

async function oddajRedniKomentar(e, activityId) {
  e.preventDefault();

  const token = localStorage.getItem("token");
  const komentarInput = document.getElementById(`redniKomentarInput-${activityId}`);
  const slikaInput = document.getElementById(`redniKomentarImageInput-${activityId}`);
  const sporocilo = document.getElementById(`redniKomentarSporocilo-${activityId}`);

  if (!token) {
    sporocilo.textContent = "Za dodajanje komentarja se moraš prijaviti.";
    return;
  }

  const pretvoriVSlikoBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  let slikaTekst = null;

  if (slikaInput && slikaInput.files && slikaInput.files[0]) {
    //console.log("Datoteka najdena:", slikaInput.files[0].name);
    try {
      slikaTekst = await pretvoriVSlikoBase64(slikaInput.files[0]);
    } catch (napakaPriSliki) {
      console.error("Napaka pri branju slike:", napakaPriSliki);
      sporocilo.textContent = "Napaka pri obdelavi slike.";
      return;
    }
  }

  try {
    sporocilo.textContent = "Pošiljam...";

    const odgovor = await fetch(`${API_URL}/komentarji`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        komentar: komentarInput.value,
        terminId: activityId,
        slika: slikaTekst
      })
    });

    if (!odgovor.ok) {
      sporocilo.textContent = "Napaka pri dodajanju komentarja.";
      return;
    }

    komentarInput.value = "";
    slikaInput.value = "";
    sporocilo.textContent = "Komentar uspešno dodan.";

  } catch (napaka) {
    console.error("Omrežna napaka:", napaka);
    sporocilo.textContent = "Napaka na omrežju.";
  }
}

//prikazovanje za urejanje profila
function prikaziUrediProfil() {
  const forma = document.getElementById("editProfileForm");

  if (!forma) return;

  forma.classList.toggle("profile-form-hidden");
}

//prijava z google profilom
async function  handleGoogleLogin(response) {
  const odgovor = await fetch (`${API_URL}/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      credential: response.credential
    })
  });

  const podatki = await odgovor.json();

  if(!odgovor.ok) {
    const sporocilo = document.getElementById("loginMessage");

    if(sporocilo) {
      sporocilo.textContent = podatki.napaka || "Google prijava ni uspela.";
      sporocilo.classList.remove("hidden");
      sporocilo.classList.remove("success")
      sporocilo.className = "error-message"
    }
    return;
  }
  localStorage.setItem("token", podatki.token);
  localStorage.setItem("uporabnik", JSON.stringify(podatki.uporabnik));

  window.location.href = "profil.html";
}

//aktiven zemljevid
let zemljevid = null;
let markerji = [];

function ikonaZaSport(sport) {
  if (sport === "Nogomet") return "⚽";
  if (sport === "Košarka") return "🏀";
  if (sport === "Odbojka") return "🏐";
  if (sport === "Tenis") return "🎾";
  if (sport === "Badminton") return "🏸";
  return "🏃";
}

function inicializirajZemljevid() {
  const mapDiv = document.getElementById("map");

  if (!mapDiv) return;

  zemljevid = L.map("map").setView([46.1512, 14.9955], 8);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap"
  }).addTo(zemljevid);
}

function prikaziAktivnostiNaZemljevidu(aktivnosti) {
  if (!zemljevid) return;

  markerji.forEach(marker => zemljevid.removeLayer(marker));
  markerji = [];

  aktivnosti.forEach(a => {
    const lat = Number(a.lat);
    const lng = Number(a.lng);

    if (!lat || !lng) return;

    const emoji = ikonaZaSport(a.sport);

    const customIcon = L.divIcon({
      html: `<div class="sport-marker">${emoji}</div>`,
      className: "",
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    const marker = L.marker([lat, lng], {
      icon: customIcon
    }).addTo(zemljevid);

    marker.bindPopup(`
      <b>${a.title}</b><br>
      ${a.sport}<br>
      ${a.venue}, ${a.city}<br>
      ${a.date} ob ${a.time}
    `);

    markerji.push(marker);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  inicializirajZemljevid();

  if (document.getElementById("map")) {
    await naloziAktivnosti(false);
  }
});

//funkcija za stran ko kliknes na ime aktivnosti
async function naloziPodrobnostiAktivnosti() {
  const container = document.getElementById("aktivnostPodrobnosti");
  const naslov = document.getElementById("aktivnostNaslov");

  if (!container || !naslov) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const jeRedniTermin = params.get("redni") === "true";

  if (!id) {
    container.innerHTML = `<p class="empty">Manjka ID aktivnosti.</p>`;
    return;
  }

  try {
    const odgovor = await fetch(`${API_URL}/aktivnosti/${id}`);
    const a = await odgovor.json();

    if (!odgovor.ok) {
      container.innerHTML = `<p class="empty">${a.napaka || "Napaka pri nalaganju aktivnosti."}</p>`;
      return;
    }

    const datum = new Date(a.datum).toLocaleDateString("sl-SI");
    const ura = new Date(a.datum).toLocaleTimeString("sl-SI", {
      hour: "2-digit",
      minute: "2-digit"
    });

    naslov.textContent = a.naziv;

    await pridobiVseckaneIds();
    await pridobiPrijavljeneTermine();

    const jeVseckan = vseckaniOrganizatorji.includes(a.organizator_id);
    const jePrijavljen = prijavljeniTermini.includes(a.id_termin);

    container.innerHTML = `
      <article class="activity-card">
        <div class="emoji">${vrniIkonoSporta(a.sport)}</div>

        <div class="activity-info">
          <h2>${a.naziv} (${a.sport})</h2>

          <p>
            ${datum} ob ${ura} ·
            <strong>Lokacija:</strong> ${a.prizorisce}, ${a.mesto} ·
            <strong>Organizator:</strong> ${a.organizatorime || ""} ${a.organizatorpriimek || ""}
          </p>

          <p class="activity-desc" style="font-style: italic; color: #555; margin-top: 5px;">
            ${a.opis || "Brez opisa"}
          </p>

          <div class="tags" style="margin-top: 10px;">
            <span>${a.zahtevnost || ""}</span>
            <span>${a.spol || ""}</span>
            <span>${a.starostnaskupina || ""}</span>
            <span>${a.stevilomest} prostih mest</span>
          </div>
        </div>

        <div class="activity-buttons">
          <button onclick="toggleJoinNaPodrobnostih(this, ${a.id_termin})" class="btn ${jePrijavljen ? 'danger' : (a.stevilomest > 0 ? 'primary' : 'disabled')} small" ${a.stevilomest === 0 && !jePrijavljen ? 'disabled' : ''}>
            ${jePrijavljen ? 'Odjavi se' : (a.stevilomest > 0 ? 'Prijavi se' : 'Polno')}
          </button>
        </div>

        <button onclick="toggleHeart(this, ${a.organizator_id})" class="heart-btn ${jeVseckan ? 'liked' : ''}">
          ${jeVseckan ? '♥' : '♡'}
        </button>
      </article>
    `;

    if (jeRedniTermin) {
      const sekcija = document.getElementById("redniKomentarjiSekcija");

      if (sekcija) {
        sekcija.classList.remove("hidden");
      }

      await naloziKomentarjeAktivnosti(id);
      pripraviObrazecZaKomentar(id);
    }

  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="empty">Napaka pri povezavi s strežnikom.</p>`;
  }
}

async function naloziKomentarjeAktivnosti(terminId) {
  const container = document.getElementById("aktivnostKomentarji");

  if (!container) return;

  try {
    const odgovor = await fetch(`${API_URL}/komentarji/termin/${terminId}`);
    const komentarji = await odgovor.json();

    if (!odgovor.ok) {
      container.innerHTML = `<p class="empty">${komentarji.napaka || "Napaka pri nalaganju komentarjev."}</p>`;
      return;
    }

    if (komentarji.length === 0) {
      container.innerHTML = `<p class="empty">Ta redni termin še nima komentarjev.</p>`;
      return;
    }

    container.innerHTML = komentarji.map(k => `
      <div class="card">
        <p><b>${k.ime} ${k.priimek}:</b> ${k.komentar}</p>
        ${k.slika ? `<img src="${k.slika}" style="width:120px;height:120px;object-fit:cover;border-radius:8px;margin-top:8px;">` : ""}
      </div>
    `).join("");

  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="empty">Napaka pri povezavi s strežnikom.</p>`;
  }
}

function pripraviObrazecZaKomentar(terminId) {
  const form = document.getElementById("podrobnostiKomentarForm");

  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const komentarInput = document.getElementById("podrobnostiKomentarInput");
    const slikaInput = document.getElementById("podrobnostiKomentarSlika");
    const sporocilo = document.getElementById("podrobnostiKomentarSporocilo");

    if (!token) {
      sporocilo.textContent = "Za dodajanje komentarja se moraš prijaviti.";
      return;
    }

    let slikaTekst = null;

    if (slikaInput && slikaInput.files && slikaInput.files[0]) {
      slikaTekst = await pretvoriSlikoVBase64(slikaInput.files[0]);
    }

    const odgovor = await fetch(`${API_URL}/komentarji`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        komentar: komentarInput.value,
        terminId: terminId,
        slika: slikaTekst
      })
    });

    if (!odgovor.ok) {
      sporocilo.textContent = "Napaka pri dodajanju komentarja.";
      return;
    }

    komentarInput.value = "";

    if (slikaInput) {
      slikaInput.value = "";
    }

    sporocilo.textContent = "Komentar uspešno dodan.";

    await naloziKomentarjeAktivnosti(terminId);
  });
}

function pretvoriSlikoVBase64(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();

    reader.onload = function () {
      resolve(reader.result);
    };

    reader.onerror = function (error) {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
}

naloziPodrobnostiAktivnosti();