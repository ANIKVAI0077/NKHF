// =========================
// Helper Functions
// =========================
const screens = document.querySelectorAll('.screen');
function showScreen(id) {
  screens.forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// =========================
// Home Buttons Navigation
// =========================
document.querySelectorAll('.cards .card').forEach(btn => {
  btn.addEventListener('click', () => showScreen(btn.dataset.target));
});

// =========================
// Local Storage Keys
// =========================
const DONATIONS_KEY = "donations";
const EXPENSES_KEY = "expenses";
const MEMBERS_KEY = "members";
const NOTICES_KEY = "notices";

// =========================
// Donations Form
// =========================
const donationForm = document.getElementById('donationForm');
donationForm.addEventListener('submit', function(e){
  e.preventDefault();
  const donation = {
    id: Date.now(),
    name: document.getElementById('donorName').value,
    phone: document.getElementById('donorPhone').value,
    amount: parseFloat(document.getElementById('donationAmount').value),
    date: document.getElementById('donationDate').value,
    method: document.getElementById('paymentMethod').value,
    note: document.getElementById('donationNote').value
  };
  const data = JSON.parse(localStorage.getItem(DONATIONS_KEY) || "[]");
  data.push(donation);
  localStorage.setItem(DONATIONS_KEY, JSON.stringify(data));

  document.getElementById('recentSaved').textContent = `সেভ হয়েছে: ${donation.name} - ${donation.amount} টাকা`;
  updateReceipt(donation);
  donationForm.reset();
  showScreen('receiptGenerator');
  updateAccounts();
  updateDonationTable();
  updateReports();
});

// =========================
// Update Receipt Preview
// =========================
function updateReceipt(donation){
  document.getElementById('rName').textContent = donation.name;
  document.getElementById('rAmount').textContent = donation.amount;
  document.getElementById('rDate').textContent = donation.date;
  document.getElementById('rNote').textContent = donation.note || "-";
}

// =========================
// PDF Download
// =========================
document.getElementById('downloadPdf').addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const el = document.querySelector('.receipt');
  doc.html(el, { x: 10, y: 10, callback: function(doc) { doc.save('receipt.pdf'); } });
});

// Print
document.getElementById('printReceipt').addEventListener('click', () => {
  const printWindow = window.open('', '_blank');
  printWindow.document.write('<html><head><title>রিসিট</title></head><body>');
  printWindow.document.write(document.querySelector('.receipt').outerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();
});

// =========================
// Donation List Table
// =========================
function updateDonationTable(filterName="", filterMonth=""){
  const data = JSON.parse(localStorage.getItem(DONATIONS_KEY) || "[]");
  let filtered = data;
  if(filterName) filtered = filtered.filter(d => d.name.includes(filterName));
  if(filterMonth) filtered = filtered.filter(d => d.date.startsWith(filterMonth));
  const tableDiv = document.getElementById('donationTable');
  if(filtered.length===0) { tableDiv.innerHTML="কোনো রেকর্ড নেই"; return; }
  let html = '<table><tr><th>নাম</th><th>মোবাইল</th><th>পরিমাণ</th><th>তারিখ</th><th>পেমেন্ট</th><th>নোট</th></tr>';
  filtered.forEach(d => {
    html += `<tr>
      <td>${d.name}</td>
      <td>${d.phone || "-"}</td>
      <td>${d.amount}</td>
      <td>${d.date}</td>
      <td>${d.method}</td>
      <td>${d.note || "-"}</td>
    </tr>`;
  });
  html += '</table>';
  tableDiv.innerHTML = html;
}
document.getElementById('applyFilter').addEventListener('click', () => {
  const name = document.getElementById('filterName').value;
  const month = document.getElementById('filterMonth').value;
  updateDonationTable(name, month);
});

// =========================
// Accounts
// =========================
let expenses = JSON.parse(localStorage.getItem(EXPENSES_KEY) || "[]");

function updateAccounts() {
  const donations = JSON.parse(localStorage.getItem(DONATIONS_KEY) || "[]");
  const totalIncome = donations.reduce((sum,d)=>sum+d.amount,0);
  const totalExpense = expenses.reduce((sum,e)=>sum+parseFloat(e.amount),0);
  document.getElementById('totalIncome').textContent = totalIncome;
  document.getElementById('totalExpense').textContent = totalExpense;
  document.getElementById('balance').textContent = totalIncome - totalExpense;

  const logDiv = document.getElementById('accountsLog');
  let html = '<table><tr><th>বিবরণ</th><th>পরিমাণ</th><th>তারিখ</th></tr>';
  expenses.forEach(e => {
    html += `<tr><td>${e.desc}</td><td>${e.amount}</td><td>${e.date}</td></tr>`;
  });
  html += '</table>';
  logDiv.innerHTML = html;
}

document.getElementById('addExpense').addEventListener('click', () => {
  const desc = document.getElementById('expenseDesc').value;
  const amount = document.getElementById('expenseAmount').value;
  const date = document.getElementById('expenseDate').value;
  if(!desc || !amount || !date) return alert("সব ফিল্ড পূরণ করুন");
  expenses.push({desc, amount, date});
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  document.getElementById('expenseDesc').value='';
  document.getElementById('expenseAmount').value='';
  document.getElementById('expenseDate').value='';
  updateAccounts();
});

// =========================
// Members
// =========================
function updateMembersTable(){
  const members = JSON.parse(localStorage.getItem(MEMBERS_KEY) || "[]");
  const div = document.getElementById('membersTable');
  if(members.length===0){ div.innerHTML="কোনো মেম্বার নেই"; return; }
  let html = '<table><tr><th>নাম</th><th>পদবি</th><th>মোবাইল</th></tr>';
  members.forEach(m => {
    html += `<tr><td>${m.name}</td><td>${m.role}</td><td>${m.phone || "-"}</td></tr>`;
  });
  html += '</table>';
  div.innerHTML = html;
}

document.getElementById('saveMember').addEventListener('click', () => {
  const name = document.getElementById('memberName').value;
  const role = document.getElementById('memberRole').value;
  const phone = document.getElementById('memberPhone').value;
  if(!name || !role) return alert("নাম এবং পদবি দিন");
  const members = JSON.parse(localStorage.getItem(MEMBERS_KEY) || "[]");
  members.push({name, role, phone});
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
  document.getElementById('memberName').value='';
  document.getElementById('memberRole').value='';
  document.getElementById('memberPhone').value='';
  updateMembersTable();
  updateReports();
});

// =========================
// Reports
// =========================
function updateReports(){
  const donations = JSON.parse(localStorage.getItem(DONATIONS_KEY) || "[]");
  const members = JSON.parse(localStorage.getItem(MEMBERS_KEY) || "[]");
  const thisMonth = new Date().toISOString().slice(0,7);
  const monthlyDonations = donations.filter(d => d.date.startsWith(thisMonth));
  document.getElementById('reportThisMonth').textContent = monthlyDonations.reduce((sum,d)=>sum+d.amount,0);
  document.getElementById('reportReceipts').textContent = donations.length;
  document.getElementById('reportMembers').textContent = members.length;
}

// =========================
// Backup
// =========================
document.getElementById('exportBackup').addEventListener('click', ()=>{
  const data = {
    donations: JSON.parse(localStorage.getItem(DONATIONS_KEY)||"[]"),
    expenses: JSON.parse(localStorage.getItem(EXPENSES_KEY)||"[]"),
    members: JSON.parse(localStorage.getItem(MEMBERS_KEY)||"[]"),
    notices: JSON.parse(localStorage.getItem(NOTICES_KEY)||"[]")
  };
  const blob = new Blob([JSON.stringify(data,null,2)], {type:"application/json"});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download="backup.json";
  a.click();
});

// Import Backup
document.getElementById('importBackup').addEventListener('click', ()=>{
  const file = document.getElementById('importFile').files[0];
  if(!file) return alert("ফাইল নির্বাচন করুন");
  const reader = new FileReader();
  reader.onload = e => {
    const data = JSON.parse(e.target.result);
    localStorage.setItem(DONATIONS_KEY, JSON.stringify(data.donations||[]));
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(data.expenses||[]));
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(data.members||[]));
    localStorage.setItem(NOTICES_KEY, JSON.stringify(data.notices||[]));
    alert("ডেটা ইমপোর্ট সম্পন্ন");
    updateDonationTable();
    updateAccounts();
    updateMembersTable();
    updateReports();
    updateNotices();
  };
  reader.readAsText(file);
});

// =========================
// Notices
// =========================
function updateNotices(){
  const notices = JSON.parse(localStorage.getItem(NOTICES_KEY)||"[]");
  const div = document.getElementById('notices');
  if(notices.length===0){ div.innerHTML="কোনো নোটিস নেই"; return; }
  let html = '<table><tr><th>শিরোনাম</th><th>বিবরণ</th></tr>';
  notices.forEach(n=>{
    html += `<tr><td>${n.title}</td><td>${n.body}</td></tr>`;
  });
  html += '</table>';
  div.innerHTML = html;
}

document.getElementById('saveNotice').addEventListener('click', ()=>{
  const title = document.getElementById('noticeTitle').value;
  const body = document.getElementById('noticeBody').value;
  if(!title || !body) return alert("শিরোনাম এবং বিবরণ দিন");
  const notices = JSON.parse(localStorage.getItem(NOTICES_KEY)||"[]");
  notices.push({title, body});
  localStorage.setItem(NOTICES_KEY, JSON.stringify(notices));
  document.getElementById('noticeTitle').value='';
  document.getElementById('noticeBody').value='';
  updateNotices();
});

// =========================
// Initialize
// =========================
document.getElementById('year').textContent = new Date().getFullYear();
updateDonationTable();
updateAccounts();
updateMembersTable();
updateReports();
updateNotices();
