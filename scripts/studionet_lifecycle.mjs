import{createClient,createAccount}from'../frontend/node_modules/genlayer-js/dist/index.js';
import{studionet}from'../frontend/node_modules/genlayer-js/dist/chains/index.js';
import{existsSync,mkdirSync,readFileSync,writeFileSync}from'node:fs';
const address=process.env.DORMANT_KEY_ADDRESS;if(!/^0x[0-9a-f]{40}$/i.test(address||''))throw Error('SET_DORMANT_KEY_ADDRESS');
const ROOT=new URL('../../',import.meta.url),stateDir=new URL('./.state/',import.meta.url),stateFile=new URL('./.state/studionet.json',import.meta.url),evidenceFile=new URL('../docs/STUDIONET_E2E.json',import.meta.url);mkdirSync(stateDir,{recursive:true});
const encode=x=>JSON.stringify(x,(_,v)=>typeof v==='bigint'?String(v):v,2),sleep=ms=>new Promise(r=>setTimeout(r,ms));
function secrets(){return Object.fromEntries(readFileSync(new URL('secrets/genlayer-test-wallets.env',ROOT),'utf8').split(/\r?\n/).filter(x=>x.includes('=')).map(x=>{const i=x.indexOf('=');return[x.slice(0,i),x.slice(i+1).replace(/^<|>$/g,'').trim()]}));}
function account(which){const key=secrets()[`SERVICE_LEDGER_KEY_${which}`];if(!key)throw Error(`MISSING_TEST_WALLET_${which}`);return createAccount(key.startsWith('0x')?key:`0x${key}`)}
function signer(which){return createClient({chain:studionet,account:account(which)})}const reader=createClient({chain:studionet}),read=(functionName,args=[])=>reader.readContract({address,functionName,args});
let state=existsSync(stateFile)?JSON.parse(readFileSync(stateFile,'utf8')):{address,startedAt:new Date().toISOString(),actions:{},readbacks:{}};if(state.address.toLowerCase()!==address.toLowerCase())throw Error('STATE_ADDRESS_MISMATCH');const save=()=>writeFileSync(stateFile,encode(state)+'\n');
async function receipt(hash,allowError=false){for(let i=0;i<120;i++){const tx=await reader.getTransaction({hash}),status=String(tx.statusName||tx.status_name||tx.status||'').toUpperCase();if(['ACCEPTED','FINALIZED','UNDETERMINED'].includes(status)){const rs=(tx.consensus_data?.leader_receipt||[]).filter(x=>x.result?.payload!=='idle'),success=rs.length>0&&rs.every(x=>x.execution_result==='SUCCESS'),result=rs[0]?.result?.payload??null;if(!success&&!allowError)throw Error(`GENVM_ERROR ${hash} ${result}`);return{status,execution:success?'SUCCESS':'ERROR',result};}await sleep(3000)}throw Error(`PENDING_NO_RESUBMIT ${hash}`)}
async function send(name,who,functionName,args=[],allowError=false){let item=state.actions[name];if(!item){item=state.actions[name]={who,functionName,args,phase:'SENDING',submittedAt:new Date().toISOString()};save();const raw=await signer(who).writeContract({address,functionName,args});item.hash=typeof raw==='string'?raw:raw?.hash||raw?.txId||raw?.transactionHash;if(!item.hash)throw Error(`MALFORMED_TX_RESPONSE ${name}`);item.phase='SUBMITTED';save()}item.receipt=await receipt(item.hash,allowError);item.phase='VERIFIED';save();console.log(encode({name,hash:item.hash,receipt:item.receipt}));return item}
async function waitUntil(epoch){while(Date.now()<epoch*1000+1500){console.log(`WAITING_UNTIL ${new Date(epoch*1000).toISOString()}`);await sleep(Math.min(30000,epoch*1000+1500-Date.now()))}}
async function main(){
 const config=await read('get_config');if(config.version!=='DORMANT_KEY_RECOVERY_V1')throw Error(`VERSION_MISMATCH ${config.version}`);state.initialConfig=config;
 const A=account('A').address,B=account('B').address,protectedKey='0x'+'77'.repeat(20),newKey='0x'+'88'.repeat(20);state.accounts={ownerAndGuardianA:A,guardianB:B,protectedKey,newKey};if(state.charterId===undefined)state.charterId=Number(config.charter_count);save();
 await send('create_charter','A','create_charter',[protectedKey,[A,B],2,60,60]);
 await send('failure_unauthorized_heartbeat','B','record_activity',[state.charterId],true);
 let charter=await read('get_charter',[state.charterId]);await waitUntil(Number(charter.last_activity_at)+60);
 if(state.caseId===undefined){state.caseId=Number((await read('get_config')).case_count);save()}
 await send('open_recovery','B','open_recovery',[state.charterId,newKey,'The protected administrative key missed its canonical heartbeat; both configured guardians independently reviewed the committed recovery evidence.','a'.repeat(64)]);
 await send('guardian_a_approve','A','guardian_vote',[state.caseId,true]);await send('guardian_b_approve','B','guardian_vote',[state.caseId,true]);
 await send('assess','A','assess',[state.caseId]);let recovery=await read('get_case',[state.caseId]);
 if(recovery.state==='CHALLENGED'){await send('resolve_challenge','A','resolve_challenge',[state.caseId,'The owner reviewed the guardian quorum, canonical heartbeat expiry, replacement address and committed evidence digest; the bounded recovery may proceed after the original challenge window.']);recovery=await read('get_case',[state.caseId])}
 if(recovery.state==='ELIGIBLE'){await waitUntil(Number(recovery.challenge_until));await send('finalize','B','finalize',[state.caseId]);recovery=await read('get_case',[state.caseId])}
 if(recovery.state==='AUTHORIZED'){await send('failure_wrong_digest','A','consume_authorization',[state.caseId,'b'.repeat(64)],true);await send('consume','A','consume_authorization',[state.caseId,recovery.authorization_digest]);await send('failure_replay','A','consume_authorization',[state.caseId,recovery.authorization_digest],true)}
 state.readbacks.charter=await read('get_charter',[state.charterId]);state.readbacks.recovery=await read('get_case',[state.caseId]);state.finalConfig=await read('get_config');state.completedAt=new Date().toISOString();save();writeFileSync(evidenceFile,encode(state)+'\n');console.log(encode({complete:true,evidence:new URL(evidenceFile).pathname,state:state.readbacks.recovery.state}))
}
await main();
