(()=>{
  const tabs=document.querySelector('.tabs');
  if(!tabs)return;

  const indicator=document.createElement('span');
  indicator.className='tab-indicator';
  indicator.setAttribute('aria-hidden','true');
  tabs.prepend(indicator);

  let settleTimer=0;
  function activeTab(){return tabs.querySelector('.tab.active')}
  function moveIndicator({animate=true,center=false}={}){
    const active=activeTab();
    if(!active)return;
    const x=active.offsetLeft;
    const y=active.offsetTop;
    if(!animate)indicator.style.transition='none';
    indicator.style.width=`${active.offsetWidth}px`;
    indicator.style.height=`${active.offsetHeight}px`;
    indicator.style.transform=`translate3d(${x}px,${y}px,0)`;
    if(!animate){indicator.getBoundingClientRect();indicator.style.transition='';}
    tabs.classList.add('indicator-ready');
    if(animate){
      tabs.classList.add('indicator-moving');
      clearTimeout(settleTimer);
      settleTimer=setTimeout(()=>tabs.classList.remove('indicator-moving'),520);
    }
    if(center){
      const target=Math.max(0,active.offsetLeft-(tabs.clientWidth-active.offsetWidth)/2);
      tabs.scrollTo({left:target,behavior:'smooth'});
    }
  }

  moveIndicator({animate:false});

  tabs.addEventListener('click',event=>{
    const tab=event.target.closest('.tab');
    if(!tab)return;
    requestAnimationFrame(()=>moveIndicator({animate:true,center:true}));
  });

  const observer=new MutationObserver(mutations=>{
    if(mutations.some(m=>m.type==='attributes'&&m.attributeName==='class')){
      requestAnimationFrame(()=>moveIndicator({animate:true}));
    }
  });
  tabs.querySelectorAll('.tab').forEach(tab=>observer.observe(tab,{attributes:true,attributeFilter:['class']}));

  window.addEventListener('resize',()=>requestAnimationFrame(()=>moveIndicator({animate:false})));
})();
