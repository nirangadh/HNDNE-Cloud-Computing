# PQ1: VM image or container image, and what the monsoon changes

Posted after Day 1. Attempt it without notes in about 35 minutes, then compare your answer with the guidance below. Bring your attempt to the review session.

## Scenario

The south-west monsoon has returned. A substation fault leaves Colombo, including Thara Hospitals' flagship hospital and its IT office, without mains power for six hours. The basement server room is dry this time, but its generator runs for only two hours.

Thara's six-month pilot is being built in AWS in Asia Pacific (Mumbai), ap-south-1. The Head of IT must choose how the patient portal's web tier is packaged: as a **virtual machine image** (an image of a whole EC2 instance, operating system included) or as a **container image** (the portal and its libraries, run by a container runtime on an EC2 instance). He also proposes running the pilot in a single availability zone "to keep us inside the budget".

Constraints you should notice:

- The CFO has approved **USD 150 a month** for the pilot, and wants every cost line explained.
- The Data Protection Officer requires that patient data stay in a known location and that Thara can say **who can read it** at every layer.
- The hospital information system (HIS) and the Colombo IT office are **not** part of the pilot; they remain on the premises.

## Questions

**(a) Explain (6 marks).** Explain the difference in isolation boundary between a virtual machine running on a Type 1 hypervisor such as the AWS Nitro System, and a container running on a shared kernel using namespaces and cgroups. State what follows from that difference for start-up time and for attack surface.

**(b) Apply (8 marks).** Recommend whether Thara should package the portal's web tier as a virtual machine image or as a container image for the pilot, and justify your recommendation against the scenario. In your answer:

- describe where the portal runs so that the six-hour Colombo outage does not take the portal offline; and
- using the Shared Responsibility Model, state which layers of your chosen design Thara must secure and which AWS secures.

**(c) Evaluate (6 marks).** Evaluate the Head of IT's proposal to run the pilot in a single availability zone. Consider what does and does not fail during the Colombo outage, what a single-AZ design risks that the outage does not, and the cost argument. State what would change your view.

## Answer guidance

This guidance describes what a strong answer covers. It is not a model answer to memorise; the marks go to reasoning applied to Thara.

**(a)** A strong answer places the boundaries precisely. A VM has its own guest kernel, and isolation is enforced by the hypervisor (on EC2, a thin hypervisor with networking, storage and security offloaded to Nitro hardware). A container is a group of processes on the host's kernel, isolated by namespaces (what it can see) and limited by cgroups (what it can use). It then draws the consequences: containers start faster because no kernel boots, and pack more densely; but every container on a host depends on the one shared kernel, so a kernel flaw exposes all of them, whereas a VM escape must defeat the hypervisor. Answers that call a container "a lightweight VM" miss the point of the question.

**(b)** Either recommendation can earn full marks if it is argued from the scenario. A strong answer notices that both options run on EC2 in ap-south-1, so neither is affected by a power failure in Colombo: the outage is a question of *where* the portal runs, not *how* it is packaged. It then chooses on the real differences for a small team in a pilot. For example, a VM image is closer to what the IT team already runs and is rebuildable after a failure; a container image is smaller, starts faster and is easier to reproduce exactly, but adds a runtime to learn and patch. The shared responsibility part should be specific: with the portal on EC2, Thara patches the operating system, and with containers also the runtime and the images; Thara controls access, security group rules and the data; AWS secures the facilities, hardware, network and hypervisor. Strong answers link this to the DPO: patient data stays in ap-south-1, and Thara can name who reads it at each layer.

**(c)** A strong answer separates two different failures. The Colombo outage does not touch AWS: the portal keeps serving patients over the internet. What fails is on Thara's side: the on-premises HIS once the generator runs out, and administrative access from the IT office, so staff may need another way in. A single AZ, however, is exposed to a failure *inside* AWS: if that AZ has a problem, the whole pilot stops, which is exactly the "one basement" risk the move was meant to end. The cost argument should be weighed, not assumed: a second AZ matters most for the parts that must stay up, and the pilot's budget is an argument for sizing carefully, not automatically for giving up the AZ. Strong answers say what would change their view, for example if the pilot's recovery targets were relaxed, or if a second AZ pushed a stated cost line beyond the USD 150 ceiling.
