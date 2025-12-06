const DB_KEY='nkf_data_v2';
let state={donations:[],members:[],notices:[]};
const $=id=>document.getElementById(id);
const nowYMD=()=>new Date().toISOString().slice(0,10);

function loadState(){const raw=localStorage.getItem(DB_KEY);if(raw){try{state=JSON.parse(raw);}catch(e){state={donations:[],members:[],notices:[]};saveState();}}else saveState();}
function saveState(){localStorage.setItem(DB_KEY,JSON.stringify(state));}

function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.id===id?s.classList.remove('hidden'):s.classList.add('hidden'));window.scrollTo(0,0);refreshAll();}

document.querySelectorAll('[data-target]').forEach(btn=>btn.addEventListener('click',()=>showScreen(btn.dataset.target)));

// Donation Entry
$('donationDate').value=nowYMD();
$('donationForm').addEventListener('submit',e=>{
  e.preventDefault();
  const d={id:'d'+Date.now(),name:$('donorName').value.trim()||'অজানা',phone:$('donorPhone').value.trim(),amount:Number($('donationAmount').value)||0,date:$('donationDate').value||nowYMD(),method:$('paymentMethod').value,note:$('donationNote').value.trim()||'-'};
  state.donations.push(d);saveState();
  $('recentSaved').innerText=`সেভ হয়েছে: ${d.name} — ${d.amount} টাকা`;setReceipt(d);
  $('donationForm').reset();$('donationDate').value=nowYMD();refreshAll();
});

// Donation Table
function renderDonationTable(){const wrap=$('donationTable');if(state.donations.length===0){wrap.innerHTML='<div class="muted">কোনো অনুদান নেই</div>';return;}let html='<table class="table"><thead><tr><th>দাতার নাম</th><th>পরিমাণ</th><th>তারিখ</th><th>পেমেন্ট</th><th>রিসিট</th></tr></thead><tbody>';state.donations.slice().reverse().forEach(d=>{html+=`<tr><td>${d.name}${d.phone?'<div class="small muted">'+d.phone+'</div>':''}</td><td>${d.amount}</td><td>${d.date}</td><td>${d.method}</td><td><button class="btn small" onclick='viewReceipt("${d.id}")'>View Receipt</button></td></tr>`;});html+='</tbody></table>';wrap.innerHTML=html;}
window.viewReceipt=id=>{const d=state.donations.find(x=>x.id===id);if(!d)return alert('ডেটা পাওয়া যায়নি।');setReceipt(d);showScreen('receiptGenerator');};
function setReceipt(d){$('rName').innerText=d.name;$('rAmount').innerText=d.amount;$('rDate').innerText=d.date;$('rNote').innerText=d.note;}
$('downloadPdf').addEventListener('click',()=>{try{const {jsPDF}=window.jspdf;const doc=new jsPDF({unit:'pt',format:'a4'});let y=60;doc.setFontSize(16);doc.text('নোয়াপাড়া–কড়রা মানবিক ফাউন্ডেশন',40,y);y+=30;doc.setFontSize(14);doc.text('অনুদান গ্রহণ রিসিট',40,y);y+=30;doc.setFontSize(12);doc.text(`দাতার নাম: ${$('rName').innerText}`,40,y);y+=20;doc.text(`অনুদানের পরিমাণ: ${$('rAmount').innerText} টাকা`,40,y);y+=20;doc.text(`তারিখ: ${$('rDate').innerText}`,40,y);y+=20;doc.text(`উদ্দেশ্য: ${$('rNote').innerText}`,40,y);y+=40;doc.text('গ্রহণকারীর স্বাক্ষর: ____________________',40,y);y+=30;doc.text('স্থাপিত: দুই হাজার পঁচিশ',40,y);doc.save(`receipt_${Date.now()}.pdf`);}catch(err){alert('PDF তৈরি করতে সমস্যা হয়েছে।');}});
$('printReceipt').addEventListener('click',()=>window.print());

// Members
$('saveMember').addEventListener('click',()=>{const m={id:'m'+Date.now(),name:$('memberName').value.trim()||'-',role:$('memberRole').value.trim()||'-',phone:$('memberPhone').value.trim()};state.members.push(m);saveState();$('memberName').value='';$('memberRole').value='';$('memberPhone').value='';refreshAll();});
function renderMembers(){const wrap=$('membersTable');if(state.members.length===0){wrap.innerHTML='<div class="muted">কোনও সদস্য নেই</div>';return;}let html='<table class="table"><thead><tr><th>নাম</th><th>পদবি</th><th>মোবাইল</th></tr></thead><tbody>';state.members.forEach(m=>html+=`<tr><td>${m.name}</td><td>${m.role}</td><td>${m.phone}</td></tr>`);html+='</tbody></table>';wrap.innerHTML=html;}

// Notices
$('saveNotice').addEventListener('click',()=>{const n={id:'n'+Date.now(),title:$('noticeTitle').value.trim()||'বিজ্ঞপ্তি',body:$('noticeBody').value.trim()||'',date:nowYMD()};state.notices.push(n);saveState();$('noticeTitle').value='';$('noticeBody').value='';refreshAll();});
function renderNotices(){const wrap=$('notices');if(state.notices.length===0){wrap.innerHTML='<div class="muted">কোনো নোটিস নেই</div>';return;}let html='';state.notices.slice().reverse().forEach(n=>{html+=`<div class="card"><strong>${n.title}</strong><div class="muted small">${n.date}</div><p>${n.body}</p></div>`});wrap.innerHTML=html;}

// Reports
function refreshAll(){loadState();renderDonationTable();renderMembers();renderNotices();renderReports();$('year').innerText=new Date().getFullYear();}
function renderReports(){$('reportThisMonth').innerText=state.donations.filter(d=>d.date.startsWith(nowYMD().slice(0,7))).reduce((s,x)=>s+Number(x.amount),0);$('reportReceipts').innerText=state.donations.length;$('reportMembers').innerText=state.members.length;}

// Backup
$('exportBackup').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='nkf_backup.json';a.click();URL.revokeObjectURL(url);});
$('importBackup').addEventListener('click',()=>{const file=$('importFile').files[0];if(!file)return alert('ফাইল নির্বাচন করুন।');const reader=new FileReader();reader.onload=e=>{try{state=JSON.parse(e.target.result);saveState();refreshAll();alert('ইম্পোর্ট সফল হয়েছে।');}catch(err){alert('ফাইলটি সঠিক নয়।')}};reader.readAsText(file);});

// Donation Cancel
$('donationCancel').addEventListener('click',()=>{$('donationForm').reset();$('donationDate').value=nowYMD();});
loadState();refreshAll();
