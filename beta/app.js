(()=>{
  const keyMap={
    'alimentacao-registros-v1':'alimentacao-beta-registros-v1',
    'alimentacao-ajustes-v1':'alimentacao-beta-ajustes-v1',
    'alimentacao-hidratacao-v1':'alimentacao-beta-hidratacao-v1',
    'alimentacao-watch-v1':'alimentacao-beta-watch-v1',
    'alimentacao-medidas-v1':'alimentacao-beta-medidas-v1',
    'alimentacao-snapshots-v1':'alimentacao-beta-snapshots-v1'
  };
  const mapKey=key=>keyMap[key]||key;
  const proto=Storage.prototype;
  const originalGet=proto.getItem;
  const originalSet=proto.setItem;
  const originalRemove=proto.removeItem;
  proto.getItem=function(key){return originalGet.call(this,mapKey(key));};
  proto.setItem=function(key,value){return originalSet.call(this,mapKey(key),value);};
  proto.removeItem=function(key){return originalRemove.call(this,mapKey(key));};

  document.title='NutriTrack Beta';
  const badge=document.querySelector('.badge');
  if(badge) badge.textContent='PRO · BETA';

  const script=document.createElement('script');
  script.src='./base-app.js?v=7';
  script.onload=()=>{document.documentElement.dataset.channel='beta';};
  script.onerror=()=>alert('Não foi possível iniciar a versão Beta.');
  document.body.appendChild(script);
})();
