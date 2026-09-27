# Getting started

Read this three weeks before Day 1.

## 1. The timeline

| When | What you do |
|---|---|
| Three weeks before Day 1 | Read this page. Start the free AWS Skill Builder course *AWS Cloud Practitioner Essentials* and complete its first two modules. Tell your lecturer now if you do not have access to a payment card. |
| Two weeks before Day 1, not earlier | Create your AWS account (section 2). |
| Before Day 1 | Confirm you can sign in. Install an authenticator app on your phone (Google Authenticator, Microsoft Authenticator, or similar). |
| Day 1 | Bring a laptop and your phone. The afternoon lab secures your account. |

**Why not earlier?** A new account runs on the AWS Free Plan for six months. That window has to cover all seven teaching days, the review session, your capstone build and the viva. Creating the account too early means it can close before your coursework is finished.

## 2. Creating your account

1. Go to the AWS sign-up page and choose the **Free Plan**.
2. Use an email address you will still check in six months. Use a strong, unique password.
3. AWS asks for a payment card and verifies your phone number. The card is for verification; on the Free Plan you are not charged unless you choose to upgrade.
4. When the account is active, sign in once and stop. **Do not launch anything before Day 1.**

**No payment card?** Tell your lecturer. You will be given access to a shared teaching account so you can do every lab. You will still take full part in the group capstone.

## 3. How the Free Plan works

At the time of writing, a new account receives USD 100 in credits, and up to USD 100 more for completing some onboarding activities (two of them happen naturally in the Day 1 and Day 2 labs). The plan lasts six months or until the credits run out, whichever comes first. After that the account closes, and you have 90 days to retrieve anything from it. Some purchases, such as reserved capacity and paid support, are blocked on the Free Plan; you will still learn what they are.

AWS changes these terms from time to time; the AWS Free Tier page has the current version. If you follow the lab sheets and the rules below, the whole module uses a small fraction of your credits.

## 4. The rules

These rules protect your credits and your account. They are also marked in your evidence packs.

1. **Root is for Day 1 only.** On Day 1 you create an admin user with MFA. After Day 1 you never sign in as root again.
2. **One region.** Every lab uses **Asia Pacific (Mumbai), ap-south-1**. Check the region in the top right corner of the console at the start of every lab. A resource created in the wrong region is invisible from the right one, and still costs money.
3. **Tag everything.** From Day 2, every resource you create gets three tags: `Module=CC`, `Day=<day number>`, `Owner=<your student id>`.
4. **Keep a ledger.** Record what you create, when, and when you deleted or stopped it, in the [cost ledger](templates/cost-ledger.csv).
5. **Some things are built and deleted the same afternoon.** A NAT gateway, a load balancer and a database bill every hour they exist, whether or not anything uses them. The lab sheet tells you when to delete them. Do it before you leave.
6. **Stop, don't forget.** At the end of every lab, follow the teardown list. Instances you keep are stopped, not left running.
7. **Watch your budget alerts.** On Day 1 you set up a budget that emails you at USD 10, 25 and 50 of usage. If one arrives unexpectedly, open Cost Explorer, find what is running, and tell your lecturer.

## 5. Finding your way around this repository

- [README](README.md): the module at a glance and the day index.
- [scenario/](scenario/): Thara Hospitals and the architecture you build.
- `days/day-<n>/`: slides, notes, the lab sheet and interactive visuals for each day.
- [coursework/](coursework/): the portfolio and capstone briefs.
- [templates/](templates/): the evidence pack and the cost ledger.
- [practice/](practice/): practice questions.
