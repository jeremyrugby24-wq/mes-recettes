/* Realistic ingredient cutouts. Match specific foods before broad families. */
function ingredientAsset(name){
 const n=searchText(name);
 const rules=[
 [/sel[, ]+poivre|cumin, paprika|persil, sel/,'spice-mix'],[/thym.*ail/,'thyme-garlic'],[/thym/,'thyme'],[/herbes/,'dried-herbs'],[/basilic/,'basil'],[/persil et ciboulette/,'parsley-chives'],[/persil|ciboulette/,'parsley'],[/aneth/,'dill'],[/citronnelle/,'lemongrass'],
 [/champignon/,'button-mushrooms'],[/poulet/,'chicken-breast'],[/dinde/,'turkey-breast'],[/boeuf.*hache|steak hache/,'ground-beef'],[/boeuf/,'beef-strips'],[/filet mignon|porc/,'pork-tenderloin'],[/saumon/,'salmon'],[/cabillaud/,'cod'],[/crevette/,'shrimp'],[/thon/,'tuna'],[/tofu/,'tofu'],[/oeuf/,'eggs'],
 [/huile.*sesame/,'sesame-oil'],[/huile.*olive/,'olive-oil'],[/huile vegetale/,'neutral-oil'],[/olive/,'olives'],[/vinaigre balsamique/,'balsamic-vinegar'],[/vinaigre.*cidre/,'cider-vinegar'],[/sauce soja/,'soy-sauce'],[/pesto rouge/,'red-pesto'],[/pate de curry/,'red-curry-paste'],[/moutarde.*ancienne/,'wholegrain-mustard'],[/moutarde/,'dijon-mustard'],[/miel/,'honey'],
 [/tomates sechees/,'sun-dried-tomatoes'],[/tomates cerises/,'cherry-tomatoes'],[/concentre de tomate/,'tomato-paste'],[/coulis|tomates concassees/,'tomato-passata'],[/tomate/,'tomato'],[/patate douce/,'sweet-potato'],[/pomme de terre/,'potato'],[/pomme/,'apple'],
 [/poivron jaune/,'yellow-pepper'],[/poivron/,'red-pepper'],[/courgette/,'zucchini'],[/carotte/,'carrot'],[/brocoli/,'broccoli'],[/concombre/,'cucumber'],[/cornichon/,'pickles'],[/chou rouge/,'red-cabbage'],[/poireau/,'leek'],[/echalote/,'shallot'],[/oignon nouveau/,'spring-onion'],[/oignon rouge/,'red-onion'],[/oignon/,'yellow-onion'],[/ail/,'garlic'],[/gingembre/,'ginger'],[/epinard/,'spinach'],[/aubergine/,'eggplant'],[/pousses de soja/,'bean-sprouts'],[/salade|jeunes pousses/,'lettuce'],[/haricots? rouges?/,'red-beans'],[/pois chiche/,'chickpeas'],[/petits pois/,'peas'],[/lentille/,'lentils'],[/mais/,'corn'],
 [/riz rond/,'rice-round'],[/riz complet/,'brown-rice'],[/nouilles de riz/,'rice-noodles'],[/nouilles/,'wheat-noodles'],[/riz/,'rice'],[/fusilli/,'fusilli'],[/penne|pates/,'penne'],[/spaghetti/,'spaghetti'],[/lasagne/,'lasagna'],[/spaetzle|spatzle/,'spaetzle'],[/semoule/,'couscous'],[/quinoa/,'quinoa'],[/polenta/,'polenta'],[/pain/,'bread'],[/chapelure/,'breadcrumbs'],[/farine/,'flour'],
 [/lait de coco/,'coconut-milk'],[/noix de coco/,'coconut-flakes'],[/lait/,'milk'],[/creme/,'cream'],[/skyr|yaourt|fromage blanc/,'yogurt'],[/parmesan/,'parmesan'],[/fromage fondant/,'processed-cheese'],[/mozzarella/,'mozzarella'],[/cheddar/,'cheddar'],[/raclette/,'raclette'],[/chevre/,'goat-cheese'],[/beurre/,'butter'],
 [/citron vert/,'lime'],[/citron/,'lemon'],[/sucre/,'brown-sugar'],[/paprika|piment/,'paprika'],[/curry/,'curry-powder'],[/cumin/,'cumin'],[/epices/,'spice-mix'],[/bouillon/,'stock'],[/poivre/,'pepper'],[/^sel$/,'salt']
 ];
 return rules.find(([re])=>re.test(n))?.[1]||null;
}
function ingredientVisual(name){
 const id=ingredientAsset(name);
 return id?'<img src="assets/ingredients/'+id+'.webp" alt="" loading="lazy" decoding="async" width="120" height="100">':'';
}
