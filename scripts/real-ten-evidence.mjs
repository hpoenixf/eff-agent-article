const SHA = /^[a-f0-9]{40}$/;
const ensure = (value, message) => { if (!value) throw new Error(message); };
const stable = value => JSON.stringify(value, (_, v) => v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map(k => [k, v[k]])) : v);
// These two receipts describe actual retained cohorts, not a new execution runner.
// Both repositories use this one data-only validator; historical five-task evidence is immutable.
export function validateRealTenEvidence(evidence, scenario) {
 const admission=scenario==='shared-admission', version=admission?'017':'018', hash=/^[a-f0-9]{64}$/;
 ensure(['shared-admission','schedule-occurrence'].includes(scenario) && evidence?.schemaVersion===1 && evidence.kind===`v${version}-real-ten-release-qualification-candidate` && evidence.version===`0.${admission?17:18}.0`, 'Wrong real-ten scenario receipt');
 ensure(SHA.test(evidence.localExecutionCommit) && SHA.test(evidence.localExecutionTree) && hash.test(evidence.executionIdentity) && evidence.sourceInputRechecked===true && evidence.realProviderApplicability==='supported-with-stated-scope', 'Invalid real-ten execution identity');
 for(const name of ['frozenPlanSha256','frozenPlanFileSha256','retainedStateSha256','readbackSha256','independentAcceptanceSha256','mechanicalPolicySha256']) ensure(hash.test(evidence[name]), 'Missing frozen real-ten evidence identity');
 for(const name of ['historicalResultsRewritten','oldUnknownSettled','liveContentionClaim','globalCapacityCertification','sameInterruptedAdmissionGroupRecoveryClaim','financialSemanticQualification','contentQualityAffectsSuccess']) ensure(evidence[name]===false, 'Real-ten scope cannot expand historical or capacity claims');
 ensure(Array.isArray(evidence.knownRuntimeIssuesObservedWithinStatedScope) && evidence.knownRuntimeIssuesObservedWithinStatedScope.length===0, 'Real-ten known Runtime issues must be explicitly empty');
 const g=evidence.normalGate, successes=admission?9:10;
 ensure(g?.planned===10 && g.attempted===10 && g.notRun===0 && g.requiredSuccesses===9 && g.threshold===0.9 && g.successes===successes && g.observedRate===successes/10, 'Frozen real-ten denominator/successes changed');
 ensure(Array.isArray(g.tasks) && g.tasks.length===10 && Array.isArray(g.taskIds) && g.taskIds.length===10 && new Set(g.taskIds).size===10 && new Set(g.tasks.map(t=>t.id)).size===10 && stable(g.taskIds)===stable(g.tasks.map(t=>t.id)), 'Missing/duplicated original real-ten tasks');
 const decision=evidence.mechanicalDecision;
 ensure(decision?.policy==='real-ten-min-nine-20261102' && decision.eligible===true && decision.planned===10 && decision.attempted===10 && decision.successes===successes && decision.observedRate===g.observedRate, 'Mechanical real-ten decision differs from cohort');
 const safe=evidence.separateSafetyGate, safetyPath=admission?'docs/verification/v017-admission-offline.safe.json':'docs/verification/v018-schedule.safe.json';
 ensure(evidence.separateSafetyGatePassed===true && safe?.passed===true && safe.sameExecutionSource===true && safe.receipt===safetyPath && Number.isSafeInteger(safe.fullSuitePassed) && safe.fullSuitePassed>0 && safe.fullSuiteFailed===0 && safe.independentInstallAndBuild===true && safe.offlineSafetyNotInRealTaskDenominator===true && safe.sameFixedExecutionInputsRechecked===true && hash.test(safe.offlineReceiptSha256) && safe.independentTenTaskAcceptanceSha256===evidence.independentAcceptanceSha256, 'Separate real-ten safety binding missing');
 ensure(safe[admission?'originalTwoProcessNormalAndUnknown':'originalScheduleSafetyAndHistoricalOpener']===true, 'Missing original separate safety');
 const history=evidence.historicalFiveTaskReceipt;
 ensure(history?.path===`docs/verification/v${version}-release.safe.json` && hash.test(history.sha256) && history.unchanged===true && history.includedInNewNormalNumerator===false, 'Historical five-task receipt cannot become the real-ten numerator');
 const inputFiles=evidence.inputFiles;
 ensure(Array.isArray(inputFiles) && inputFiles.length>0 && inputFiles.length<=4096 && new Set(inputFiles.map(f=>f.path)).size===inputFiles.length, 'Invalid real-ten input inventory');
 for(const f of inputFiles) ensure(typeof f.path==='string' && /^[a-zA-Z0-9_./-]+$/.test(f.path) && !f.path.split('/').some(p=>!p || p==='.' || p==='..') && /^(src\/|fixtures\/|package(?:-lock)?\.json$|scripts\/build\.mjs$)/.test(f.path) && SHA.test(f.gitBlob) && hash.test(f.sha256), 'Invalid real-ten input identity');
 const reports=[];let physical=0, confirmed=0, unknown=0;
 const common=['original-admission-input-hash-to-wire','original-publication-body-receipt-event','actual-report-byte-readback','zero-provider-cold-inspection'];
 for(const [index,t] of g.tasks.entries()) {
  ensure(t.id===`fresh-v${admission?17:18}-ten-20261103-${String(index+1).padStart(2,'0')}` && t.frozenTaskIndex===index && t.executionIdentity===evidence.executionIdentity && t.realProvider===true && hash.test(t.questionSha256) && hash.test(t.sourcePlanSha256) && hash.test(t.originalResultSha256) && t.originalResultHashAlgorithm==='sha256-original-canonical-json', 'Real-ten task identity/plan drift');
  ensure(Number.isSafeInteger(t.physicalRequests) && t.physicalRequests>0 && t.physicalRequests<=57, 'Invalid physical request count');physical+=t.physicalRequests;
  if(admission && index===4) {
   ensure(t.status==='unknown' && t.eligibleSuccess===false && t.runtimeAccepted===false && t.workflowCompleted===false && t.deliveryReadback===false && t.onTime===false && t.unknownEffects===true && t.physicalRequests===2 && t.retainedUnknownRequestCount===2 && t.report===null && Array.isArray(t.mechanisms) && t.mechanisms.length===0 && t.cohortPhase==='retained-interrupted-unknown', 'Original task05 unknown and two reservations must remain retained');unknown+=t.physicalRequests;
  } else {
   ensure(t.status==='success' && t.eligibleSuccess===true && t.runtimeAccepted===true && t.workflowCompleted===true && t.deliveryReadback===true && t.onTime===true && t.unknownEffects===false && t.completedAdmissionTickets===t.physicalRequests && t.admissionLiveContentionClaim===false, 'Original successful real-ten task evidence missing');confirmed+=t.physicalRequests;
   ensure(Array.isArray(t.mechanisms) && common.every(m=>t.mechanisms.includes(m)) && ['publicationEvidenceSha256','admissionEvidenceSha256','coldReaderEvidenceSha256'].every(k=>hash.test(t[k])), 'Original Publication/Admission/readback identity missing');
   ensure(t.report?.path===`docs/verification/v${version}-real-ten-reports/task-${String(index+1).padStart(2,'0')}.md` && hash.test(t.report.sha256) && Number.isSafeInteger(t.report.bytes) && t.report.bytes>0 && t.report.synthetic===true, 'Original real-ten report identity missing');reports.push(t.report);
   if(admission) ensure(t.cohortPhase===(index<4?'retained-pre-interruption-success':'original-unrun-task-in-isolated-new-admission-group'), 'Four retained/five isolated Admission successes must remain distinct');
   else ensure(t.scheduleApiOnly===true && hash.test(t.scheduleEvidenceSha256) && ['original-schedule-confirm-before-actual-due','zero-dispatch-pre-due-and-materialization','single-explicit-wake-same-run-worker','schema5-session-read-only-reader'].every(m=>t.mechanisms.includes(m)), 'Original Schedule API scope missing');
  }
  ensure(t.sourcePlanSha256===(admission && index<5?g.tasks[0].sourcePlanSha256:evidence.frozenPlanSha256), 'Frozen task source plan differs');
 }
 ensure(reports.length===successes && new Set(reports.map(r=>r.path)).size===successes && evidence.physicalRequests===physical && evidence.confirmedGoZeroResponses===confirmed && evidence.unknownBillingOrOutcomeReservations===unknown && physical===confirmed+unknown, 'Real-ten physical/confirmed/unknown accounting differs');
 if(admission) {
  const c=evidence.interruptionAndContinuation;
  ensure(c?.originalTenFrozenBeforeRun===true && c.originalSuccessesRetained===4 && c.originalUnknownTaskIndex===4 && c.originalUnknownReservations===2 && stable(c.originalUnrunTaskIndicesExecuted)===stable([5,6,7,8,9]) && c.originalUnknownNeverReplayed===true && c.newIndependentAdmissionGroup===true && c.originalGroupCapacityPreserved===true && hash.test(c.originalCapacitySha256) && c.sharedAdmissionConfigurationUnchanged===true && c.sameGroupRecoveryClaim===false && c.crossGroupGlobalCapacityClaim===false && c.unknownRemoteCompletionStillUnresolved===true, 'Admission interruption/isolated continuation boundary changed');
 } else ensure(evidence.liveCliClaim===false && evidence.backgroundOrRecurrence===false && evidence.singleExplicitWake===true && evidence.sessionReaderReadOnly===true && evidence.admissionReaderReadOnlyApiClaim===false && evidence.admissionInspectionInventoryUnchanged===true, 'Schedule API evidence cannot claim live CLI/background/read-only Admission API');
 return {inputFiles,report:reports[0],reportFiles:reports};
}
