(() => {
  const foods = [
    { id:'arroz-branco', name:'Arroz branco cozido', aliases:['arroz','arroz branco'], kcal:128, protein:2.5, carbs:28.1, fat:0.2, quality:3, standard:'1 concha rasa (100 g)', units:{concha:100,colher:25,xicara:160} },
    { id:'feijao-carioca', name:'Feijão carioca cozido', aliases:['feijao','feijão','feijao carioca','feijão carioca'], kcal:76, protein:4.8, carbs:13.6, fat:0.5, quality:5, standard:'1 concha média (100 g)', units:{concha:100,colher:25,xicara:170} },
    { id:'frango-grelhado', name:'Peito de frango grelhado', aliases:['frango','frango grelhado','peito de frango'], kcal:159, protein:32, carbs:0, fat:2.5, quality:5, standard:'1 filé médio (120 g)', units:{file:120,unidade:120} },
    { id:'ovo-cozido', name:'Ovo cozido', aliases:['ovo','ovo cozido'], kcal:146, protein:13.3, carbs:0.6, fat:9.5, quality:5, standard:'1 unidade média (50 g)', units:{unidade:50,ovo:50} },
    { id:'ovo-mexido', name:'Ovo mexido', aliases:['ovos mexidos','ovo mexido'], kcal:166, protein:11, carbs:1.6, fat:12.6, quality:4, standard:'1 ovo preparado (50 g)', units:{unidade:50,ovo:50} },
    { id:'pao-frances', name:'Pão francês', aliases:['pao frances','pão francês','pao','pão'], kcal:270, protein:9, carbs:58, fat:3.1, quality:2, standard:'1 unidade (50 g)', units:{unidade:50,pao:50} },
    { id:'pao-forma', name:'Pão de forma', aliases:['pao de forma','pão de forma'], kcal:253, protein:9, carbs:49, fat:3.4, quality:2, standard:'1 fatia (25 g)', units:{fatia:25,unidade:25} },
    { id:'banana-prata', name:'Banana prata', aliases:['banana','banana prata'], kcal:98, protein:1.3, carbs:26, fat:0.1, quality:5, standard:'1 unidade média (80 g)', units:{unidade:80,banana:80} },
    { id:'maca', name:'Maçã', aliases:['maca','maçã'], kcal:56, protein:0.3, carbs:15, fat:0.1, quality:5, standard:'1 unidade média (130 g)', units:{unidade:130,maca:130} },
    { id:'laranja', name:'Laranja', aliases:['laranja'], kcal:47, protein:0.9, carbs:12, fat:0.1, quality:5, standard:'1 unidade média (130 g)', units:{unidade:130,laranja:130} },
    { id:'mamao', name:'Mamão papaya', aliases:['mamao','mamão','mamao papaya','mamão papaya'], kcal:40, protein:0.5, carbs:10.4, fat:0.1, quality:5, standard:'1/2 unidade pequena (150 g)', units:{unidade:300,metade:150,fatia:100} },
    { id:'aveia', name:'Aveia em flocos', aliases:['aveia','aveia em flocos'], kcal:394, protein:13.9, carbs:66.6, fat:8.5, quality:5, standard:'2 colheres de sopa (30 g)', units:{colher:15,xicara:90} },
    { id:'leite-integral', name:'Leite integral', aliases:['leite','leite integral'], kcal:61, protein:3.2, carbs:4.7, fat:3.3, quality:4, baseUnit:'ml', standard:'1 copo (200 ml)', units:{copo:200,xicara:240} },
    { id:'leite-desnatado', name:'Leite desnatado', aliases:['leite desnatado'], kcal:35, protein:3.4, carbs:5, fat:0.1, quality:4, baseUnit:'ml', standard:'1 copo (200 ml)', units:{copo:200,xicara:240} },
    { id:'cafe', name:'Café sem açúcar', aliases:['cafe','café','cafe sem acucar','café sem açúcar'], kcal:2, protein:0.1, carbs:0, fat:0, quality:4, baseUnit:'ml', standard:'1 xícara pequena (50 ml)', units:{xicara:50,copo:150} },
    { id:'queijo-mucarela', name:'Queijo muçarela', aliases:['queijo','mucarela','muçarela','queijo mucarela','queijo muçarela'], kcal:330, protein:22.6, carbs:3, fat:25.2, quality:3, standard:'1 fatia (20 g)', units:{fatia:20,unidade:20} },
    { id:'presunto', name:'Presunto cozido', aliases:['presunto'], kcal:126, protein:17, carbs:2, fat:5, quality:2, standard:'1 fatia (15 g)', units:{fatia:15,unidade:15} },
    { id:'iogurte-natural', name:'Iogurte natural integral', aliases:['iogurte','iogurte natural','iogurte integral'], kcal:61, protein:3.5, carbs:4.7, fat:3.3, quality:5, standard:'1 pote (170 g)', units:{pote:170,unidade:170} },
    { id:'granola', name:'Granola tradicional', aliases:['granola'], kcal:407, protein:10, carbs:64, fat:12, quality:3, standard:'2 colheres de sopa (30 g)', units:{colher:15,xicara:100} },
    { id:'batata-cozida', name:'Batata inglesa cozida', aliases:['batata','batata inglesa','batata cozida'], kcal:52, protein:1.2, carbs:11.9, fat:0.1, quality:4, standard:'1 unidade média (120 g)', units:{unidade:120,batata:120} },
    { id:'batata-doce', name:'Batata-doce cozida', aliases:['batata doce','batata-doce'], kcal:77, protein:0.6, carbs:18.4, fat:0.1, quality:5, standard:'1 porção (100 g)', units:{unidade:150,fatia:30} },
    { id:'macarrao', name:'Macarrão cozido', aliases:['macarrao','macarrão','massa cozida'], kcal:157, protein:5.8, carbs:30.9, fat:0.9, quality:3, standard:'1 xícara (140 g)', units:{xicara:140,colher:20} },
    { id:'patinho', name:'Patinho bovino grelhado', aliases:['patinho','carne bovina','bife'], kcal:219, protein:35.9, carbs:0, fat:7.3, quality:4, standard:'1 bife médio (100 g)', units:{bife:100,unidade:100} },
    { id:'carne-moida', name:'Carne moída cozida', aliases:['carne moida','carne moída'], kcal:212, protein:26, carbs:0, fat:11, quality:4, standard:'1 porção (100 g)', units:{colher:25} },
    { id:'tilapia', name:'Tilápia grelhada', aliases:['tilapia','tilápia','peixe grelhado'], kcal:128, protein:26, carbs:0, fat:2.7, quality:5, standard:'1 filé médio (120 g)', units:{file:120,unidade:120} },
    { id:'atum', name:'Atum em água', aliases:['atum','atum em agua','atum em água'], kcal:116, protein:25.5, carbs:0, fat:0.8, quality:4, standard:'1 lata drenada (120 g)', units:{lata:120,unidade:120,colher:25} },
    { id:'alface', name:'Alface crua', aliases:['alface'], kcal:15, protein:1.4, carbs:2.9, fat:0.2, quality:5, standard:'1 prato de sobremesa (50 g)', units:{folha:10,prato:50} },
    { id:'tomate', name:'Tomate cru', aliases:['tomate'], kcal:18, protein:0.9, carbs:3.9, fat:0.2, quality:5, standard:'1 unidade média (120 g)', units:{unidade:120,tomate:120,fatia:20} },
    { id:'cenoura', name:'Cenoura cozida', aliases:['cenoura'], kcal:35, protein:0.8, carbs:8.2, fat:0.2, quality:5, standard:'1 unidade média (80 g)', units:{unidade:80,colher:20} },
    { id:'brocolis', name:'Brócolis cozido', aliases:['brocolis','brócolis'], kcal:35, protein:2.4, carbs:7.2, fat:0.4, quality:5, standard:'1 xícara (90 g)', units:{xicara:90,colher:15} },
    { id:'azeite', name:'Azeite de oliva', aliases:['azeite','azeite de oliva'], kcal:884, protein:0, carbs:0, fat:100, quality:4, standard:'1 colher de sopa (13 g)', units:{colher:13,cha:4} },
    { id:'manteiga', name:'Manteiga', aliases:['manteiga'], kcal:717, protein:0.9, carbs:0.1, fat:81.1, quality:2, standard:'1 colher de chá (5 g)', units:{colher:10,cha:5} },
    { id:'acucar', name:'Açúcar', aliases:['acucar','açúcar','acucar refinado','açúcar refinado'], kcal:387, protein:0, carbs:100, fat:0, quality:1, standard:'1 colher de chá (5 g)', units:{colher:12,cha:5} },
    { id:'chocolate-leite', name:'Chocolate ao leite', aliases:['chocolate','chocolate ao leite'], kcal:535, protein:7.7, carbs:59.4, fat:30.3, quality:1, standard:'4 quadradinhos (20 g)', units:{quadradinho:5,unidade:5} },
    { id:'biscoito-recheado', name:'Biscoito recheado', aliases:['biscoito recheado','bolacha recheada'], kcal:472, protein:6, carbs:70, fat:19, quality:1, standard:'3 unidades (30 g)', units:{unidade:10,biscoito:10} },
    { id:'refrigerante', name:'Refrigerante comum', aliases:['refrigerante','coca cola','coca-cola','guarana','guaraná'], kcal:42, protein:0, carbs:10.6, fat:0, quality:1, baseUnit:'ml', standard:'1 lata (350 ml)', units:{lata:350,copo:200} },
    { id:'suco-laranja', name:'Suco de laranja natural', aliases:['suco de laranja','laranja natural'], kcal:45, protein:0.7, carbs:10.4, fat:0.2, quality:4, baseUnit:'ml', standard:'1 copo (200 ml)', units:{copo:200,xicara:240} },
    { id:'whey', name:'Whey protein', aliases:['whey','whey protein'], kcal:400, protein:80, carbs:10, fat:6.7, quality:4, standard:'1 scoop (30 g)', units:{scoop:30,medidor:30} },
    { id:'tapioca', name:'Tapioca sem recheio', aliases:['tapioca','goma de tapioca'], kcal:230, protein:0.2, carbs:56, fat:0.1, quality:2, standard:'1 disco médio (65 g)', units:{unidade:65,disco:65,colher:15} },
    { id:'cuscuz', name:'Cuscuz de milho cozido', aliases:['cuscuz','cuscuz de milho'], kcal:113, protein:2.2, carbs:25.3, fat:0.7, quality:4, standard:'1 porção (100 g)', units:{xicara:140,colher:20} },
    { id:'abacate', name:'Abacate', aliases:['abacate'], kcal:96, protein:1.2, carbs:6, fat:8.4, quality:5, standard:'3 colheres de sopa (75 g)', units:{colher:25,metade:200} },
    { id:'amendoim', name:'Amendoim torrado sem sal', aliases:['amendoim'], kcal:606, protein:25.6, carbs:18.7, fat:49.7, quality:4, standard:'1 punhado pequeno (30 g)', units:{punhado:30,colher:15} }
  ];

  const normalize = (value='') => String(value)
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().trim().replace(/[^a-z0-9\s-]/g,' ').replace(/\s+/g,' ');

  const unitAliases = {
    g:'g', grama:'g', gramas:'g', kg:'kg', quilo:'kg', quilos:'kg',
    ml:'ml', litro:'l', litros:'l', l:'l',
    unidade:'unidade', unidades:'unidade', un:'unidade',
    fatia:'fatia', fatias:'fatia', colher:'colher', colheres:'colher',
    'colher de sopa':'colher', 'colheres de sopa':'colher',
    'colher de cha':'cha', 'colheres de cha':'cha', cha:'cha',
    xicara:'xicara', xicaras:'xicara', copo:'copo', copos:'copo',
    concha:'concha', conchas:'concha', file:'file', files:'file',
    bife:'bife', bifes:'bife', lata:'lata', latas:'lata', pote:'pote', potes:'pote',
    scoop:'scoop', scoops:'scoop', medidor:'medidor', medidores:'medidor',
    disco:'disco', discos:'disco', folha:'folha', folhas:'folha', prato:'prato', pratos:'prato',
    quadradinho:'quadradinho', quadradinhos:'quadradinho', biscoito:'biscoito', biscoitos:'biscoito',
    punhado:'punhado', punhados:'punhado', metade:'metade', metades:'metade', ovo:'ovo', ovos:'ovo',
    banana:'banana', bananas:'banana', maca:'maca', macas:'maca', laranja:'laranja', laranjas:'laranja',
    tomate:'tomate', tomates:'tomate', batata:'batata', batatas:'batata', pao:'pao', paes:'pao'
  };

  function scoreFood(food, query) {
    const q = normalize(query);
    if (!q) return 0;
    const candidates = [food.name, ...(food.aliases || [])].map(normalize);
    let best = 0;
    for (const c of candidates) {
      if (c === q) best = Math.max(best, 100);
      else if (c.startsWith(q)) best = Math.max(best, 82 - Math.max(0, c.length-q.length));
      else if (q.startsWith(c)) best = Math.max(best, 78 - Math.max(0, q.length-c.length));
      else if (c.includes(q)) best = Math.max(best, 65);
      else {
        const words = q.split(' ').filter(Boolean);
        const hits = words.filter(w => c.includes(w)).length;
        if (hits) best = Math.max(best, 35 + hits / words.length * 25);
      }
    }
    return best;
  }

  function search(query, limit=6) {
    if (normalize(query).length < 2) return [];
    return foods.map(food => ({food, score:scoreFood(food, query)}))
      .filter(x => x.score >= 45)
      .sort((a,b) => b.score-a.score || a.food.name.localeCompare(b.food.name,'pt-BR'))
      .slice(0, limit)
      .map(x => x.food);
  }

  function findBest(query) {
    const matches = search(query, 1);
    if (!matches.length) return null;
    const score = scoreFood(matches[0], query);
    return score >= 65 ? matches[0] : null;
  }

  function parseNumber(raw) {
    if (!raw) return 1;
    const text = raw.replace(',','.');
    if (/^\d+\/\d+$/.test(text)) {
      const [a,b] = text.split('/').map(Number);
      return b ? a/b : 1;
    }
    const n = Number(text);
    return Number.isFinite(n) ? n : 1;
  }

  function parseAmount(amountText, food) {
    const raw = normalize(amountText);
    if (!raw) return null;
    const numberMatch = raw.match(/(\d+(?:[.,]\d+)?|\d+\/\d+)/);
    const qty = parseNumber(numberMatch?.[1]);
    let unitText = raw.replace(numberMatch?.[0] || '', '').trim();
    unitText = unitText.replace(/^de\s+/, '').trim();

    if (/\bkg\b|\bquilo/.test(raw)) return { baseQty:qty*1000, label:`${qty} kg` };
    if (/\bgrama|\bgramas|\bg\b/.test(raw)) return { baseQty:qty, label:`${qty} g` };
    if (/\blitro|\blitros|\bl\b/.test(raw)) return { baseQty:qty*1000, label:`${qty} L` };
    if (/\bml\b/.test(raw)) return { baseQty:qty, label:`${qty} ml` };

    const normalizedKeys = Object.keys(unitAliases).sort((a,b)=>b.length-a.length);
    const alias = normalizedKeys.find(k => unitText.includes(k) || raw.includes(k));
    if (alias) {
      const key = unitAliases[alias];
      const perUnit = food.units?.[key];
      if (perUnit) return { baseQty:qty*perUnit, label:`${qty} ${alias}` };
    }

    if (/^\d+(?:[.,]\d+)?$/.test(raw) && food.units?.unidade) {
      return { baseQty:qty*food.units.unidade, label:`${qty} unidade${qty===1?'':'s'}` };
    }
    return null;
  }

  function standardBaseQty(food) {
    const match = normalize(food.standard).match(/\((\d+(?:[.,]\d+)?)\s*(g|ml)\)/);
    if (match) return Number(match[1].replace(',','.'));
    if (food.units?.unidade) return food.units.unidade;
    return 100;
  }

  function estimate(foodOrId, amountText='') {
    const food = typeof foodOrId === 'string' ? foods.find(f => f.id===foodOrId) : foodOrId;
    if (!food) return null;
    const parsed = parseAmount(amountText, food);
    const baseQty = parsed?.baseQty ?? standardBaseQty(food);
    const factor = baseQty / 100;
    const round1 = v => Math.round(v*10)/10;
    return {
      food,
      amountLabel: parsed?.label || food.standard,
      usedDefault: !parsed,
      baseQty,
      baseUnit: food.baseUnit || 'g',
      calories: Math.round(food.kcal * factor),
      protein: round1(food.protein * factor),
      carbs: round1(food.carbs * factor),
      fat: round1(food.fat * factor),
      quality: food.quality
    };
  }

  window.NutritionHelper = { foods, normalize, search, findBest, estimate };
})();
