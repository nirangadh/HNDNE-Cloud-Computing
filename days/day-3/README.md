# Day 3

## Materials

- [Morning slides: VPC anatomy](slides/day-3-morning.pdf) (PDF)
- [Afternoon slides: Build the Thara network](slides/day-3-afternoon.pdf) (PDF)
- [Notes](notes.md): read before the lab
- [Lab sheet](lab.md): steps, prove it, break it, teardown and cost line
- Interactive visuals. They run in the browser: open them from the [course website](https://nirangadh.github.io/HNDNE-Cloud-Computing/days/day-3/), because GitHub shows them as code.
  - [Packet path predictor: which check stops the packet?](artefacts/packet-path-predictor.html)
  - [Security group versus network ACL: one connection, two firewalls](artefacts/sg-vs-nacl.html)
  - [Thara VPC builder: what Day 3 adds to the architecture](artefacts/thara-vpc-builder.html)

## Morning: VPC anatomy

**Ideas covered:** A VPC is a network you already know; Two firewalls, two behaviours; Seeing the traffic.

**Demonstration:** The wizard, then what it hid.

**Activity:** Predict the packet path.

## Afternoon: Build the Thara network

**You build:** component 4, Thara VPC; component 5, Bastion for Colombo IT; component 6, Portal web tier.

**Estimated credit use:** about USD 0.40 if you follow the teardown list.

## After this day

**Read:**

- Amazon VPC User Guide, "Security groups" and "Network ACLs"
- Amazon VPC User Guide, "NAT gateways", "VPC peering basics", "Gateway endpoints"

**Self-check (issued separately):** Domain 3 networking set A (15 items); Domain 3 networking set B (15 items).

**Practice question:** [PQ3](../../practice/PQ3.md), posted in [practice](../../practice/).

**Tasks:**

- One paragraph: why is VPC peering non-transitive and what does that force a hospital group with five sites to do

**Evidence pack 3** is due before the next teaching day, on the date announced for your cohort. See the [portfolio brief](../../coursework/portfolio-brief.md).
