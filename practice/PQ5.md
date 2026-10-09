# PQ5: The leaked report and the contractor's key

Posted after Day 5. Attempt it without notes in about 35 minutes, then compare your answer with the guidance below. Bring your attempt to the review session.

## Scenario

The pilot runs as you have built it up to Day 5: the web tier reads `thara-reports-<student id>` through `thara-web-role`, the bucket has Block Public Access on, and `thara-trail` delivers to `thara-audit-<student id>`. GuardDuty has not been enabled in this account. IAM Access Analyzer has.

Some weeks ago a contractor was engaged for **two days** to find out why report downloads were slow. All he needed was to read the log files in the audit bucket. The engineer on duty was busy. She created an IAM user for him, gave it an access key, and attached a policy that allows every S3 action on every resource, "to be removed on the second evening". It was not removed.

Yesterday a patient's laboratory report was found on a public forum, with a link that opens for anyone. This is what the Data Protection Officer has been shown so far.

- IAM Access Analyzer holds a finding, four days old: `thara-reports-<student id>` allows public access.
- CloudTrail event history holds two events, four days old, both made with the contractor's access key, from an address that is not Thara's and not the contractor's office. The first turned Block Public Access off on the reports bucket. The second put a bucket policy on it that allows anyone to read its objects.
- The contractor says that he did not do this, and that the key was in a file on a laptop he no longer has.

Constraints you should notice:

- The need was **two days** of **read access to logs**. What was granted was everything in S3, with no end.
- Laboratory reports are **special-category** personal data.
- Every administrative action must be **attributable to a named person**.
- The CFO will approve controls that cost little, and wants each one priced.

Use these rounded prices. Do not rely on remembered ones.

| Item | Price |
|---|---|
| A customer-managed KMS key | About USD 1 a month |
| A trail's first copy of management events | No charge |
| GuardDuty | No charge for a 30-day trial, then charged by the volume it analyses |
| IAM Access Analyzer, for access from outside the account | No charge |
| A role, a policy, MFA | No charge |

## Questions

**(a) Explain (6 marks).** Explain the order in which AWS decides whether a request is allowed, naming the two different ways a request can be refused. Then explain how a role with temporary credentials differs from an IAM user with an access key. Last, explain why the fact that the reports bucket was encrypted did not prevent this leak.

**(b) Apply (8 marks).**

- Write the statements of the identity-based policy that the contractor should have had, giving the effect, the action and the resource of each.
- Say how he should have been given that access, and what would have ended it without anyone having to remember.
- From the two events, state what the Data Protection Officer can now say as fact, naming the fields of an event that support it. Then state two things the events cannot tell her.
- Choose one control for each of these four threats, and say where in the architecture it sits: access that outlives the job; a reports bucket made public; misuse that nobody notices for four days; a copied disk or snapshot.

**(c) Evaluate (6 marks).** Two proposals are made at the review.

1. A colleague: "The bucket was encrypted the whole time. Nobody outside could really have read those reports, so there is nothing to tell the patients."
2. A second colleague: "From now on, give every contractor a user with read-only access to everything and delete it when they leave. Read-only cannot hurt."

Evaluate each proposal against the scenario: say what is right in it, what is wrong, and how it would fail. Finish with a judgement for the Data Protection Officer: what must be done today, what will remain unknown, what the controls you chose in (b) cost each month, and what would change your view.

## Answer guidance

This guidance describes what a strong answer covers. It is not a model answer to memorise; the marks go to reasoning applied to Thara.

**(a)** A strong answer says that AWS gathers every statement that applies to a request and decides in a fixed order. If any statement with the effect Deny matches, the request is refused, whatever else allows it: an explicit deny. If none does and a statement with the effect Allow matches, the request is allowed. If neither matches, it is refused: an implicit deny, which is the starting point for everything. The two refusals differ in their cure: an implicit deny is ended by adding an allow, and an explicit deny only by removing it. On identities: an IAM user has credentials of its own, and an access key works from anywhere until someone deletes it in IAM. A role has no credentials of its own. It is assumed by whoever its trust policy names, and each time it issues temporary credentials that expire by themselves within hours. On encryption: encryption at rest protects stored data against someone who copies the storage. It does not decide who may ask for an object. With the bucket's default encryption, S3 decrypts an object for any principal that the policies allow to read it, and once the bucket policy allowed everyone, S3 decrypted for everyone. Encryption and access control are separate questions.

**(b)** A strong answer writes two statements. One has the effect Allow, the action `s3:ListBucket` and the resource `arn:aws:s3:::thara-audit-<student id>`. The other has the effect Allow, the action `s3:GetObject` and the resource `arn:aws:s3:::thara-audit-<student id>/*`. Listing acts on the bucket and reading acts on its objects, so the two resources differ. Nothing else is granted, so every other action, including any change to the reports bucket, would have met an implicit deny. He should have been given a role to assume, with that policy, signing in as himself with MFA, and not a key in a file. The role's credentials expire by themselves, so on the third day there would have been nothing left to remove and nothing on the laptop worth stealing. From the events, the Data Protection Officer can say as fact: which actions were taken and on which resource (the event name and the resource name), when (the event time), with which credential (the user name and the access key), and from which address (the source IP address). She cannot say which person was at the keyboard, because the key works for whoever holds the file. And she cannot say from these events which reports were downloaded or by whom: reading an object is a data event, which the trail does not record unless it has been asked to. For the four threats: access that outlives the job is closed by a role with temporary credentials, in IAM. A bucket made public is closed by least privilege, since a policy without the action cannot change the bucket's settings, and it is caught by IAM Access Analyzer, which reads the bucket's policy; an explicit deny on changing the bucket's public access settings, for every identity that does not need it, is stronger still. Misuse that nobody notices is closed by GuardDuty, which reads CloudTrail events and would have reported a credential used from an unusual place, with someone assigned to read its findings. A copied disk or snapshot is closed by encryption at rest with `alias/thara-records`, in KMS.

**(c)** A strong answer takes the proposals separately. The first is right that the bucket was encrypted and wrong about what that means. Encryption at rest protects copied storage. For four days the bucket policy allowed anyone to read, and S3 decrypted each object for whoever asked. The reports must be treated as exposed, and the patients and the Data Protection Officer's own obligations follow from that. The proposal would fail at the first question an auditor asks: who could read the data? The second is right that read-only access cannot change a bucket's settings, so this exact attack would have failed. It is wrong for Thara: read-only access to everything includes every laboratory report, which is special-category data that a log analyst has no reason to see, and "delete it when they leave" is the same promise that was broken this time. A control that depends on someone remembering is the weakness, not the cure. For the Data Protection Officer, today: delete the contractor's access key and user in IAM; switch Block Public Access back on and remove the public bucket policy; confirm that the Access Analyzer finding resolves; check event history for anything else done with that key, including new users or keys that an attacker might have created to keep access. What will remain unknown is which reports were read and by whom, because object reads were not being recorded; the honest position is that every report in the bucket for those four days may have been. The monthly cost of the controls chosen in (b) is about USD 1 for the key, nothing for the role, the policy, MFA, the trail and Access Analyzer, and a GuardDuty charge after its trial that depends on volume and should be read from its usage page before the trial ends, so that the CFO sees the figure before she is asked to pay it. What would change the view: evidence that object reads had been recorded, which would turn "may have been read" into a list; a finding that the key was used elsewhere, which would widen the incident beyond one bucket; or a GuardDuty charge after the trial that the pilot's ceiling cannot carry, which would reopen the question of who reads the trail by hand.
