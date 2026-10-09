# Glossary

The words this module uses, each with its meaning and an example from Thara Hospitals. Terms are filed under the day that first teaches them, and they appear here as each day is posted.

## Day 1

### Elasticity
Capacity that grows and shrinks with demand, so that you pay only for what runs.

*Thara example:* the portal peaks from 07:00 to 10:00 and triples in dengue season; a bought server sized for that idles the rest of the year.

### IaaS
Infrastructure as a service: the provider runs everything up to virtualisation, and you run the operating system and everything above it.

*Thara example:* the patient portal runs on EC2 virtual servers where Thara manages the operating system.

### Region
A separate geographic area where AWS runs a group of availability zones. Most services are regional: what you create in one region exists only there.

*Thara example:* the pilot is pinned to `ap-south-1`, so the answer to "where is patient data?" is Asia Pacific (Mumbai).

### Availability zone
One or more data centres inside a region, with their own power, cooling and networking, far enough from the other zones that one flood or power failure should not reach them.

*Thara example:* Colombo had one basement, and one flood took everything; Mumbai has three zones.

### Hypervisor
The software that runs virtual machines on one physical machine and keeps them apart. Each virtual machine has its own operating system and kernel.

*Thara example:* every EC2 server in the pilot is a virtual machine on the thin hypervisor of the Nitro System.

### Container
A group of ordinary processes to which the host's kernel shows a restricted view of the system. Containers share that one kernel, so they start fast and pack densely.

*Thara example:* whether the portal ships as a VM image or a container image is the question you argue in today's practice question.

### Shared Responsibility Model
The allocation of security work between AWS and the customer. AWS secures the cloud itself; the customer secures what it puts in the cloud. The split changes with the service.

*Thara example:* AWS guards the disks in the data centre; Thara answers for the operating system, the database logins and the application.

### Root user
The identity that owns an AWS account: the email address and password it was created with. No policy can restrict it.

*Thara example:* the Head of IT's personal login must not be the root user, or the hospital loses its account when he leaves.

### MFA
Multi-factor authentication: a second proof at sign-in, such as a six-digit code from an authenticator app, on top of the password.

*Thara example:* root and `admin-<student id>` both get MFA, because the admin user is the one used every day.

### Budget
A spending threshold in AWS Budgets that emails an alert when cost crosses it. It measures and warns. It does not stop anything.

*Thara example:* `thara-budget` excludes credits, so it reads what the pilot's resources would cost without them.

## Day 2

### AMI
Amazon Machine Image: the template an instance's disk is built from. It is a snapshot of a root volume plus the launch settings, so every instance launched from it starts identical.

*Thara example:* `thara-portal-v1` is the portal server as an image; Day 3 launches the private web tier from it.

### Key pair
An SSH key in two halves. AWS puts the public half on the instance; you download the private half once, and it never expires.

*Thara example:* `thara-key` is created at launch, and its file is needed again on Day 3.

### User data
A script handed to an instance at launch. It runs once, as root, at first boot, with nobody logged in.

*Thara example:* the user data for `thara-web-1` installs the web server and writes the pilot page.

### Security group
A firewall attached to an instance, with allow rules only. It is stateful: when a request is allowed in, its reply is allowed out automatically.

*Thara example:* the group in front of `thara-web-1` allows HTTP from anywhere, and SSH from your IP and from the EC2 Instance Connect service.

### EBS volume
A virtual disk that you attach to an instance, format and mount. It lives in one availability zone, and its data survives a stop, a start and a reboot.

*Thara example:* the 8 GiB gp3 data volume mounted at `/data` holds `reports-index.txt`.

### Snapshot
A point-in-time copy of a volume, kept in region-wide storage. The first copies every block in use; each later one stores only the blocks changed since.

*Thara example:* the data volume's snapshot is kept after the volume is deleted; Day 5 and Day 6 restore from it.

### Bucket
A container for objects in Amazon S3. Its name is unique across all of AWS, yet it is created in one region and its data stays there.

*Thara example:* `thara-reports-<student id>` lives in Mumbai and holds the laboratory reports.

### Object
One whole item stored in a bucket: data plus a little metadata, under a key, which is its name. You put, get or delete a whole object.

*Thara example:* each laboratory report PDF is one object, written once and fetched by its key.

### Block Public Access
A master switch on a bucket that overrides any setting that would make the bucket or its objects public. It is on by default.

*Thara example:* with the switch on, no link can make a laboratory report public by accident.

### Reserved Instance
A one-year or three-year commitment to a particular instance family in a region, in return for a discount. You pay for every hour, used or not.

*Thara example:* a one-year commitment would cut the web tier's cost by roughly a third, but the pilot is approved for six months.

### Tag
A label of a key and a value on a resource. It changes nothing about how the resource works; it says what it is, who made it and on which day.

*Thara example:* everything from today carries `Module=CC`, `Day=<n>` and `Owner=<student id>`, so Day 7 can group spending by tag.

### Access key
A long-lived credential for an IAM user: a key id and a secret, used by programs and the command line. It works until someone deactivates or deletes it.

*Thara example:* the key typed into `thara-web-1` today is deactivated in teardown and deleted on Day 5.

## Day 3

### VPC
A private network that you define in software inside one region, with its own range of addresses. Nothing enters or leaves it until you say so.

*Thara example:* `thara-vpc`, with the range `10.0.0.0/16`, holds everything the pilot builds from today.

### Subnet
A slice of a VPC's address range that lives in exactly one availability zone. Where a subnet sits decides which zone its servers are in.

*Thara example:* `thara-private-a` is `10.0.11.0/24` in one zone, and `thara-private-b` is `10.0.12.0/24` in another.

### Route table
The list of rules a subnet uses to decide where to send traffic for each destination range. A subnet is associated with exactly one.

*Thara example:* `thara-private-rt` holds only the local route, so the private subnets have no way out.

### Internet gateway
The door between a VPC and the internet. It is attached to the VPC, and it translates between an instance's private address and its public one.

*Thara example:* one gateway is attached to `thara-vpc`, and only `thara-public-rt` has a route to it.

### Public subnet
A subnet whose route table sends `0.0.0.0/0` to an internet gateway. Its name plays no part. An instance in it also needs a public address to be reachable.

*Thara example:* `thara-public-a` is public because it is associated with `thara-public-rt`, not because of what it is called.

### Elastic IP
A public IPv4 address that stays yours until you release it. It survives a stop and a start, and can be moved from one instance to another.

*Thara example:* `thara-bastion` has no Elastic IP, so its public address changes each time it is stopped and started.

### Default VPC
The ready-made network that every region gives an account. Every subnet in it is public and hands each instance a public address.

*Thara example:* the Day 2 `thara-web-1` ran in the default VPC; from today everything goes into `thara-vpc`.

### Network ACL
A firewall on a subnet, with numbered allow and deny rules tried lowest first. It is stateless: a reply is judged as a new packet and needs its own rule.

*Thara example:* `thara-strict-nacl` breaks SSH to the bastion until an outbound rule allows the reply.

### Ephemeral port
A temporary, high-numbered port that a client picks for one connection. The server's reply is sent back to it.

*Thara example:* the bastion's SSH reply goes to an ephemeral port on your laptop, which is why the strict network ACL needs `1024-65535` outbound.

### Flow log
A record of the traffic at the network interfaces of a VPC: who talked to whom, on which port, and whether it was accepted or rejected. It does not record what was said.

*Thara example:* the flow log on `thara-vpc` shows a REJECT record for the attempt on the bastion's port 3389.

### Bastion
The one server that administrators connect to from outside, and from which they reach everything else. It is the only administrative door into the network.

*Thara example:* `thara-bastion` accepts SSH from the IT office's address only, and `thara-web-1` accepts SSH only from the bastion's group.
