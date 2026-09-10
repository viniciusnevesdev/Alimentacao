(() => {
  const STORAGE_KEY = 'alimentacao-registros-v1';
  const SETTINGS_KEY = 'alimentacao-ajustes-v1';
  const WATER_KEY = 'alimentacao-hidratacao-v1';
  const defaults = { calorieGoal:2000, proteinGoal:120, carbsGoal:250, fatGoal:65, waterGoal:2000 };
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const num = v => Number(v || 0);
  const fmt = (v,d=0) => new Intl.NumberFormat('pt-BR',{maximumFractionDigits:d}).format(v);
  const uid = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const today = () => new Date().toLocaleDateString('en-CA');
  const nowTime = () => new Date().toTimeString().slice(0,5);
  const mealConfigs = [
    ['Café da manhã','☕','Primeira refeição do dia','icon-amber'],
    ['Lanche da manhã','🍎','Lanche entre as refeições','icon-rose'],
    ['Almoço','☀️','Refeição principal','icon-emerald'],
    ['Lanche da tarde','🍓','Energia durante a tarde','icon-rose'],
    ['Jantar','🌙','Refeição noturna','icon-emerald'],
    ['Ceia','🍪','Antes de dormir','icon-amber'],
    ['Outro','＋','Outros registros','icon-sky']
  ];

  let entries = load(STORAGE_KEY, []);
  let settings = {...defaults, ...load(SETTINGS_KEY,{})};
  let waterLogs = load(WATER_KEY, {});
  let selectedFood = null;
  let estimateSource = '';

  function load(key,fallback){try{return JSON.parse(localStorage.getItem(key)) ?? fallback}catch{return fallback}}
  function persist(){localStorage.setItem(STORAGE_KEY,JSON.stringify(entries));localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));localStorage.setItem(WATER_KEY,JSON.stringify(waterLogs))}
  function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
  function qualityClass(q){return `q${Math.max(1,Math.min(5,Math.round(num(q))))}`}
  function qualityLabel(score){if(!score)return'Sem registros';if(score>=4.2)return'Muito boa';if(score>=3.4)return'Boa';if(score>=2.6)return'Mediana';return'Baixa'}
  function weightedQuality(list){if(!list.length)return 0;const weighted=list.filter(e=>num(e.calories)>0);if(weighted.length){const total=weighted.reduce((s,e)=>s+num(e.calories),0);return weighted.reduce((s,e)=>s+num(e.calories)*num(e.quality),0)/total}return list.reduce((s,e)=>s+num(e.quality),0)/list.length}
  function progress(value,goal){return goal ? Math.min(100,Math.max(0,value/goal*100)) : 0}
  function currentDate(){return $('#selectedDate').value || today()}
  function dateLabel(dateStr){if(dateStr===today())return'Hoje';const y=new Date();y.setDate(y.getDate()-1);if(dateStr===y.toLocaleDateString('en-CA'))return'Ontem';return new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short'}).format(new Date(dateStr+'T12:00:00')).replace('.','')}
  function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),1800)}

  function render(){renderDate();renderDiary();renderCatalog();renderSettings()}
  function renderDate(){$('#dateChip').textContent=dateLabel(currentDate())}

  function renderDiary(){
    const date=currentDate();
    const list=entries.filter(e=>e.date===date).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
    const calories=list.reduce((s,e)=>s+num(e.calories),0);
    const protein=list.reduce((s,e)=>s+num(e.protein),0);
    const carbs=list.reduce((s,e)=>s+num(e.carbs),0);
    const fat=list.reduce((s,e)=>s+num(e.fat),0);
    const quality=weightedQuality(list);
    const water=num(waterLogs[date]);
    const remaining=settings.calorieGoal-calories;

    $('#totalCalories').textContent=fmt(calories);
    $('#calorieGoalText').textContent=fmt(settings.calorieGoal);
    $('#calorieBalance').textContent=remaining>=0?`Restam ${fmt(remaining)} kcal para atingir sua meta`:`Meta excedida em ${fmt(Math.abs(remaining))} kcal`;
    $('#calorieBalance').classList.toggle('over',remaining<0);
    $('#caloriePercent').textContent=`${Math.round(progress(calories,settings.calorieGoal))}%`;
    $('#calorieProgress').style.width=`${progress(calories,settings.calorieGoal)}%`;
    $('#calorieProgressWrap').classList.toggle('over',remaining<0);
    $('#qualityScore').textContent=quality?`${quality.toFixed(1)}/5`:'—';
    $('#qualityText').textContent=qualityLabel(quality);

    setMacro('protein',protein,settings.proteinGoal,4);
    setMacro('carbs',carbs,settings.carbsGoal,4);
    setMacro('fat',fat,settings.fatGoal,9);
    $('#waterValue').textContent=fmt(water);
    $('#waterGoalText').textContent=fmt(settings.waterGoal);
    $('#waterPercent').textContent=`${Math.round(progress(water,settings.waterGoal))}%`;
    $('#waterProgress').style.width=`${progress(water,settings.waterGoal)}%`;
    $('#waterRemaining').textContent=`Faltam ${fmt(Math.max(0,settings.waterGoal-water))} ml`;

    const box=$('#mealList');
    box.innerHTML=mealConfigs.map(([meal,icon,subtitle,iconClass])=>{
      const items=list.filter(e=>e.meal===meal);
      const kcal=items.reduce((s,e)=>s+num(e.calories),0);
      const p=items.reduce((s,e)=>s+num(e.protein),0), c=items.reduce((s,e)=>s+num(e.carbs),0), f=items.reduce((s,e)=>s+num(e.fat),0);
      return `<article class="card meal"><div class="meal-head"><div class="meal-ident"><div class="meal-icon ${iconClass}">${icon}</div><div><h3>${meal}</h3><div class="meal-stats"><span>${items.length} ${items.length===1?'item':'itens'}</span><span>•</span><strong>${fmt(kcal)} kcal</strong><span>•</span><span>P ${fmt(p,1)}g</span><span>C ${fmt(c,1)}g</span><span>G ${fmt(f,1)}g</span></div></div></div><div class="meal-actions"><button class="btn primary" data-add-meal="${escapeHtml(meal)}">＋ Adicionar</button></div></div><div>${items.length?items.map(entryHtml).join(''):`<div class="meal-empty">Nenhum alimento registrado. <button class="link-btn" data-add-meal="${escapeHtml(meal)}">Adicionar agora</button></div>`}</div></article>`;
    }).join('');
    $$('[data-add-meal]').forEach(b=>b.onclick=()=>openNew(b.dataset.addMeal));
    $$('[data-edit]').forEach(b=>b.onclick=()=>openEdit(b.dataset.edit));
    $$('[data-delete]').forEach(b=>b.onclick=()=>removeEntry(b.dataset.delete));
  }

  function setMacro(key,value,goal,kcalPerGram){
    $(`#${key}Value`).textContent=fmt(value,1);
    $(`#${key}Goal`).textContent=fmt(goal,0);
    $(`#${key}Percent`).textContent=`${Math.round(progress(value,goal))}%`;
    $(`#${key}Progress`).style.width=`${progress(value,goal)}%`;
    $(`#${key}Kcal`).textContent=`${fmt(value*kcalPerGram)} kcal`;
    $(`#${key}Remaining`).textContent=`${fmt(Math.max(0,goal-value),1)}g restantes`;
  }

  function entryHtml(e){
    const estimated=e.estimateSource?'<span class="estimate-chip">≈ estimado</span>':'';
    return `<div class="entry"><div><div class="entry-title">${escapeHtml(e.food)} <span class="quality-chip ${qualityClass(e.quality)}">Q${e.quality||3}/5</span>${estimated}</div><div class="entry-meta">${escapeHtml(e.amount||'Quantidade não informada')} · ${escapeHtml(e.time||'--:--')}${e.notes?` · ${escapeHtml(e.notes)}`:''}</div></div><div class="entry-side"><div class="entry-kcal">${fmt(num(e.calories))} <small>kcal</small></div><div class="entry-macros">P ${fmt(num(e.protein),1)}g · C ${fmt(num(e.carbs),1)}g · G ${fmt(num(e.fat),1)}g</div><div class="entry-buttons"><button class="link-btn" data-edit="${e.id}">Editar</button><button class="link-btn" data-delete="${e.id}">Excluir</button></div></div></div>`;
  }

  function renderCatalog(){
    const query=($('#catalogSearch')?.value||'').trim();
    const all=window.NutritionHelper?.foods||[];
    const foods=query?(window.NutritionHelper?.search(query,50)||[]):all;
    $('#catalogCount').textContent=`${foods.length} ${foods.length===1?'alimento':'alimentos'}`;
    $('#foodCatalog').innerHTML=foods.map(food=>{
      const sample=window.NutritionHelper.estimate(food,'');
      return `<article class="card food-card"><h3>${escapeHtml(food.name)}</h3><p>Porção de referência: ${escapeHtml(food.standard)}</p><div class="food-kcal">${fmt(sample.calories)} kcal</div><div class="food-macro">P ${fmt(sample.protein,1)}g · C ${fmt(sample.carbs,1)}g · G ${fmt(sample.fat,1)}g · Qualidade ${food.quality}/5</div><button class="btn soft" style="margin-top:10px" data-catalog-add="${food.id}">Adicionar ao diário</button></article>`;
    }).join('') || '<div class="card meal-empty">Nenhum alimento encontrado.</div>';
    $$('[data-catalog-add]').forEach(b=>b.onclick=()=>{switchView('diary');openNew('Outro',b.dataset.catalogAdd)});
  }

  function renderSettings(){
    ['calorieGoal','proteinGoal','carbsGoal','fatGoal','waterGoal'].forEach(k=>{const el=$(`#setting-${k}`);if(el&&document.activeElement!==el)el.value=settings[k]});
  }

  function switchView(view){
    $$('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${view}`));
    $$('.tab').forEach(t=>t.classList.toggle('active',t.dataset.view===view));
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function openNew(meal='Outro',foodId=''){
    $('#entryForm').reset();
    $('#entryDialogTitle').textContent='Adicionar alimento';
    $('#entryId').value='';
    $('#entryDate').value=currentDate();
    $('#entryTime').value=nowTime();
    $('#meal').value=meal;
    $('#q3').checked=true;
    selectedFood=null;estimateSource='';
    renderSuggestions('');hidePreview();
    if(foodId){const food=window.NutritionHelper?.foods.find(f=>f.id===foodId);if(food)selectSuggestion(food)}
    $('#entryDialog').showModal();
    setTimeout(()=>$('#food').focus(),80);
  }

  function openEdit(id){
    const e=entries.find(x=>x.id===id);if(!e)return;
    $('#entryForm').reset();$('#entryDialogTitle').textContent='Editar alimento';$('#entryId').value=e.id;$('#entryDate').value=e.date;$('#entryTime').value=e.time;$('#meal').value=e.meal;$('#food').value=e.food;$('#amount').value=e.amount||'';$('#calories').value=e.calories;$('#protein').value=e.protein||'';$('#carbs').value=e.carbs||'';$('#fat').value=e.fat||'';$('#notes').value=e.notes||'';
    const q=$(`input[name="quality"][value="${e.quality||3}"]`);if(q)q.checked=true;
    estimateSource=e.estimateSource||'';selectedFood=window.NutritionHelper?.findBest(e.food)||null;renderSuggestions(e.food);updatePreview();$('#entryDialog').showModal();
  }

  function removeEntry(id){if(!confirm('Excluir este alimento do diário?'))return;entries=entries.filter(e=>e.id!==id);persist();renderDiary();toast('Registro excluído')}

  function renderSuggestions(query){
    const box=$('#foodSuggestions');const matches=window.NutritionHelper?.search(query,7)||[];
    if(!query.trim()){box.innerHTML='<div class="notice">Digite o nome do alimento para ver sugestões da base local.</div>';return}
    if(!matches.length){box.innerHTML='<div class="notice">Não encontrei esse alimento na base. Você ainda pode preencher os dados manualmente.</div>';return}
    box.innerHTML=matches.map(f=>{const s=window.NutritionHelper.estimate(f,'');return `<button type="button" class="suggestion ${selectedFood?.id===f.id?'selected':''}" data-food-id="${f.id}"><span><b>${escapeHtml(f.name)}</b><small>${escapeHtml(f.standard)}</small></span><strong>${fmt(s.calories)} kcal</strong></button>`}).join('');
    $$('[data-food-id]').forEach(b=>b.onclick=()=>{const f=window.NutritionHelper.foods.find(x=>x.id===b.dataset.foodId);selectSuggestion(f)});
  }

  function selectSuggestion(food){
    if(!food)return;selectedFood=food;$('#food').value=food.name;if(!$('#amount').value)$('#amount').value=food.standard;renderSuggestions(food.name);updatePreview();
  }

  function hidePreview(){$('#nutritionPreview').hidden=true}
  function updatePreview(){
    if(!selectedFood){selectedFood=window.NutritionHelper?.findBest($('#food').value)||null}
    if(!selectedFood){hidePreview();return}
    const estimate=window.NutritionHelper.estimate(selectedFood,$('#amount').value);
    if(!estimate){hidePreview();return}
    $('#nutritionPreview').hidden=false;
    $('#previewName').textContent=selectedFood.name;
    $('#previewServing').textContent=estimate.usedDefault?`Usando porção padrão: ${selectedFood.standard}`:`Calculado para: ${$('#amount').value}`;
    $('#previewCalories').textContent=fmt(estimate.calories);
    $('#previewProtein').textContent=fmt(estimate.protein,1);
    $('#previewCarbs').textContent=fmt(estimate.carbs,1);
    $('#previewFat').textContent=fmt(estimate.fat,1);
    $('#applySuggestion').dataset.foodId=selectedFood.id;
  }

  function applySuggestion(){
    if(!selectedFood)return;const estimate=window.NutritionHelper.estimate(selectedFood,$('#amount').value);if(!estimate)return;
    $('#calories').value=estimate.calories;$('#protein').value=estimate.protein;$('#carbs').value=estimate.carbs;$('#fat').value=estimate.fat;const q=$(`input[name="quality"][value="${estimate.quality}"]`);if(q)q.checked=true;estimateSource=selectedFood.id;toast('Sugestão nutricional aplicada');
  }

  function updateWater(delta){const d=currentDate();waterLogs[d]=Math.max(0,num(waterLogs[d])+delta);persist();renderDiary()}

  $('#entryForm').addEventListener('submit',ev=>{
    ev.preventDefault();const id=$('#entryId').value||uid();const entry={id,date:$('#entryDate').value,time:$('#entryTime').value,meal:$('#meal').value,food:$('#food').value.trim(),amount:$('#amount').value.trim(),calories:num($('#calories').value),quality:num($('input[name="quality"]:checked')?.value||3),protein:num($('#protein').value),carbs:num($('#carbs').value),fat:num($('#fat').value),notes:$('#notes').value.trim(),estimateSource,updatedAt:new Date().toISOString()};
    const i=entries.findIndex(e=>e.id===id);if(i>=0)entries[i]=entry;else entries.push(entry);persist();$('#selectedDate').value=entry.date;$('#entryDialog').close();switchView('diary');render();toast(i>=0?'Registro atualizado':'Alimento adicionado');
  });

  $('#food').addEventListener('input',()=>{selectedFood=window.NutritionHelper?.findBest($('#food').value)||null;estimateSource='';renderSuggestions($('#food').value);updatePreview()});
  $('#amount').addEventListener('input',updatePreview);
  $('#applySuggestion').onclick=applySuggestion;
  $('#selectedDate').onchange=render;
  $('#prevDay').onclick=()=>shiftDay(-1);$('#nextDay').onclick=()=>shiftDay(1);
  function shiftDay(delta){const d=new Date(currentDate()+'T12:00:00');d.setDate(d.getDate()+delta);$('#selectedDate').value=d.toLocaleDateString('en-CA');render()}
  $('#goToday').onclick=()=>{$('#selectedDate').value=today();render()};
  $$('.tab').forEach(t=>t.onclick=()=>switchView(t.dataset.view));
  $('#catalogSearch').addEventListener('input',renderCatalog);
  $('#waterMinus').onclick=()=>updateWater(-250);$('#water250').onclick=()=>updateWater(250);$('#water500').onclick=()=>updateWater(500);
  $('#heroGoals').onclick=()=>switchView('settings');
  $('#saveGoals').onclick=()=>{settings={...settings,calorieGoal:num($('#setting-calorieGoal').value),proteinGoal:num($('#setting-proteinGoal').value),carbsGoal:num($('#setting-carbsGoal').value),fatGoal:num($('#setting-fatGoal').value),waterGoal:num($('#setting-waterGoal').value)};persist();render();toast('Metas salvas')};
  $('#exportBtn').onclick=()=>{const payload={app:'Alimentação',version:3,exportedAt:new Date().toISOString(),settings,entries,waterLogs};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`alimentacao-backup-${today()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);};
  $('#importBtn').onclick=()=>$('#importFile').click();
  $('#importFile').onchange=async ev=>{const file=ev.target.files?.[0];if(!file)return;try{const data=JSON.parse(await file.text());if(!Array.isArray(data.entries))throw new Error();if(!confirm(`Importar ${data.entries.length} registros e substituir os dados atuais?`))return;entries=data.entries;settings={...defaults,...(data.settings||{})};waterLogs=data.waterLogs||{};persist();render();toast('Backup restaurado')}catch{alert('Não foi possível importar este arquivo.')}ev.target.value=''};
  $('#clearBtn').onclick=()=>{if(!confirm('Apagar todos os registros, hidratação e ajustes deste aparelho?'))return;entries=[];waterLogs={};settings={...defaults};persist();render();toast('Dados apagados')};
  $$('[data-close]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.close).close());

  $('#selectedDate').value=today();render();switchView('diary');
  if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();