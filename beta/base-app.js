(() => {
  const STORAGE_KEY='alimentacao-registros-v1';
  const SETTINGS_KEY='alimentacao-ajustes-v1';
  const WATER_KEY='alimentacao-hidratacao-v1';
  const WATCH_KEY='alimentacao-watch-v1';
  const MEASURE_KEY='alimentacao-medidas-v1';
  const SNAPSHOT_KEY='alimentacao-snapshots-v1';
  const CUSTOM_FOODS_KEY='alimentacao-custom-foods-v1';
  const BACKUP_SCHEMA_VERSION=1;
  const APP_DATA_VERSION=5;
  const RELEASE_VERSIONS=window.NutriTrackVersions||{official:'1.0.0',beta:'1.1.0-beta'};
  const defaults={calorieGoal:2000,proteinGoal:120,carbsGoal:250,fatGoal:65,waterGoal:2000,weightGoal:75,moveGoal:600,exerciseGoal:30,standGoal:12};
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const num=v=>Number(v||0), fmt=(v,d=0)=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:d}).format(v);
  const uid=()=>crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const today=()=>new Date().toLocaleDateString('en-CA'), nowTime=()=>new Date().toTimeString().slice(0,5);
  const icon=id=>`<svg><use href="#i-${id}"/></svg>`;
  const mealConfigs=[
    ['Café da manhã','coffee','Primeira refeição do dia','icon-amber'],
    ['Lanche da manhã','apple','Lanche entre as refeições','icon-rose'],
    ['Almoço','sun','Refeição principal','icon-emerald'],
    ['Lanche da tarde','apple','Energia durante a tarde','icon-rose'],
    ['Jantar','moon','Refeição noturna','icon-indigo'],
    ['Ceia','cookie','Antes de dormir','icon-slate'],
    ['Outro','utensils','Outros registros','icon-slate']
  ];

  let entries=load(STORAGE_KEY,[]);
  let settings={...defaults,...load(SETTINGS_KEY,{})};
  let waterLogs=load(WATER_KEY,{});
  let watchLogs=load(WATCH_KEY,{});
  let measurements=load(MEASURE_KEY,[]);
  let snapshots=load(SNAPSHOT_KEY,[]);
  let customFoods=load(CUSTOM_FOODS_KEY,[]);
  let selectedFood=null, estimateSource='', analyticsPeriod=30;
  customFoods.forEach(food=>{if(food?.id&&!window.NutritionHelper?.foods.some(f=>f.id===food.id))window.NutritionHelper?.foods.push(food)});

  function load(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
  function persist(){
    localStorage.setItem(STORAGE_KEY,JSON.stringify(entries));
    localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));
    localStorage.setItem(WATER_KEY,JSON.stringify(waterLogs));
    localStorage.setItem(WATCH_KEY,JSON.stringify(watchLogs));
    localStorage.setItem(MEASURE_KEY,JSON.stringify(measurements));
    localStorage.setItem(SNAPSHOT_KEY,JSON.stringify(snapshots));
    localStorage.setItem(CUSTOM_FOODS_KEY,JSON.stringify(customFoods));
  }
  function isPlainObject(value){return !!value&&typeof value==='object'&&!Array.isArray(value)}
  function normalizeBackupPayload(data){
    if(!isPlainObject(data)||!Array.isArray(data.entries))throw new Error('backup-invalid');
    const schemaVersion=Math.max(1,num(data.backupSchemaVersion||data.backupSchema||1));
    return {
      schemaVersion,
      sourceChannel:typeof data.sourceChannel==='string'?data.sourceChannel:'unknown',
      entries:data.entries,
      settings:isPlainObject(data.settings)?data.settings:{},
      waterLogs:isPlainObject(data.waterLogs)?data.waterLogs:{},
      watchLogs:isPlainObject(data.watchLogs)?data.watchLogs:{},
      measurements:Array.isArray(data.measurements)?data.measurements:[],
      snapshots:Array.isArray(data.snapshots)?data.snapshots:null,
      customFoods:Array.isArray(data.customFoods)?data.customFoods:[]
    };
  }
  function currentChannel(){return document.documentElement.dataset.channel==='beta'?'beta':'official'}
  function currentReleaseVersion(){return RELEASE_VERSIONS[currentChannel()]||'0.0.0'}
  function renderReleaseVersion(){const el=$('#appVersion');if(el)el.textContent=`v${currentReleaseVersion()}`}
  function createBackupPayload(){
    const sourceChannel=currentChannel();
    return {app:'NutriTrack',version:APP_DATA_VERSION,releaseVersion:currentReleaseVersion(),backupSchemaVersion:BACKUP_SCHEMA_VERSION,sourceChannel,compatibleWith:['official','beta'],exportedAt:new Date().toISOString(),settings,entries,waterLogs,watchLogs,measurements,snapshots,customFoods};
  }
  function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
  function currentDate(){return $('#selectedDate').value||today()}
  function progress(v,g){return g?Math.min(100,Math.max(0,num(v)/num(g)*100)):0}
  function qualityClass(q){return `q${Math.max(1,Math.min(5,Math.round(num(q)||3)))}`}
  function qualityLabel(score){if(!score)return'Sem registros';if(score>=4.2)return'Muito boa';if(score>=3.4)return'Boa';if(score>=2.6)return'Mediana';return'Baixa'}
  function weightedQuality(list){if(!list.length)return 0;const weighted=list.filter(e=>num(e.calories)>0);if(weighted.length){const total=weighted.reduce((s,e)=>s+num(e.calories),0);return weighted.reduce((s,e)=>s+num(e.calories)*num(e.quality||3),0)/total}return list.reduce((s,e)=>s+num(e.quality||3),0)/list.length}
  function prettyDate(dateStr){const d=new Date(dateStr+'T12:00:00');return new Intl.DateTimeFormat('pt-BR',{day:'numeric',month:'short',year:'numeric'}).format(d).replace(/\./g,'')}
  function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),1800)}
  function dayList(days,end=currentDate()){const base=new Date(end+'T12:00:00');return Array.from({length:days},(_,i)=>{const d=new Date(base);d.setDate(base.getDate()-(days-1-i));return d.toLocaleDateString('en-CA')})}
  function sumDay(date,key){return entries.filter(e=>e.date===date).reduce((s,e)=>s+num(e[key]),0)}

  function render(){renderDate();renderDiary();renderCatalog();renderWatch();renderMeasurements();renderBackup();renderSettings();renderAnalytics()}
  function renderDate(){const d=currentDate();$('#prettyDate').textContent=prettyDate(d);$('#goToday').style.display=d===today()?'none':'inline-flex'}

  function renderDiary(){
    const date=currentDate(), list=entries.filter(e=>e.date===date).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
    const calories=list.reduce((s,e)=>s+num(e.calories),0), protein=list.reduce((s,e)=>s+num(e.protein),0), carbs=list.reduce((s,e)=>s+num(e.carbs),0), fat=list.reduce((s,e)=>s+num(e.fat),0), quality=weightedQuality(list), water=num(waterLogs[date]), watch=num(watchLogs[date]?.activeCalories), remaining=settings.calorieGoal-calories;
    $('#totalCalories').textContent=fmt(calories);$('#calorieGoalText').textContent=fmt(settings.calorieGoal);
    $('#calorieBalance').textContent=remaining>=0?`Restam ${fmt(remaining)} kcal para atingir sua meta`:`Meta excedida em ${fmt(Math.abs(remaining))} kcal`;$('#calorieBalance').classList.toggle('over',remaining<0);
    $('#caloriePercent').textContent=`${Math.round(progress(calories,settings.calorieGoal))}%`;$('#calorieProgress').style.width=`${progress(calories,settings.calorieGoal)}%`;$('#calorieProgressWrap').classList.toggle('over',remaining<0);
    $('#qualityScore').textContent=quality?`${quality.toFixed(1)}/5`:'—';$('#qualityText').textContent=qualityLabel(quality);$('#netCaloriesText').textContent=watch?`Balanço líquido: ${fmt(calories-watch)} kcal`:'Balanço diário';
    setMacro('protein',protein,settings.proteinGoal,4);setMacro('carbs',carbs,settings.carbsGoal,4);setMacro('fat',fat,settings.fatGoal,9);
    $('#waterValue').textContent=fmt(water);$('#waterGoalText').textContent=fmt(settings.waterGoal);$('#waterPercent').textContent=`${Math.round(progress(water,settings.waterGoal))}%`;$('#waterProgress').style.width=`${progress(water,settings.waterGoal)}%`;$('#waterRemaining').textContent=`Faltam ${fmt(Math.max(0,settings.waterGoal-water))} ml`;
    const box=$('#mealList');
    box.innerHTML=mealConfigs.map(([meal,iconId,subtitle,iconClass])=>{
      const items=list.filter(e=>e.meal===meal);const kcal=items.reduce((s,e)=>s+num(e.calories),0),p=items.reduce((s,e)=>s+num(e.protein),0),c=items.reduce((s,e)=>s+num(e.carbs),0),f=items.reduce((s,e)=>s+num(e.fat),0);
      return `<article class="card meal"><div class="meal-head"><div class="meal-ident"><div class="meal-icon ${iconClass}">${icon(iconId)}</div><div><h3>${meal}</h3><div class="meal-stats"><span>${items.length} ${items.length===1?'item':'itens'}</span><span>•</span><strong>${fmt(kcal)} kcal</strong><span class="p">P: ${fmt(p,1)}g</span><span class="c">C: ${fmt(c,1)}g</span><span class="f">G: ${fmt(f,1)}g</span></div></div></div><div class="meal-actions"><button class="btn primary" data-add-meal="${escapeHtml(meal)}">${icon('plus')}Adicionar</button></div></div><div>${items.length?items.map(entryHtml).join(''):`<div class="meal-empty">Nenhum alimento registrado. <button class="link-btn" data-add-meal="${escapeHtml(meal)}">Adicionar agora</button></div>`}</div></article>`;
    }).join('');
    $$('[data-add-meal]').forEach(b=>b.onclick=()=>openNew(b.dataset.addMeal));$$('[data-edit]').forEach(b=>b.onclick=()=>openEdit(b.dataset.edit));$$('[data-delete]').forEach(b=>b.onclick=()=>removeEntry(b.dataset.delete));
  }
  function setMacro(key,value,goal,kcalPerGram){$(`#${key}Value`).textContent=fmt(value,1);$(`#${key}Goal`).textContent=fmt(goal);$(`#${key}Percent`).textContent=`${Math.round(progress(value,goal))}%`;$(`#${key}Progress`).style.width=`${progress(value,goal)}%`;$(`#${key}Kcal`).textContent=`${fmt(value*kcalPerGram)} kcal`;$(`#${key}Remaining`).textContent=`${fmt(Math.max(0,goal-value),1)}g restantes`}
  function entryHtml(e){const estimated=e.estimateSource?'<span class="estimate-chip">≈ estimado</span>':'';return `<div class="entry"><div><div class="entry-title">${escapeHtml(e.food)} <span class="quality-chip ${qualityClass(e.quality)}">Q${e.quality||3}/5</span>${estimated}</div><div class="entry-meta">${escapeHtml(e.amount||'Quantidade não informada')} · ${escapeHtml(e.time||'--:--')}${e.notes?` · ${escapeHtml(e.notes)}`:''}</div></div><div class="entry-side"><div class="entry-kcal">${fmt(num(e.calories))} <small>kcal</small></div><div class="entry-macros"><span class="p">P: ${fmt(num(e.protein),1)}g</span> · <span class="c">C: ${fmt(num(e.carbs),1)}g</span> · <span class="f">G: ${fmt(num(e.fat),1)}g</span></div><div class="entry-buttons"><button class="link-btn" data-edit="${e.id}" aria-label="Editar">${icon('edit')}</button><button class="link-btn" data-delete="${e.id}" aria-label="Excluir">${icon('trash')}</button></div></div></div>`}

  function renderCatalog(){const query=($('#catalogSearch')?.value||'').trim();const all=window.NutritionHelper?.foods||[];const foods=query?(window.NutritionHelper?.search(query,80)||[]):all;$('#foodCatalog').innerHTML=foods.map(food=>{const sample=window.NutritionHelper.estimate(food,'');const source=food.custom?(food.source==='openfoodfacts'?'Personalizado • Open Food Facts':'Personalizado'):'Base local';return `<article class="card food-card"><h3>${escapeHtml(food.name)}</h3><p>${source} • ${escapeHtml(food.standard)}${food.foodScore?` • FoodScore ${fmt(food.foodScore)}/100`:''}</p><div class="food-row"><div class="food-kcal">${fmt(sample.calories)} <small>kcal</small></div><div class="food-macro"><span class="p">P: ${fmt(sample.protein,1)}g</span> · <span class="c">C: ${fmt(sample.carbs,1)}g</span> · <span class="f">G: ${fmt(sample.fat,1)}g</span></div></div><div class="food-actions"><button class="link-btn" data-catalog-add="${food.id}">${icon('plus')} Adicionar</button>${food.custom?`<button class="link-btn" data-custom-delete="${food.id}">${icon('trash')} Excluir</button>`:''}</div></article>`}).join('')||'<article class="card meal-empty">Nenhum alimento encontrado.</article>';$$('[data-catalog-add]').forEach(b=>b.onclick=()=>{switchView('diary');openNew('Outro',b.dataset.catalogAdd)});$$('[data-custom-delete]').forEach(b=>b.onclick=()=>deleteCustomFood(b.dataset.customDelete))}

  function syncCustomFoodsToHelper(){
    if(!window.NutritionHelper?.foods)return;
    const ids=new Set(customFoods.map(f=>f.id));
    window.NutritionHelper.foods.splice(0,window.NutritionHelper.foods.length,...window.NutritionHelper.foods.filter(f=>!f.custom||ids.has(f.id)));
    customFoods.forEach(food=>{const i=window.NutritionHelper.foods.findIndex(f=>f.id===food.id);if(i>=0)window.NutritionHelper.foods[i]=food;else window.NutritionHelper.foods.push(food)});
  }
  function openCustomFood(prefill=''){
    $('#customFoodForm').reset();$('#customFoodForm').dataset.source='manual';$('#customFoodForm').dataset.desrotulandoProductId='';$('#customFoodId').value='';$('#customFoodName').value=prefill||'';$('#customFoodRefQty').value=100;$('#customFoodUnit').value='g';$('#customFoodQuality').value=3;$('#customFoodScore').value='';$('#customFoodScoreSource').value='manual';$('#onlineFoodStatus').textContent='A busca nutricional usa Open Food Facts. A consulta ao Desrotulando é experimental e pode deixar de funcionar.';$('#customFoodDialog').showModal();setTimeout(()=>$('#customFoodName').focus(),80);
  }
  function openFoodProduct(product){
    const n=product?.nutriments||{},name=(product.product_name||'').trim(),brand=(product.brands||'').split(',')[0]?.trim();
    if(!name)throw new Error('Produto sem nome');
    const kcal=Number(n['energy-kcal_100g']??(Number(n.energy_100g)?Number(n.energy_100g)/4.184:NaN));
    if(!Number.isFinite(kcal))throw new Error('Produto sem dados nutricionais por 100 g');
    $('#customFoodName').value=brand&&!name.toLowerCase().includes(brand.toLowerCase())?name+' — '+brand:name;
    $('#customFoodBarcode').value=product.code||$('#customFoodBarcode').value;
    $('#customFoodRefQty').value=100;$('#customFoodUnit').value='g';$('#customFoodCalories').value=Math.round(kcal);$('#customFoodProtein').value=Number(n.proteins_100g||0).toFixed(1);$('#customFoodCarbs').value=Number(n.carbohydrates_100g||0).toFixed(1);$('#customFoodFat').value=Number(n.fat_100g||0).toFixed(1);$('#onlineFoodStatus').textContent='Dados encontrados no Open Food Facts. Revise o rótulo antes de salvar.';
    $('#customFoodForm').dataset.source='openfoodfacts';
  }
  async function lookupBarcode(){
    const code=$('#customFoodBarcode').value.replace(/\D/g,'');if(!code){toast('Digite o código de barras');return}
    $('#onlineFoodStatus').textContent='Buscando produto...';
    try{const r=await fetch('https://world.openfoodfacts.org/api/v2/product/'+encodeURIComponent(code)+'.json?fields=code,product_name,brands,nutriments',{cache:'no-store'});if(!r.ok)throw new Error();const data=await r.json();if(!data.product)throw new Error();openFoodProduct(data.product)}
    catch{$('#onlineFoodStatus').textContent='Produto não encontrado ou sem dados suficientes. Você pode preencher manualmente.'}
  }
  async function lookupFoodName(){
    const q=$('#customFoodName').value.trim();if(q.length<2){toast('Digite o nome do alimento');return}
    $('#onlineFoodStatus').textContent='Buscando pelo nome...';
    try{const url='https://world.openfoodfacts.org/cgi/search.pl?search_terms='+encodeURIComponent(q)+'&search_simple=1&action=process&json=1&page_size=8&fields=code,product_name,brands,nutriments';const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error();const data=await r.json();const product=(data.products||[]).find(p=>p.product_name&&p.nutriments&&(p.nutriments['energy-kcal_100g']||p.nutriments.energy_100g));if(!product)throw new Error();openFoodProduct(product);$('#onlineFoodStatus').textContent='Encontrei um resultado por nome no Open Food Facts. Pode ser um produto industrializado com nome parecido; confira antes de salvar.'}
    catch{$('#onlineFoodStatus').textContent='Nenhum resultado confiável encontrado. Para receitas como bolo de fubá, os valores variam com a receita; preencha manualmente ou pelo rótulo.'}
  }
  function qualityFromFoodScore(score){
    const value=Math.max(1,Math.min(100,Number(score)||0));
    return Math.max(1,Math.min(5,Math.ceil(value/20)));
  }
  function findFoodScore(value,depth=0){
    if(depth>5||value==null)return null;
    if(Array.isArray(value)){for(const item of value){const found=findFoodScore(item,depth+1);if(found)return found}return null}
    if(typeof value!=='object')return null;
    for(const key of ['product_score','food_score','foodScore','foodscore']){
      const n=Number(value[key]);
      if(Number.isFinite(n)&&n>=1&&n<=100)return n;
      if(value[key]&&typeof value[key]==='object'){
        const nested=Number(value[key].value??value[key].score??value[key].total);
        if(Number.isFinite(nested)&&nested>=1&&nested<=100)return nested;
      }
    }
    if(Object.prototype.hasOwnProperty.call(value,'score')){
      const n=Number(value.score);
      if(Number.isFinite(n)&&n>=1&&n<=100)return n;
    }
    for(const child of Object.values(value)){const found=findFoodScore(child,depth+1);if(found)return found}
    return null;
  }
  function applyFoodScore(score,source='Desrotulando (experimental)'){
    const normalized=Math.max(1,Math.min(100,Math.round(Number(score)/5)*5||Number(score)));
    if(!Number.isFinite(normalized))return false;
    $('#customFoodScore').value=normalized;
    $('#customFoodScoreSource').value=source;
    $('#customFoodQuality').value=qualityFromFoodScore(normalized);
    return true;
  }
  function decodeDesrotulandoProductId(link){
    try{
      const url=new URL(link.trim());
      if(url.hostname!=='deeplink.desrotulando.com')return null;
      const parts=url.pathname.split('/').filter(Boolean);
      const raw=parts[parts.length-1]||'';
      if(/^[a-f0-9]{24}$/i.test(raw))return raw.toLowerCase();
      const normalized=raw.replace(/-/g,'+').replace(/_/g,'/');
      const padded=normalized+'='.repeat((4-normalized.length%4)%4);
      const decoded=atob(padded).trim();
      return /^[a-f0-9]{24}$/i.test(decoded)?decoded.toLowerCase():null;
    }catch{return null}
  }
  async function lookupDesrotulandoByProductId(productId){
    const base='https://api.desrotulando.com/prod';
    const urls=[
      base+'/products/'+encodeURIComponent(productId),
      base+'/product/'+encodeURIComponent(productId),
      base+'/product?id='+encodeURIComponent(productId)
    ];
    let blocked=false,lastStatus=0;
    for(const url of urls){
      try{
        const r=await fetch(url,{method:'GET',cache:'no-store',mode:'cors',credentials:'omit',headers:{Accept:'application/json'}});
        lastStatus=r.status;
        if(r.status===401||r.status===403){blocked=true;break}
        if(!r.ok)continue;
        const data=await r.json();
        const score=findFoodScore(data);
        if(score){
          applyFoodScore(score);
          $('#customFoodForm').dataset.scoreSource='desrotulando';
          $('#onlineFoodStatus').textContent='Produto identificado pelo link e FoodScore encontrado: '+$('#customFoodScore').value+'/100. Confira antes de salvar.';
          return true;
        }
      }catch{}
    }
    $('#customFoodScoreSource').value='manual';
    $('#onlineFoodStatus').textContent=blocked||lastStatus===403
      ?'O link foi reconhecido e o produto foi identificado, mas o Desrotulando bloqueou a leitura dos dados sem autenticação. Você ainda pode informar o FoodScore manualmente.'
      :'O link foi reconhecido, mas não consegui obter os dados desse produto agora.';
    return false;
  }
  async function lookupDesrotulandoLink(){
    const link=$('#customFoodDesrotulandoUrl').value.trim();
    if(!link){toast('Cole o link compartilhado do Desrotulando');return}
    const productId=decodeDesrotulandoProductId(link);
    if(!productId){$('#onlineFoodStatus').textContent='Não reconheci um identificador de produto nesse link do Desrotulando.';return}
    $('#customFoodForm').dataset.desrotulandoProductId=productId;
    $('#onlineFoodStatus').textContent='Link reconhecido. Produto identificado; tentando obter o FoodScore...';
    await lookupDesrotulandoByProductId(productId);
  }

  async function lookupDesrotulando(){
    const code=$('#customFoodBarcode').value.replace(/\D/g,'');
    if(!code){toast('Digite o código de barras para consultar o Desrotulando');return}
    $('#onlineFoodStatus').textContent='Consultando o Desrotulando de forma experimental...';
    const base='https://api.desrotulando.com/prod';
    const urls=[
      base+'/product?ean='+encodeURIComponent(code),
      base+'/product/'+encodeURIComponent(code),
      base+'/search?ean='+encodeURIComponent(code)
    ];
    let blocked=false,lastStatus=0;
    for(const url of urls){
      try{
        const r=await fetch(url,{method:'GET',cache:'no-store',mode:'cors',credentials:'omit',headers:{Accept:'application/json'}});
        lastStatus=r.status;
        if(r.status===401||r.status===403){blocked=true;break}
        if(!r.ok)continue;
        const data=await r.json();
        const score=findFoodScore(data);
        if(score){
          applyFoodScore(score);
          $('#customFoodForm').dataset.scoreSource='desrotulando';
          $('#onlineFoodStatus').textContent='FoodScore encontrado no Desrotulando: '+$('#customFoodScore').value+'/100. A qualidade 1–5 foi preenchida automaticamente; confira antes de salvar.';
          return;
        }
      }catch{}
    }
    $('#customFoodScoreSource').value='manual';
    $('#onlineFoodStatus').textContent=blocked||lastStatus===403
      ?'O Desrotulando bloqueou a consulta direta sem autenticação. A integração experimental ficou disponível, mas neste momento você precisa informar o FoodScore manualmente; a busca nutricional pelo Open Food Facts continua funcionando.'
      :'Não consegui obter o FoodScore agora. Você pode tentar novamente ou informar a nota manualmente.';
  }

  function deleteCustomFood(id){
    const food=customFoods.find(f=>f.id===id);if(!food||!confirm('Excluir "'+food.name+'" do banco personalizado?'))return;customFoods=customFoods.filter(f=>f.id!==id);const i=window.NutritionHelper?.foods.findIndex(f=>f.id===id)??-1;if(i>=0)window.NutritionHelper.foods.splice(i,1);persist();render();toast('Alimento personalizado excluído');
  }

  function watchFor(date=currentDate()){return {...{activeCalories:0,basalCalories:0,exerciseMinutes:0,standHours:0,steps:0,distanceKm:0,restingHeartRate:0,currentHeartRate:0,sleepHours:0},...(watchLogs[date]||{})}}
  function renderWatch(){const w=watchFor(),has=Object.values(w).some(v=>num(v)>0),total=num(w.activeCalories)+num(w.basalCalories);$('#watchStatus').textContent=has?'Dados salvos':'Não conectado';$('#watchStatus').classList.toggle('ok',has);$('#watchActive').textContent=fmt(w.activeCalories);$('#watchBasal').textContent=fmt(w.basalCalories);$('#watchTotal').textContent=fmt(total);$('#moveValue').textContent=fmt(w.activeCalories);$('#moveGoal').textContent=fmt(settings.moveGoal);setActivity('move',w.activeCalories,settings.moveGoal);$('#exerciseValue').textContent=fmt(w.exerciseMinutes);$('#exerciseGoal').textContent=fmt(settings.exerciseGoal);setActivity('exercise',w.exerciseMinutes,settings.exerciseGoal);$('#standValue').textContent=fmt(w.standHours);$('#standGoal').textContent=fmt(settings.standGoal);setActivity('stand',w.standHours,settings.standGoal);$('#stepsValue').textContent=fmt(w.steps);$('#distanceValue').textContent=`${fmt(w.distanceKm,2)} km percorridos`;$('#heartValue').textContent=fmt(w.restingHeartRate);$('#heartCurrent').textContent=`Repouso • Atual: ${fmt(w.currentHeartRate)} bpm`;$('#sleepValue').textContent=fmt(w.sleepHours,1)}
  function setActivity(key,value,goal){const p=progress(value,goal);$(`#${key}Percent`).textContent=`${Math.round(p)}%`;$(`#${key}Progress`).style.width=`${p}%`}

  function sortedMeasurements(){return [...measurements].sort((a,b)=>a.date.localeCompare(b.date))}
  function renderMeasurements(){const list=sortedMeasurements(),initial=list[0],latest=list[list.length-1],delta=initial&&latest?num(latest.weight)-num(initial.weight):null;$('#initialWeight').textContent=initial?`${fmt(initial.weight,1)} kg`:'—';$('#latestWeight').textContent=latest?`${fmt(latest.weight,1)} kg`:'—';$('#weightGoalText').textContent=settings.weightGoal?`${fmt(settings.weightGoal,1)} kg`:'—';$('#totalWeightDelta').textContent=delta===null?'—':`${delta>0?'+':''}${fmt(delta,1)} kg`;$('#measurementCount').textContent=`${list.length} ${list.length===1?'pesagem registrada':'pesagens registradas'}`;$('#measurementRows').innerHTML=[...list].reverse().map((m,revIndex)=>{const chronologicalIndex=list.length-1-revIndex;const prev=chronologicalIndex>0?list[chronologicalIndex-1]:null;const d=prev?num(m.weight)-num(prev.weight):null;return `<tr><td><strong>${escapeHtml(m.date)}</strong></td><td><strong>${fmt(m.weight,1)} kg</strong>${d!==null?` <span class="${d<=0?'delta-down':''}">(${d>0?'+':''}${fmt(d,1)})</span>`:''}</td><td>${m.bodyFat?`${fmt(m.bodyFat,1)}%`:'—'}</td><td>${m.waist?`${fmt(m.waist,1)} cm`:'—'}</td><td><button class="link-btn" data-delete-measure="${m.id}">${icon('trash')}</button></td></tr>`}).join('')||'<tr><td colspan="5">Nenhuma medição registrada.</td></tr>';$$('[data-delete-measure]').forEach(b=>b.onclick=()=>deleteMeasurement(b.dataset.deleteMeasure));$('#backupMeasurementCount').textContent=`${list.length} ${list.length===1?'pesagem':'pesagens'}`}

  function renderBackup(){const days=new Set(entries.map(e=>e.date)).size;$('#daysMonitored').textContent=`${days} ${days===1?'registro':'registros'}`;if($('#customFoodCount'))$('#customFoodCount').textContent=`${customFoods.length} ${customFoods.length===1?'item':'itens'}`;$('#snapshotCount').textContent=`${snapshots.length} ${snapshots.length===1?'snapshot disponível':'snapshots disponíveis'}`;$('#snapshotList').innerHTML=snapshots.length?snapshots.map(s=>`<div class="snapshot-item"><div><strong>${escapeHtml(s.label||'Ponto de restauração')}</strong><small>${new Date(s.timestamp).toLocaleString('pt-BR')}</small></div><button class="btn" data-restore-snapshot="${s.id}">Restaurar versão</button></div>`).join(''):'<div class="meal-empty">Nenhum ponto de restauração criado.</div>';$$('[data-restore-snapshot]').forEach(b=>b.onclick=()=>restoreSnapshot(b.dataset.restoreSnapshot))}

  function renderSettings(){['calorieGoal','proteinGoal','carbsGoal','fatGoal','waterGoal','weightGoal'].forEach(k=>{const el=$(`#setting-${k}`);if(el&&document.activeElement!==el)el.value=settings[k]??''})}

  function renderAnalytics(){const days=dayList(analyticsPeriod),calories=days.map(d=>sumDay(d,'calories')),protein=days.map(d=>sumDay(d,'protein')),watch=days.map(d=>num(watchLogs[d]?.activeCalories));const observed=days.filter(d=>sumDay(d,'calories')>0);const avgC=observed.length?observed.reduce((s,d)=>s+sumDay(d,'calories'),0)/observed.length:0;const avgP=observed.length?observed.reduce((s,d)=>s+sumDay(d,'protein'),0)/observed.length:0;const observedWatch=days.filter(d=>num(watchLogs[d]?.activeCalories)>0);const avgW=observedWatch.length?observedWatch.reduce((s,d)=>s+num(watchLogs[d]?.activeCalories),0)/observedWatch.length:0;$('#avgCalories').innerHTML=`${fmt(avgC)} <small>kcal</small>`;$('#avgCaloriesGoal').textContent=`Meta: ${fmt(settings.calorieGoal)} kcal`;$('#avgProtein').innerHTML=`${fmt(avgP,1)} <small>g/dia</small>`;$('#avgProteinGoal').textContent=`Meta: ${fmt(settings.proteinGoal)}g`;$('#avgWatch').innerHTML=`${fmt(avgW)} <small>kcal/dia</small>`;const startDate=days[0],m=sortedMeasurements().filter(x=>x.date>=startDate&&x.date<=currentDate());const delta=m.length>1?num(m[m.length-1].weight)-num(m[0].weight):null;$('#weightDelta').textContent=delta===null?'—':`${delta>0?'+':''}${fmt(delta,1)} kg`;drawChart(days,calories,watch,settings.calorieGoal)}

  function drawChart(days,calories,watch,goal){const svg=$('#calorieChart');if(!svg)return;const W=720,H=360,L=56,R=14,T=18,B=36,plotW=W-L-R,plotH=H-T-B;const maxVal=Math.max(goal,500,...calories,...watch)*1.08;const x=i=>L+(days.length===1?plotW/2:i*plotW/(days.length-1));const y=v=>T+plotH-(num(v)/maxVal)*plotH;const pts=(arr)=>arr.map((v,i)=>[x(i),y(v)]);const smoothPath=(points)=>{if(!points.length)return'';let d=`M ${points[0][0]} ${points[0][1]}`;for(let i=1;i<points.length;i++){const p0=points[i-1],p1=points[i],mx=(p0[0]+p1[0])/2;d+=` C ${mx} ${p0[1]}, ${mx} ${p1[1]}, ${p1[0]} ${p1[1]}`}return d};const area=(path)=>`${path} L ${x(days.length-1)} ${T+plotH} L ${x(0)} ${T+plotH} Z`;const greenPath=smoothPath(pts(calories)),redPath=smoothPath(pts(watch));let grid='';for(let i=0;i<=4;i++){const val=maxVal*(4-i)/4,yy=T+plotH*i/4;grid+=`<line x1="${L}" y1="${yy}" x2="${W-R}" y2="${yy}" stroke="#dbe3ec" stroke-dasharray="6 7"/><text x="${L-10}" y="${yy+4}" text-anchor="end" fill="#6d7c93" font-size="13">${Math.round(val)}</text>`}const tickCount=Math.min(7,days.length),indexes=Array.from({length:tickCount},(_,i)=>Math.round(i*(days.length-1)/(tickCount-1||1)));const labels=indexes.map(i=>`<text x="${x(i)}" y="${H-10}" text-anchor="middle" fill="#697991" font-size="12">${days[i].slice(8,10)}/${days[i].slice(5,7)}</text>`).join('');const goalY=y(goal);svg.innerHTML=`<defs><linearGradient id="greenFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#16bd82" stop-opacity=".36"/><stop offset="70%" stop-color="#16bd82" stop-opacity=".11"/><stop offset="100%" stop-color="#16bd82" stop-opacity="0"/></linearGradient><linearGradient id="redFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f52f5e" stop-opacity=".25"/><stop offset="100%" stop-color="#f52f5e" stop-opacity="0"/></linearGradient><filter id="greenGlow" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="redGlow" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>${grid}<line x1="${L}" y1="${goalY}" x2="${W-R}" y2="${goalY}" stroke="#98a7bb" stroke-width="2" stroke-dasharray="8 8"/><path d="${area(greenPath)}" fill="url(#greenFill)"/><path d="${greenPath}" fill="none" stroke="#29b87d" stroke-width="3" filter="url(#greenGlow)"/><path d="${area(redPath)}" fill="url(#redFill)"/><path d="${redPath}" fill="none" stroke="#ef315d" stroke-width="3" filter="url(#redGlow)"/>${labels}`}

  function switchView(view){$$('.view').forEach(v=>{const active=v.id===`view-${view}`;v.classList.toggle('active',active);v.hidden=!active});$$('.tab').forEach(t=>{const active=t.dataset.view===view;t.classList.toggle('active',active);t.setAttribute('aria-selected',String(active))});if(view==='analytics')renderAnalytics();window.scrollTo({top:0,behavior:'smooth'})}

  function openNew(meal='Outro',foodId=''){ $('#entryForm').reset();$('#entryDialogTitle').textContent='Adicionar alimento';$('#entryId').value='';$('#entryDate').value=currentDate();$('#entryTime').value=nowTime();$('#meal').value=meal;$('#q3').checked=true;selectedFood=null;estimateSource='';renderSuggestions('');hidePreview();if(foodId){const food=window.NutritionHelper?.foods.find(f=>f.id===foodId);if(food)selectSuggestion(food)}$('#entryDialog').showModal();setTimeout(()=>$('#food').focus(),80)}
  function openEdit(id){const e=entries.find(x=>x.id===id);if(!e)return;$('#entryForm').reset();$('#entryDialogTitle').textContent='Editar alimento';$('#entryId').value=e.id;$('#entryDate').value=e.date;$('#entryTime').value=e.time;$('#meal').value=e.meal;$('#food').value=e.food;$('#amount').value=e.amount||'';$('#calories').value=e.calories;$('#protein').value=e.protein||'';$('#carbs').value=e.carbs||'';$('#fat').value=e.fat||'';$('#notes').value=e.notes||'';const q=$(`input[name="quality"][value="${e.quality||3}"]`);if(q)q.checked=true;estimateSource=e.estimateSource||'';selectedFood=window.NutritionHelper?.findBest(e.food)||null;renderSuggestions(e.food);updatePreview();$('#entryDialog').showModal()}
  function removeEntry(id){if(!confirm('Excluir este alimento do diário?'))return;entries=entries.filter(e=>e.id!==id);persist();render();toast('Registro excluído')}
  function renderSuggestions(query){const box=$('#foodSuggestions'),matches=window.NutritionHelper?.search(query,7)||[];if(!query.trim()){box.innerHTML='<div class="notice">Digite o nome do alimento para ver sugestões da base local.</div>';return}if(!matches.length){box.innerHTML='<div class="notice">Não encontrei esse alimento na base.</div><button type="button" class="btn" id="createMissingFood">Adicionar este alimento ao banco</button>';$('#createMissingFood').onclick=()=>openCustomFood(query.trim());return}box.innerHTML=matches.map(f=>{const s=window.NutritionHelper.estimate(f,'');return `<button type="button" class="suggestion ${selectedFood?.id===f.id?'selected':''}" data-food-id="${f.id}"><span><b>${escapeHtml(f.name)}</b><small>${escapeHtml(f.standard)}</small></span><strong>${fmt(s.calories)} kcal</strong></button>`}).join('');$$('[data-food-id]').forEach(b=>b.onclick=()=>{const f=window.NutritionHelper.foods.find(x=>x.id===b.dataset.foodId);selectSuggestion(f)})}
  function selectSuggestion(food){
    if(!food)return;
    selectedFood=food;
    $('#food').value=food.name;
    if(!$('#amount').value)$('#amount').value=food.standard;
    renderSuggestions(food.name);
    updatePreview();
    applySuggestion(true);
  }
  function hidePreview(){$('#nutritionPreview').hidden=true}
  function updatePreview(){
    if(!selectedFood){hidePreview();return}
    const amountText=$('#amount').value.trim();
    const e=window.NutritionHelper.estimate(selectedFood,amountText);
    if(!e){hidePreview();return}
    $('#nutritionPreview').hidden=false;
    $('#previewName').textContent=selectedFood.name;
    $('#previewServing').textContent=amountText&&e.usedDefault
      ?'Quantidade não reconhecida — use g, ml, unidade, fatia ou outra medida sugerida.'
      :e.usedDefault
        ?`Usando porção padrão: ${selectedFood.standard}`
        :`Calculado para: ${amountText}`;
    $('#previewCalories').textContent=fmt(e.calories);
    $('#previewProtein').textContent=fmt(e.protein,1);
    $('#previewCarbs').textContent=fmt(e.carbs,1);
    $('#previewFat').textContent=fmt(e.fat,1);
  }
  function applySuggestion(silent=false){
    if(!selectedFood)return false;
    const amountText=$('#amount').value.trim();
    const e=window.NutritionHelper.estimate(selectedFood,amountText);
    if(!e)return false;
    if(amountText&&e.usedDefault){
      if(estimateSource===selectedFood.id){
        $('#calories').value='';
        $('#protein').value='';
        $('#carbs').value='';
        $('#fat').value='';
      }
      estimateSource='';
      if(!silent)toast('Quantidade não reconhecida — ajuste a medida ou preencha manualmente');
      return false;
    }
    $('#calories').value=e.calories;
    $('#protein').value=e.protein;
    $('#carbs').value=e.carbs;
    $('#fat').value=e.fat;
    const q=$(`input[name="quality"][value="${e.quality}"]`);
    if(q)q.checked=true;
    estimateSource=selectedFood.id;
    if(!silent)toast('Valores recalculados pela base local');
    return true;
  }
  function updateWater(delta){const d=currentDate();waterLogs[d]=Math.max(0,num(waterLogs[d])+delta);persist();renderDiary()}

  function openWatchEditor(){const w=watchFor();$('#watch-active-input').value=w.activeCalories||'';$('#watch-basal-input').value=w.basalCalories||'';$('#watch-exercise-input').value=w.exerciseMinutes||'';$('#watch-stand-input').value=w.standHours||'';$('#watch-steps-input').value=w.steps||'';$('#watch-distance-input').value=w.distanceKm||'';$('#watch-resting-input').value=w.restingHeartRate||'';$('#watch-current-input').value=w.currentHeartRate||'';$('#watch-sleep-input').value=w.sleepHours||'';$('#watchDialog').showModal()}
  function openMeasurement(){const f=$('#measurementForm');f.reset();$('#measurementId').value='';$('#measurementDate').value=currentDate();$('#measurementDialog').showModal()}
  function deleteMeasurement(id){if(!confirm('Excluir esta medição?'))return;measurements=measurements.filter(m=>m.id!==id);persist();render();toast('Medição excluída')}
  function createSnapshot(){const label=$('#snapshotName').value.trim()||'Ponto de restauração';const data={entries,settings,waterLogs,watchLogs,measurements,customFoods};snapshots.unshift({id:uid(),label,timestamp:new Date().toISOString(),data:JSON.parse(JSON.stringify(data))});snapshots=snapshots.slice(0,20);$('#snapshotName').value='';persist();renderBackup();toast('Ponto de restauração criado')}
  function restoreSnapshot(id){const s=snapshots.find(x=>x.id===id);if(!s||!confirm(`Restaurar "${s.label}"? Os dados atuais serão substituídos.`))return;entries=s.data.entries||[];settings={...defaults,...(s.data.settings||{})};waterLogs=s.data.waterLogs||{};watchLogs=s.data.watchLogs||{};measurements=s.data.measurements||[];customFoods=s.data.customFoods||customFoods;syncCustomFoodsToHelper();persist();render();toast('Versão restaurada')}

  $('#entryForm').addEventListener('submit',ev=>{ev.preventDefault();const id=$('#entryId').value||uid(),entry={id,date:$('#entryDate').value,time:$('#entryTime').value,meal:$('#meal').value,food:$('#food').value.trim(),amount:$('#amount').value.trim(),calories:num($('#calories').value),quality:num($('input[name="quality"]:checked')?.value||3),protein:num($('#protein').value),carbs:num($('#carbs').value),fat:num($('#fat').value),notes:$('#notes').value.trim(),estimateSource,updatedAt:new Date().toISOString()};const i=entries.findIndex(e=>e.id===id);if(i>=0)entries[i]=entry;else entries.push(entry);persist();$('#selectedDate').value=entry.date;$('#entryDialog').close();switchView('diary');render();toast(i>=0?'Registro atualizado':'Alimento adicionado')});
  $('#watchForm').addEventListener('submit',ev=>{ev.preventDefault();watchLogs[currentDate()]={activeCalories:num($('#watch-active-input').value),basalCalories:num($('#watch-basal-input').value),exerciseMinutes:num($('#watch-exercise-input').value),standHours:num($('#watch-stand-input').value),steps:num($('#watch-steps-input').value),distanceKm:num($('#watch-distance-input').value),restingHeartRate:num($('#watch-resting-input').value),currentHeartRate:num($('#watch-current-input').value),sleepHours:num($('#watch-sleep-input').value),updatedAt:new Date().toISOString()};persist();$('#watchDialog').close();render();toast('Dados de atividade salvos')});
  $('#customFoodForm').addEventListener('submit',ev=>{ev.preventDefault();const name=$('#customFoodName').value.trim(),refQty=Math.max(.1,num($('#customFoodRefQty').value)),unit=$('#customFoodUnit').value==='ml'?'ml':'g',factor=100/refQty,id=$('#customFoodId').value||'custom-'+uid();const foodScoreRaw=num($('#customFoodScore').value),food={id,name,aliases:[name],kcal:num($('#customFoodCalories').value)*factor,protein:num($('#customFoodProtein').value)*factor,carbs:num($('#customFoodCarbs').value)*factor,fat:num($('#customFoodFat').value)*factor,quality:num($('#customFoodQuality').value)||3,standard:refQty+' '+unit,baseUnit:unit,units:{},custom:true,barcode:$('#customFoodBarcode').value.replace(/\D/g,''),source:$('#customFoodForm').dataset.source||'manual',foodScore:foodScoreRaw>=1&&foodScoreRaw<=100?foodScoreRaw:null,scoreSource:foodScoreRaw>=1&&foodScoreRaw<=100?($('#customFoodScoreSource').value||'manual'):null,desrotulandoUrl:$('#customFoodDesrotulandoUrl').value.trim()||null,desrotulandoProductId:$('#customFoodForm').dataset.desrotulandoProductId||null};const same=customFoods.findIndex(f=>window.NutritionHelper.normalize(f.name)===window.NutritionHelper.normalize(name));if(same>=0){food.id=customFoods[same].id;customFoods[same]=food}else customFoods.push(food);syncCustomFoodsToHelper();persist();$('#customFoodDialog').close();render();if($('#entryDialog').open){selectedFood=food;selectSuggestion(food)}toast(same>=0?'Alimento personalizado atualizado':'Alimento adicionado ao banco')});

  $('#measurementForm').addEventListener('submit',ev=>{ev.preventDefault();const date=$('#measurementDate').value;const existing=measurements.find(m=>m.date===date);const item={id:existing?.id||uid(),date,weight:num($('#measurementWeight').value),bodyFat:num($('#measurementFat').value),waist:num($('#measurementWaist').value)};measurements=measurements.filter(m=>m.id!==item.id&&m.date!==date);measurements.push(item);persist();$('#measurementDialog').close();render();toast('Medição salva')});

  $('#food').addEventListener('input',()=>{selectedFood=null;estimateSource='';renderSuggestions($('#food').value);updatePreview()});
  $('#amount').addEventListener('input',()=>{updatePreview();if(selectedFood)applySuggestion(true)});
  $('#applySuggestion').onclick=()=>applySuggestion(false);
  ['calories','protein','carbs','fat'].forEach(id=>$('#'+id).addEventListener('input',()=>{estimateSource=''}));
  $('#catalogSearch').addEventListener('input',renderCatalog);
  $('#selectedDate').onchange=render;$('#prevDay').onclick=()=>shiftDay(-1);$('#nextDay').onclick=()=>shiftDay(1);function shiftDay(delta){const d=new Date(currentDate()+'T12:00:00');d.setDate(d.getDate()+delta);$('#selectedDate').value=d.toLocaleDateString('en-CA');render()}$('#goToday').onclick=()=>{$('#selectedDate').value=today();render()};$('#prettyDate').onclick=()=>{try{$('#selectedDate').showPicker()}catch{$('#selectedDate').click()}};
  $$('.tab').forEach(t=>t.onclick=()=>switchView(t.dataset.view));$$('[data-view-jump]').forEach(b=>b.onclick=()=>switchView(b.dataset.viewJump));
  $$('.period-pills button').forEach(b=>b.onclick=()=>{analyticsPeriod=num(b.dataset.period);$$('.period-pills button').forEach(x=>x.classList.toggle('active',x===b));renderAnalytics()});
  $('#waterMinus').onclick=()=>updateWater(-250);$('#water250').onclick=()=>updateWater(250);$('#water500').onclick=()=>updateWater(500);$('#heroGoals').onclick=()=>switchView('backup');$('#editWatch').onclick=openWatchEditor;$('#newMeasurement').onclick=openMeasurement;$('#saveSnapshot').onclick=createSnapshot;
  $('#scanPlaceholder').onclick=()=>openCustomFood($('#catalogSearch').value.trim());$('#createFoodPlaceholder').onclick=()=>openCustomFood($('#catalogSearch').value.trim());$('#lookupBarcode').onclick=lookupBarcode;$('#lookupFoodName').onclick=lookupFoodName;$('#lookupDesrotulandoLink').onclick=lookupDesrotulandoLink;$('#lookupDesrotulando').onclick=lookupDesrotulando;$('#customFoodScore').addEventListener('input',()=>{const score=num($('#customFoodScore').value);$('#customFoodScoreSource').value='manual';if(score>=1&&score<=100)$('#customFoodQuality').value=qualityFromFoodScore(score)});
  $('#saveGoals').onclick=()=>{settings={...settings,calorieGoal:num($('#setting-calorieGoal').value),proteinGoal:num($('#setting-proteinGoal').value),carbsGoal:num($('#setting-carbsGoal').value),fatGoal:num($('#setting-fatGoal').value),waterGoal:num($('#setting-waterGoal').value),weightGoal:num($('#setting-weightGoal').value)};persist();render();toast('Metas salvas')};
  $('#exportBtn').onclick=()=>{const payload=createBackupPayload();const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);const prefix=payload.sourceChannel==='beta'?'nutritrack-beta-backup':'nutritrack-backup';a.download=prefix+'-'+today()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)};$('#importBtn').onclick=()=>$('#importFile').click();$('#importFile').onchange=async ev=>{const file=ev.target.files?.[0];if(!file)return;try{const data=JSON.parse(await file.text()),backup=normalizeBackupPayload(data),newer=backup.schemaVersion>BACKUP_SCHEMA_VERSION;const warning=newer?'\n\nEste backup usa um formato mais novo. Serão importados os campos compatíveis; dados adicionais que esta versão ainda não conhece serão ignorados.':'';if(!confirm(`Importar ${backup.entries.length} registros e substituir os dados atuais?${warning}`))return;entries=backup.entries;settings={...defaults,...backup.settings};waterLogs=backup.waterLogs;watchLogs=backup.watchLogs;measurements=backup.measurements;snapshots=backup.snapshots??snapshots;customFoods=backup.customFoods||[];syncCustomFoodsToHelper();persist();render();toast(newer?'Backup compatível restaurado':'Backup restaurado')}catch{alert('Não foi possível importar este arquivo.')}ev.target.value=''};
  $('#clearBtn').onclick=()=>{if(!confirm('Apagar registros, hidratação, atividade, medidas e ajustes deste aparelho?'))return;entries=[];waterLogs={};watchLogs={};measurements=[];snapshots=[];customFoods=[];settings={...defaults};syncCustomFoodsToHelper();persist();render();toast('Dados apagados')};$$('[data-close]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.close).close());

  $('#selectedDate').value=today();renderReleaseVersion();render();switchView('diary');if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();
