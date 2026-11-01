const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const prefix=fs.readFileSync(path.join(__dirname,'cooking.cjs'),'utf8').split('\n(async()=>{')[0];
const environment=new Function('require','__dirname',prefix+'\nreturn environment')(require,__dirname);
(async()=>{
 const root=path.resolve(__dirname,'..'),e=environment(fs.readFileSync(root+'/index.html','utf8'));await e.run('load()');
 const original=e.run('JSON.stringify(R)');
 e.run(`recipeHistory=[{id:'a',recipe_id:'R01',title:'Plat A',portions:4,prepared_on:'2024-02-29',completed_at:'2024-02-29T12:00:00Z',nutrition:{protein_g:40,kcal:450}},{id:'b',recipe_id:'R01',title:'Plat A',portions:2,prepared_on:'2024-03-01',completed_at:'2024-03-01T12:00:00Z',nutrition:{protein_g:40,kcal:450}},{id:'c',recipe_id:'R02',title:'Annulée',portions:10,prepared_on:'2024-02-29',voided_at:'now',nutrition:{protein_g:100,kcal:1000}}]`);
 assert.equal(e.run('preparationSummary(activePreparations()).protein'),240);assert.equal(e.run('preparationSummary(activePreparations()).portions'),6);assert.equal(e.run('preparationSummary(activePreparations()).preparations'),2);assert.equal(e.run('preparationSummary(activePreparations()).recipes.get("R01").count'),2);
 assert.equal(e.run('preparationSummary(activePreparations().filter(h=>h.prepared_on.startsWith("2024-02"))).kcal'),1800);
 assert.equal(e.run('calendarDays(2024,2,recipeHistory).length'),29);assert.equal(e.run('calendarDays(2024,2,recipeHistory).at(-1).count'),1);assert.equal(e.run('calendarDays(2023,2,[]).length'),28);
 e.run('plannedRecipes=[{id:"old",completed_at:new Date(1000).toISOString()},{id:"new",completed_at:new Date(86400001).toISOString()},{id:"todo",completed_at:null}]');assert.equal(e.run('visiblePlannedRecipes(86401001).map(i=>i.id).join()'),'new,todo');
 e.run('userSession={user:{id:"owner"}};personalOwner="owner";personalReady=true;favoriteRecipes.add("R01")');assert.match(e.run('favoriteRecipeButton("R01")'),/aria-pressed="true"/);
 e.run('supabaseClient.from=()=>({delete(){return this},eq(){return this},then(resolve){resolve({error:{code:"network"}})}})');await e.run('toggleFavorite("R01")');assert.equal(e.run('favoriteRecipes.has("R01")'),true,'Failed writes must keep saved favorites');
 e.run('supabaseClient.from=()=>({delete(){return this},eq(){return this},then(resolve){resolve({error:null})}})');await e.run('toggleFavorite("R01")');assert.equal(e.run('favoriteRecipes.has("R01")'),false);
 e.run('historyMonth="2024-02"');assert.match(e.run('renderHistory()'),/1800|1 800|1 800/);assert.match(e.run('renderHistory()'),/4<\/b><span>portions préparées/);assert.match(e.run('renderHistory()'),/Annulée/);assert.doesNotMatch(e.run('renderHistory()'),/10<\/b><span>portions préparées/);
 assert.equal(e.run('JSON.stringify(R)'),original);
 e.run('clearPersonalSpace()');assert.equal(e.run('favoriteRecipes.size+recipeHistory.length+plannedRecipes.length'),0);assert.equal(e.run('personalReady'),false);
 // History pagination preserves every preparation instead of stopping at the API's 1000-row limit.
 e.run(`userSession={user:{id:'owner'}};supabaseClient.from=table=>({select(){return this},order(){return this},range(start,end){return Promise.resolve({data:Array.from({length:start===0?1000:1},(_,i)=>({id:String(start+i),recipe_id:'R01',portions:1,nutrition:{protein_g:40},prepared_on:'2024-02-01',completed_at:'2024-02-01T12:00:00Z'})),error:null})},then(resolve){resolve({data:[],error:null})}})`);
 await e.run('loadPersonalSpace()');assert.equal(e.run('recipeHistory.length'),1001);assert.equal(e.run('preparationSummary(activePreparations()).protein'),40040);
 console.log('PASS: portions × macros, répétitions, annulations, mois et année bissextile, délai 24 h, favoris et erreurs réseau, isolation à la déconnexion, pagination complète, recettes inchangées.');
})().catch(error=>{console.error(error);process.exitCode=1});
