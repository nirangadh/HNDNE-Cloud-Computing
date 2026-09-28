# Lab 1: Account guardrails lab

**Day 1, afternoon session. Duration 3 hours. Builds component 1 (Guardrails) of the Thara Hospitals architecture.**

| | |
|---|---|
| Learning outcomes | LO2, LO4, LO8 |
| Sub-outcomes | K2.4, K4.3, S4.1, K8.1 |
| Prerequisites | Your AWS account is active (or your lecturer has issued you a fallback IAM user); the [cost ledger](../../templates/cost-ledger.csv) is downloaded; your phone has an authenticator app |
| Estimated credit consumption | USD 0.00 |
| Evidence pack | Pack 1, due before the next teaching day |

## 0. Before you start

1. Region check: today you will set the console to **Asia Pacific (Mumbai) ap-south-1** in step 6. Until then you are working in IAM and billing pages, which have no region.
2. Today is the one day you sign in as **root**. From step 6 onwards you work as your **admin IAM user**, and you never use root again in this module.
3. Tags: nothing you create today can be tagged in a way that matters for cost, so tags start on Day 2 (`Module=CC`, `Day=<n>`, `Owner=<student id>`).
4. Open your cost ledger. Write today's date and the segment names below with a blank cost column.

Console labels below are as they appeared at the time of writing. AWS renames buttons from time to time; if a label differs, look for the same idea nearby and tell your lecturer.

### The ideas behind today's lab

#### Root, admin, and why they differ

The **root user** is the identity that owns the account: the email address and password you signed up with. No policy can restrict it. An **IAM admin user** is a named identity you create inside the account; it does the daily work, and root is kept for the handful of tasks only root can do, such as the billing-access setting in step 3. Both get MFA today. Neither gets access keys today.

> **You already know this.** Root is the `enable secret` on a core switch; the admin user is a named operator account in your AAA server. You would never let the whole team share the enable secret.

> **Thara.** The Head of IT's personal login must not be the account's root. If he leaves, or his phone is stolen, the hospital must still own its account.

> **Common mistake.** "MFA on root is enough." The admin user needs MFA too, because that is the identity you use every day, so it is the one most likely to be phished.

#### Budgets, credits and the ceiling

Your Free Plan account started with USD 100 in credits. Credits pay your bill, so a budget that **includes** credits sees your spending cancelled out and reads zero until the credits are gone. It never warns you. You will configure the budget to **exclude** credits, so it measures gross usage: what the resources would cost without the credits. Alerts at USD 10, USD 25 and USD 50 are early warnings, not a spending limit. Every account includes the Basic support plan at no cost, and Basic unlocks a small set of free Trusted Advisor checks. At the time of writing AWS is reorganising its paid support plans; Basic remains free.

> **You already know this.** A bandwidth alert on a leased line: it emails you when utilisation crosses 80 percent. It does not shape the traffic.

> **Thara.** The CFO's monthly report of actual against forecast starts with a budget like this one. A budget that reads zero because credits hide the spend would make that report meaningless.

> **Common mistake.** "The budget stops spending." It does not. It sends an email. Nothing in AWS stops spending except you.

Open [budget-credit-trap](artefacts/budget-credit-trap.html) now and flip the "include credits" switch. You will need it again in section 5.

#### Shared responsibility, applied

This morning you met the Shared Responsibility Model. This afternoon you do the first piece of Thara's share. IAM is the first customer responsibility: nothing AWS does protects a weak root password or a shared admin login. Choosing the region is also yours, because it decides where data lives. This module pins every lab to ap-south-1.

> **Thara.** The Data Protection Officer will ask where patient data is. The answer is a region, "Asia Pacific (Mumbai)", not "the cloud".

## 1. Objective

At the end of this lab your account has root MFA, a named admin user with MFA, a budget that measures gross usage with three email alerts, Cost Explorer switched on, and the first row of your cost ledger: component 1, the guardrails. Every later lab depends on it, because from Day 2 you build only as the admin user, in ap-south-1, with the budget watching; it serves Thara's requirement that monthly cost stays inside USD 150 with an itemised record.

## 2. Timed segments

| Segment | Minutes | Cost note |
|---|---|---|
| Activation triage | 20 | nil |
| Root MFA and IAM admin user | 35 | nil |
| Budget and Cost Explorer | 35 | nil |
| Trusted Advisor and ledger | 25 | nil |
| Evidence capture | 20 | nil |

Segments containing a NAT gateway, a load balancer or a database are created, used and deleted inside the segment. Do not carry them across the break. Nothing today bills by the hour.

## 3. Steps

Each step states what to do and what you should see. If you do not see it, stop and diagnose before moving on.

*Segment 1: Activation triage*

1. **Confirm the account is active.** Sign in at the AWS console with your root email and password. *Expected:* Console Home opens and shows the **Explore AWS** widget and a **Cost and Usage** widget with your credit balance and the days left on your plan. If AWS says the account is still being activated, tell your lecturer: you will do today's steps with the fallback IAM user you are issued, and repeat them in your own account when it activates.

*Segment 2: Root MFA and IAM admin user*

2. **Secure root with MFA.** Choose your account name (top right), then **Security credentials**. In **Multi-factor authentication (MFA)**: if a device is already listed, AWS asked you to register one at first sign-in, so check it is yours and move on. Otherwise choose **Assign MFA device**, give it a name, choose **Authenticator app**, scan the QR code with your phone, enter **MFA code 1** and **MFA code 2**, and choose **Add MFA**. Sign out. *Expected:* the MFA section lists one device; when you sign in as root again you are asked for a six-digit code.
3. **Let IAM users see billing.** Sign in as root again (with MFA). Choose your account name, then **Account**. Scroll to **IAM user and role access to Billing information**, choose **Edit**, tick **Activate IAM Access**, and choose **Update**. *Expected:* a message confirms that IAM user and role access to billing information is activated. Without this, your admin user will get "access denied" in Budgets and Cost Explorer, however many permissions it has.
4. **Create the admin user.** Open IAM (notice it has no region selector). Choose **Users**, then **Create user**. User name `admin-<student id>`. Tick **Provide user access to the AWS Management Console**, choose **I want to create an IAM user**, set a custom password you have not used anywhere else. Under **Set permissions** choose **Attach policies directly** and tick `AdministratorAccess`. Create the user. On the IAM **Dashboard**, copy the **sign-in URL for IAM users** into your ledger notes. *Expected:* `admin-<student id>` appears in the Users list.
5. **Give the admin user MFA.** Open `admin-<student id>`, then the **Security credentials** tab, then **Assign MFA device**, and repeat the authenticator steps with a second entry in your app. Then sign out of root. From now on, do not sign in as root again in this module. *Expected:* the user's MFA shows one assigned device.

*Segment 3: Budget and Cost Explorer*

6. **Sign in as the admin user.** Open the IAM sign-in URL you copied, sign in as `admin-<student id>`, and enter the MFA code. In the region selector choose **Asia Pacific (Mumbai) ap-south-1**. *Expected:* the top bar shows `admin-<student id>` and the region shows Mumbai.
7. **Create the budget.** On Console Home, in **Explore AWS**, choose the activity **Set up a cost budget using AWS Budgets** (completing it earns you onboarding credits). In Budgets choose **Create budget**, then **Customize (advanced)** and **Cost budget**. Name it `thara-budget`. Period **Monthly**, **Recurring budget**, budgeting method **Fixed**, amount **50.00**. Under **Budget scope**, **Filters**, choose **Add filter**, then **Charge type**, set it to **exclude** and tick **Credit**. Choose **Next**, then add three alert thresholds, each an **Absolute value** on **Actual** spend: 10, 25 and 50, all to your email. Create the budget. *Expected:* `thara-budget` is listed with USD 50.00 budgeted and USD 0.00 actual. Forecast alerts are not used: AWS needs several weeks of usage before it can forecast a new account.
8. **Switch on Cost Explorer.** In Billing and Cost Management choose **Cost Explorer**, then **Launch Cost Explorer**. Then open the **Free Tier** page and the **Credits** page. *Expected:* Cost Explorer tells you your data is being prepared (it can take about 24 hours); the Credits page lists your sign-up credit, and the budget activity's credit may appear within about ten minutes.

*Segment 4: Trusted Advisor and ledger*

9. **Read Trusted Advisor.** Open Trusted Advisor, open the **Security** category and choose **Refresh** (on the Basic plan checks are refreshed by hand). Note which checks are available to you. *Expected:* the free checks are all of **Service limits** plus a short list including **MFA on root account**, which shows no problem because of step 2.
10. **Write the first ledger row.** In your cost ledger, fill today's row for `thara-budget`: date, day 1, segment Guardrails, the region, and a note "credits excluded; alerts 10/25/50". Write your account id in the note with the middle digits masked (for example `1234****9012`). *Expected:* one complete row with an estimated cost of 0.00.

*Segment 5: Evidence capture*

Take the screenshots listed in section 8 now, while everything is open.

## 4. Prove it

Paste the evidence of each into your evidence pack.

- Open a private browser window and sign in with the IAM sign-in URL as `admin-<student id>`: you are asked for an MFA code.
- Open `thara-budget`: its details show a **Charge type** filter excluding **Credit**, and the three alert thresholds.
- Open Cost Explorer again: it opens directly, not on its welcome page.
- Trusted Advisor's **MFA on root account** check shows no problem. This proves step 2 from outside your own memory of doing it.

## 5. Break it

**Fault:** your budget includes credits.

1. Edit `thara-budget` and remove the Charge type filter (or untick **Credit** in it). Save.
2. Open the budget's details. **Symptom today:** the filter line has gone, and actual spend still reads USD 0.00. It read USD 0.00 before as well, because a new account has no usage yet. That is the trap: the fault is invisible until you spend.
3. **Predict:** in your break-it table, write what the budget's actual line would read on the day a forgotten resource had used USD 12 of gross usage, with credits included and with credits excluded, and which alerts would fire in each case.
4. **Check your prediction** in [budget-credit-trap](artefacts/budget-credit-trap.html).
5. **Fix:** add the Charge type filter excluding Credit again, save, and confirm it appears in the budget's details.

Record the fault, symptom, evidence and fix in the table in section 4 of your evidence pack.

## 6. Teardown

Nothing to delete today. Confirm that nothing exists yet that could bill:

1. In EC2, region ap-south-1: **Instances (running)** is 0.
2. In the VPC console, region ap-south-1: only the **default VPC** is listed. Every region has one; leave it.
3. In S3: there are no buckets.

Kept: the admin user, both MFA devices, `thara-budget` and Cost Explorer. They persist for the whole module.

## 7. Cost line

Estimate for today: **USD 0.00**. Write the day's total against the estimate in your ledger. If it is higher than the estimate, write why in one line.

## 8. Evidence required

1. Screenshot of `admin-<student id>` in IAM with MFA assigned (mask the middle digits of the account id).
2. Screenshot of the budget filter showing Credit excluded and the three alert thresholds.
3. Your first cost ledger row.
4. Your break-it row from section 5, including your prediction.

## 9. Thara connection

This lab satisfies the requirement that every administrative action is attributable to a named person, and starts the one that keeps monthly cost inside USD 150 with an itemised forecast. The Head of IT would ask who can still sign in as root and how you know MFA is on: your answer is the Trusted Advisor check, not your word. The CFO would ask why the budget shows usage when the bill shows nothing: because it excludes credits, it measures what Thara would pay once the credits are gone. The Data Protection Officer would ask where the data will live: in Asia Pacific (Mumbai), ap-south-1, and nowhere else.
