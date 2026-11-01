const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function environment(html,extension=''){
 const elements={},storage=new Map(),element=id=>elements[id]??={value:id==='f'?'all':id==='sort'?'default':'',innerHTML:'',textContent:'',style:{},scrollTop:0,hidden:false,classList:{add(){},remove(){},toggle(){}},querySelector(){return {scrollTop:0}},setAttribute(){},addEventListener(){},focus(){},scrollIntoView(){}};
 const context=vm.createContext({console,Blob,Response,DecompressionStream,Uint8Array,atob,setTimeout,clearTimeout,navigator:{},sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},window:{supabase:{createClient(){return {}}}},localStorage:{getItem(){return null}},document:{getElementById:element,querySelector:element,addEventListener(){},body:{classList:{contains(){return false}},style:{}}}});
 const source=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean).join('\n').replace('(async()=>{await refreshSession();await load();})();','');
 vm.runInContext(source,context);if(extension)vm.runInContext(extension,context);vm.runInContext('renderAuth=()=>{};renderPlan=()=>{}',context);
 return {context,element,run:s=>vm.runInContext(s,context)};
}
(async()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),js=fs.readFileSync(path.join(root,'assets/cooking.js'),'utf8'),e=environment(html,js);await e.run('load()');assert.equal(e.run('R.length'),34);
 const original=e.run('JSON.stringify(R)');
 const catalogueDigest=require('node:crypto').createHash('sha256').update(e.run('JSON.stringify(R.map(({image_url,...recipe})=>recipe))')).digest('hex');
 assert.equal(catalogueDigest,'a7fe380eefad19564d2537fcedb6e093d241a4ff9aaded44a9ea49111e376f62','Ingredients, steps, quantities and recipe metadata must match the approved catalogue');
 e.run('cart={R22:1,"ajout-poulet-champignons-polenta":2}');
 const mushrooms=JSON.parse(e.run('JSON.stringify(Object.values(shoppingIngredients()).filter(i=>i.name==="Champignons de Paris"))'));
 assert.equal(mushrooms.length,1);assert.equal(mushrooms[0].qty,e.run('R.find(r=>r.id==="R22").ingredients.find(i=>i.ingredient==="Champignons de Paris").qty+360'));
 assert.equal(e.run('canonicalIngredient("Champignons de Paris en conserve")'),'Champignons de Paris en conserve');
 assert.equal(e.run('canonicalIngredient("Creme legere 12%")'),'Creme legere 12%');
 assert.equal(e.run('canonicalIngredient("Riz complet (poids cru)")'),'Riz complet sec');
 assert.notEqual(e.run('canonicalIngredient("Riz basmati sec")'),e.run('canonicalIngredient("Riz jasmin sec")'));
 e.run('R.push({id:"units",ingredients:[{ingredient:"Huile d’olive",qty:4,unit:"g"},{ingredient:"Huile d\'olive",qty:5,unit:"ml"}]});cart={units:1}');assert.equal(e.run('Object.keys(shoppingIngredients()).length'),2);e.run('R.pop()');
 e.run('cart={R22:1,"ajout-poulet-champignons-polenta":2}');assert.equal((e.run('cartText()').match(/Champignons de Paris/g)||[]).length,1);assert.ok(!e.run('cartText()').includes('\\n'));e.run('renderCart()');assert.match(e.element('drawer').innerHTML,/ingredientPicture/);
 for(const id of JSON.parse(e.run('JSON.stringify(R.map(r=>r.id))'))){e.run('openRecipe('+JSON.stringify(id)+')');const content=e.element('overlay').innerHTML;assert.match(content,/role="dialog"/);assert.match(content,/cookIngredientPanel/);assert.equal((content.match(/data-cook-done=/g)||[]).length,e.run('currentRecipe.steps.length'));assert.equal((content.match(/data-cook-ingredient=/g)||[]).length,e.run('currentRecipe.ingredients.length'));e.run('changePortions(1)');e.run('closeModal()')}
 e.run('openRecipe("R01");cookState.step=2;cookState.done=[0];cookState.ingredients=[1];cookState.guided=true;saveCookState();closeModal();openRecipe("R01")');assert.equal(e.run('cookState.step'),2);assert.equal(e.run('cookState.done[0]'),0);assert.equal(e.run('cookState.ingredients[0]'),1);assert.equal(e.run('cookState.guided'),true);
 e.run('navigateCooking(100)');assert.equal(e.run('cookState.step'),6);e.run('navigateCooking(-100)');assert.equal(e.run('cookState.step'),0);e.run('changePortions(-100)');assert.equal(e.run('currentPortions'),1);e.run('changePortions(100)');assert.equal(e.run('currentPortions'),20);
 assert.equal(e.run('JSON.stringify(R)'),original,'Cooking and shopping must never mutate recipe data');
 e.element('q').value='boeuf';e.run('render()');assert.match(e.element('grid').innerHTML,/bœuf/);e.element('q').value='';e.element('f').value='fast';e.run('render()');assert.ok(!e.element('grid').innerHTML.includes('Lasagnes'));
 if(process.argv[2]){const old=environment(fs.readFileSync(process.argv[2],'utf8'));await old.run('load()');assert.equal(original,old.run('JSON.stringify(R)'),'All 34 recipes must remain byte-for-byte identical after loading')}
 console.log('PASS: 34 recettes inchangées, fiches complètes, portions, navigation, reprise de progression, regroupement des courses, unités et produits distincts, recherche et filtre.');
})().catch(e=>{console.error(e);process.exitCode=1});
