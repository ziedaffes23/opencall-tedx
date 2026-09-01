# Project TODO

- [x] Ajouter une page publique de candidature speaker TEDx Thyna.
- [x] Reprendre une direction artistique TEDx élégante, premium et cohérente avec le design défini précédemment.
- [x] Construire un formulaire responsive avec les informations essentielles du candidat.
- [x] Ajouter une validation claire des champs obligatoires et des formats saisis.
- [x] Afficher un état de chargement et une confirmation explicite après l’envoi.
- [x] Enregistrer chaque candidature côté serveur et préparer sa transmission vers Google Sheets.
- [x] Ajouter une protection anti-spam et éviter l’exposition de secrets côté navigateur.
- [x] Écrire et exécuter les tests Vitest pour la validation et la soumission.
- [x] Vérifier le rendu desktop et mobile avec une capture visuelle.
- [x] Documenter la configuration du sous-domaine speakers.tedxthyna.com et les réglages DNS requis.
- [x] Créer un checkpoint final une fois tous les éléments validés.

- [x] Remplacer le formulaire initial par la structure détaillée « Open call form » fournie par l’équipe TEDx Thyna.
- [x] Ajouter la section About you : nom complet, email, téléphone, âge, ville/pays, statut actuel, activité actuelle et liens externes facultatifs.
- [x] Ajouter la section Your idea avec l’idée de talk et le point de vue susceptible de faire débat.
- [x] Ajouter la section Your Talk avec le souvenir principal attendu et la catégorie de l’idée.
- [x] Ajouter la section You as a Speaker avec l’expérience de prise de parole, le contexte et la motivation.
- [x] Ajouter la section Final Step avec la photo récente et le champ « anything else ».
- [x] Vérifier avec l’équipe la formulation exacte de la question dupliquée dans la section Your idea avant la version finale.
- [x] Ajouter l’âge, le statut, les catégories et les réponses conditionnelles au modèle de données et à Google Sheets.
- [x] Gérer l’upload sécurisé de la photo avec type et taille contrôlés.

- [x] Ajouter des messages de validation explicites par champ et un message global accessible.
- [x] Ajouter une protection anti-spam côté serveur avec honeypot, limitation simple et garde contre les doublons.
- [x] Écrire des tests Vitest pour la procédure speaker.submit : validation invalide, succès et échecs d’intégration.
- [x] Renforcer la validation de l’upload photo côté client et serveur, y compris le décodage base64 et les messages d’erreur.
- [x] Ajouter une référence de design vérifiable à partir des tokens, composants et captures effectivement livrés.

- [x] Afficher des erreurs de validation par champ pour tous les champs clés et mapper les erreurs serveur vers l’interface.
- [x] Ajouter des tests Vitest pour les échecs storagePut, webhook Google Sheets, doublon et limitation de fréquence.
- [x] Vérifier les signatures binaires JPEG/PNG après décodage base64 côté serveur.

- [x] Mapper les erreurs TRPC/Zod serveur vers des erreurs par champ dans l’interface au lieu d’un simple message global.
- [x] Ajouter des tests Vitest pour le rejet des doublons récents et la limitation de fréquence par IP.

- [x] Vérifier le contrat de mapping d’une erreur serveur vers le champ concerné avec un formatter tRPC explicite et un test Vitest du mapper partagé.

- [ ] Repenser la direction artistique du formulaire TEDx autour du thème mafia/noir avec une élégance éditoriale.
- [ ] Conserver la lisibilité, l’accessibilité et la responsivité de toutes les sections et du parcours de soumission.
- [ ] Vérifier le rendu visuel desktop/mobile après la refonte mafia/noir.
- [ ] Exécuter la suite TypeScript et Vitest après la refonte.
- [ ] Inspecter le dépôt GitHub fourni et synchroniser la version finale vers https://github.com/ziedaffes23/opencall-tedx.git.
