import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const cfg = window.APP_CONFIG || {};
const supabase = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
const loginView = document.querySelector('#loginView');
const appView = document.querySelector('#appView');
const body = document.querySelector('#monitorBody');
const dlg = document.querySelector('#editDialog');
let rows = []; let currentId = null;

const ragLabel = {green:'🟢 Hijau', yellow:'🟡 Kuning', red:'🔴 Merah'};
const esc = s => String(s ?? '').replace(/[&<>'"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));

async function boot(){
  if(!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY || cfg.SUPABASE_URL.includes('REPLACE')){
    document.querySelector('#loginError').textContent='Konfigurasi Supabase belum diisi. Lihat README.md.'; return;
  }
  const {data:{session}} = await supabase.auth.getSession();
  toggle(!!session); if(session) await load();
}
function toggle(isIn){loginView.classList.toggle('hidden',isIn);appView.classList.toggle('hidden',!isIn)}

document.querySelector('#loginForm').addEventListener('submit', async e=>{
  e.preventDefault(); document.querySelector('#loginError').textContent='';
  const email=document.querySelector('#email').value.trim(), password=document.querySelector('#password').value;
  const {error}=await supabase.auth.signInWithPassword({email,password});
  if(error){document.querySelector('#loginError').textContent='Login gagal. Periksa email/password.';return}
  toggle(true); await load();
});
document.querySelector('#logoutBtn').onclick=async()=>{await supabase.auth.signOut();toggle(false)};
document.querySelector('#refreshBtn').onclick=load;
document.querySelector('#phaseFilter').onchange=render;
document.querySelector('#ragFilter').onchange=render;
document.querySelector('#searchInput').oninput=render;

async function load(){
  const {data,error}=await supabase.from('weekly_monitoring').select('*').order('week_no');
  if(error){alert('Gagal memuat data: '+error.message);return} rows=data||[]; render(); updateKpis();
}
function filtered(){
  const phase=document.querySelector('#phaseFilter').value, rag=document.querySelector('#ragFilter').value, q=document.querySelector('#searchInput').value.toLowerCase();
  return rows.filter(r => (phase==='all'||r.phase===phase) && (rag==='all'||r.rag===rag) && (!q||JSON.stringify(r).toLowerCase().includes(q)));
}
function render(){
  body.innerHTML=filtered().map(r=>`<tr>
    <td><span class="week">M${r.week_no}</span><br><small>${esc(r.phase)}</small></td>
    <td>${esc(r.period)}</td><td><b>${esc(r.focus)}</b><br><small>${esc(r.program||'')}</small></td>
    <td>${esc(r.pic)}</td><td>${esc(r.output)}</td><td>${esc(r.deadline)}</td>
    <td><span class="rag">${ragLabel[r.rag]||r.rag}</span></td>
    <td class="progress"><b>${r.progress}%</b><div class="progress-bar"><i style="width:${r.progress}%"></i></div></td>
    <td>${esc(r.blocker||'—')}</td><td>${esc(r.decision_needed||'—')}</td><td>${esc(r.follow_up||'—')}</td>
    <td><button class="edit-btn" data-id="${r.id}">Edit</button></td></tr>`).join('');
  body.querySelectorAll('.edit-btn').forEach(b=>b.onclick=()=>openEdit(Number(b.dataset.id)));
}
function updateKpis(){
  const avg = rows.length ? Math.round(rows.reduce((a,b)=>a+(b.progress||0),0)/rows.length):0;
  const attention=rows.filter(r=>r.rag==='yellow'||r.rag==='red').length;
  document.querySelector('#kpiWeeks').textContent=rows.length;
  document.querySelector('#kpiProgress').textContent=avg+'%';
  document.querySelector('#kpiAttention').textContent=attention;
}
function openEdit(id){
  const r=rows.find(x=>x.id===id); if(!r)return; currentId=id;
  document.querySelector('#editTitle').textContent=`Edit M${r.week_no} · ${r.focus}`;
  document.querySelector('#editRag').value=r.rag; document.querySelector('#editProgress').value=r.progress;
  document.querySelector('#editBlocker').value=r.blocker||''; document.querySelector('#editDecision').value=r.decision_needed||''; document.querySelector('#editFollowup').value=r.follow_up||'';
  document.querySelector('#saveError').textContent=''; dlg.showModal();
}
document.querySelector('#saveBtn').addEventListener('click', async e=>{
  e.preventDefault(); const payload={rag:document.querySelector('#editRag').value,progress:Number(document.querySelector('#editProgress').value),blocker:document.querySelector('#editBlocker').value.trim(),decision_needed:document.querySelector('#editDecision').value.trim(),follow_up:document.querySelector('#editFollowup').value.trim(),updated_at:new Date().toISOString()};
  const {error}=await supabase.from('weekly_monitoring').update(payload).eq('id',currentId);
  if(error){document.querySelector('#saveError').textContent=error.message;return} dlg.close(); await load();
});
boot();