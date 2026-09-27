# Group capstone: the Thara Hospitals patient portal pilot

**Weight:** 30% of the module. **Group size:** three (four where cohort size requires).
**Available:** from the start of the module; walked through in class on Day 4. **Submission:** after the review session. **Viva:** after submission. Exact dates are announced for your cohort.

## 1. The task

Thara Hospitals has approved a six-month pilot to move the patient portal and its database to AWS. Your group is the pilot team. Build components 4 to 12 of the canonical architecture ([diagram](../scenario/architecture.svg)) in one member's account, to the requirements in [the scenario](../scenario/organisation.md), section 4, inside the CFO's ceiling of USD 150 a month at production scale, and defend the design.

## 2. Requirements you must meet

1. A public portal reachable from the internet through a load balancer across two availability zones, with the web tier in private subnets and an Auto Scaling group of minimum two.
2. A patient-records database in private subnets, reachable only from the web tier's security group and the bastion, encrypted with a customer-managed key.
3. A laboratory-reports bucket with Block Public Access on, versioning, a lifecycle rule, and a bucket policy that admits only the web tier's role.
4. Private administrative access via a bastion whose SSH source is the Colombo IT office address (your current address stands in for it).
5. Patching for the private tier without a public address (a bounded NAT gateway window is acceptable; document its hours).
6. CloudTrail delivering to an audit bucket; VPC Flow Logs enabled; one CloudWatch alarm with an SNS notification.
7. A backup plan for the database and a **tested** restore with a measured RTO against the target of two hours; an RPO of one hour argued from the backup schedule.
8. Member access to the host account through IAM users with least-privilege policies per tier (network, security, data), written by the group.
9. A Pricing Calculator estimate for production scale (assume 730 hours a month for everything that would run continuously) inside USD 150, and an actual cost ledger for the build.

## 3. Deliverables

1. The running environment, demonstrated live at the viva (a five-minute screen recording is the fallback if the account has expired).
2. An architecture diagram using the canonical component numbers.
3. A design justification of no more than 2,500 words: network layout, security controls, resilience choices, and cost. Every choice is tied to a requirement in section 2 or to a voice in the scenario.
4. The Pricing Calculator estimate (exported) and the build cost ledger.
5. A threat table of at least eight threats, each with the control that addresses it and where in the architecture the control sits.
6. The three tier IAM policies as JSON and the member sign-in test record from Day 5.
7. A contribution statement signed by all members, listing who built and who wrote what.

## 4. Marking

| Criterion | Weight | Distinction looks like |
|---|---|---|
| Architecture correctness | 25% | Every requirement met; routing and placement right; nothing public that should not be |
| Security reasoning | 25% | Threat table drives the controls; least privilege demonstrated, not asserted; the DPO's questions answered |
| Resilience and data management | 20% | Tested restore with measured RTO; scaling shown to work; backup schedule argued from RPO |
| Cost reasoning and evidence | 15% | Estimate inside the ceiling with the largest lines explained; ledger matches Cost Explorer; bounded windows documented |
| Group viva | 15% | Each member answers on a tier other than their own |

A peer-assessment factor of plus or minus 10% may be applied to an individual's share where the contribution statement and viva performance justify it and programme regulations permit.

## 5. Cost rules for the build

The load balancer exists only during testing windows and the demonstration. The NAT gateway exists only while patching. RDS may run continuously during the final week only. Instances are stopped when nobody is working. The ledger shows the hours of each. A host account that runs out of credits may rotate hosting to another member; the rebuild is itself good practice and is not penalised.

## 6. What the viva asks

Fifteen minutes. Each member is asked about a tier that was not their primary responsibility. Expect: "walk me through a request from a patient to the database", "what happens if AZ a fails", "show me who accessed the audit bucket last week", "what would you cut if the CFO halved the ceiling".
