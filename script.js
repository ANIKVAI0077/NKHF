const DB_KEY = 'nkf_data_v3';
let state = { donations: [] };
const $ = id => document.getElementById(id);

/* Load and Save State */
function loadState() {
  const raw = localStorage.getItem(DB_KEY);
  if(raw) state = JSON.parse(raw);
  else saveState();
}
function saveState() { localStorage.setItem(DB_KEY, JSON.stringify(state)); }

/* Show Screen */
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s => s.id===id ? s.classList.remove('hidden') : s.classList.add('hidden'));
  window.scrollTo(0,0);
  $('year').innerText = new Date().getFullYear();
  renderDonationTable();
}

/* Navigation */
document.querySelectorAll('[data-target]').forEach(btn => btn.addEventListener('click', ()=> showScreen(btn.dataset.target)));
document.querySelectorAll('.backBtn').forEach(btn => btn.addEventListener('click', ()=> showScreen('home')));

/* Donation Form */
const donationForm = $('donationForm');
$('donationDate').value = new Date().toISOString().slice(0,10);

donationForm.addEventListener('submit', e => {
  e.preventDefault();
  const d = {
    id: 'd'+Date.now(),
    name: $('donorName').value.trim() || 'অজানা',
    phone: $('donorPhone').value.trim(),
    amount: Number($('donationAmount').value) || 0,
    date: $('donationDate').value,
    method: $('paymentMethod').value,
    note: $('donationNote').value.trim() || '-'
  };
  state.donations.push(d);
  saveState();
  $('recentSaved').innerText = `সেভ হয়েছে: ${d.name} — ${d.amount} টকা`;
  setReceipt(d);
  donationForm.reset();
  $('donationDate').value = new Date().toISOString().slice(0,10);
  showScreen('receiptGenerator');
});

/* Cancel Button */
$('donationCancel').addEventListener('click', ()=> { donationForm.reset(); $('donationDate').value = new Date().toISOString().slice(0,10); });

/* Receipt Preview */
function setReceipt(d){
  $('rName').innerText = d.name;
  $('rAmount').innerText = d.amount;
  $('rDate').innerText = d.date;
  $('rNote').innerText = d.note;
}

/* Render Donation Table */
function renderDonationTable(filter={}){
  const wrap = $('donationTable');
  let items = state.donations.slice().reverse();
  if(filter.name) items = items.filter(x => x.name.includes(filter.name));
  if(filter.month) items = items.filter(x => x.date.startsWith(filter.month));
  if(items.length===0){ wrap.innerHTML='<div class="muted">কোনো অনুদান নেই</div>'; return; }

  let html = '<table><thead><tr><th>দাতার নাম</th><th>পরিমাণ</th><th>তারিখ</th><th>পেমেন্ট</th><th>রিসিট</th></tr></thead><tbody>';
  items.forEach(it=>{
    html += `<tr>
      <td>${it.name}${it.phone?`<div class="small muted">${it.phone}</div>`:''}</td>
      <td>${it.amount}</td>
      <td>${it.date}</td>
      <td>${it.method}</td>
      <td><button class="btn small" onclick='viewReceipt("${it.id}")'>View</button></td>
    </tr>`;
  });
  html+='</tbody></table>';
  wrap.innerHTML = html;
}

/* View Receipt from Table */
window.viewReceipt = function(id){
  const d = state.donations.find(x=>x.id===id);
  if(d){ setReceipt(d); showScreen('receiptGenerator'); }
}

/* Filter Donations */
$('applyFilter').addEventListener('click', ()=>{
  const filter = { name: $('filterName').value.trim(), month: $('filterMonth').value };
  renderDonationTable(filter);
});

/* PDF and Print */
$('downloadPdf').addEventListener('click', ()=>{
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text($('receiptPreview').innerText, 10, 10);
  doc.save('receipt.pdf');
});
$('printReceipt').addEventListener('click', ()=>{ window.print(); });

/* Initialize */
loadState();
showScreen('home');
