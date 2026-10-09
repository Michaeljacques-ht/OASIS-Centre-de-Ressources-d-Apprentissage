#!/bin/bash
cd "$(dirname "$0")"
PORT=8090 node server.js > /tmp/server.log 2>&1 &
SRV=$!
sleep 1.5
B=http://127.0.0.1:8090

echo "== stats =="; curl -s $B/api/stats; echo; echo
echo "== categories (extrait) =="; curl -s $B/api/categories | head -c 200; echo; echo
echo "== ressources filtre type+matiere =="; curl -s "$B/api/ressources?type=support&matiere=Math%C3%A9matiques" | head -c 300; echo; echo
echo "== recherche q=python =="; curl -s "$B/api/ressources?q=python" | head -c 250; echo; echo
echo "== tri populaires =="; curl -s "$B/api/ressources?tri=populaires" | head -c 200; echo; echo
echo "== outils =="; curl -s $B/api/outils | head -c 150; echo; echo
echo "== quiz liste =="; curl -s $B/api/quiz | head -c 250; echo; echo
echo "== méthodes paiement PLOP PLOP =="; curl -s $B/api/paiement/methodes | head -c 250; echo; echo

echo "== connexion admin =="
TOK=$(curl -s -X POST $B/api/auth/connexion -H "Content-Type: application/json" -d '{"email":"admin@oasis.ht","password":"admin123"}' | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{console.log(JSON.parse(d).token||'ECHEC')}catch(e){console.log('ECHEC:'+d)}})")
echo "Token: ${TOK:0:20}..."
echo "== /api/auth/moi =="; curl -s $B/api/auth/moi -H "Authorization: Bearer $TOK" | head -c 200; echo; echo

echo "== connexion apprenant + quiz complet =="
TOKA=$(curl -s -X POST $B/api/auth/connexion -H "Content-Type: application/json" -d '{"email":"apprenant@oasis.ht","password":"eleve123"}' | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{console.log(JSON.parse(d).token)})")
QID=$(curl -s $B/api/quiz | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{console.log(JSON.parse(d)[0].id)})")
echo "Quiz id: $QID"
echo "== detail quiz (les réponses ne doivent PAS apparaître) =="
curl -s $B/api/quiz/$QID | head -c 400; echo; echo
echo "== soumission quiz (toutes réponses = 0) =="
NB=$(curl -s $B/api/quiz/$QID | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{console.log(JSON.parse(d).questions.length)})")
REPS=$(node -e "console.log(JSON.stringify(Array($NB).fill(0)))")
curl -s -X POST $B/api/quiz/$QID/soumettre -H "Content-Type: application/json" -H "Authorization: Bearer $TOKA" -d "{\"reponses\":$REPS}" | head -c 300; echo; echo
echo "== resultats apprenant =="; curl -s $B/api/resultats -H "Authorization: Bearer $TOKA" | head -c 200; echo; echo

echo "== favoris (ajout + liste) =="
RID=$(curl -s "$B/api/ressources" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{console.log(JSON.parse(d).items[0].id)})")
curl -s -X POST $B/api/favoris/$RID -H "Content-Type: application/json" -H "Authorization: Bearer $TOKA" ; echo
curl -s $B/api/favoris -H "Authorization: Bearer $TOKA" | head -c 150; echo; echo

echo "== telechargement (compteur) =="
RID_FREE=$(curl -s "$B/api/ressources?parPage=1000" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const items=JSON.parse(d).items; console.log((items.find(r=>!r.prixHTG)||items[0]).id)})")
curl -s -X POST $B/api/ressources/$RID_FREE/telecharger | head -c 100; echo; echo

echo "== paiement requis sur ressource premium =="
RID_PAY=$(curl -s "$B/api/ressources?parPage=1000" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const items=JSON.parse(d).items; console.log((items.find(r=>r.prixHTG>0)||items[0]).id)})")
curl -s -X POST $B/api/ressources/$RID_PAY/telecharger -H "Authorization: Bearer $TOKA" | head -c 180; echo; echo

echo "== publication ressource (enseignant) =="
TOKE=$(curl -s -X POST $B/api/auth/connexion -H "Content-Type: application/json" -d '{"email":"enseignant@oasis.ht","password":"prof123"}' | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{console.log(JSON.parse(d).token)})")
curl -s -X POST $B/api/ressources -H "Content-Type: application/json" -H "Authorization: Bearer $TOKE" -d '{"titre":"Test publication","type":"fiche","matiere":"Mathématiques","niveau":"Lycée","description":"test"}' | head -c 200; echo; echo
echo "== publication refusée (apprenant) =="
curl -s -X POST $B/api/ressources -H "Content-Type: application/json" -H "Authorization: Bearer $TOKA" -d '{"titre":"x","type":"fiche"}' | head -c 150; echo; echo

echo "== admin utilisateurs =="; curl -s $B/api/admin/utilisateurs -H "Authorization: Bearer $TOK" | head -c 250; echo; echo
echo "== admin refusé (apprenant) =="; curl -s $B/api/admin/utilisateurs -H "Authorization: Bearer $TOKA" | head -c 120; echo; echo

echo "== pages statiques =="
for p in / /categories /ressources /catalogue /multimedia /ressources-multimedias-enseignants /methodologie /ressources-methodologiques-enseignant /pedagogie /ressources-pedagogiques-enseignant /ressources-pedagogiques-eleves /tableau-ressources /laboratoire /simulations /experiences /nouveau-laboratoire /outils-educatifs /ajouter-outil /dissertations /nouvelle-dissertation /exposes /travaux-pratiques /travaux-diriges /creer-travail-dirige /creer-quiz /banque-questions /cartes-geographiques /examens /forum /partage /groupes /outils /quiz /quiz-jouer /ressource /paiement /apropos /connexion /inscription /dashboard /css/styles.css /js/app.js; do printf "%-24s -> %s\n" $p $(curl -s -o /dev/null -w "%{http_code}" $B$p); done
echo "== 404 =="; curl -s -o /dev/null -w "%{http_code}\n" $B/inexistant
echo "== traversée répertoire =="; curl -s -o /dev/null -w "%{http_code}\n" --path-as-is "$B/../lib/db.js"

kill $SRV 2>/dev/null
echo "== FIN DES TESTS =="
