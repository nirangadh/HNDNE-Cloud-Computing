# Thara Hospitals (Pvt) Ltd

*A fictional organisation created for teaching. Any resemblance to a real hospital group is coincidental.*

## 1. Profile

Thara Hospitals is a private hospital group in Sri Lanka: a flagship hospital in Colombo 5 and four branch hospitals in Kandy, Galle, Negombo and Kurunegala. About 1,400 staff. A shared hospital information system (HIS) runs on two ageing servers in the Colombo basement. Patients book appointments and download laboratory reports through a portal on those servers. Branch hospitals reach the HIS over leased lines that fail in monsoon weather. Backups are nightly tape, taken to a cupboard on the third floor.

## 2. What went wrong

During the last south-west monsoon, water entered the basement server room. The portal and the laboratory-reporting system were down for three days. Consultants at the branches worked from paper. Separately, a patient discovered that the laboratory report download link she had been sent by SMS opened for anyone who had the link, with no login.

## 3. The two voices

**Head of IT** wants the patient portal and its database on AWS as a six-month pilot, with the rest of the HIS to follow if the pilot holds. Wants private administrative access from the Colombo IT office, and wants the branches connected to the pilot later without new leased lines.

**Chief Financial Officer** has approved USD 150 a month for the pilot and expects an itemised forecast, a monthly actual against forecast, and an explanation of any line that changes.

A third voice appears in some scenarios: the **Data Protection Officer**, appointed under the Personal Data Protection Act No. 9 of 2022, who will ask where patient data is stored, who can read it, and how the hospital would know if someone did.

## 4. Requirements that drive the baseline

| Requirement | Why it exists in the story | Component(s) |
|---|---|---|
| Public patient portal reachable from anywhere in Sri Lanka | Appointment booking and report download | 2, 6, 12 |
| Portal must ride out morning OPD peaks (07:00 to 10:00) and dengue-season surges | Otherwise the CFO's ceiling buys a bigger server that idles | 12 |
| Laboratory report PDFs stored durably, never publicly listable, link access time-limited | The leaked-link incident | 3 |
| Patient records database reachable only from the web tier and the bastion | Health data is a special category of personal data | 4, 5, 11 |
| RPO 1 hour, RTO 2 hours for patient records | Consultants cannot work from paper again | 11 |
| Every administrative action attributable to a named person | The DPO's question "how would we know" | 10 |
| Encryption at rest for records and reports; TLS at the edge | PDPA expectations and the DPO | 10, 12 |
| Private admin access from Colombo IT; no public database | Head of IT | 5 |
| Web tier patched without being exposed to the internet | Security hygiene | 7, 8 |
| Partner diagnostic laboratory sends results into the system | Existing clinical workflow | 9 |
| Branches connected later without leased lines | Head of IT, future phase | 13 |
| Monthly cost inside USD 150 with an itemised forecast | CFO | 1, all |

## 5. Constraints

- Pilot region: ap-south-1 (Mumbai), the nearest region to Colombo.
- Budget ceiling: USD 150 per month for the pilot.
- No new leased lines; branch connectivity must reuse existing internet links.
- The DPO must be able to see who accessed what, when.
- The pilot must be recoverable by the IT team without vendor assistance.

## 6. Data classification (used on Day 6)

| Data | Class | Needs |
|---|---|---|
| Web server OS and application | Ephemeral, rebuildable from the AMI | Image, not backup |
| Laboratory report PDFs | Critical, personal, health | Durable object storage, versioning, encryption, no public access, lifecycle to cheaper classes after 90 days |
| Patient records database | Critical, personal, health | Private subnet, encryption, hourly RPO, tested restore |
| Audit logs and flow logs | Critical for the DPO, not personal | Immutable bucket, retention |
| Portal session data | Ephemeral | None |

## 7. The architecture you will build

Each lab lights up numbered components on the [architecture diagram](architecture.svg).

| No. | Component | What it is | Day |
|---|---|---|---|
| 1 | Guardrails | root MFA, IAM admin user, Budget excluding credits, home region | 1 |
| 2 | Patient portal web server and image | EC2 t3.micro with user-data web server, EBS data volume, snapshot, custom AMI | 2 |
| 3 | Laboratory reports bucket | S3 bucket thara-reports; Day 2 create, Day 5 policy and encryption, Day 6 versioning and lifecycle | 2, 5, 6 |
| 4 | Thara VPC | 10.0.0.0/16, two AZs, public and private subnets, IGW, route tables, security groups, NACLs, Flow Logs | 3 |
| 5 | Bastion for Colombo IT | EC2 in thara-public-a, SSH restricted by security group | 3 |
| 6 | Portal web tier | web instances in private subnets, launched from the Day 2 AMI; Day 7 wraps them in an Auto Scaling group | 3, 7 |
| 7 | NAT gateway | bounded-window egress for patching the private tier | 4 |
| 8 | S3 gateway endpoint | private path from the web tier to the reports bucket | 4 |
| 9 | Partner diagnostic laboratory VPC | partnerlab-vpc 10.1.0.0/16 peered to thara-vpc, then withdrawn | 4 |
| 10 | Identity, keys and audit | instance role for S3, least-privilege policies, group member users, KMS key alias/thara-records, CloudTrail to thara-audit | 5 |
| 11 | Patient records database and Backup plan | RDS thara-records in private subnets, snapshot and restore, AWS Backup plan with measured RTO | 6 |
| 12 | Load balancer and Auto Scaling group | ALB across public subnets, launch template from the AMI, ASG min 2 across private subnets, CPU alarm, SNS | 7 |
| 13 | Edge and branches | WAF web ACL on the ALB (demonstrated); CloudFront in front of the portal (concept); branches over Site-to-Site VPN (concept) | 4, 7 |

## 8. Names used in labs

| Thing | Name |
|---|---|
| VPC | thara-vpc |
| CIDR | 10.0.0.0/16 |
| Public subnets | thara-public-a (10.0.1.0/24), thara-public-b (10.0.2.0/24) |
| Private subnets | thara-private-a (10.0.11.0/24), thara-private-b (10.0.12.0/24) |
| Bastion | thara-bastion |
| Web instances | thara-web-1, thara-web-2 |
| Reports bucket | thara-reports-<student id> |
| Audit bucket | thara-audit-<student id> |
| Database | thara-records |
| Partner VPC | partnerlab-vpc (10.1.0.0/16) |
| KMS key alias | alias/thara-records |
| Tags | Module=CC, Day=<n>, Owner=<student id> |
