# Espace personnel

Les migrations `20261101_personal_recipes.sql`, puis `20261101_personal_privileges.sql` ont été appliquées au projet le 1er novembre 2026. Ne pas relancer la première migration sur une base déjà équipée.

- `recipe_favorites` conserve les favoris par compte.
- `recipe_history` conserve chaque préparation, ses portions, sa date et une copie des valeurs nutritionnelles par portion. Les annulations sont réversibles.
- `recipe_reference` contient uniquement les titres et macros du catalogue public. Lors de futurs ajouts de recettes, compléter cette référence avant d’autoriser leur enregistrement.
- Le déclencheur archive les nouvelles réalisations du planning. Réajouter ou retirer un plat du planning n’efface pas son historique.
- Les réalisations connues dans l’ancien planning sont importées. Les anciennes réalisations déjà remplacées par une nouvelle entrée ne peuvent pas être reconstituées.
- Le retrait après 24 h concerne l’affichage du planning, sans suppression de l’historique.
- Les bilans comptabilisent toutes les portions préparées et ne représentent pas une consommation personnelle.
- Aucun événement de navigation, traceur ou donnée supplémentaire n’est collecté.

Vérifications locales : `node tests/cooking.cjs` et `node tests/personal-space.cjs`.
Le test `tests/personal-database.sql` vérifie l’archivage, l’annulation, les droits et l’isolation dans une transaction annulée. Il nécessite au moins un compte existant ; aucune écriture de test n’est conservée.
