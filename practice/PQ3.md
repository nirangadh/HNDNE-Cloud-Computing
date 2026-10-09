# PQ3: A network for the Trincomalee branch

Posted after Day 3. Attempt it without notes in about 35 minutes, then compare your answer with the guidance below. Bring your attempt to the review session.

## Scenario

Thara Hospitals is opening a fifth branch, in Trincomalee, and it must be working within a month. The branch gets a small appointment system of its own with two tiers: a **web tier** that patients and reception staff use from the internet, and a **database** of appointments, which holds patient names.

The Head of IT wants the system in a VPC of its own in Asia Pacific (Mumbai), ap-south-1, built to the same pattern as the pilot so that the two networks can be connected later. How they will be connected is not part of this question.

Constraints you should notice:

- The branch VPC is given the range **`10.2.0.0/16`**. The pilot's `thara-vpc` uses `10.0.0.0/16` and the partner laboratory uses `10.1.0.0/16`.
- The web tier must be reachable from the internet on HTTP, and must keep working if **one availability zone is lost**.
- The database listens on TCP port 3306. It must accept connections **only from the web tier**, and it must never have a public address.
- Administrators connect by SSH, **only from the Colombo IT office**, whose public address range is `203.0.113.0/24`, and only through one bastion.
- The Data Protection Officer wants to be able to show any connection attempt that was refused.
- The CFO has set aside **USD 40 a month** of the pilot's USD 150 for this branch, and wants every line explained.

Use these rounded prices. Do not rely on remembered ones.

| Item | Price |
|---|---|
| `t3.micro`, running | USD 0.011 per hour (a month is 730 hours) |
| A public IPv4 address, in use or idle | USD 0.005 per hour |
| A VPC, its subnets, route tables, internet gateway, security groups and network ACLs | No charge |

Every server in this system is a `t3.micro`: two web servers, one database server and one bastion.

## Questions

**(a) Explain (6 marks).** Explain what makes a subnet public. Then distinguish a security group from a network ACL by what each is attached to, whether it keeps state, the kinds of rule it holds and the order in which its rules are evaluated, and explain why a reply needs a rule on one of them and not on the other.

**(b) Apply (8 marks).** Design the branch VPC. Draw it, or describe it precisely enough to be drawn:

- the subnets, with a range and an availability zone for each, and whether each is public or private;
- the route tables, with every route in each and the subnets associated with each;
- where the two web servers, the database server and the bastion sit, and which of them have a public address; and
- the inbound rules of three security groups, one each for the bastion, the web tier and the database, giving the type or port and the source of every rule.

Then state what you would switch on for the Data Protection Officer, and where its records would go.

**(c) Evaluate (6 marks).** Two proposals are made to simplify the design.

1. A colleague: "Drop the bastion. Give the database server a public address and allow SSH to it from the IT office range only. It is the same rule with one server fewer."
2. A second colleague: "Replace the three security groups with one network ACL on each subnet. An ACL can deny as well as allow, so it is the stronger tool."

Evaluate each proposal against the scenario. State what it would save, what it would cost Thara in other ways and how it could fail. Finish with a judgement for the CFO on whether the design fits inside USD 40 a month, using the prices given, and say what would change your view.

## Answer guidance

This guidance describes what a strong answer covers. It is not a model answer to memorise; the marks go to reasoning applied to Thara.

**(a)** A strong answer says that a subnet is public because its route table has a default route, `0.0.0.0/0`, to an internet gateway, and that an instance in it is reachable only if it also has a public address; the subnet's name decides nothing. It then contrasts the two firewalls on the same four points. A security group is attached to an instance's network interface, is stateful, holds allow rules only, and is evaluated as a whole. A network ACL is attached to a subnet, is stateless, holds allow and deny rules, and is evaluated in numbered order with the first match deciding. Because a security group remembers the request it allowed, the reply passes without a rule. A network ACL judges the reply as a new packet, travelling from the service's port to a temporary high-numbered port on the client, so it needs its own rule for the ephemeral range in the other direction.

**(b)** A strong answer carves four subnets out of `10.2.0.0/16` across two zones, for example `10.2.1.0/24` and `10.2.2.0/24` as public subnets in zones a and b, and `10.2.11.0/24` and `10.2.12.0/24` as private subnets in the same two zones. It attaches an internet gateway. The public route table holds the local route and `0.0.0.0/0` to the gateway and is associated with both public subnets. The private route table holds the local route only and is associated with both private subnets. One web server sits in each public subnet with a public address, which is what meets the loss of one zone. The bastion sits in a public subnet with a public address. The database server sits in a private subnet with none. The rules: the bastion's group allows SSH from `203.0.113.0/24`; the web tier's group allows HTTP from anywhere and SSH from the bastion's group; the database's group allows port 3306 from the web tier's group and SSH from the bastion's group. Naming a group as the source, not an address range, is the mark of a strong answer: the rule keeps working when a web server is replaced and gets a new address. For the Data Protection Officer: a flow log on the VPC, delivered to a log group in CloudWatch Logs, where a refused attempt appears as a REJECT record with its source address and port.

**(c)** A strong answer takes the proposals separately. The first saves the bastion, about USD 11.68 a month, and breaks a stated requirement: the database must never have a public address. To be reached it would also have to sit in a public subnet, so the patient data is one mistaken rule away from the internet, and the single door that the Head of IT asked for is gone. The second misreads what each tool is for. A network ACL cannot name a group as a source, so "only from the web tier" becomes "from the public subnets' ranges", which also admits the bastion and anything else placed there. It cannot tell one instance in a subnet from another. And it is stateless, so every allow needs a matching return rule for the ephemeral ports, and the commonest failure is a connection that times out because that rule was forgotten. Its real strength, denying a named range for a whole subnet, is not something this design needs. On cost: a running `t3.micro` with a public address is USD 0.016 an hour, about USD 11.68 a month, and without one about USD 8.03. Two web servers are about USD 23.36, the database server about USD 8.03, the bastion about USD 11.68: about USD 43 in all, just over the ceiling. The network itself costs nothing. The answer for the CFO is not to remove the bastion but to stop it when nobody is administering the system: a stopped bastion has no instance charge and no public address charge, which brings the design to roughly USD 31 plus a little storage. What would change the view: a requirement for administrators to be on call at all hours, a ceiling that cannot stretch to two web servers, or a blocklist of addresses that the hospital must refuse, which is the one job here that a network ACL would do better.
