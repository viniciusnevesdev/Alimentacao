(()=>{
  const keyMap={
    'alimentacao-registros-v1':'alimentacao-beta-registros-v1',
    'alimentacao-ajustes-v1':'alimentacao-beta-ajustes-v1',
    'alimentacao-hidratacao-v1':'alimentacao-beta-hidratacao-v1',
    'alimentacao-watch-v1':'alimentacao-beta-watch-v1',
    'alimentacao-medidas-v1':'alimentacao-beta-medidas-v1',
    'alimentacao-snapshots-v1':'alimentacao-beta-snapshots-v1',
    'alimentacao-custom-foods-v1':'alimentacao-beta-custom-foods-v1'
  };
  const mapKey=key=>keyMap[key]||key;
  const proto=Storage.prototype;
  const originalGet=proto.getItem;
  const originalSet=proto.setItem;
  const originalRemove=proto.removeItem;
  proto.getItem=function(key){return originalGet.call(this,mapKey(key));};
  proto.setItem=function(key,value){return originalSet.call(this,mapKey(key),value);};
  proto.removeItem=function(key){return originalRemove.call(this,mapKey(key));};

  document.documentElement.dataset.channel='beta';
  document.title='NutriTrack Beta';
  const badge=document.querySelector('.badge');
  if(badge) badge.textContent='PRO · BETA';

  const closeIcon='<svg aria-hidden="true" focusable="false" viewBox="0 0 20.7578 20.3672"><path d="M20.3516 10.1797C20.3516 15.7812 15.7812 20.3516 10.1719 20.3516C4.57031 20.3516 0 15.7812 0 10.1797C0 4.57031 4.57031 0 10.1719 0C15.7812 0 20.3516 4.57031 20.3516 10.1797ZM13.25 6.125L10.1819 9.17967L7.11719 6.125C6.96875 5.98438 6.80469 5.91406 6.60938 5.91406C6.20312 5.91406 5.88281 6.21875 5.88281 6.60938C5.88281 6.8125 5.96094 6.99219 6.10156 7.13281L9.16294 10.1942L6.10156 13.2422C5.96094 13.3906 5.88281 13.5625 5.88281 13.7578C5.88281 14.1562 6.20312 14.4766 6.60938 14.4766C6.8125 14.4766 6.98438 14.3984 7.13281 14.2578L10.1797 11.2109L13.2266 14.2578C13.3672 14.3984 13.5391 14.4766 13.75 14.4766C14.1484 14.4766 14.4688 14.1562 14.4688 13.7578C14.4688 13.5625 14.3984 13.3906 14.2578 13.2422L11.1981 10.1925L14.2578 7.13281C14.3984 6.99219 14.4688 6.8125 14.4688 6.60938C14.4688 6.21875 14.1484 5.91406 13.75 5.91406C13.5547 5.91406 13.3828 5.98438 13.25 6.125Z" fill="currentColor" fill-opacity=".85"/></svg>';
  document.querySelectorAll('.close-btn').forEach(button=>{
    button.innerHTML=closeIcon;
    button.setAttribute('aria-label','Fechar');
  });
  document.querySelector('#entryDialog .modal-head p')?.remove();

  const topActions=document.querySelector('.top-actions');
  if(topActions&&!document.getElementById('entryEditorShortcut')){
    const editorLink=document.createElement('a');
    editorLink.id='entryEditorShortcut';
    editorLink.className='square-action';
    editorLink.href='./editor.html';
    editorLink.setAttribute('aria-label','Abrir editor da janela Adicionar alimento');
    editorLink.title='Editor de Adicionar alimento';
    editorLink.textContent='✎';
    topActions.prepend(editorLink);
  }

  const script=document.createElement('script');
  script.src='./base-app.js?v=13';
  script.onload=()=>{};
  script.onerror=()=>alert('Não foi possível iniciar a versão Beta.');
  document.body.appendChild(script);
})();
