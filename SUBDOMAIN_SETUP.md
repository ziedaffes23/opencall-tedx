# Configuration du sous-domaine TEDx Thyna

## Objectif

Le formulaire doit être accessible à l’adresse publique `https://speakers.tedxthyna.com` après publication du projet.

## Étapes dans Manus

Publiez d’abord le projet depuis l’interface de gestion du projet. Ensuite, ouvrez **Settings → Domains**, choisissez l’option permettant de lier un domaine existant et saisissez `speakers.tedxthyna.com`. L’interface affichera la cible DNS exacte associée au projet publié. Cette cible doit être copiée telle quelle : l’URL de prévisualisation de développement ne doit pas être utilisée comme cible DNS.

## Enregistrement DNS

Dans le panneau DNS du registrar qui gère `tedxthyna.com`, ajoutez un enregistrement **CNAME** avec les valeurs suivantes :

| Champ | Valeur |
|---|---|
| Type | `CNAME` |
| Nom / Host | `speakers` |
| Cible / Target | La cible fournie dans **Settings → Domains** après l’ajout du domaine |
| TTL | Automatique ou `3600` secondes |

Si le registrar ajoute automatiquement le domaine principal au champ **Name**, utilisez uniquement `speakers` afin d’obtenir `speakers.tedxthyna.com`. Supprimez les éventuels enregistrements A ou CNAME concurrents portant le même nom `speakers`, car plusieurs cibles peuvent empêcher la résolution correcte.

## Vérifications

Après l’enregistrement DNS, attendez la propagation puis revenez dans **Settings → Domains** pour terminer la vérification et l’émission du certificat HTTPS. Le résultat attendu est une résolution de `speakers.tedxthyna.com` vers la cible Manus affichée par l’interface, suivie d’un accès HTTPS sans avertissement de certificat.

Ne partagez pas l’URL de prévisualisation `manus.computer` comme adresse publique définitive. Le sous-domaine final doit être testé depuis une fenêtre privée avec l’URL `https://speakers.tedxthyna.com`.
