/* app.js */
const DB_KEY='nkf_data_v1';
const DEFAULT_ADMIN_PASS='NKHF';

let state={donations:[],expenses:[],members:[],notices:[]};
const $=id=>document.getElementById(id);
const nowYMD=()=>new Date().toISOString().slice(0,10);

function loadState(){
  const raw=localStorage.getItem(DB_KEY);
  if(raw){try{state=JSON.parse(raw);}catch(e){console.error(e);state={donations:[],expenses:[],members:[],notices:[]};saveState();}}
  else saveState();
}
function saveState(){localStorage.setItem(DB_KEY,JSON.stringify(state));}
function formatCurrency(n){if(n===undefined||n===null)return'0';try{return Number(n).toLocaleString('bn-BD')}catch(e){return String(n);}}

const screens=Array.from(document.querySelectorAll('.screen'));
function showScreen(id){screens.forEach(s=>s.id===id?s.classList.remove('hidden'):s.classList.add('hidden'));window.scrollTo(0,0);refreshAll();}
document.querySelectorAll('[data-target]').forEach(btn=>{btn.addEventListener('click',()=>showScreen(btn.dataset.target));});

/* Admin modal */
$('adminBtn').addEventListener('click',()=>$('adminModal').classList.remove('hidden'));
$('adminClose').addEventListener('click',()=>$('adminModal').classList.add('hidden'));
$('adminLoginBtn').addEventListener('click',()=>{
  const pass=$('adminPassword').value;
  if(pass===DEFAULT_ADMIN_PASS){$('adminModal').classList.add('hidden');alert('অ্যাডমিন সফলভাবে লগইন করলেন (ডেমো)।');$('adminPassword').value='';}
  else alert('পাসওয়ার্ড ভুল।');
});

/* Donation entry */
const donationForm=$('donationForm');
$('donationDate').value=nowYMD();
donationForm.addEventListener('submit',e=>{
  e.preventDefault();
  const d={id:'d'+Date.now(),name:$('donorName').value.trim()||'অজানা',phone:$('donorPhone').value.trim(),amount:Number($('donationAmount').value)||0,date:$('donationDate').value||nowYMD(),method:$('paymentMethod').value||'Cash',note:$('donationNote').value.trim()||'-'};
  state.donations.push(d);
  saveState();
  $('recentSaved').innerText=`সেভ হয়েছে: ${d.name} — ${formatCurrency(d.amount)} টকা`;
  setReceipt(d);
  donationForm.reset();
  $('donationDate').value=nowYMD();
  refreshAll();
});
$('donationCancel').addEventListener('click',()=>{donationForm.reset();$('donationDate').value=nowYMD();});

/* Render donation list */
function renderDonationTable(filter={}){const wrap=$('donationTable');let items=state.donations.slice().reverse();if(filter.name)items=items.filter(i=>i.name.includes(filter.name));if(filter.month)items=items.filter(i=>i.date.startsWith(filter.month));if(items.length===0){wrap.innerHTML='<div class="muted">কোনো অনুদান নেই</div>';return;}let html=`<table class="table"><thead><tr><th>দাতার নাম</th><th>পরিমাণ</th><th>তারিখ</th><th>পেমেন্ট</th><th>রিসিট</th></tr></thead><tbody>`;items.forEach(it=>{html+=`<tr><td>${escapeHtml(it.name)}${it.phone?'<br><small>'+escapeHtml(it.phone)+'</small>':''}</td><td>${formatCurrency(it.amount)}</td><td>${it.date}</td><td>${it.method}</td><td><button onclick="setReceipt(${JSON.stringify(it)})">দেখাও</button></td></tr>`});html+='</tbody></table>';wrap.innerHTML=html;}
function escapeHtml(text){return text.replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[m]);}

/* Filter donation list */
$('applyFilter').addEventListener('click',()=>{renderDonationTable({name:$('filterName').value.trim(),month:$('filterMonth').value})});

/* Receipt */
function setReceipt(d){$('rName').innerText=d.name;$('rAmount').innerText=formatCurrency(d.amount);$('rDate').innerText=d.date;$('rNote').innerText=d.note||'-';showScreen('receiptGenerator');}
$('downloadPdf').addEventListener('click',()=>{const {jsPDF}=window.jspdf;let doc=new jsPDF();doc.text($('receiptPreview').innerText,10,10);doc.save('receipt.pdf');});
$('printReceipt').addEventListener('click',()=>{const w=window.open('');w.document.write('<pre>'+$('receiptPreview').innerText+'</pre>');w.print();});

/* Accounts */
function refreshAccounts(){const totalInc=state.donations.reduce((a,b)=>a+b.amount,0);const totalExp=state.expenses.reduce((a,b)=>a+b.amount,0);$('totalIncome').innerText=formatCurrency(totalInc);$('totalExpense').innerText=formatCurrency(totalExp);$('balance').innerText=formatCurrency(totalInc-totalExp);let html='';state.expenses.slice().reverse().forEach(x=>{html+=`<div>${x.date}: ${x.desc} — ${formatCurrency(x.amount)}</div>`});$('accountsLog').innerHTML=html;}
$('addExpense').addEventListener('click',()=>{const desc=$('expenseDesc').value.trim(),amount=Number($('expenseAmount').value)||0,date=$('expenseDate').value||nowYMD();if(!desc||!amount)return;state.expenses.push({desc,amount,date});saveState();refreshAccounts();$('expenseDesc').value='';$('expenseAmount').value='';$('expenseDate').value=nowYMD();});

/* Members */
function renderMembers(){let html='';state.members.slice().reverse().forEach(m=>{html+=`<div>${m.name} (${m.role})<br><small>${m.phone}</small></div>`});$('membersTable').innerHTML=html;}
$('saveMember').addEventListener('click',()=>{const name=$('memberName').value.trim(),role=$('memberRole').value.trim(),phone=$('memberPhone').value.trim();if(!name)return;state.members.push({name,role,phone});saveState();renderMembers();$('memberName').value='';$('memberRole').value='';$('memberPhone').value='';});

/* Notices */
function renderNotices(){let html='';state.notices.slice().reverse().forEach(n=>{html+=`<div><strong>${n.title}</strong><br>${n.body}</div>`});$('notices').innerHTML=html;}
$('saveNotice').addEventListener('click',()=>{const t=$('noticeTitle').value.trim(),b=$('noticeBody').value.trim();if(!t||!b)return;state.notices.push({title:t,body:b});saveState();renderNotices();$('noticeTitle').value='';$('noticeBody').value='';});

/* Backup */
$('exportBackup').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(state)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='backup.json';a.click();});
$('importBackup').addEventListener('click',()=>{const f=$('importFile').files[0];if(!f)return;const r=new FileReader();r.onload=e=>{try{state=JSON.parse(e.target.result);saveState();refreshAll();alert('ব্যাকআপ ইম্পোর্ট সম্পন্ন');}catch(err){alert('ফাইল ভঙ্গুর')}};r.readAsText(f);});

/* Refresh everything */
function refreshAll(){renderDonationTable();refreshAccounts();renderMembers();renderNotices();$('year').innerText=new Date().getFullYear();}
loadState();refreshAll();
