(()=>{
  'use strict';
  const STORAGE='nutritrack-beta-entry-editor-v2';
  const preview=document.getElementById('previewRoot');
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const deepCopy=o=>JSON.parse(JSON.stringify(o));
  const baseConfig=()=>({schemaVersion:2,editor:'adicionar-alimento',styles:{},hidden:{},orders:{}});
  let config=baseConfig();
  let selected=null;
  const originalStyle=new Map();

  function allTargets(){return qa('[data-editor-id]',preview)}
  allTargets().forEach(el=>originalStyle.set(el.dataset.editorId,el.getAttribute('style')||''));

  function load(){
    try{const raw=localStorage.getItem(STORAGE);if(raw){const parsed=JSON.parse(raw);if(parsed&&parsed.schemaVersion===2&&parsed.styles&&parsed.hidden&&parsed.orders)config=parsed}}catch{}
  }
  function save(){localStorage.setItem(STORAGE,JSON.stringify(config))}
  function cssId(id){return '[data-editor-id="'+CSS.escape(id)+'"]'}
  function target(id){return q(cssId(id),preview)}
  function numeric(v){const n=Number(v);return Number.isFinite(n)?n:null}
  function applyStyle(el,key,value){if(value===null||value===undefined||value==='')el.style.removeProperty(key);else el.style.setProperty(key,value)}
  function styleFor(id){return config.styles[id]||(config.styles[id]={})}

  function applyOne(id){
    const el=target(id);if(!el)return;
    const s=config.styles[id]||{};
    el.classList.toggle('editor-hidden',!!config.hidden[id]);
    applyStyle(el,'width',s.width!=null?s.width+'%':null);
    applyStyle(el,'height',s.height!=null&&s.height!==''?s.height+'px':null);
    applyStyle(el,'font-size',s.fontSize!=null?s.fontSize+'px':null);
    applyStyle(el,'font-weight',s.fontWeight!=null?String(s.fontWeight):null);
    applyStyle(el,'text-align',s.textAlign||null);
    applyStyle(el,'padding-left',s.paddingX!=null?s.paddingX+'px':null);applyStyle(el,'padding-right',s.paddingX!=null?s.paddingX+'px':null);
    applyStyle(el,'padding-top',s.paddingY!=null?s.paddingY+'px':null);applyStyle(el,'padding-bottom',s.paddingY!=null?s.paddingY+'px':null);
    applyStyle(el,'margin-top',s.marginTop!=null?s.marginTop+'px':null);applyStyle(el,'margin-bottom',s.marginBottom!=null?s.marginBottom+'px':null);
    applyStyle(el,'border-radius',s.radius!=null?s.radius+'px':null);applyStyle(el,'gap',s.gap!=null?s.gap+'px':null);
    if(s.position==='center'){el.style.marginLeft='auto';el.style.marginRight='auto'}
    else if(s.position==='right'){el.style.marginLeft='auto';el.style.marginRight='0'}
    else if(s.position==='left'){el.style.marginLeft='0';el.style.marginRight='auto'}
    else{el.style.removeProperty('margin-left');el.style.removeProperty('margin-right')}
  }
  function applyOrders(){
    Object.entries(config.orders||{}).forEach(([parentId,ids])=>{
      const parent=target(parentId);if(!parent||!Array.isArray(ids))return;
      ids.forEach(id=>{const child=target(id);if(child&&child.parentElement===parent)parent.appendChild(child)})
    })
  }
  function applyAll(){applyOrders();allTargets().forEach(el=>applyOne(el.dataset.editorId))}
  function captureOrder(parent){
    if(!parent?.dataset.editorId)return;
    config.orders[parent.dataset.editorId]=Array.from(parent.children).filter(x=>x.dataset?.editorId).map(x=>x.dataset.editorId);
  }
  function populatePicker(){
    const picker=q('#elementPicker');picker.innerHTML='';
    allTargets().forEach(el=>{const o=document.createElement('option');o.value=el.dataset.editorId;o.textContent=el.dataset.editorName||el.dataset.editorId;picker.appendChild(o)})
  }
  function selectById(id){const el=target(id);if(el)select(el)}
  function select(el){
    if(!el)return;allTargets().forEach(x=>x.classList.remove('editor-selected'));selected=el;
    if(!config.hidden[selected.dataset.editorId])selected.classList.add('editor-selected');
    q('#selectedName').textContent=selected.dataset.editorName||selected.dataset.editorId;q('#selectedId').textContent=selected.dataset.editorId;
    q('#elementPicker').value=selected.dataset.editorId;syncInspector();
  }
  function computed(){return selected?getComputedStyle(selected):null}
  function px(v){const n=parseFloat(v);return Number.isFinite(n)?Math.round(n):0}
  function own(id){return config.styles[id]||{}}
  function syncInspector(){
    if(!selected)return;const id=selected.dataset.editorId,cs=computed(),s=own(id),rect=selected.getBoundingClientRect(),pRect=selected.parentElement?.getBoundingClientRect();
    q('#metrics').textContent='Atual: '+Math.round(rect.width)+' × '+Math.round(rect.height)+' px · pai: '+(pRect?Math.round(pRect.width):'—')+' px';
    q('#widthInput').value=s.width!=null?s.width:'';q('#heightInput').value=s.height!=null?s.height:'';q('#fontSizeInput').value=s.fontSize!=null?s.fontSize:px(cs.fontSize);q('#fontWeightInput').value=s.fontWeight!=null?s.fontWeight:parseInt(cs.fontWeight)||400;
    q('#paddingXInput').value=s.paddingX!=null?s.paddingX:px(cs.paddingLeft);q('#paddingYInput').value=s.paddingY!=null?s.paddingY:px(cs.paddingTop);q('#marginTopInput').value=s.marginTop!=null?s.marginTop:px(cs.marginTop);q('#marginBottomInput').value=s.marginBottom!=null?s.marginBottom:px(cs.marginBottom);q('#radiusInput').value=s.radius!=null?s.radius:px(cs.borderRadius);q('#gapInput').value=s.gap!=null?s.gap:px(cs.gap);
    qa('#alignSeg button').forEach(b=>b.classList.toggle('active',b.dataset.value===(s.textAlign||cs.textAlign||'left')));qa('#positionSeg button').forEach(b=>b.classList.toggle('active',b.dataset.value===(s.position||'left')));
    const movable=selected.dataset.editorMovable==='true';q('#moveUpBtn').disabled=!movable;q('#moveDownBtn').disabled=!movable;q('#toggleHiddenBtn').textContent=config.hidden[id]?'Restaurar visibilidade':'Excluir / ocultar';
  }
  function mutate(prop,value){if(!selected)return;const id=selected.dataset.editorId;styleFor(id)[prop]=value;applyOne(id);save();syncInspector()}

  preview.addEventListener('click',e=>{const el=e.target.closest('[data-editor-id]');if(!el||!preview.contains(el))return;e.preventDefault();e.stopPropagation();select(el)},true);
  preview.addEventListener('submit',e=>e.preventDefault(),true);
  q('#elementPicker').addEventListener('change',e=>selectById(e.target.value));

  const fields={widthInput:'width',heightInput:'height',fontSizeInput:'fontSize',fontWeightInput:'fontWeight',paddingXInput:'paddingX',paddingYInput:'paddingY',marginTopInput:'marginTop',marginBottomInput:'marginBottom',radiusInput:'radius',gapInput:'gap'};
  Object.entries(fields).forEach(([id,prop])=>q('#'+id).addEventListener('change',e=>{const v=e.target.value.trim();mutate(prop,v===''?null:numeric(v))}));
  qa('#alignSeg button').forEach(b=>b.addEventListener('click',()=>mutate('textAlign',b.dataset.value)));qa('#positionSeg button').forEach(b=>b.addEventListener('click',()=>mutate('position',b.dataset.value)));

  function move(direction){
    if(!selected||selected.dataset.editorMovable!=='true')return;const parent=selected.parentElement;if(!parent)return;
    const items=Array.from(parent.children).filter(x=>x.dataset?.editorId&&x.dataset.editorMovable==='true');const i=items.indexOf(selected);const j=i+direction;if(i<0||j<0||j>=items.length)return;
    if(direction<0)parent.insertBefore(selected,items[j]);else parent.insertBefore(items[j],selected);captureOrder(parent);save();syncInspector();
  }
  q('#moveUpBtn').onclick=()=>move(-1);q('#moveDownBtn').onclick=()=>move(1);
  q('#toggleHiddenBtn').onclick=()=>{if(!selected)return;const id=selected.dataset.editorId;config.hidden[id]=!config.hidden[id];applyOne(id);save();syncInspector()};
  q('#resetSelectedBtn').onclick=()=>{if(!selected)return;const id=selected.dataset.editorId;delete config.styles[id];delete config.hidden[id];selected.setAttribute('style',originalStyle.get(id)||'');selected.classList.remove('editor-hidden');save();applyOne(id);syncInspector()};
  q('#resetAllBtn').onclick=()=>{if(!confirm('Restaurar todas as alterações deste editor?'))return;config=baseConfig();allTargets().forEach(el=>{el.setAttribute('style',originalStyle.get(el.dataset.editorId)||'');el.classList.remove('editor-hidden','editor-selected')});save();applyAll();populatePicker();selectById('caloriesField')};

  function payload(){return {schemaVersion:2,editor:'adicionar-alimento',source:'NutriTrack Beta',exportedAt:new Date().toISOString(),styles:config.styles,hidden:config.hidden,orders:config.orders}}
  q('#exportBtn').onclick=()=>{const blob=new Blob([JSON.stringify(payload(),null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='nutritrack-editor-adicionar-alimento-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)};
  q('#copyBtn').onclick=async()=>{try{await navigator.clipboard.writeText(JSON.stringify(payload(),null,2));const b=q('#copyBtn');const t=b.textContent;b.textContent='Copiado ✓';setTimeout(()=>b.textContent=t,1100)}catch{alert('Não foi possível copiar. Use Exportar JSON.')}};
  q('#importBtn').onclick=()=>q('#importFile').click();q('#importFile').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{const data=JSON.parse(await file.text());if(data?.schemaVersion!==2||!data.styles||!data.hidden||!data.orders)throw new Error();config={schemaVersion:2,editor:'adicionar-alimento',styles:deepCopy(data.styles),hidden:deepCopy(data.hidden),orders:deepCopy(data.orders)};save();applyAll();populatePicker();selectById('caloriesField')}catch{alert('Este JSON não é compatível com a versão 2 do editor.')}e.target.value=''};

  window.addEventListener('error',e=>{console.error('[Editor]',e.error||e.message)});window.addEventListener('unhandledrejection',e=>console.error('[Editor Promise]',e.reason));
  load();applyAll();populatePicker();selectById('caloriesField');
})();
