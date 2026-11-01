const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const prefix=fs.readFileSync(path.join(__dirname,'cooking.cjs'),'utf8').split('\n(async()=>{')[0];
const environment=new Function('require','__dirname',prefix+'\nreturn environment')(require,__dirname);
(async()=>{
 const root=path.resolve(__dirname,'..'),e=environment(fs.readFileSync(root+'/index.html','utf8'));await e.run('load()');
 e.run('userSession={user:{id:"owner",email:"test@example.fr",user_metadata:{name:"Camille <test>"}}};favoriteRecipes.add("R01");recipeHistory=[{id:"history"}]');
 assert.match(e.run('connectedAccountMarkup()'),/TON COIN CUISINE/);assert.doesNotMatch(e.run('connectedAccountMarkup()'),/👤|<test>/);assert.match(e.run('connectedAccountMarkup()'),/Mes favoris/);
 e.run('supabaseClient.auth={signOut:async()=>({error:{message:"network"}})}');await e.run('signOutAccount()');assert.equal(e.run('userSession.user.id'),'owner');assert.equal(e.run('favoriteRecipes.has("R01")'),true);assert.match(e.run('accountError'),/n’a pas abouti/);assert.equal(e.run('signingOut'),false);
 e.run('let logoutCalls=0,logoutScope=null,finishLogout;supabaseClient.auth.signOut=options=>{logoutCalls++;logoutScope=options.scope;return new Promise(resolve=>finishLogout=resolve)}');
 const first=e.run('signOutAccount()');await e.run('signOutAccount()');assert.equal(e.run('logoutCalls'),1);assert.equal(e.run('signingOut'),true);assert.match(e.run('connectedAccountMarkup()'),/disabled aria-busy="true"/);
 e.run('finishLogout({error:null})');await first;assert.equal(e.run('logoutScope'),'local');assert.equal(e.run('userSession'),null);assert.equal(e.run('favoriteRecipes.size+recipeHistory.length'),0);assert.equal(e.run('signingOut'),false);assert.equal(e.element('authPanel').hidden,false);
 console.log('PASS: compte échappé, erreur conservant la session, double clic bloqué, déconnexion locale, données en mémoire nettoyées et retour à la connexion.');
})().catch(error=>{console.error(error);process.exitCode=1});
