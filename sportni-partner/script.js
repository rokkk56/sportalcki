const activities = [
  { sport:'Odbojka', city:'Ljubljana', date:'Jutri', time:'18:00', spots:3, level:'Srednja', gender:'Mešano', age:'18-30', emoji:'🏐', org:'Nika' },
  { sport:'Nogomet', city:'Maribor', date:'Petek', time:'20:00', spots:5, level:'Napredna', gender:'Moški', age:'18-30', emoji:'⚽', org:'Matej' },
  { sport:'Košarka', city:'Celje', date:'Sobota', time:'17:30', spots:2, level:'Srednja', gender:'Mešano', age:'15-18', emoji:'🏀', org:'Blaž' },
  { sport:'Tenis', city:'Kranj', date:'Nedelja', time:'10:00', spots:1, level:'Začetnik', gender:'Mešano', age:'30+', emoji:'🎾', org:'Sara' },
  { sport:'Tek', city:'Velenje', date:'Danes', time:'19:00', spots:0, level:'Začetnik', gender:'Mešano', age:'18-30', emoji:'🏃', org:'Jan' }
];

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

  list.innerHTML = filtered.map((a, index) => `
    <article class="activity-card">
      <div class="emoji">${a.emoji}</div>
      <div class="activity-info">
        <h2>${a.sport} - ${a.city}</h2>
        <p>${a.date} ob ${a.time} · organizator: ${a.org}</p>
        <div class="tags"><span>${a.level}</span><span>${a.gender}</span><span>${a.age}</span><span>${a.spots} prostih mest</span></div>
      </div>
      <button onclick="toggleJoin(this)" class="btn ${a.spots > 0 ? 'primary' : 'disabled'} small" ${a.spots === 0 ? 'disabled' : ''}>${a.spots > 0 ? 'Prijavi se' : 'Polno'}</button>
    </article>`).join('') || '<p class="empty">Ni najdenih aktivnosti za izbrane filtre.</p>';
}

function toggleJoin(button) {
  if (button.textContent === 'Prijavi se') {
    button.textContent = 'Odjavi se';
    button.classList.remove('primary');
    button.classList.add('danger');
  } else {
    button.textContent = 'Prijavi se';
    button.classList.remove('danger');
    button.classList.add('primary');
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
renderActivities();
