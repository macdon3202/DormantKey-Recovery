C="contracts/dormant_key_recovery.py";O="0x"+"11"*20;G1="0x"+"22"*20;G2="0x"+"33"*20;G3="0x"+"44"*20;NEW="0x"+"55"*20;X="0x"+"66"*20
def sender(a):return bytes.fromhex(a[2:])
def deploy(vm,d):vm.warp("2026-09-19T08:00:00+00:00");vm.strict_mocks=True;vm.check_pickling=True;return d(C,sdk_version="v0.2.16")
def charter(c,vm):
 with vm.prank(sender(O)):c.create_charter(O,[G1,G2,G3],2,60,60)
def open_case(c,vm):
 vm.warp("2026-09-19T08:02:00+00:00")
 with vm.prank(sender(G1)):c.open_recovery(0,NEW,"Two devices holding the administrative key were destroyed and documented by guardians.","a"*64)
def approve(c,vm):
 with vm.prank(sender(G1)):c.guardian_vote(0,True)
 with vm.prank(sender(G2)):c.guardian_vote(0,True)
def mock(vm,decision="ALLOW",aligned="YES",risk="NO",enough="YES"):vm.mock_llm("DORMANT_KEY_RECOVERY_ASSESSMENT_V1",{"decision":decision,"charter_aligned":aligned,"takeover_risk":risk,"evidence_sufficient":enough})

def test_happy_lifecycle_and_single_use(direct_vm,direct_deploy):
 c=deploy(direct_vm,direct_deploy);charter(c,direct_vm);open_case(c,direct_vm);approve(c,direct_vm);mock(direct_vm)
 with direct_vm.prank(sender(G1)):c.assess(0)
 assert c.get_case(0).state=="ELIGIBLE" and c.get_case(0).assessment=="ALLOW"
 with direct_vm.prank(sender(G1)),direct_vm.expect_revert("CHALLENGE_WINDOW_OPEN"):c.finalize(0)
 direct_vm.warp("2026-09-19T08:04:00+00:00");digest=c.finalize(0)
 with direct_vm.prank(sender(X)),direct_vm.expect_revert("OWNER_ONLY"):c.consume_authorization(0,digest)
 with direct_vm.prank(sender(O)),direct_vm.expect_revert("AUTHORIZATION_MISMATCH"):c.consume_authorization(0,"b"*64)
 with direct_vm.prank(sender(O)):c.consume_authorization(0,digest)
 assert c.get_case(0).state=="CONSUMED"
 with direct_vm.prank(sender(O)),direct_vm.expect_revert("CASE_NOT_AUTHORIZED"):c.consume_authorization(0,digest)

def test_heartbeat_is_authoritative(direct_vm,direct_deploy):
 c=deploy(direct_vm,direct_deploy);charter(c,direct_vm)
 with direct_vm.prank(sender(G1)),direct_vm.expect_revert("KEY_NOT_DORMANT"):c.open_recovery(0,NEW,"Lost key","a"*64)
 with direct_vm.prank(sender(X)),direct_vm.expect_revert("PROTECTED_KEY_ONLY"):c.record_activity(0)
 direct_vm.warp("2026-09-19T08:00:30+00:00")
 with direct_vm.prank(sender(O)):c.record_activity(0)
 direct_vm.warp("2026-09-19T08:01:01+00:00")
 with direct_vm.prank(sender(G1)),direct_vm.expect_revert("KEY_NOT_DORMANT"):c.open_recovery(0,NEW,"Lost key","a"*64)
 direct_vm.warp("2026-09-19T08:01:31+00:00")
 with direct_vm.prank(sender(G1)):c.open_recovery(0,NEW,"Lost key","a"*64)

def test_guardian_and_duplicate_vote(direct_vm,direct_deploy):
 c=deploy(direct_vm,direct_deploy);charter(c,direct_vm);open_case(c,direct_vm)
 with direct_vm.prank(sender(X)),direct_vm.expect_revert("GUARDIAN_ONLY"):c.guardian_vote(0,True)
 with direct_vm.prank(sender(G1)):c.guardian_vote(0,True)
 with direct_vm.prank(sender(G1)),direct_vm.expect_revert("ALREADY_VOTED"):c.guardian_vote(0,True)

def test_quorum_and_assessor_authorization(direct_vm,direct_deploy):
 c=deploy(direct_vm,direct_deploy);charter(c,direct_vm);open_case(c,direct_vm)
 with direct_vm.prank(sender(G1)):c.guardian_vote(0,True)
 with direct_vm.prank(sender(G1)),direct_vm.expect_revert("QUORUM_NOT_MET"):c.assess(0)
 with direct_vm.prank(sender(G2)):c.guardian_vote(0,True)
 with direct_vm.prank(sender(X)),direct_vm.expect_revert("GUARDIAN_ONLY"):c.assess(0)

def test_vote_challenge_blocks_allow(direct_vm,direct_deploy):
 c=deploy(direct_vm,direct_deploy);charter(c,direct_vm);open_case(c,direct_vm);approve(c,direct_vm)
 with direct_vm.prank(sender(G3)):c.guardian_vote(0,False)
 mock(direct_vm)
 with direct_vm.prank(sender(G1)):c.assess(0)
 assert c.get_case(0).state=="CHALLENGED"
 with direct_vm.prank(sender(X)),direct_vm.expect_revert("OWNER_ONLY"):c.resolve_challenge(0,"Reviewed")
 with direct_vm.prank(sender(O)):c.resolve_challenge(0,"The challenged evidence was reviewed against the charter and guardian records.")
 assert c.get_case(0).state=="ELIGIBLE"

def test_unsafe_allow_becomes_insufficient(direct_vm,direct_deploy):
 c=deploy(direct_vm,direct_deploy);charter(c,direct_vm);open_case(c,direct_vm);approve(c,direct_vm);mock(direct_vm,"ALLOW","NO","YES","NO")
 with direct_vm.prank(sender(G1)):c.assess(0)
 assert c.get_case(0).state=="CHALLENGED" and c.get_case(0).assessment=="INSUFFICIENT"

def test_invalid_and_duplicate_opening(direct_vm,direct_deploy):
 c=deploy(direct_vm,direct_deploy);charter(c,direct_vm);direct_vm.warp("2026-09-19T08:02:00+00:00")
 with direct_vm.prank(sender(G1)),direct_vm.expect_revert("INVALID_NEW_KEY"):c.open_recovery(0,O,"Lost key","a"*64)
 with direct_vm.prank(sender(X)),direct_vm.expect_revert("GUARDIAN_ONLY"):c.open_recovery(0,NEW,"Lost key","a"*64)
 with direct_vm.prank(sender(G1)):c.open_recovery(0,NEW,"Lost key","a"*64)
 with direct_vm.prank(sender(G2)),direct_vm.expect_revert("DUPLICATE_CASE"):c.open_recovery(0,NEW,"Lost key","a"*64)

def test_config(direct_vm,direct_deploy):
 c=deploy(direct_vm,direct_deploy);assert c.get_config()["version"]=="DORMANT_KEY_RECOVERY_V1" and c.get_config()["max_guardians"]==8
