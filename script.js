const DB_KEY = 'nkf_data_v2';
let state = { donations: [], members: [], notices: [] };
const $ = id => document.getElementById(id);
const nowYMD = () => new Date().toISOString().slice(0,10);

function loadState() {
  const raw = localStorage.getItem(DB_KEY);
  if(raw) state = JSON.parse(raw);
  else saveState();
}
function saveState() { localStorage.setItem(DB_KEY, JSON.stringify(state)); }

function showScreen(id){
  document.querySelectorAll('.screen').forEach(s => s.id === id ? s.classList.remove('hidden') : s.classList.add('hidden'));
  window.scrollTo(0,0);
  refreshAll();
}

/* Home navigation */
document.querySelectorAll('[data-target]').forEach(btn => btn.addEventListener('click', ()=> showScreen(btn.dataset.target)));
document.querySelectorAll('.backBtn').forEach(btn => btn.addEventListener('click', ()=> showScreen('home')));

/* Donation Entry */
const donationForm = $('donationForm');
$('donationDate').value = nowYMD();
donationForm.addEventListener('submit', e => {
  e.preventDefault();
  const d = {
    id: 'd' + Date.now(),
    name: $('donorName').value.trim() || 'অজানা',
    phone: $('donorPhone').value.trim(),
    amount: Number($('donationAmount').value) || 0,
    date: $('donationDate').value || nowYMD(),
    method: $('paymentMethod').value || 'Cash',
    note: $('donationNote').value.trim() || '-'
  };
  state.donations.push(d);
  saveState();
  $('recentSaved').innerText = `সেভ হয়েছে: ${d.name} — ${d.amount} টকা`;
  setReceipt(d);
  donationForm.reset();
  $('donationDate').value = nowYMD();
  renderDonationTable();
});

$('donationCancel').addEventListener('click', () => { donationForm.reset(); $('donationDate').value = nowYMD(); });

/* Receipt preview */
function setReceipt(d){
  $('rName').innerText = d.name;
  $('rAmount').innerText = d.amount;
  $('rDate').innerText = d.date;
  $('rNote').innerText = d.note;
}

/* Donation Table */
function renderDonationTable(filter={}) {
  const wrap = $('donationTable');
  let items = state.donations.slice().reverse();
  if(filter.name) items = items.filter(x => x.name.includes(filter.name));
  if(filter.month) items = items.filter(x => x.date.startsWith(filter.month));
  if(items.length===0){ wrap.innerHTML='<div class="muted">কোনো অনুদান নেই</div>'; return; }
  let html = '<table><thead><tr><th>দাতার নাম</th><th>পরিমাণ</th><th>তারিখ</th><th>পেমেন্ট</th><th>রিসিট</th></tr></thead><tbody>';
  items.forEach(it=>{
    html+= `<tr>
      <td>${it.name}${it.phone ? `<div class="small muted">${it.phone}</div>`: ''}</td>
      <td>${it.amount}</td><td>${it.date}</td><td>${it.method}</td>
      <td><button class="btn small" onclick='viewReceipt("${it.id}")'>View</button></td>
    </tr>`;
  });
  html+='</tbody></table>'; wrap.innerHTML = html;
}

window.viewReceipt = function(id){ const d = state.donations.find(x=>x.id===id); if(d){ setReceipt(d); showScreen('receiptGenerator'); } }

/* Filter button */
$('applyFilter').addEventListener('click', ()=> {
  renderDonationTable({ name:$('filterName').value.trim(), month:$('filterMonth').value });
});

/* Init */
function refreshAll(){
  loadState();
  renderDonationTable();
  $('year').innerText = new Date().getFullYear();
}
loadState(); refreshAll(); showScreen('home');
