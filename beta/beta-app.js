(()=>{
  const replacements={
    "'alimentacao-registros-v1'":"'alimentacao-beta-registros-v1'",
    "'alimentacao-ajustes-v1'":"'alimentacao-beta-ajustes-v1'",
    "'alimentacao-hidratacao-v1'":"'alimentacao-beta-hidratacao-v1'",
    "'alimentacao-watch-v1'":"'alimentacao-beta-watch-v1'",
    "'alimentacao-medidas-v1'":"'alimentacao-beta-medidas-v1'",
    "'alimentacao-snapshots-v1'":"'alimentacao-beta-snapshots-v1'"
  };
  fetch('./base-app.js',{cache:'no-store'})
    .then(r=>{if(!r.ok)throw new Error('Falha ao carregar base-app.js');return r.text()})
    .then(code=>{
      for(const [from,to] of Object.entries(replacements)) code=code.split(from).join(to);
      code=code.replace("a.download=`nutritrack-backup-${today()}.json`","a.download=`nutritrack-beta-backup-${today()}.json`");
      (0,eval)(code);
      document.documentElement.dataset.channel='beta';
    })
    .catch(err=>{console.error('[NutriTrack Beta]',err);alert('Não foi possível iniciar a versão Beta.');});
})();