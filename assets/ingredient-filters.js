/* Ingredient families affect catalogue display only; recipes remain untouched. */
const ingredientFilterGroups=[
 {id:'meat',label:'Viandes & poissons',photo:'chicken-breast',items:[['Poulet','chicken-breast'],['Dinde','turkey-breast'],['Bœuf','ground-beef','beef-strips','ravioli'],['Porc','pork-tenderloin','ham','bacon-matchsticks'],['Saumon','salmon'],['Cabillaud','cod'],['Crevettes','shrimp'],['Thon','tuna']]},
 {id:'veg',label:'Légumes',photo:'carrot',items:[['Courgettes','zucchini'],['Champignons','button-mushrooms'],['Carottes','carrot'],['Brocolis','broccoli'],['Poivrons','red-pepper','yellow-pepper'],['Épinards','spinach'],['Tomates','tomato','cherry-tomatoes','sun-dried-tomatoes','tomato-passata','tomato-paste'],['Poireaux','leek'],['Aubergines','eggplant'],['Concombre','cucumber'],['Salade','lettuce'],['Oignons','yellow-onion','red-onion','spring-onion'],['Échalotes','shallot'],['Chou rouge','red-cabbage'],['Haricots verts','green-beans'],['Navets','turnip'],['Avocat','avocado'],['Petits pois','peas'],['Maïs','corn'],['Pousses de soja','bean-sprouts']]},
 {id:'starch',label:'Féculents',photo:'rice',items:[['Riz','rice','brown-rice','rice-round'],['Pâtes','penne','fusilli','spaghetti','lasagna','spaetzle','ravioli'],['Nouilles','wheat-noodles','rice-noodles'],['Pommes de terre','potato'],['Patates douces','sweet-potato'],['Quinoa','quinoa'],['Semoule','couscous'],['Polenta','polenta'],['Pain','bread','burger-bun'],['Tortillas','tortillas'],['Gnocchis','gnocchi']]},
 {id:'dairy',label:'Laitages',photo:'yogurt',items:[['Skyr, yaourt & fromage blanc','yogurt'],['Crème','cream'],['Lait','milk'],['Mozzarella','mozzarella'],['Parmesan','parmesan'],['Chèvre','goat-cheese'],['Cheddar','cheddar'],['Raclette','raclette'],['Reblochon','reblochon'],['Fromage fondant','processed-cheese'],['Beurre','butter']]},
 {id:'other',label:'Autres',photo:'eggs',items:[['Œufs','eggs'],['Tofu','tofu'],['Lentilles','lentils'],['Pois chiches','chickpeas'],['Haricots rouges','red-beans'],['Lait de coco','coconut-milk'],['Citron','lemon','lime'],['Olives','olives'],['Moutarde','dijon-mustard','wholegrain-mustard'],['Sauce soja','soy-sauce'],['Miel','honey']]}
];
const selectedIngredients=new Set();
let activeIngredientGroup=null, ingredientResultCount=0;
function ingredientItemKey(group,item){return group.id+':'+item[1]}
function recipeIngredientAssets(recipe){return new Set((recipe.ingredients||[]).map(i=>ingredientAsset(i.ingredient)))}
function matchesIngredientFilters(recipe){
 if(!selectedIngredients.size)return true;
 const assets=recipeIngredientAssets(recipe);
 return ingredientFilterGroups.every(group=>{
  const choices=group.items.filter(item=>selectedIngredients.has(ingredientItemKey(group,item)));
  return !choices.length||choices.some(item=>item.slice(1).some(id=>assets.has(id)));
 });
}
function ingredientResultLabel(n){return n+' recette'+(n===1?' correspond':'s correspondent')+' à tes choix'}
function clearIngredientFilters(){selectedIngredients.clear()}
function closeIngredientPicker(){const dialog=document.getElementById('ingredientPicker');if(dialog.open)dialog.close()}
function renderIngredientFilters(count){
 ingredientResultCount=count;
 const categories=document.getElementById('ingredientCategories');
 if(!categories.innerHTML)categories.innerHTML=ingredientFilterGroups.map(g=>'<button class="ingredientCategory" data-ingredient-group="'+g.id+'" aria-haspopup="dialog"><img src="assets/ingredients/'+g.photo+'.webp" alt="" width="48" height="42"><span>'+g.label+'</span><b data-group-count="'+g.id+'"></b></button>').join('');
 if(categories.querySelectorAll)categories.querySelectorAll('[data-group-count]').forEach(b=>{const g=ingredientFilterGroups.find(g=>g.id===b.dataset.groupCount),n=g.items.filter(i=>selectedIngredients.has(ingredientItemKey(g,i))).length;b.textContent=n||'';b.hidden=!n});
 document.getElementById('ingredientChoices').innerHTML=ingredientFilterGroups.flatMap(g=>g.items.filter(i=>selectedIngredients.has(ingredientItemKey(g,i))).map(i=>'<button class="ingredientChip" data-remove-ingredient="'+ingredientItemKey(g,i)+'" aria-label="Retirer '+i[0]+'">'+i[0]+' <span aria-hidden="true">×</span></button>')).join('')+(selectedIngredients.size?'<button class="ingredientClear" id="clearAllIngredients">Tout effacer</button><p class="ingredientRule">Au choix dans une même catégorie · Ensemble entre catégories</p>':'');
 document.getElementById('viewIngredientResults').textContent='Voir '+count+' recette'+(count===1?'':'s');
 const options=document.getElementById('ingredientOptions');
 if(options.querySelectorAll)options.querySelectorAll('[data-ingredient-option]').forEach(button=>button.setAttribute('aria-pressed',String(selectedIngredients.has(button.dataset.ingredientOption))));
}
function openIngredientPicker(id){
 const group=ingredientFilterGroups.find(g=>g.id===id);if(!group)return;
 activeIngredientGroup=group;
 const available=new Set(R.flatMap(r=>[...recipeIngredientAssets(r)]));
 document.getElementById('ingredientPickerTitle').textContent=group.label;
 document.getElementById('ingredientOptions').innerHTML=group.items.filter(i=>i.slice(1).some(id=>available.has(id))).map(i=>'<button class="ingredientOption" data-ingredient-option="'+ingredientItemKey(group,i)+'" aria-pressed="'+selectedIngredients.has(ingredientItemKey(group,i))+'"><img src="assets/ingredients/'+i[1]+'.webp" alt="" width="100" height="82"><span>'+i[0]+'</span><b aria-hidden="true">✓</b></button>').join('');
 renderIngredientFilters(ingredientResultCount);
 document.getElementById('ingredientPicker').showModal();
}
document.addEventListener('click',event=>{
 const group=event.target.closest('[data-ingredient-group]');if(group){openIngredientPicker(group.dataset.ingredientGroup);return}
 const option=event.target.closest('[data-ingredient-option]');if(option){const key=option.dataset.ingredientOption;selectedIngredients.has(key)?selectedIngredients.delete(key):selectedIngredients.add(key);render();return}
 const remove=event.target.closest('[data-remove-ingredient]');if(remove){selectedIngredients.delete(remove.dataset.removeIngredient);render();document.getElementById('ingredientCategories').querySelector('button').focus();return}
 if(event.target.closest('#clearAllIngredients')){clearIngredientFilters();render();document.getElementById('ingredientCategories').querySelector('button').focus()}
 if(event.target.closest('#clearIngredientGroup')&&activeIngredientGroup){activeIngredientGroup.items.forEach(i=>selectedIngredients.delete(ingredientItemKey(activeIngredientGroup,i)));render()}
 if(event.target.closest('#closeIngredientPicker, #viewIngredientResults'))closeIngredientPicker();
 if(event.target.id==='ingredientPicker'){const rect=event.target.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeIngredientPicker()}
});
