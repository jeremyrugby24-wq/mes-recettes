/* UI metadata: last explicit use (zero-based step), including reserved ingredients.
   null: ingredient not explicitly used in the existing instructions; keep manual.
   Names are guards so a changed recipe cannot silently reuse a stale mapping. */
const ingredientUsage = {
  "R01": {
    "ingredients": [
      "Poulet (blanc, cru)",
      "Pomme de terre",
      "Coulis de tomate",
      "Vinaigre de cidre",
      "Miel",
      "Paprika fumé",
      "Piment en poudre",
      "Ail",
      "Beurre",
      "Huile d'olive",
      "Sel"
    ],
    "lastUse": [
      5,
      6,
      3,
      3,
      3,
      3,
      3,
      4,
      4,
      1,
      1
    ]
  },
  "R02": {
    "ingredients": [
      "Poulet (blanc, cru)",
      "Pomme de terre",
      "Courgette",
      "Poivron rouge",
      "Oignon jaune",
      "Huile d'olive",
      "Herbes"
    ],
    "lastUse": [
      5,
      1,
      4,
      4,
      2,
      3,
      4
    ]
  },
  "R03": {
    "ingredients": [
      "Poulet (blanc, cru)",
      "Riz jasmin sec",
      "Lait de coco leger",
      "Pâte de curry rouge",
      "Poivron rouge",
      "Champignons de Paris",
      "Sucre roux",
      "Huile vegetale",
      "Jus de citron vert",
      "Sel"
    ],
    "lastUse": [
      3,
      5,
      4,
      2,
      3,
      3,
      null,
      2,
      4,
      4
    ]
  },
  "R04": {
    "ingredients": [
      "Poulet (blanc, cru)",
      "Riz rond paella sec",
      "Poivron rouge",
      "Petits pois",
      "Coulis de tomate",
      "Oignon jaune",
      "Huile d'olive",
      "Bouillon",
      "Epices"
    ],
    "lastUse": [
      4,
      3,
      2,
      4,
      3,
      2,
      1,
      3,
      3
    ]
  },
  "R05": {
    "ingredients": [
      "Poulet (blanc, cru)",
      "Nouilles de riz seches",
      "Carotte",
      "Concombre",
      "Pousses de soja",
      "Huile de sésame",
      "Epices",
      "Jus de citron vert",
      "Sel",
      "Ail",
      "Gingembre"
    ],
    "lastUse": [
      5,
      5,
      5,
      5,
      5,
      2,
      null,
      4,
      4,
      4,
      4
    ]
  },
  "R06": {
    "ingredients": [
      "Boeuf haché 5%",
      "Pates proteinees",
      "Tomates concassees",
      "Oignon jaune",
      "Carotte",
      "Ail",
      "Huile d'olive",
      "Herbes"
    ],
    "lastUse": [
      2,
      5,
      3,
      1,
      1,
      2,
      1,
      3
    ]
  },
  "R07": {
    "ingredients": [
      "Saumon",
      "Pates proteinees",
      "Creme legere 15%",
      "Jus de citron",
      "Aneth frais",
      "Ail",
      "Huile d'olive"
    ],
    "lastUse": [
      4,
      4,
      3,
      3,
      4,
      3,
      1
    ]
  },
  "R08": {
    "ingredients": [
      "Boeuf haché 5%",
      "Feuilles de lasagne seches",
      "Coulis de tomate",
      "Lait demi-ecreme",
      "Farine",
      "Mozzarella rapée",
      "Oignon jaune",
      "Huile d'olive",
      "Epices"
    ],
    "lastUse": [
      4,
      4,
      4,
      4,
      4,
      5,
      1,
      1,
      2
    ]
  },
  "R09": {
    "ingredients": [
      "Poulet (blanc, cru)",
      "Riz basmati sec",
      "Lait de coco leger",
      "Citronnelle",
      "Oignon jaune",
      "Huile vegetale",
      "Gingembre",
      "Epices",
      "Jus de citron vert",
      "Sel"
    ],
    "lastUse": [
      5,
      5,
      4,
      2,
      2,
      1,
      2,
      3,
      4,
      4
    ]
  },
  "R10": {
    "ingredients": [
      "Boeuf maigre",
      "Brocoli",
      "Carotte",
      "Riz complet sec",
      "Huile de sésame",
      "Gingembre",
      "Ail",
      "Jus de citron vert",
      "Sel"
    ],
    "lastUse": [
      5,
      5,
      5,
      5,
      3,
      null,
      null,
      4,
      4
    ]
  },
  "R11": {
    "ingredients": [
      "Poulet (blanc, cru)",
      "Mozzarella rapée",
      "Coulis de tomate",
      "Riz basmati sec",
      "Huile d'olive",
      "Ail",
      "Herbes"
    ],
    "lastUse": [
      4,
      3,
      5,
      5,
      1,
      2,
      2
    ]
  },
  "R12": {
    "ingredients": [
      "Poulet (blanc, cru)",
      "Courgette",
      "Carotte",
      "Fromage fondant leger",
      "Riz basmati sec",
      "Huile d'olive",
      "Ail"
    ],
    "lastUse": [
      5,
      3,
      2,
      4,
      5,
      1,
      3
    ]
  },
  "R13": {
    "ingredients": [
      "Poulet (blanc, cru)",
      "Semoule moyenne seche",
      "Courgette",
      "Coulis de tomate",
      "Bouillon",
      "Oignon jaune",
      "Huile d'olive",
      "Epices"
    ],
    "lastUse": [
      5,
      5,
      5,
      3,
      3,
      1,
      1,
      2
    ]
  },
  "R14": {
    "ingredients": [
      "Poulet (blanc, cru)",
      "Patate douce",
      "Jeunes pousses",
      "Huile d'olive",
      "Vinaigre balsamique",
      "Epices"
    ],
    "lastUse": [
      4,
      4,
      3,
      1,
      3,
      1
    ]
  },
  "R15": {
    "ingredients": [
      "Poulet (blanc, cru)",
      "Riz basmati sec",
      "Petits pois",
      "Tomates concassees",
      "Oignon jaune",
      "Ail",
      "Gingembre",
      "Huile vegetale",
      "Epices"
    ],
    "lastUse": [
      3,
      5,
      4,
      4,
      1,
      2,
      2,
      1,
      5
    ]
  },
  "R16": {
    "ingredients": [
      "Poulet (blanc, cru)",
      "Spaetzle",
      "Chou rouge",
      "Pomme",
      "Vinaigre de cidre",
      "Beurre",
      "Huile d'olive"
    ],
    "lastUse": [
      5,
      5,
      5,
      1,
      2,
      4,
      1
    ]
  },
  "R17": {
    "ingredients": [
      "Boeuf maigre",
      "Spaetzle",
      "Champignons de Paris",
      "Creme legere 12%",
      "Echalote",
      "Beurre",
      "Persil frais"
    ],
    "lastUse": [
      3,
      5,
      2,
      4,
      2,
      1,
      4
    ]
  },
  "R18": {
    "ingredients": [
      "Boeuf haché 5%",
      "Cheddar",
      "Salade iceberg",
      "Tomate",
      "Cornichons",
      "Oignon jaune",
      "Fromage blanc 3%",
      "Moutarde",
      "Concentré de tomate",
      "Paprika fumé",
      "Pomme de terre",
      "Sel"
    ],
    "lastUse": [
      6,
      6,
      6,
      6,
      6,
      6,
      2,
      2,
      2,
      2,
      6,
      4
    ]
  },
  "R19": {
    "ingredients": [
      "Poulet (blanc, cru)",
      "Riz jasmin sec",
      "Lait de coco leger",
      "Pâte de curry panang",
      "Poivron rouge",
      "Sucre de coco",
      "Jus de citron vert",
      "Sel"
    ],
    "lastUse": [
      3,
      5,
      2,
      1,
      3,
      null,
      4,
      4
    ]
  },
  "R20": {
    "ingredients": [
      "Penne proteinees",
      "Boeuf haché 5%",
      "Coulis de tomate",
      "Oignon jaune",
      "Ail",
      "Huile d'olive",
      "Herbes"
    ],
    "lastUse": [
      5,
      2,
      3,
      1,
      2,
      1,
      3
    ]
  },
  "R21": {
    "ingredients": [
      "Fusilli proteines",
      "Creme vegetale legere",
      "Citronnelle",
      "Echalote",
      "Tofu ferme",
      "Jus de citron vert",
      "Huile d'olive"
    ],
    "lastUse": [
      5,
      4,
      3,
      3,
      2,
      4,
      2
    ]
  },
  "R22": {
    "ingredients": [
      "Poulet (blanc, cru)",
      "Champignons de Paris",
      "Creme legere 12%",
      "Riz basmati sec",
      "Echalote",
      "Moutarde",
      "Huile d'olive",
      "Ail"
    ],
    "lastUse": [
      5,
      3,
      4,
      5,
      2,
      4,
      1,
      2
    ]
  },
  "R23": {
    "ingredients": [
      "Poulet (blanc, cru)",
      "Noix de coco râpée",
      "Chapelure",
      "Oeuf",
      "Riz basmati sec",
      "Coulis de tomate",
      "Vinaigre de cidre",
      "Miel",
      "Jus de citron",
      "Piment en poudre",
      "Huile d'olive",
      "Sel"
    ],
    "lastUse": [
      4,
      3,
      3,
      3,
      5,
      1,
      1,
      1,
      1,
      1,
      4,
      2
    ]
  },
  "R24": {
    "ingredients": [
      "Boeuf haché 5%",
      "Haricots rouges egouttes",
      "Mais doux",
      "Tomates concassees",
      "Oignon jaune",
      "Poivron rouge",
      "Riz blanc sec",
      "Ail",
      "Huile d'olive",
      "Epices"
    ],
    "lastUse": [
      2,
      3,
      3,
      3,
      1,
      1,
      5,
      2,
      1,
      3
    ]
  },
  "ajout-dinde-curry-riz": {
    "ingredients": [
      "Blanc de dinde",
      "Riz basmati (poids cru)",
      "Oignon",
      "Lait de coco allégé",
      "Yaourt nature 0 % ou skyr",
      "Huile d’olive",
      "Curry en poudre",
      "Sel, poivre, ail en poudre"
    ],
    "lastUse": [
      2,
      6,
      2,
      4,
      5,
      2,
      3,
      3
    ]
  },
  "ajout-wok-boeuf-nouilles": {
    "ingredients": [
      "Steak haché de bœuf 5 % MG",
      "Nouilles chinoises sèches",
      "Poivron rouge",
      "Courgette",
      "Sauce soja salée",
      "Huile de sésame",
      "Gingembre frais râpé",
      "Ail"
    ],
    "lastUse": [
      4,
      4,
      3,
      3,
      4,
      4,
      3,
      3
    ]
  },
  "ajout-poulet-galette-pdt": {
    "ingredients": [
      "Blanc de poulet cru",
      "Pomme de terre",
      "Œuf entier",
      "Huile d’olive",
      "Herbes de Provence, ail en poudre, sel, poivre"
    ],
    "lastUse": [
      4,
      4,
      1,
      3,
      3
    ]
  },
  "ajout-cabillaud-croute-herbes": {
    "ingredients": [
      "Pavé de cabillaud",
      "Pomme de terre",
      "Pain de mie complet",
      "Persil et ciboulette frais",
      "Huile d’olive",
      "Moutarde de Dijon",
      "Jus de citron",
      "Sel, poivre"
    ],
    "lastUse": [
      5,
      5,
      3,
      3,
      4,
      3,
      1,
      1
    ]
  },
  "ajout-crevettes-semoule": {
    "ingredients": [
      "Crevettes décortiquées",
      "Semoule de blé dur sèche",
      "Tomates cerises",
      "Oignon nouveau avec sa tige",
      "Huile d’olive",
      "Ail",
      "Concentré de tomate",
      "Persil, sel, piment d’Espelette"
    ],
    "lastUse": [
      4,
      5,
      3,
      4,
      2,
      2,
      3,
      4
    ]
  },
  "ajout-burger-bowl-montagnard": {
    "ingredients": [
      "Steak haché de bœuf 5 %",
      "Pomme de terre",
      "Fromage à raclette",
      "Cornichons",
      "Salade verte ou roquette",
      "Moutarde à l’ancienne",
      "Huile d’olive",
      "Sel, poivre"
    ],
    "lastUse": [
      4,
      4,
      4,
      4,
      4,
      5,
      1,
      2
    ]
  },
  "ajout-poulet-pesto-rouge-pates": {
    "ingredients": [
      "Blanc de poulet cru",
      "Spaghettis complets (poids cru)",
      "Pesto rouge",
      "Tomates séchées à l’huile égouttées",
      "Parmesan râpé",
      "Huile d’olive",
      "Basilic frais, sel, poivre"
    ],
    "lastUse": [
      2,
      4,
      3,
      3,
      5,
      2,
      5
    ]
  },
  "ajout-dinde-poireaux-chevre": {
    "ingredients": [
      "Blanc de dinde cru",
      "Poireau",
      "Fromage de chèvre frais",
      "Riz complet (poids cru)",
      "Huile d’olive",
      "Sel, poivre, muscade"
    ],
    "lastUse": [
      3,
      2,
      4,
      5,
      2,
      4
    ]
  },
  "ajout-boeuf-poivrons-quinoa": {
    "ingredients": [
      "Steak haché de bœuf 5 %",
      "Quinoa (poids cru)",
      "Poivron jaune",
      "Oignon rouge",
      "Huile d’olive",
      "Vinaigre balsamique",
      "Cumin, paprika, sel, poivre"
    ],
    "lastUse": [
      5,
      5,
      5,
      2,
      3,
      2,
      4
    ]
  },
  "ajout-poulet-champignons-polenta": {
    "ingredients": [
      "Blanc de poulet cru",
      "Champignons de Paris frais",
      "Polenta précuite",
      "Lait écrémé",
      "Beurre",
      "Thym frais et ail",
      "Sel, poivre"
    ],
    "lastUse": [
      4,
      4,
      4,
      2,
      1,
      4,
      3
    ]
  }
};
