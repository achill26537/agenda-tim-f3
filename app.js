(function(){
const $=id=>document.getElementById(id);
const monthNames=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const dayNames=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const today=new Date(); let selectedDate=fmtDate(today), shownYear=today.getFullYear(), shownMonth=today.getMonth(), agendas=[], toastTimer;
function fmtDate(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function parseDate(s){const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)}
function dateLong(s){const d=parseDate(s);return dayNames[d.getDay()]+', '+d.getDate()+' '+monthNames[d.getMonth()]+' '+d.getFullYear()}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function safeGet(key, fallback=''){try{return localStorage.getItem(key) ?? fallback}catch(e){return fallback}}
function safeSet(key,value){try{localStorage.setItem(key,value);return true}catch(e){return false}}
function load(){try{agendas=JSON.parse(safeGet('agendaSekdaData','[]')||'[]');if(!Array.isArray(agendas))agendas=[]}catch(e){agendas=[]}}
function save(){if(!safeSet('agendaSekdaData',JSON.stringify(agendas))){showToast('Data belum dapat disimpan oleh browser ini. Coba buka file di Safari/Chrome biasa.')}}
function showToast(msg){$('toast').textContent=msg;$('toast').classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.add('hidden'),2600)}
function sorted(items){return items.slice().sort((a,b)=>a.time.localeCompare(b.time))}
function renderCalendar(){
 $('monthLabel').textContent=monthNames[shownMonth]+' '+shownYear;
 const first=new Date(shownYear,shownMonth,1), start=new Date(shownYear,shownMonth,1-first.getDay());
 let rows='';
 for(let w=0;w<6;w++){let cells='';for(let j=0;j<7;j++){let d=new Date(start);d.setDate(start.getDate()+w*7+j);let s=fmtDate(d),inMonth=d.getMonth()===shownMonth,has=agendas.some(a=>a.date===s),cl=['day',!inMonth?'muted':'',s===selectedDate?'selected':'',s===fmtDate(today)?'today':'',has?'has-event':''].filter(Boolean).join(' ');cells+=`<td><button class="${cl}" data-date="${s}" aria-label="${esc(dateLong(s))}">${d.getDate()}</button></td>`}rows+='<tr>'+cells+'</tr>'}
 $('calendarBody').innerHTML=rows;
 $('calendarBody').querySelectorAll('button[data-date]').forEach(b=>b.addEventListener('click',()=>{selectedDate=b.dataset.date;const d=parseDate(selectedDate);shownYear=d.getFullYear();shownMonth=d.getMonth();renderAll()}));
}
function renderAgendas(){
 $('selectedDateHeading').textContent=dateLong(selectedDate);
 const list=sorted(agendas.filter(a=>a.date===selectedDate));$('agendaCount').textContent=list.length+' kegiatan';
 if(!list.length){$('agendaList').innerHTML='<div class="empty"><strong>Belum ada agenda</strong>Belum ada kegiatan pada tanggal ini.<br>Tekan “Tambah agenda” untuk mulai menyusun jadwal.</div>';return}
 $('agendaList').innerHTML=list.map((a,i)=>`<article class="agenda-item"><div class="agenda-top"><span class="time-pill">${esc(a.time)}</span><div class="agenda-actions"><button class="icon-btn edit-btn" data-id="${esc(a.id)}">Edit</button><button class="icon-btn delete-btn" data-id="${esc(a.id)}" title="Hapus agenda">Hapus</button></div></div><div class="agenda-title">${esc(a.name)}</div>${a.place?`<div class="agenda-meta">⌖ ${esc(a.place)}</div>`:''}${a.guests?`<div class="agenda-meta" style="margin-top:5px">Undangan: ${esc(a.guests).replace(/\n/g,' · ')}</div>`:''}${a.dress?`<div class="agenda-meta" style="margin-top:5px">Catatan: ${esc(a.dress)}</div>`:''}</article>`).join('');
 $('agendaList').querySelectorAll('.edit-btn').forEach(b=>b.addEventListener('click',()=>openForm(b.dataset.id)));
 $('agendaList').querySelectorAll('.delete-btn').forEach(b=>b.addEventListener('click',()=>deleteAgenda(b.dataset.id)));
}
function renderAll(){renderCalendar();renderAgendas()}
function openForm(id){
 $('formPanel').classList.remove('hidden');
 $('formTitle').textContent=id?'Edit agenda':'Tambah agenda';
 $('editId').value=id||'';
 const a=id?agendas.find(x=>x.id===id):null;
 $('eventDate').value=a?a.date:selectedDate;$('eventTime').value=a?a.time:'';
 $('eventName').value=a?a.name:'';$('eventPlace').value=a?a.place:'';$('eventGuests').value=a?a.guests:'';$('eventDress').value=a?a.dress:'';
 $('formPanel').scrollIntoView({behavior:'smooth',block:'start'});
}
function closeForm(){$('formPanel').classList.add('hidden');$('agendaForm').reset();$('editId').value=''}
function deleteAgenda(id){const a=agendas.find(x=>x.id===id);if(!a)return;if(!confirm('Hapus agenda "'+a.name+'"?'))return;agendas=agendas.filter(x=>x.id!==id);save();renderAll();showToast('Agenda berhasil dihapus.')}
function makeText(){
 const list=sorted(agendas.filter(a=>a.date===selectedDate));let out='*Jadwal Sekda Kota Bogor*\n'+dateLong(selectedDate)+'\n';
 if(!list.length)return out+'\nBelum ada agenda.';
 list.forEach((a,i)=>{out+='\n\n'+(i+1)+'. *'+a.time.replace(':','.')+'*\n'+a.name;if(a.place)out+='\nTempat : '+a.place;if(a.guests){a.guests.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).forEach(g=>out+='\n- '+g)}if(a.dress)out+='\n*Pakaian : '+a.dress+'*'});
 return out;
}
async function copyText(){const txt=$('copyText').value;try{await navigator.clipboard.writeText(txt);showToast('Teks agenda berhasil disalin.')}catch(e){$('copyText').focus();$('copyText').select();try{document.execCommand('copy');showToast('Teks agenda disalin.')}catch(err){showToast('Pilih teks lalu salin secara manual.')}}}
$('prevMonth').addEventListener('click',()=>{shownMonth--;if(shownMonth<0){shownMonth=11;shownYear--}renderCalendar()});
$('nextMonth').addEventListener('click',()=>{shownMonth++;if(shownMonth>11){shownMonth=0;shownYear++}renderCalendar()});
$('addAgendaBtn').addEventListener('click',()=>openForm());$('newAgendaTop').addEventListener('click',()=>openForm());
$('closeForm').addEventListener('click',closeForm);$('cancelForm').addEventListener('click',closeForm);
$('agendaForm').addEventListener('submit',e=>{e.preventDefault();const id=$('editId').value;const item={id:id||String(Date.now())+'-'+Math.random().toString(16).slice(2,7),date:$('eventDate').value,time:$('eventTime').value,name:$('eventName').value.trim(),place:$('eventPlace').value.trim(),guests:$('eventGuests').value.trim(),dress:$('eventDress').value.trim()};if(id)agendas=agendas.map(a=>a.id===id?item:a);else agendas.push(item);selectedDate=item.date;const d=parseDate(selectedDate);shownYear=d.getFullYear();shownMonth=d.getMonth();save();closeForm();renderAll();showToast(id?'Agenda berhasil diperbarui.':'Agenda berhasil ditambahkan.')});
$('copyDayBtn').addEventListener('click',()=>{$('copyText').value=makeText();$('copyModal').classList.remove('hidden')});
$('closeCopy').addEventListener('click',()=>$('copyModal').classList.add('hidden'));$('doneCopy').addEventListener('click',()=>$('copyModal').classList.add('hidden'));$('copyTextBtn').addEventListener('click',copyText);
$('copyModal').addEventListener('click',e=>{if(e.target===$('copyModal'))$('copyModal').classList.add('hidden')});
$('exportBtn').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(agendas,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='agenda-sekda-kota-bogor.json';a.click();URL.revokeObjectURL(url);showToast('Data agenda diekspor.')});
load();renderAll();
})();
