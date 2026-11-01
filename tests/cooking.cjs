const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function environment(html,extension=''){
 const elements={},storage=new Map(),element=id=>elements[id]??={value:id==='f'?'all':id==='sort'?'default':'',innerHTML:'',textContent:'',style:{},scrollTop:0,hidden:false,classList:{add(){},remove(){},toggle(){}},querySelector(){return {scrollTop:0}},setAttribute(){},addEventListener(){},focus(){},scrollIntoView(){}};
 const context=vm.createContext({console,Blob,Response,DecompressionStream,Uint8Array,atob,setTimeout,clearTimeout,navigator:{},sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},window:{supabase:{createClient(){return {}}}},localStorage:{getItem(){return null}},document:{getElementById:element,querySelector:element,addEventListener(){},body:{classList:{contains(){return false}},style:{}}}});
 const source=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean).join('\n').replace('(async()=>{await refreshSession();await load();startPersonalRefresh();})();','');
 vm.runInContext(fs.readFileSync(path.join(root,"assets/new-recipes.js"),"utf8"),context);vm.runInContext(fs.readFileSync(path.join(root,'assets/ingredient-photos.js'),'utf8'),context);vm.runInContext(fs.readFileSync(path.join(root,'assets/ingredient-filters.js'),'utf8'),context);vm.runInContext(fs.readFileSync(path.join(root,'assets/personal-space.js'),'utf8'),context);vm.runInContext(source,context);if(extension){vm.runInContext(fs.readFileSync(path.join(root,'assets/ingredient-usage.js'),'utf8'),context);vm.runInContext(extension,context);}vm.runInContext('renderAuth=()=>{};renderPlan=()=>{}',context);
 return {context,element,run:s=>vm.runInContext(s,context)};
}
(async()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),js=fs.readFileSync(path.join(root,'assets/cooking.js'),'utf8'),e=environment(html,js);await e.run('load()');assert.equal(e.run('R.length'),54);
 const original=e.run('JSON.stringify(R)');
 // Same-family choices form a union; different families require both ingredients.
 const count=()=>e.run('R.filter(matchesIngredientFilters).length');
 e.run('selectedIngredients.add("meat:chicken-breast")');const chicken=count();assert.ok(chicken>0);
 e.run('selectedIngredients.add("meat:turkey-breast")');assert.ok(count()>chicken);
 e.run('selectedIngredients.add("veg:button-mushrooms")');assert.ok(count()>0);assert.ok(count()<chicken);
 assert.equal(e.run('R.filter(matchesIngredientFilters).every(r=>r.ingredients.some(i=>/champignon/i.test(i.ingredient)))'),true);
 e.run('clearIngredientFilters();selectedIngredients.add("dairy:milk")');assert.equal(e.run('matchesIngredientFilters({ingredients:[{ingredient:"Lait de coco"}]})'),false);
 e.run('clearIngredientFilters();selectedIngredients.add("veg:button-mushrooms")');assert.equal(e.run('matchesIngredientFilters({ingredients:[{ingredient:"Champignons de Paris frais"}]})'),true);
 e.run('clearIngredientFilters()');assert.equal(count(),54);
 assert.equal(e.run('ingredientResultLabel(1)'),"1 recette correspond à tes choix");assert.equal(e.run('ingredientResultLabel(0)'),"0 recettes correspondent à tes choix");

 const catalogueDigest=require('node:crypto').createHash('sha256').update(e.run('JSON.stringify(R.filter(r=>!r.id.startsWith("N")).map(({image_url,...recipe})=>recipe))')).digest('hex');
 assert.equal(catalogueDigest,'a7fe380eefad19564d2537fcedb6e093d241a4ff9aaded44a9ea49111e376f62','Ingredients, steps, quantities and recipe metadata must match the approved catalogue');
 e.run('cart={R22:1,"ajout-poulet-champignons-polenta":2}');
 const mushrooms=JSON.parse(e.run('JSON.stringify(Object.values(shoppingIngredients()).filter(i=>i.name==="Champignons de Paris"))'));
 assert.equal(mushrooms.length,1);assert.equal(mushrooms[0].qty,e.run('R.find(r=>r.id==="R22").ingredients.find(i=>i.ingredient==="Champignons de Paris").qty+360'));
 assert.equal(e.run('canonicalIngredient("Champignons de Paris en conserve")'),'Champignons de Paris en conserve');
 assert.equal(e.run('canonicalIngredient("Creme legere 12%")'),'Creme legere 12%');
 assert.equal(e.run('canonicalIngredient("Riz complet (poids cru)")'),'Riz complet sec');
 assert.equal(e.run('canonicalIngredient("Pomme de terre crue")'),'Pomme de terre');
 assert.notEqual(e.run('canonicalIngredient("Crevettes cuites décortiquées")'),e.run('canonicalIngredient("Crevettes crues décortiquées")'));
 assert.notEqual(e.run('canonicalIngredient("Oignon rouge")'),e.run('canonicalIngredient("Oignon jaune")'));
 assert.notEqual(e.run('canonicalIngredient("Lentilles vertes cuites égouttées")'),e.run('canonicalIngredient("Lentilles vertes sèches")'));
 assert.notEqual(e.run('canonicalIngredient("Riz basmati sec")'),e.run('canonicalIngredient("Riz jasmin sec")'));
 e.run('R.push({id:"units",ingredients:[{ingredient:"Huile d’olive",qty:4,unit:"g"},{ingredient:"Huile d\'olive",qty:5,unit:"ml"}]});cart={units:1}');assert.equal(e.run('Object.keys(shoppingIngredients()).length'),2);e.run('R.pop()');
 e.run('cart={R22:1,"ajout-poulet-champignons-polenta":2}');assert.equal((e.run('cartText()').match(/Champignons de Paris/g)||[]).length,1);assert.ok(!e.run('cartText()').includes('\\n'));e.run('renderCart()');assert.match(e.element('drawer').innerHTML,/ingredientPicture/);
 for(const id of JSON.parse(e.run('JSON.stringify(R.map(r=>r.id))'))){e.run('openRecipe('+JSON.stringify(id)+')');assert.match(e.element('overlay').innerHTML,/recipePhoto/);assert.match(e.element('overlay').innerHTML,/id="addCart"/);assert.match(e.element('overlay').innerHTML,/id="launchRecipe"/);e.run('launchRecipe()');const content=e.element('overlay').innerHTML;assert.match(content,/role="dialog"/);assert.match(content,/cookIngredientPanel/);assert.equal((content.match(/data-cook-done=/g)||[]).length,e.run('currentRecipe.steps.length'));assert.equal((content.match(/data-cook-ingredient=/g)||[]).length,e.run('currentRecipe.ingredients.length'));e.run('changePortions(1)');e.run('closeModal()')}
 e.run('openRecipe("R01");cookState.step=2;cookState.done=[0];cookState.ingredients=[1];cookState.guided=true;saveCookState();closeModal();openRecipe("R01")');assert.equal(e.run('cookState.step'),2);assert.equal(e.run('cookState.done[0]'),0);assert.equal(e.run('cookState.ingredients[0]'),1);assert.equal(e.run('cookState.guided'),true);
 e.run('launchRecipe();navigateCooking(1)');assert.equal(e.run('cookState.step'),3);assert.equal(e.run('cookState.done.includes(2)'),true);e.run('navigateCooking(-1)');assert.equal(e.run('cookState.step'),2);assert.equal(e.run('cookState.done.includes(2)'),false);e.run('changePortions(-100)');assert.equal(e.run('currentPortions'),1);e.run('changePortions(100)');assert.equal(e.run('currentPortions'),20);
 for(const id of JSON.parse(e.run('JSON.stringify(R.map(r=>r.id))'))){
 e.run('openRecipe('+JSON.stringify(id)+');launchRecipe()');
 assert.equal(e.run('ingredientUsage[currentRecipe.id].lastUse.length'),e.run('currentRecipe.ingredients.length'));
 assert.equal(e.run('ingredientUsage[currentRecipe.id].ingredients.every((name,i)=>name===currentRecipe.ingredients[i].ingredient)'),true);
 assert.equal(e.run('ingredientUsage[currentRecipe.id].lastUse.every(i=>i===null||Number.isInteger(i)&&i>=0&&i<currentRecipe.steps.length)'),true);
 }
 // Split garlic and paprika must remain unchecked until their later use.
 e.run('openRecipe("R01");launchRecipe();cookState.done=[];cookState.ingredients=[];cookState.ingredientOverrides={};validateCookingStep(3,true)');
 assert.equal(e.run('cookState.step'),4);assert.equal(e.run('isIngredientChecked(2)'),true);assert.equal(e.run('isIngredientChecked(7)'),false);assert.equal(e.run('isIngredientChecked(5)'),true);
 e.run('validateCookingStep(4,true)');assert.equal(e.run('isIngredientChecked(7)'),true);e.run('navigateCooking(-1)');assert.equal(e.run('cookState.done.includes(4)'),false);assert.equal(e.run('isIngredientChecked(7)'),false);
 // Split oil must remain available after the first use in the potato pancake.
 e.run('openRecipe("ajout-poulet-galette-pdt");launchRecipe();cookState.done=[];validateCookingStep(2,true)');assert.equal(e.run('isIngredientChecked(3)'),false);e.run('navigateCooking(1)');assert.equal(e.run('isIngredientChecked(3)'),true);
 // Known ingredients missing from existing instructions stay manual.
 e.run('openRecipe("R03");launchRecipe();cookState.done=[0,1,2,3,4,5];cookState.ingredients=[]');assert.equal(e.run('isIngredientChecked(6)'),false);
 // Portions and macro totals remain available in consultation and through cooking.
 e.run('openRecipe("R01");changePortions(1)');assert.match(e.element('overlay').innerHTML,/932 kcal/);assert.match(e.element('overlay').innerHTML,/320 g/);assert.match(e.element('overlay').innerHTML,/Ajouter 2 portions au panier/);
 e.run('launchRecipe();showRecipeDetails()');assert.equal(e.run('currentPortions'),2);assert.match(e.element('overlay').innerHTML,/932 kcal/);
 // Final validation completes the recipe without an extra click.
 e.run('launchRecipe();cookState.done=[0,1,2,3,4,5];cookState.step=6;validateCookingStep(6,true)');assert.equal(e.run('cookState.done.length'),7);assert.match(e.element('overlay').innerHTML,/Bon appétit/);
 assert.equal(e.run('JSON.stringify(R)'),original,'Cooking and shopping must never mutate recipe data');
 e.element('q').value='boeuf';e.run('render()');assert.match(e.element('grid').innerHTML,/bœuf/);e.element('q').value='';e.element('f').value='fast';e.run('render()');assert.ok(!e.element('grid').innerHTML.includes('Lasagnes'));
 if(process.argv[2]){const old=environment(fs.readFileSync(process.argv[2],'utf8'));await old.run('load()');assert.equal(e.run('JSON.stringify(R.filter(r=>!r.id.startsWith("N")))'),old.run('JSON.stringify(R)'),'All 34 recipes must remain byte-for-byte identical after loading')}
 e.element('q').value='';e.element('f').value='new';e.run('render()');assert.equal(e.element('count').textContent,'20 recettes correspondent à tes choix');assert.ok(!e.element('grid').innerHTML.includes('Poulet façon Buffalo'));
 const additions=JSON.parse(e.run('JSON.stringify(R.filter(r=>r.id.startsWith("N")))'));
 assert.equal(additions.length,20);assert.equal(e.run('new Set(R.map(r=>r.id)).size'),54);assert.equal(e.run('new Set(R.map(r=>r.title)).size'),54);
 for(const r of additions){assert.ok(r.nutrition_per_serving.kcal>=400&&r.nutrition_per_serving.kcal<=500,r.id);assert.ok(r.nutrition_per_serving.protein_g>=40,r.id);assert.ok(r.total_time_min>=20&&r.total_time_min<=40,r.id);assert.ok(r.ingredients.every(i=>i.qty>0&&i.unit==='g'));assert.equal(r.nutrition_estimated,true)}
 assert.equal(e.run('ingredientAsset("Oignon nouveau avec sa tige")'),'spring-onion');
 assert.equal(e.run('ingredientAsset("Champignons de Paris frais")'),'button-mushrooms');
 assert.equal(e.run('ingredientAsset("Fromage fondant leger")'),'processed-cheese');
 assert.equal(e.run('ingredientAsset("Riz rond paella sec")'),'rice-round');
 const nutrientRefs=Object.values(JSON.parse(fs.readFileSync(path.join(root,'assets/recipes/nutrition-estimates.json'),'utf8')).foods);
 for(const r of additions){
  const sums={kcal:0,protein_g:0,carbs_g:0,fat_g:0};
  for(const i of r.ingredients){const ref=nutrientRefs.find(f=>f.ingredient===i.ingredient);assert.ok(ref,i.ingredient);for(const key of Object.keys(sums))sums[key]+=ref[key]*i.qty/100}
  for(const key of Object.keys(sums))assert.ok(Math.abs(sums[key]-r.nutrition_per_serving[key])<=(key==='kcal'?1:.11),r.id+' '+key+' must match its quantities');
 }
 const ingredients=JSON.parse(e.run('JSON.stringify([...new Set(R.flatMap(r=>r.ingredients.map(i=>i.ingredient)))].map(name=>({name,id:ingredientAsset(name)})))'));
 for(const i of ingredients){assert.ok(i.id,'Missing realistic ingredient mapping: '+i.name);if(process.env.CHECK_ASSETS==='1')assert.ok(fs.existsSync(path.join(root,'assets/ingredients',i.id+'.webp')),i.name)}
 if(process.env.CHECK_ASSETS==='1')for(const id of JSON.parse(e.run('JSON.stringify(R.map(r=>r.id))')))assert.ok(fs.existsSync(path.join(root,'assets/recipes',id+'.webp')),id);
 e.run('openRecipe("N01")');assert.match(e.element('overlay').innerHTML,/Valeurs estimées/);assert.match(e.element('overlay').innerHTML,/<img src="assets\/ingredients\/chicken-breast.webp"/);
 console.log('PASS: 34 recettes inchangées + 20 nouvelles ; macros et seuils ; photos d’ingrédients ; consultation/panier/macros ; validation et retour ; ingrédients à usages multiples ; fin de recette ; portions et progression ; courses, recherche et filtres.');
})().catch(e=>{console.error(e);process.exitCode=1});
