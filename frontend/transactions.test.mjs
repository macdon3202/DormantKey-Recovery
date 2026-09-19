import test from'node:test';import assert from'node:assert/strict';import{normalizeHash,receiptState,VERSION}from'./src/transactions.js';
test('guards contract version',()=>assert.equal(VERSION,'DORMANT_KEY_RECOVERY_V1'));
test('normalizes transaction hashes',()=>{const h='0x'+'ab'.repeat(32);assert.equal(normalizeHash({txId:h}),h);assert.throws(()=>normalizeHash({}),/valid transaction hash/)});
test('reads StudioNet status and embedded errors',()=>{assert.equal(receiptState({statusName:'FINALIZED'}).accepted,true);assert.deepEqual(receiptState({statusName:'ACCEPTED',consensus_data:{leader_receipt:[{execution_result:'ERROR',result:{payload:'OWNER_ONLY'}}]}}),{label:'ACCEPTED',accepted:false,failed:true,reason:'OWNER_ONLY'})});
