const map=L.map('map',{zoomControl:true}).setView([13.2,101],6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
const red=L.divIcon({className:'',html:'<div style="width:18px;height:18px;border-radius:50%;background:#e5383b;border:3px solid #fff;box-shadow:0 0 0 2px #e5383b"></div>',iconSize:[18,18]});
const blue=L.divIcon({className:'',html:'<div style="width:12px;height:12px;border-radius:50%;background:#2f6fed;border:2px solid #fff;box-shadow:0 0 2px #0006"></div>',iconSize:[12,12]});
const green=L.divIcon({className:'',html:'<div style="width:12px;height:12px;border-radius:50%;background:#2eb872;border:2px solid #fff;box-shadow:0 0 2px #0006"></div>',iconSize:[12,12]});
let pts=[],provs,cl=L.markerClusterGroup({showCoverageOnHover:false}),newsL=L.layerGroup().addTo(map),choro;
const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let LIC=[];
function popup(p){const q=(p.name||p.name_en||'nursing home');const g=`https://www.google.com/maps/search/${encodeURIComponent(q)}/@${p.lat},${p.lon},17z`;
 let s=`<b>${esc(p.name)}</b><br>${p.name_en&&p.name_en!==p.name?esc(p.name_en)+'<br>':''}${esc(p.address)}<br>${esc(p.province)} · ${esc(p.province_th)}<br>License: ${esc(p.license_status)}<br>`;
 s+= p.news==='in_news'?`<b style="color:#e5383b">In the news (Oct 2026). See the news list in the panel.</b><br>`:`<i>No issue reported. Listed from ${esc(p.source)}.</i><br>`;
 return s+`<a href="${g}" target="_blank">Open in Google Maps (by name)</a> · <a href="${p.source_url}" target="_blank">Source</a>`;}
function color(n){return n>=100?'#08306b':n>=40?'#2171b5':n>=15?'#6baed6':n>=5?'#c6dbef':n>=1?'#eef5fc':'#ffffff'}
function draw(){const q=document.getElementById('q').value.trim().toLowerCase(),pv=document.getElementById('prov').value,sr=document.getElementById('src').value;
 cl.clearLayers();newsL.clearLayers();let n=0;
 pts.forEach(p=>{if(pv&&p.province!==pv)return;if(sr&&p.source!==sr)return;if(q&&!(p.name+' '+p.name_en+' '+p.address).toLowerCase().includes(q))return;n++;
  const m=L.marker([p.lat,p.lon],{icon:p.news==='in_news'?red:(p.license_status.startsWith('on 2025')||p.source.includes('licensed')?green:blue)}).bindPopup(popup(p));
  (p.news==='in_news'?newsL:cl).addLayer(m);});
 map.addLayer(cl);document.getElementById('kMap').textContent=n;
 const ll=LIC.filter(x=>x.province===pv&&(!q||x.name.toLowerCase().includes(q)));
 document.getElementById('liclist').innerHTML=pv?`<div><b>${ll.length} listed in ${esc(pv)}</b></div>`+ll.map(x=>`<div>${esc(x.name)} <span class="small">· licensed ${x.licensed}</span></div>`).join(''):'';
 if(pv&&provs){const f=provs.features.find(f=>f.properties.name===pv);if(f)map.fitBounds(L.geoJSON(f).getBounds());}}
Promise.all(['data/nursing_homes.geojson','data/provinces.geojson','data/licensed_list_2025.json'].map(u=>fetch(u).then(r=>r.json()))).then(([g,pr,lic])=>{
 pts=g.features.map(f=>f.properties);provs=pr;LIC=lic;
 choro=L.geoJSON(pr,{style:f=>({color:'#8aa',weight:.6,fillOpacity:.55,fillColor:color(f.properties.licensed)}),onEachFeature:(f,l)=>l.bindTooltip(`${f.properties.name} · ${f.properties.name_th}<br>Licensed: <b>${f.properties.licensed}</b> · On map: ${f.properties.mapped}`,{sticky:true})}).addTo(map);choro.bringToBack();
 const sel=document.getElementById('prov');pr.features.map(f=>f.properties).sort((a,b)=>a.name.localeCompare(b.name)).forEach(p=>sel.add(new Option(`${p.name} · ${p.name_th} (${p.licensed})`,p.name)));
 const srcs=[...new Set(pts.map(p=>p.source))];srcs.forEach(s=>document.getElementById('src').add(new Option(s,s)));
 document.getElementById('bySrc').innerHTML='Pins by source: '+srcs.map(s=>`${esc(s)} <b>${pts.filter(p=>p.source===s).length}</b>`).join(' · ');
 const top=pr.features.map(f=>f.properties).sort((a,b)=>b.licensed-a.licensed).slice(0,10),mx=top[0].licensed;
 document.getElementById('top').innerHTML=top.map(p=>`<div class="bar"><span>${p.name_th}</span><i style="width:${p.licensed/mx*150}px"></i>${p.licensed}</div>`).join('')+'<div class="small">Source: DOP/HSS 2025. calc. by province</div>';
 draw();});
document.getElementById('news').innerHTML=NEWS.map(n=>`<div class="nw"><b>${n.name}</b><span class="small">${n.date}${n.onmap?' · red pin on map':' · not pinned'}</span><div>${n.text}</div>${n.links.map(l=>`<a href="${l[1]}" target="_blank">${l[0]}</a>`).join(' · ')}</div>`).join('');
document.getElementById('kNews').textContent=NEWS.length;
['q','prov','src'].forEach(i=>document.getElementById(i).addEventListener('input',draw));
document.getElementById('choro').addEventListener('change',e=>e.target.checked?choro.addTo(map).bringToBack():map.removeLayer(choro));
