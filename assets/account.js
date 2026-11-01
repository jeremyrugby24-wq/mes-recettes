let signingOut=false,accountError='';
function connectedAccountMarkup(){
 const user=userSession.user,meta=user.user_metadata||{},name=(meta.full_name||meta.name||user.email?.split('@')[0]||'Mon compte').trim(),first=name.split(/\s+/)[0];
 return '<div class="authHero accountHero"><span class="accountPortrait" aria-hidden="true">'+esc(first.charAt(0).toUpperCase())+'</span><span class="accountEyebrow">TON COIN CUISINE</span><h2>Bonjour '+esc(first)+' !</h2><p>Tes bonnes recettes, toujours à portée de main.</p></div><div class="authContent accountContent"><div class="accountIdentity"><span class="accountStatus">Compte connecté</span><span class="accountEmail">'+esc(user.email||'')+'</span></div><nav class="accountShortcuts" aria-label="Accéder à mon espace"><button data-account-tab="plan">Mon planning <span aria-hidden="true">→</span></button><button data-account-tab="favorites">Mes favoris <span aria-hidden="true">→</span></button><button data-account-tab="history">Mon historique <span aria-hidden="true">→</span></button></nav><div class="accountSignOut"><p>Tu peux te déconnecter sur cet appareil. Ton planning, tes favoris et ton historique restent enregistrés dans ton compte.</p><p id="accountMessage" role="status" aria-live="polite">'+esc(accountError)+'</p><button class="btn accountSignOutButton" id="signOut" '+(signingOut?'disabled aria-busy="true"':'')+'>'+ (signingOut?'Déconnexion en cours…':'Se déconnecter')+'</button></div></div>';
}
async function signOutAccount(){
 if(signingOut)return;
 signingOut=true;accountError='';renderAuth();
 try{
  const {error}=await supabaseClient.auth.signOut({scope:'local'});
  if(error)throw error;
  userSession=null;clearPersonalSpace();render();renderPlan();showPanel('auth');showToast('Tu es déconnecté sur cet appareil');
 }catch{accountError='La déconnexion n’a pas abouti. Vérifie ta connexion et réessaie.'}
 finally{signingOut=false;renderAuth();document.getElementById(userSession?'signOut':'authEmail')?.focus()}
}
document.addEventListener('click',event=>{const link=event.target.closest('[data-account-tab]');if(link){personalTab=link.dataset.accountTab;showPanel('plan')}});
