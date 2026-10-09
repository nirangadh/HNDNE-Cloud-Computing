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

## Day 4

### NAT gateway
A managed service in a public subnet that lets instances in private subnets start connections to the internet and receive the replies. Nothing outside can start a connection through it. It bills for every hour it exists.

*Thara example:* the pilot creates one to patch the web tier, and deletes it inside the same lab segment.

### Gateway endpoint
A private path from a VPC to Amazon S3 that never crosses the internet. It is a route, placed in the route tables you choose, and it has no charge.

*Thara example:* `thara-web-1` lists `thara-reports-<student id>` through the endpoint on `thara-private-rt`, with no default route.

### VPC peering
A private link between exactly two VPCs. It is not transitive: it carries only traffic between its own two networks. Each side needs a route to the other, and the two address ranges must not overlap.

*Thara example:* `thara-vpc` is peered with `partnerlab-vpc`, `10.1.0.0/16`, so that the partner laboratory can send results in.

### Transit Gateway
A regional hub that many networks attach to once each, and that routes between them. It removes the need to peer every pair, and it is a charged service.

*Thara example:* one partner needs only a peering; a fifth site to connect is what would raise the question of a hub.

### Site-to-Site VPN
Encrypted tunnels over the internet between AWS and a customer gateway device at a site. It is cheap and quick to set up, and its bandwidth and latency depend on the internet link.

*Thara example:* the four branches are to reach the pilot this way, over the internet links they already have.

### Direct Connect
A dedicated physical link from a site into AWS, provided through a carrier. It gives steady latency and large bandwidth, costs far more than a VPN, and takes weeks to provision.

*Thara example:* ruled out for the branches, which may not have new leased lines.

### Hosted zone
The container in Route 53 that holds the DNS records for one domain. A private hosted zone answers only inside the VPCs it is associated with.

*Thara example:* the demonstration's private zone, thara.internal, gives the web server a name that means nothing outside the VPC.

### Alias record
A Route 53 record that maps a name to an AWS resource, such as a load balancer, and follows it when its addresses change. Unlike a CNAME record, it can sit at the top of a domain.

*Thara example:* the portal's one name will be an alias for the load balancer that Day 7 builds.

### Application Load Balancer
A managed service that receives web requests and spreads them across targets in more than one availability zone. It has its own DNS name, and it is not a server that you log in to.

*Thara example:* built on Day 7 in front of the web tier, so that patients have one way in.

### Health check
A request that a load balancer sends to each target every few seconds. A target that fails it receives no more requests until it passes again.

*Thara example:* if one web server fails, patients are sent to the other, and the portal's name does not change.

### CloudFront
A service that caches content at edge locations close to users, so that requests are answered nearby and the origin servers are asked less often.

*Thara example:* in a later phase the portal sits behind it, so that a patient in Galle is answered from nearby.

## Day 5

### Principal
The identity that makes a request to AWS: an IAM user, a role, or an AWS service acting for you. Every question about access starts with who is asking.

*Thara example:* `thara-web-1` asks S3 for a report as the principal `thara-web-role`.

### Identity-based policy
A JSON document attached to a user, a group or a role. Its statements say which actions that identity may take on which resources. It names no principal, because it belongs to one.

*Thara example:* `thara-reports-read` lets the web tier list one bucket and read the objects in it.

### Explicit deny
A statement with the effect Deny that matches a request. It beats every allow. A request that nothing allows is also refused, by implicit deny, and that refusal is cured by adding an allow.

*Thara example:* `thara-deny-test` stops the bucket listing although `thara-reports-read` still allows it.

### Least privilege
Granting an identity only the actions its work needs, on only the resources it needs, and testing that before it is attached. It is a method: start from the work, not from the service.

*Thara example:* the web tier gets two S3 actions on one bucket, where the Day 2 key had everything.

### Role
An identity with no password or key of its own. It is assumed by whoever its trust policy names, and each time it hands out credentials that expire.

*Thara example:* `thara-web-role` is assumed by the EC2 service on behalf of `thara-web-1`.

### Instance profile
The container that hands a role to an EC2 instance. The IAM console creates one with the role's name, and it is what you choose when you give an instance a role.

*Thara example:* `thara-web-1` receives `thara-web-role` through its instance profile, and the Day 7 launch template names the same one.

### Temporary credentials
A key, a secret and a token issued when a role is assumed. They stop working by themselves after a few hours, and an instance is handed new ones before then.

*Thara example:* the web tier signs its requests to S3 with them, so there is no file on the server to steal.

### Customer-managed key
An encryption key in the AWS Key Management Service that you create and control: you write its policy, and you can disable it or schedule its deletion. It has a monthly charge.

*Thara example:* `alias/thara-records` encrypts today's volume and Day 6's patient records database.

### Envelope encryption
Encrypting data with a data key, then encrypting that data key with a KMS key and storing the sealed copy beside the data. The KMS key never leaves the service.

*Thara example:* a copied snapshot of the encrypted volume holds scrambled blocks and a sealed key that only KMS can open.

### Key policy
The policy attached to a KMS key itself. It says who may manage the key and who may use it, which is a separate question from who may read the data.

*Thara example:* `admin-<student id>` is in the key policy of `alias/thara-records`, and `thara-web-role` is not.

### Trail
A CloudTrail setting that delivers a continuous record of the account's API events to a bucket. Without one, the events are kept for 90 days and are then gone.

*Thara example:* `thara-trail` writes to `thara-audit-<student id>`, where the record the Data Protection Officer relies on is kept.

### Finding
A report from a detection service that something looks wrong or is exposed. It has a severity, and it waits to be read. It changes nothing by itself.

*Thara example:* GuardDuty would write a finding if `thara-web-1` contacted an address known for malware.

## Day 6

### Storage class
The tier an object in S3 is stored in. Each class trades the monthly price of keeping the object against the cost, and the time, of getting it back.

*Thara example:* report PDFs start in S3 Standard and move to Standard-Infrequent Access after 90 days.

### Versioning
A bucket setting that keeps every version of an object. An overwrite adds a version and a delete adds a marker, so earlier content can be made current again.

*Thara example:* with versioning on `thara-reports-<student id>`, a report that a doctor overwrites by mistake can be brought back.

### Lifecycle rule
A rule on a bucket that moves objects to a cheaper storage class, or deletes them, when they reach a set age. S3 carries it out in the background, over hours to days.

*Thara example:* `thara-reports-lifecycle` moves reports after 90 days and removes old versions after 180.

### Bucket policy
A resource-based policy attached to a bucket. It names principals and says what each may do to the bucket and to the objects in it.

*Thara example:* the policy on the reports bucket names `thara-web-role` and allows it to list the bucket and read its objects.

### DB subnet group
A named list of subnets, in at least two availability zones, that tells RDS where a database may be placed.

*Thara example:* `thara-db-subnets` lists `thara-private-a` and `thara-private-b`, so the records database cannot land in a public subnet.

### Multi-AZ
An RDS option that keeps a standby copy of a database in a second availability zone and fails over to it automatically. The standby answers no queries while it waits.

*Thara example:* it would let `thara-records` ride out the loss of one zone. The pilot is shown it and does not build it.

### Read replica
A copy of a database that follows the primary a little behind and answers read queries at an endpoint of its own. It adds capacity for reading and does not take over by itself.

*Thara example:* slow report look-ups on OPD mornings are a question for a read replica, not for a standby.

### Automated backup
The backup RDS takes of a database every day without being asked, kept for a set number of days. It is deleted with the database unless you choose to retain it. A manual snapshot is not.

*Thara example:* deleting `thara-records` removes its automated backups, and `thara-records-snap1` stays.

### RPO
Recovery point objective: the most data, measured as time, that an organisation accepts losing. How often you back up decides whether you meet it.

*Thara example:* one hour for patient records, so the records must be backed up at least every hour.

### RTO
Recovery time objective: the longest a service may stay down, from the failure to working again. You find your own figure by restoring and timing it.

*Thara example:* two hours for patient records. The Day 6 lab deletes the database and measures how long it takes to return.

### Backup plan
A schedule in AWS Backup that says which resources are backed up, how often, and how long each backup is kept.

*Thara example:* `thara-daily` backs up once a day and keeps each backup for 7 days.

### Backup vault
The container in AWS Backup that holds the backups a plan creates, with access controls of its own.

*Thara example:* the backups made by `thara-daily` are kept in a vault, apart from the volume they protect.

## Day 7

### Availability target
The share of time for which a service is meant to work, written as a percentage. It is best read the other way round, as the minutes of downtime it allows in a month.

*Thara example:* a target of 99.9% would allow the portal about 44 minutes of downtime in a month of 730 hours.

### High availability
A design that recovers from a failure quickly and by itself, after a brief interruption. It needs more than one of everything that can fail, in more than one place.

*Thara example:* two web servers in two zones behind `thara-alb`: when one fails, a few requests fail, and then the other answers.

### Fault tolerance
A design in which a failure causes no interruption at all, because spare capacity is already running and already carrying the load. It costs far more than high availability.

*Thara example:* the pilot buys high availability, which its ceiling of USD 150 a month can afford, and not fault tolerance.

### Horizontal scaling
Adding more servers of the same size to share the work, as opposed to vertical scaling, which makes one server larger. It needs servers that can stand in for one another.

*Thara example:* a third `t3.micro` joins the web tier for the OPD peak, and leaves when the peak is over.

### Launch template
A saved set of launch settings, such as the image, the instance type, the security group and the role, from which identical instances can be started without a person.

*Thara example:* `thara-web-lt` starts every web server from the image `thara-portal-v1`, with `thara-web-role`.

### Target group
The list of servers to which a load balancer sends requests, together with the health check it runs on each of them.

*Thara example:* `thara-web-tg` holds the web servers and checks the path `/` on port 80 of each.

### Auto Scaling group
A service that keeps a set number of instances running from a launch template, across the subnets it is given, and replaces any instance that fails.

*Thara example:* `thara-web-asg` keeps two web servers, one in `thara-private-a` and one in `thara-private-b`, and may grow to three.

### Scaling policy
A rule attached to an Auto Scaling group that changes the number of instances it keeps when an alarm fires.

*Thara example:* the policy on `thara-web-asg` adds one server when the group's average CPU stays above 50%.

### Cooldown
A pause after a scaling action, during which the group ignores further alarms, so that a new instance can take its share of the load before anything else is added.

*Thara example:* after adding the third web server, `thara-web-asg` waits 300 seconds before it will act again.

### Alarm
A watch on one metric in CloudWatch. It changes state when the metric stays past a threshold for a set time, and it can then trigger an action and send a notification.

*Thara example:* the alarm `thara-web-asg` triggers the scale-out and publishes to `thara-alerts`, which emails you.

### Web ACL
A list of rules in AWS WAF that inspects each web request and allows or blocks it. It is attached to a resource such as a load balancer.

*Thara example:* demonstrated on a load balancer, where it blocks a request shaped like a SQL injection before it reaches a web server.

### Well-Architected Framework
The set of review questions that AWS publishes for judging a design, grouped under six pillars. It is a method for finding risks, not a mark.

*Thara example:* the Head of IT uses its questions to defend the pilot to the board, and your group uses them on its capstone design.
