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
  const receipt = document.querySelector('.receipt');
  doc.html(receipt, {
    callback: function (doc) {
      doc.save(`receipt_${Date.now()}.pdf`);
    },
    x: 10,
    y: 10
  });
});

document.getElementById('printReceipt').addEventListener('click', () => {
  const w = window.open();
  w.document.write(document.querySelector('.receipt').outerHTML);
  w.print();
  w.close();
});

// =========================
// Donation Table
// =========================
function updateDonationTable(){
  const data = JSON.parse(localStorage.getItem(DONATIONS_KEY) || "[]");
  let html = `<table><tr><th>নাম</th><th>ফোন</th><th>পরিমাণ</th><th>তারিখ</th><th>পেমেন্ট</th><th>নোট</th></tr>`;
  data.forEach(d => {
    html += `<tr>
      <td>${d.name}</td>
      <td>${d.phone || "-"}</td>
      <td>${d.amount}</td>
      <td>${d.date}</td>
      <td>${d.method}</td>
      <td>${d.note || "-"}</td>
    </tr>`;
  });
  html += "</table>";
  document.getElementById('donationTable').innerHTML = html;
}
document.getElementById('applyFilter').addEventListener('click', ()=>{
  const name = document.getElementById('filterName').value.toLowerCase();
  const month = document.getElementById('filterMonth').value;
  let data = JSON.parse(localStorage.getItem(DONATIONS_KEY) || "[]");
  if(name) data = data.filter(d => d.name.toLowerCase().includes(name));
  if(month) data = data.filter(d => d.date.startsWith(month));
  let html = `<table><tr><th>নাম</th><th>ফোন</th><th>পরিমাণ</th><th>তারিখ</th><th>পেমেন্ট</th><th>নোট</th></tr>`;
  data.forEach(d => {
    html += `<tr>
      <td>${d.name}</td>
      <td>${d.phone || "-"}</td>
      <td>${d.amount}</td>
      <td>${d.date}</td>
      <td>${d.method}</td>
      <td>${d.note || "-"}</td>
    </tr>`;
  });
  html += "</table>";
  document.getElementById('donationTable').innerHTML = html;
});

// =========================
// Members
// =========================
function updateMembersTable(){
  const data = JSON.parse(localStorage.getItem(MEMBERS_KEY) || "[]");
  let html = `<table><tr><th>নাম</th><th>পদবি</th><th>মোবাইল</th></tr>`;
  data.forEach(m => {
    html += `<tr><td>${m.name}</td><td>${m.role}</td><td>${m.phone || "-"}</td></tr>`;
  });
  html += "</table>";
  document.getElementById('membersTable').innerHTML = html;
}

document.getElementById('saveMember').addEventListener('click', ()=>{
  const member = {
    id: Date.now(),
    name: document.getElementById('memberName').value,
    role: document.getElementById('memberRole').value,
    phone: document.getElementById('memberPhone').value
  };
  const data = JSON.parse(localStorage.getItem(MEMBERS_KEY) || "[]");
  data.push(member);
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(data));
  updateMembersTable();
  document.getElementById('memberName').value="";
  document.getElementById('memberRole').value="";
  document.getElementById('memberPhone').value="";
});

// =========================
// Accounts
// =========================
function updateAccounts(){
  const donations = JSON.parse(localStorage.getItem(DONATIONS_KEY)||"[]");
  const expenses = JSON.parse(localStorage.getItem(EXPENSES_KEY)||"[]");
  const income = donations.reduce((sum,d)=>sum+d.amount,0);
  const expenseSum = expenses.reduce((sum,e)=>sum+e.amount,0);
  document.getElementById('totalIncome').textContent = income;
  document.getElementById('totalExpense').textContent = expenseSum;
  document.getElementById('balance').textContent = income - expenseSum;

  let html=`<table><tr><th>বিবরণ</th><th>পরিমাণ</th><th>তারিখ</th></tr>`;
  expenses.forEach(e=>{
    html+=`<tr><td>${e.desc}</td><td>${e.amount}</td><td>${e.date}</td></tr>`;
  });
  html+="</table>";
  document.getElementById('accountsLog').innerHTML = html;
}

document.getElementById('addExpense').addEventListener('click', ()=>{
  const expense = {
    id: Date.now(),
    desc: document.getElementById('expenseDesc').value,
    amount: parseFloat(document.getElementById('expenseAmount').value),
    date: document.getElementById('expenseDate').value
  };
  const data = JSON.parse(localStorage.getItem(EXPENSES_KEY)||"[]");
  data.push(expense);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(data));
  updateAccounts();
});

// =========================
// Notices
// =========================
function updateNotices(){
  const data = JSON.parse(localStorage.getItem(NOTICES_KEY)||"[]");
  let html="";
  data.forEach(n=>{
    html+=`<div class="card small"><strong>${n.title}</strong><p>${n.body}</p></div>`;
  });
  document.getElementById('notices').innerHTML = html;
}

document.getElementById('saveNotice').addEventListener('click', ()=>{
  const notice = {
    id: Date.now(),
    title: document.getElementById('noticeTitle').value,
    body: document.getElementById('noticeBody').value
  };
  const data = JSON.parse(localStorage.getItem(NOTICES_KEY)||"[]");
  data.push(notice);
  localStorage.setItem(NOTICES_KEY, JSON.stringify(data));
  updateNotices();
  document.getElementById('noticeTitle').value="";
  document.getElementById('noticeBody').value="";
});

// =========================
// Backup Export / Import
// =========================
document.getElementById('exportBackup').addEventListener('click', ()=>{
  const backup = {
    donations: JSON.parse(localStorage.getItem(DONATIONS_KEY)||"[]"),
    expenses: JSON.parse(localStorage.getItem(EXPENSES_KEY)||"[]"),
    members: JSON.parse(localStorage.getItem(MEMBERS_KEY)||"[]"),
    notices: JSON.parse(localStorage.getItem(NOTICES_KEY)||"[]")
  };
  const blob = new Blob([JSON.stringify(backup,null,2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download="backup.json";
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('importBackup').addEventListener('click', ()=>{
  const file = document.getElementById('importFile').files[0];
  if(!file) return alert("ফাইল নির্বাচন করুন");
  const reader = new FileReader();
  reader.onload = function(e){
    const backup = JSON.parse(e.target.result);
    localStorage.setItem(DONATIONS_KEY, JSON.stringify(backup.donations||[]));
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(backup.expenses||[]));
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(backup.members||[]));
    localStorage.setItem(NOTICES_KEY, JSON.stringify(backup.notices||[]));
    updateDonationTable();
    updateAccounts();
    updateMembersTable();
    updateNotices();
    alert("ব্যাকআপ ইমপোর্ট সম্পন্ন");
  }
  reader.readAsText(file);
});

// =========================
// Reports
// =========================
function updateReports(){
  const donations = JSON.parse(localStorage.getItem(DONATIONS_KEY)||"[]");
  const members = JSON.parse(localStorage.getItem(MEMBERS_KEY)||"[]");
  const thisMonth = new Date().toISOString().slice(0,7);
  const monthTotal = donations.filter(d=>d.date.startsWith(thisMonth)).reduce((sum,d)=>sum+d.amount,0);
  document.getElementById('reportThisMonth').textContent = monthTotal;
  document.getElementById('reportReceipts').textContent = donations.length;
  document.getElementById('reportMembers').textContent = members.length;
}

// =========================
// Init
// =========================
document.getElementById('year').textContent = new Date().getFullYear();
updateDonationTable();
updateAccounts();
updateMembersTable();
updateNotices();
updateReports();
