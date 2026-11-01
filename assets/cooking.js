/* Presentation and shopping aliases only. The recipe catalogue is never rewritten. */
const ingredientAliases = [
 ['Champignons de Paris',['Champignons de Paris','Champignons de Paris frais','Champignon de Paris','Champignon de Paris frais']],
 ["Huile d’olive",["Huile d'olive","Huile d’olive"]],
 ['Blanc de poulet cru',['Poulet (blanc, cru)','Blanc de poulet cru']],
 ['Blanc de dinde cru',['Blanc de dinde','Blanc de dinde cru']],
 ['Riz basmati sec',['Riz basmati sec','Riz basmati (poids cru)']],
 ['Riz complet sec',['Riz complet sec','Riz complet (poids cru)']],
 ['Œuf entier',['Oeuf','Œuf entier']],
 ['Bœuf haché 5 %',['Boeuf haché 5%','Steak haché de bœuf 5 %','Steak haché de bœuf 5 % MG']]
];
function ingredientKey(name){return searchText(name).replace(/[’']/g,"'").replace(/\s+/g,' ').trim()}
function canonicalIngredient(name){const key=ingredientKey(name);return ingredientAliases.find(([,names])=>names.some(n=>ingredientKey(n)===key))?.[0]||name}
function shoppingIngredients(){
 const total=new Map();
 Object.entries(cart).filter(([,qty])=>num(qty)>0).forEach(([id,portions])=>{
  const recipe=R.find(r=>r.id===id);if(!recipe)return;
  recipe.ingredients.forEach(i=>{const name=canonicalIngredient(i.ingredient),unit=(i.unit||'').trim(),key=ingredientKey(name)+'|'+unit;
   if(!total.has(key))total.set(key,{name,unit,qty:0});total.get(key).qty+=num(i.qty)*num(portions);
  });
 });
 return Object.fromEntries(total);
}
function ingredientIcon(name){
 const n=searchText(name);
 const icons=[[/champignon/,'🍄'],[/poulet|dinde/,'🍗'],[/boeuf|steak/,'🥩'],[/saumon|cabillaud/,'🐟'],[/crevette/,'🦐'],[/oeuf/,'🥚'],[/tomat|pesto rouge/,'🍅'],[/pomme de terre/,'🥔'],[/patate douce/,'🍠'],[/carotte/,'🥕'],[/brocoli/,'🥦'],[/poivron|piment/,'🌶️'],[/concombre|cornichon|courgette/,'🥒'],[/oignon|echalote/,'🧅'],[/ail/,'🧄'],[/chou|salade|pousse|poireau/,'🥬'],[/citron(?!nelle)/,'🍋'],[/pomme/,'🍎'],[/mais/,'🌽'],[/petits pois|haricot/,'🫘'],[/fromage|cheddar|mozzarella|parmesan/,'🧀'],[/beurre/,'🧈'],[/lait|creme|yaourt/,'🥛'],[/riz/,'🍚'],[/pates|penne|fusilli|spaghetti|nouille|lasagne|spaetzle/,'🍝'],[/semoule|quinoa|polenta|farine|chapelure/,'🌾'],[/pain/,'🍞'],[/miel/,'🍯'],[/coco/,'🥥'],[/tofu/,'🧊'],[/huile|vinaigre|sauce soja/,'🫙'],[/basilic|persil|herbe|aneth|thym|citronnelle/,'🌿'],[/sel/,'🧂'],[/gingembre/,'🫚']];
 return icons.find(([re])=>re.test(n))?.[1]||'🥣';
}
let cookState={step:0,done:[],ingredients:[],guided:false},ingredientsOpen=false,recipeReturnFocus=null,wakeLock=null,wakeDesired=false,wakeBusy=false;
function readCookState(id){try{return JSON.parse(sessionStorage.getItem('cooking-'+id)||'null')}catch{return null}}
function saveCookState(){if(currentRecipe)try{sessionStorage.setItem('cooking-'+currentRecipe.id,JSON.stringify(cookState))}catch{}}
function openRecipe(id){
 const r=R.find(x=>x.id===id);if(!r)return;
 recipeReturnFocus=document.activeElement;currentRecipe=r;currentPortions=1;ingredientsOpen=false;
 const saved=readCookState(id);cookState={step:Math.max(0,Math.min(r.steps.length-1,Number(saved?.step)||0)),done:Array.isArray(saved?.done)?saved.done:[],ingredients:Array.isArray(saved?.ingredients)?saved.ingredients:[],guided:!!saved?.guided};
 const overlay=document.getElementById('overlay');drawModal();overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
 document.querySelector('main').inert=true;document.getElementById('authPanel').inert=true;
 document.getElementById('closeModal').focus();
}
function closeModal(){
 document.getElementById('overlay').classList.remove('open');document.getElementById('overlay').setAttribute('aria-hidden','true');document.body.style.overflow='';
 document.querySelector('main').inert=false;document.getElementById('authPanel').inert=false;saveCookState();currentRecipe=null;wakeDesired=false;releaseWakeLock();
 if(document.fullscreenElement===document.getElementById('overlay'))document.exitFullscreen?.().catch(()=>{});
 recipeReturnFocus?.focus?.();
}
function drawModal(){
 if(!currentRecipe)return;
 const r=currentRecipe,t=timeOf(r),total=r.steps.length,done=cookState.done.filter(i=>i>=0&&i<total).length;
 const overlay=document.getElementById('overlay'),oldScroll=overlay.querySelector('.cookWorkspace')?.scrollTop||0,oldIngredients=overlay.querySelector('.cookIngredients')?.scrollTop||0,oldPreparation=overlay.querySelector('.cookPreparation')?.scrollTop||0;
 const ing=r.ingredients.map((i,index)=>'<li><label class="ingredientRow '+(cookState.ingredients.includes(index)?'isChecked':'')+'"><input type="checkbox" data-cook-ingredient="'+index+'" '+(cookState.ingredients.includes(index)?'checked':'')+'><span class="ingredientPicture" aria-hidden="true">'+ingredientIcon(i.ingredient)+'</span><span class="ingredientName">'+esc(i.ingredient)+'</span><b>'+fmt(num(i.qty)*currentPortions)+' '+esc(i.unit||'')+'</b></label></li>').join('');
 const steps=r.steps.map((s,index)=>'<li '+(cookState.guided&&cookState.step!==index?'hidden':'')+' class="cookStep '+(cookState.step===index?'isCurrent ':'')+(cookState.done.includes(index)?'isDone':'')+'"><div class="stepHeading"><button class="stepNumber" data-cook-select="'+index+'" aria-label="Sélectionner l’étape '+(index+1)+'" aria-pressed="'+(cookState.step===index)+'">'+(index+1)+'</button><span>Étape '+(index+1)+'</span><label class="stepDone"><input type="checkbox" data-cook-done="'+index+'" '+(cookState.done.includes(index)?'checked':'')+'> Terminée</label></div><p>'+esc(s.text||s)+'</p></li>').join('');
 overlay.innerHTML='<section class="cookShell" role="dialog" aria-modal="true" aria-labelledby="recipeTitle"><header class="cookHeader"><img src="'+esc(r.image_url)+'" alt="'+esc(r.title)+' — illustration générée par IA"><div class="cookTitle"><span class="cookEyebrow">À TON RYTHME, EN CUISINE</span><h2 id="recipeTitle">'+esc(r.title)+'</h2><p>'+esc(r.description||'')+'</p><span class="cookTime">'+(t?'⏱ '+fmt(t)+' min · ':'')+'Pour '+currentPortions+' personne'+(currentPortions>1?'s':'')+'</span></div><button class="iconBtn" id="closeModal" aria-label="Fermer la recette">✕</button></header><div class="cookToolbar"><div class="cookModes" role="group" aria-label="Affichage des étapes"><button data-cook-mode="overview" aria-pressed="'+!cookState.guided+'">Vue d’ensemble</button><button data-cook-mode="guided" aria-pressed="'+cookState.guided+'">Pas à pas</button></div><div class="cookTools">'+(navigator.wakeLock?'<button id="wakeToggle" aria-pressed="'+wakeDesired+'">'+(wakeLock?'☀ Écran maintenu allumé':wakeDesired?'☀ Réactiver l’écran allumé':'☀ Garder l’écran allumé')+'</button>':'')+(document.fullscreenEnabled?'<button id="cookFullscreen">⛶ Plein écran</button>':'')+'<button id="cookReset">Recommencer</button></div></div><div class="cookWorkspace"><section class="cookPreparation" aria-label="Préparation"><div class="preparationTitle"><div><span class="cookEyebrow">ON PASSE AUX FOURNEAUX</span><h3>La préparation</h3></div><span class="cookProgress" role="status" aria-live="polite">'+done+' / '+total+' étapes terminées</span></div><ol class="cookSteps">'+steps+'</ol><nav class="stepNavigation" aria-label="Parcourir les étapes"><button class="btn secondary" id="cookPrevious" '+(cookState.step===0?'disabled':'')+'>← Précédente</button><span>Étape '+(cookState.step+1)+' / '+total+'</span><button class="btn" id="cookNext" '+(cookState.step===total-1?'disabled':'')+'>Suivante →</button></nav><details class="cookNutrition"><summary>Valeurs nutritionnelles pour '+currentPortions+' portion'+(currentPortions>1?'s':'')+'</summary>'+nutrition(r.nutrition_per_serving||{},currentPortions)+'</details></section><aside class="cookIngredients '+(ingredientsOpen?'isOpen':'')+'" aria-labelledby="ingredientsTitle" id="cookIngredientPanel"><div class="ingredientsHeading"><div><span class="cookEyebrow">TOUT SOUS LA MAIN</span><h3 id="ingredientsTitle">Les ingrédients</h3></div><button class="iconBtn mobileIngredientClose" id="hideIngredients" aria-label="Fermer les ingrédients">✕</button></div><div class="cookPortions"><span>Portions</span><div><button id="minus" aria-label="Diminuer les portions" '+(currentPortions===1?'disabled':'')+'>−</button><b aria-live="polite">'+currentPortions+'</b><button id="plus" aria-label="Augmenter les portions" '+(currentPortions===20?'disabled':'')+'>+</button></div></div><p class="ingredientHint">Coche ce que tu as préparé.</p><ul class="cookIngredientList">'+ing+'</ul><button class="btn" id="addCart">🛒 Ajouter au panier</button></aside></div><button class="mobileIngredientToggle btn" id="showIngredients" aria-expanded="'+ingredientsOpen+'" aria-controls="cookIngredientPanel">'+(ingredientsOpen?'Fermer les ingrédients':'🥕 Ingrédients · '+r.ingredients.length)+'</button></section>';
 overlay.querySelector('.cookWorkspace').scrollTop=oldScroll;overlay.querySelector('.cookIngredients').scrollTop=oldIngredients;overlay.querySelector('.cookPreparation').scrollTop=oldPreparation;
}
function updateCookView(focusId){saveCookState();drawModal();if(focusId)document.getElementById(focusId)?.focus()}
function changePortions(delta){currentPortions=Math.max(1,Math.min(20,currentPortions+delta));updateCookView(delta>0?'plus':'minus')}
function navigateCooking(delta){cookState.step=Math.max(0,Math.min(currentRecipe.steps.length-1,cookState.step+delta));updateCookView(delta>0?'cookNext':'cookPrevious');document.querySelector('.cookStep.isCurrent')?.scrollIntoView({block:'nearest',behavior:'smooth'})}
async function releaseWakeLock(){const lock=wakeLock;wakeLock=null;if(lock)try{await lock.release()}catch{}}
async function requestWakeLock(){if(!wakeDesired||!currentRecipe||wakeBusy||wakeLock&&!wakeLock.released)return;wakeBusy=true;try{const lock=await navigator.wakeLock.request('screen');if(!wakeDesired||!currentRecipe){await lock.release();return}wakeLock=lock;lock.addEventListener('release',()=>{if(wakeLock===lock){wakeLock=null;if(currentRecipe)drawModal()}})}catch{wakeDesired=false;showToast('Le maintien de l’écran n’est pas disponible sur cet appareil.')}finally{wakeBusy=false;if(currentRecipe)updateCookView('wakeToggle')}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&wakeDesired)requestWakeLock()});
document.addEventListener('click',async e=>{
 if(!currentRecipe)return;
 const button=e.target.closest('button');if(!button)return;
 if(button.dataset.cookMode){cookState.guided=button.dataset.cookMode==='guided';saveCookState();drawModal();document.querySelector('[data-cook-mode="'+button.dataset.cookMode+'"]').focus()}
 if(button.hasAttribute('data-cook-select')){cookState.step=Number(button.dataset.cookSelect);saveCookState();drawModal();document.querySelector('[data-cook-select="'+cookState.step+'"]').focus()}
 if(button.id==='cookNext')navigateCooking(1);if(button.id==='cookPrevious')navigateCooking(-1);
 if(button.id==='showIngredients'||button.id==='hideIngredients'){ingredientsOpen=button.id==='showIngredients'?!ingredientsOpen:false;drawModal();document.getElementById(ingredientsOpen?'hideIngredients':'showIngredients').focus()}
 if(button.id==='cookReset'){cookState={step:0,done:[],ingredients:[],guided:cookState.guided};updateCookView('cookReset');showToast('Les cases sont décochées. Tu peux recommencer.')}
 if(button.id==='wakeToggle'){wakeDesired=!wakeDesired;if(wakeDesired)await requestWakeLock();else{await releaseWakeLock();updateCookView('wakeToggle')}}
 if(button.id==='cookFullscreen'){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.getElementById('overlay').requestFullscreen()}catch{showToast('Le plein écran n’est pas disponible sur cet appareil.')}}
});
document.addEventListener('change',e=>{
 if(!currentRecipe)return;let key,index;
 if(e.target.hasAttribute('data-cook-done')){key='done';index=Number(e.target.dataset.cookDone)}
 if(e.target.hasAttribute('data-cook-ingredient')){key='ingredients';index=Number(e.target.dataset.cookIngredient)}
 if(!key)return;cookState[key]=cookState[key].filter(i=>i!==index);if(e.target.checked)cookState[key].push(index);saveCookState();
 if(key==='done'){e.target.closest('.cookStep').classList.toggle('isDone',e.target.checked);document.querySelector('.cookProgress').textContent=cookState.done.length+' / '+currentRecipe.steps.length+' étapes terminées'}else e.target.closest('.ingredientRow').classList.toggle('isChecked',e.target.checked);
});
document.addEventListener('keydown',e=>{
 if(!currentRecipe||e.key!=='Tab')return;
 const focusables=[...document.getElementById('overlay').querySelectorAll('button:not([disabled]),input,summary')].filter(el=>el.getClientRects().length);
 if(!focusables.length)return;const first=focusables[0],last=focusables.at(-1);
 if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
});
