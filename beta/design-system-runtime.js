(()=>{
  const STORAGE_KEY='prato-beta-design-system-v1';

  function readConfig(){
    try{
      const raw=localStorage.getItem(STORAGE_KEY);
      if(!raw) return null;
      const parsed=JSON.parse(raw);
      return parsed&&parsed.overrides&&typeof parsed.overrides==='object'?parsed:null;
    }catch(error){
      console.warn('[Prato Beta Design System] configuração inválida',error);
      return null;
    }
  }

  const rules={
    'card.radius':v=>`.card{border-radius:${v}px!important}`,
    'card.borderWidth':v=>`.card{border-width:${v}px!important}`,
    'card.shadowY':v=>`.card{box-shadow:0 ${v}px var(--ds-card-shadow-blur,22px) rgba(15,23,42,var(--ds-card-shadow-opacity,.035))!important}`,
    'card.shadowBlur':v=>`:root{--ds-card-shadow-blur:${v}px}`,
    'card.shadowOpacity':v=>`:root{--ds-card-shadow-opacity:${v}}`,
    'card.glowBlur':v=>`.card{filter:drop-shadow(0 0 ${v}px rgba(16,166,111,var(--ds-card-glow-opacity,0)))}`,
    'card.glowOpacity':v=>`:root{--ds-card-glow-opacity:${v}}`,
    'card.titleSize':v=>`.card-title h3,.meal-ident h3,.backup-card-head h3,.food-card h3,.activity-rings h3,.empty-feature h3,.table-head h3{font-size:${v}px!important}`,
    'card.titleWeight':v=>`.card-title h3,.meal-ident h3,.backup-card-head h3,.food-card h3,.activity-rings h3,.empty-feature h3,.table-head h3{font-weight:${v}!important}`,
    'card.descriptionSize':v=>`.card-title p,.backup-card-head p,.food-card p,.empty-feature p{font-size:${v}px!important}`,
    'card.descriptionWeight':v=>`.card-title p,.backup-card-head p,.food-card p,.empty-feature p{font-weight:${v}!important}`,

    'dark.radius':v=>`.dark-glow,.watch-hero,.measure-hero,.backup-hero,.calorie-hero{border-radius:${v}px!important}`,
    'dark.padding':v=>`.watch-hero,.measure-hero,.backup-hero{padding:${v}px!important}`,
    'dark.glowBlur':v=>`.dark-glow{filter:drop-shadow(0 0 ${v}px rgba(16,166,111,var(--ds-dark-glow-opacity,.12)))}`,
    'dark.glowOpacity':v=>`:root{--ds-dark-glow-opacity:${v}}`,

    'settingsCard.padding':v=>`.settings-card{padding:${v}px!important}`,
    'metricCard.padding':v=>`.metric-card{padding:${v}px!important}`,
    'metricCard.iconSize':v=>`.metric-icon{width:${v}px!important;height:${v}px!important}`,
    'mealCard.headerPadding':v=>`.meal-head{padding:${v}px!important}`,
    'mealCard.iconBoxSize':v=>`.meal-icon{width:${v}px!important;height:${v}px!important}`,
    'mealCard.iconSize':v=>`.meal-icon svg{width:${v}px!important;height:${v}px!important}`,
    'foodCard.padding':v=>`.food-card{padding:${v}px!important}`,
    'backupCard.padding':v=>`.backup-card{padding:${v}px!important}`,
    'activityRow.radius':v=>`.activity-row{border-radius:${v}px!important}`,
    'activityRow.paddingY':v=>`.activity-row{padding-top:${v}px!important;padding-bottom:${v}px!important}`,
    'activityRow.paddingX':v=>`.activity-row{padding-left:${v}px!important;padding-right:${v}px!important}`,

    'button.radius':v=>`.btn{border-radius:${v}px!important}`,
    'button.fontSize':v=>`.btn{font-size:${v}px!important}`,
    'button.fontWeight':v=>`.btn{font-weight:${v}!important}`,
    'button.paddingY':v=>`.btn{padding-top:${v}px!important;padding-bottom:${v}px!important}`,
    'button.paddingX':v=>`.btn{padding-left:${v}px!important;padding-right:${v}px!important}`,
    'button.iconSize':v=>`.btn svg{width:${v}px!important;height:${v}px!important}`,
    'button.borderWidth':v=>`.btn{border-width:${v}px!important}`,

    'closeButton.size':v=>`.modal-head .close-btn{width:${v}px!important;height:${v}px!important}`,
    'closeButton.iconSize':v=>`.modal-head .close-btn svg{width:${v}px!important;height:${v}px!important}`,
    'squareAction.size':v=>`.square-action{width:${v}px!important;height:${v}px!important}`,
    'squareAction.radius':v=>`.square-action{border-radius:${v}px!important}`,
    'squareAction.iconSize':v=>`.square-action svg{width:${v}px!important;height:${v}px!important}`,

    'tab.radius':v=>`.tab{border-radius:${v}px!important}`,
    'tab.fontSize':v=>`.tab{font-size:${v}px!important}`,
    'tab.fontWeight':v=>`.tab{font-weight:${v}!important}`,
    'tab.paddingY':v=>`.tab{padding-top:${v}px!important;padding-bottom:${v}px!important}`,
    'tab.paddingX':v=>`.tab{padding-left:${v}px!important;padding-right:${v}px!important}`,
    'tab.iconSize':v=>`.tab svg{width:${v}px!important;height:${v}px!important}`,

    'pill.radius':v=>`.period-pills button,.filter-pills button,.quality-pills label,.percent-chip,.macro-chip,.badge,.connection-chip{border-radius:${v}px!important}`,
    'pill.fontSize':v=>`.period-pills button,.filter-pills button,.quality-pills label,.percent-chip,.macro-chip,.badge,.connection-chip{font-size:${v}px!important}`,
    'pill.fontWeight':v=>`.period-pills button,.filter-pills button,.quality-pills label,.percent-chip,.macro-chip,.badge,.connection-chip{font-weight:${v}!important}`,

    'input.height':v=>`.field input,.field select{height:${v}px!important;min-height:${v}px!important;max-height:${v}px!important}`,
    'input.radius':v=>`.field input,.field select,.snapshot-row input,.search-wrap{border-radius:${v}px!important}`,
    'input.fontSize':v=>`.field input,.field select,.snapshot-row input,.search-wrap input{font-size:${v}px!important}`,
    'input.borderWidth':v=>`.field input,.field select,.snapshot-row input,.search-wrap{border-width:${v}px!important}`,
    'input.paddingX':v=>`.field input,.field select,.snapshot-row input{padding-left:${v}px!important;padding-right:${v}px!important}`,
    'textarea.minHeight':v=>`.field textarea{min-height:${v}px!important}`,
    'textarea.radius':v=>`.field textarea{border-radius:${v}px!important}`,
    'textarea.fontSize':v=>`.field textarea{font-size:${v}px!important}`,

    'iconBox.size':v=>`.icon-box{width:${v}px!important;height:${v}px!important}`,
    'iconBox.radius':v=>`.icon-box{border-radius:${v}px!important}`,
    'iconBox.iconSize':v=>`.icon-box svg{width:${v}px!important;height:${v}px!important}`,

    'modal.radius':v=>`.dialog{border-radius:${v}px!important}`,
    'modal.maxWidth':v=>`.dialog{width:min(${v}px,calc(100% - 22px))!important}`,
    'modal.headerPaddingY':v=>`.modal-head{padding-top:${v}px!important;padding-bottom:${v}px!important}`,
    'modal.bodyPadding':v=>`.modal-body{padding:${v}px!important}`,

    'type.pageTitleSize':v=>`.page-intro h2,.watch-heading h2,.backup-heading h2,.measure-title h2{font-size:${v}px!important}`,
    'type.pageTitleWeight':v=>`.page-intro h2,.watch-heading h2,.backup-heading h2,.measure-title h2{font-weight:${v}!important}`,
    'type.sectionTitleSize':v=>`.section-head h2{font-size:${v}px!important}`,
    'type.sectionTitleWeight':v=>`.section-head h2{font-weight:${v}!important}`,
    'type.descriptionSize':v=>`.page-intro p,.watch-heading p,.backup-heading p,.measure-title p{font-size:${v}px!important}`,

    'progress.height':v=>`.progress{height:${v}px!important}`,
    'progress.lightHeight':v=>`.light-progress{height:${v}px!important}`,
    'progress.ringHeight':v=>`.ring-progress{height:${v}px!important}`,

    'layout.stackGap':v=>`.stack{gap:${v}px!important}`,
    'layout.shellX':v=>`.shell{padding-left:${v}px!important;padding-right:${v}px!important}`,
    'layout.gridGap':v=>`.macro-grid,.stats-grid,.catalog{gap:${v}px!important}`
  };

  function buildCSS(overrides){
    const css=[];
    Object.entries(overrides||{}).forEach(([key,value])=>{
      const fn=rules[key];
      if(!fn) return;
      const num=Number(value);
      if(!Number.isFinite(num)) return;
      css.push(fn(num));
    });
    return css.join('\n');
  }

  function apply(){
    const existing=document.getElementById('pratoBetaDesignSystemOverrides');
    if(existing) existing.remove();
    const config=readConfig();
    if(!config) return;
    const css=buildCSS(config.overrides);
    if(!css) return;
    const style=document.createElement('style');
    style.id='pratoBetaDesignSystemOverrides';
    style.textContent=css;
    document.head.appendChild(style);
  }

  apply();
  window.addEventListener('storage',event=>{
    if(event.key===STORAGE_KEY) apply();
  });
  window.PratoBetaDesignSystem={apply,storageKey:STORAGE_KEY};
})();