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
