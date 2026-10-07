# Lab 2: Build, image, containerise

**Day 2, afternoon session. Duration 3 hours. Builds component 2 (Patient portal web server and image) and component 3 (Laboratory reports bucket) of the Thara Hospitals architecture.**

| | |
|---|---|
| Learning outcomes | LO1, LO5, LO6 |
| Sub-outcomes | S1.1, S5.1, S5.2, S6.1 |
| Prerequisites | Component 1 from Day 1: your admin user with MFA, `thara-budget`, the region set to ap-south-1, your cost ledger. You have seen this morning's demonstration |
| Estimated credit consumption | USD 0.60 |
| Evidence pack | Pack 2, due before the next teaching day |

## 0. Before you start

1. Region check: the console shows **Asia Pacific (Mumbai) ap-south-1**. If not, change it now.
2. You are signed in as your **admin IAM user**, not root.
3. Tags for everything today: `Module=CC`, `Day=2`, `Owner=<student id>`.
4. Open your cost ledger. Write today's date and the segment names below with a blank cost column.

Console labels below are as they appeared at the time of writing. AWS renames buttons from time to time; if a label differs, look for the same idea nearby and tell your lecturer.

### The ideas behind today's lab

#### Tagging and the ledger

From today, every resource you create carries three tags: `Module=CC`, `Day=2`, `Owner=<student id>`. A tag is a label of a key and a value. It changes nothing about how the resource works. It lets you, and later Cost Explorer, answer "what is this, who made it, and on which day?". Today you will create an instance, two volumes, two snapshots, an image, a security group and a bucket. Without tags, a forgotten one is very hard to find a month later.

The ledger row for today is written **before** teardown, not after. Once a resource is deleted you can no longer read its id, its size or its start time from the console.

#### What you are about to do that is wrong

Read this now, so that step 10 does not surprise you.

In step 10 you will create a **long-lived access key** for your admin user, type it into the instance, and use it to upload a file to S3. This is the insecure method, and you are doing it deliberately.

- **What is wrong with it.** The key carries the full power of your admin user. It never expires. It sits in a plain text file on a server. Anyone who gets onto that server, or gets a copy of its disk, holds your whole account. On Day 1 the rule was "access keys on neither user today". Today you break that rule once, on purpose.
- **Why you do it anyway.** On Day 5 you replace the key with an instance role, which gives the server short-lived credentials that it never stores. You will understand the role far better having felt what it replaces. The contrast is the point.
- **The fence around it.** You deactivate the key in today's teardown. On Day 4 you switch it on for a few minutes for one test and switch it off again. On Day 5 you delete it. Your ledger records that it exists. The secret never appears in a screenshot, a message or your evidence pack.

> **Thara.** A patient once found that her laboratory report link opened for anyone who had it. A leaked access key is how that incident could have been much worse: not one report, but every report, and the power to delete them.

> **Common mistake.** "Deactivating a key deletes it." It does not. A deactivated key is switched off, and anyone with permission can switch it on again. Only deleting it removes it, and that happens on Day 5.

## 1. Objective

At the end of this lab you have a tagged web server `thara-web-1` serving the Thara pilot page, an image of it called `thara-portal-v1`, a snapshot of a data volume, a private bucket `thara-reports-<student id>` holding one file, and a written comparison of a container with a native service on the same machine: components 2 and 3. Day 3 launches the private web tier from your image, Days 4 to 6 use the bucket, and Day 5 repairs the insecure key; together they serve Thara's requirements that the portal can be rebuilt after the next flood and that laboratory reports are stored durably and never publicly listable.

## 2. Timed segments

| Segment | Minutes | Cost note |
|---|---|---|
| Launch and connect | 30 | `t3.micro` about USD 0.011 per hour, plus USD 0.005 per hour for its public IPv4 address |
| EBS attach, format, snapshot | 35 | 8 GB gp3: under USD 0.01 for the afternoon |
| Create the AMI | 15 | snapshot storage: a few cents a month |
| Docker contrast | 35 | nil |
| Reports bucket and the insecure upload | 25 | nil |
| Ledger, teardown, evidence | 20 | nil |

Segments containing a NAT gateway, a load balancer or a database are created, used and deleted inside the segment. Do not carry them across the break. Today has none of those, but the instance bills by the hour while it runs, so it is stopped before you leave. Prices are for ap-south-1 at the time of writing.

## 3. Steps

Each step states what to do and what you should see. If you do not see it, stop and diagnose before moving on.

*Segment 1: Launch and connect*

1. **Check where and who you are.** Confirm the region selector shows **Asia Pacific (Mumbai) ap-south-1** and the top bar shows `admin-<student id>`. *Expected:* both are correct. If the top bar shows your root email address, sign out and sign in with your IAM sign-in URL.

2. **Launch the web server.** On Console Home, in **Explore AWS**, open the activity **Launch an instance using Amazon EC2** (it counts towards your onboarding credits). It takes you to EC2, **Launch an instance**. Set:
   - **Name:** `thara-web-1`. Choose **Add additional tags** and add `Module=CC`, `Day=2`, `Owner=<student id>`, each with resource types **Instances** and **Volumes**.
   - **Application and OS Images:** Amazon Linux, the default Amazon Linux AMI (the current release is AL2023), 64-bit (x86).
   - **Instance type:** `t3.micro`.
   - **Key pair:** **Create new key pair**, name `thara-key`, type RSA, format `.pem`. The file downloads once. Keep it somewhere safe and private: you need it on Day 3.
   - **Network settings:** leave the default VPC and **Auto-assign public IP** enabled. **Create security group**, tick **Allow SSH traffic from** and choose **My IP**, and tick **Allow HTTP traffic from the internet**.
   - **Configure storage:** leave 8 GiB gp3.
   - **Advanced details, User data:** paste the script below.

   ```bash
   #!/bin/bash
   dnf install -y httpd
   echo "<h1>Thara Hospitals portal (pilot)</h1>" > /var/www/html/index.html
   systemctl enable --now httpd
   ```

   Choose **Launch instance**. *Expected:* the instance moves from **Pending** to **Running**, and after about two minutes its status check reads **2/2 checks passed**. Note its **Availability Zone** (for example `ap-south-1a`) and its **Public IPv4 address**.

3. **Connect, and load the page.** The browser-based connection does not come from your computer: it comes from the EC2 Instance Connect service. So first open the instance's **Security** tab, choose its security group, **Edit inbound rules**, **Add rule**: type **SSH**, source **Custom**, and in the search box choose the prefix list whose name ends `ec2-instance-connect` (`com.amazonaws.ap-south-1.ec2-instance-connect`). Save. Tag the security group with the three tags. Then select the instance, choose **Connect**, the **EC2 Instance Connect** tab, user name `ec2-user`, **Connect**. In a new browser tab open `http://<public IPv4 address>` (type `http://` yourself; the server does not answer on `https://`). *Expected:* a terminal opens with the prompt `[ec2-user@ip-... ~]$`, and the browser shows **Thara Hospitals portal (pilot)**.

*Segment 2: EBS attach, format, snapshot*

4. **Add a data volume.** In EC2 choose **Volumes**, **Create volume**: type **gp3**, size **8** GiB, the **same Availability Zone** as the instance, and the three tags. When it shows **Available**, select it, **Actions**, **Attach volume**, choose `thara-web-1`, device name `/dev/sdf`. Then, in the terminal:

   ```bash
   lsblk
   sudo mkfs -t xfs /dev/nvme1n1
   sudo mkdir /data
   sudo mount /dev/nvme1n1 /data
   echo "Thara Hospitals laboratory reports index" | sudo tee /data/reports-index.txt
   df -h /data
   ```

   *Expected:* `lsblk` lists a new 8G disk, `nvme1n1`, with no mount point (the console's `/dev/sdf` appears inside the instance under this name). After the commands, `df -h /data` shows an 8.0G file system mounted on `/data`, and `cat /data/reports-index.txt` prints your line. Only run `mkfs` on the empty 8G disk, never on `nvme0n1`, which is the root volume.

5. **Snapshot the data volume.** Select the 8 GiB volume, **Actions**, **Create snapshot**, description `Day 2 data volume`, and add the three tags. Open **Snapshots**. *Expected:* a snapshot of 8 GiB moves from **Pending** to **Completed** within a minute or two. Write its snapshot id in your ledger: Day 5 and Day 6 restore from it.

*Segment 3: Create the AMI*

6. **Create the image.** Select `thara-web-1`, **Actions**, **Image and templates**, **Create image**. Image name `thara-portal-v1`. Leave **Reboot instance** ticked, so the file system is consistent. Under **Instance volumes** you will see two volumes: **remove the 8 GiB data volume** (`/dev/sdf`), so the image holds the root volume only. If you leave it in, every server launched from this image on Day 3 and Day 7 gets an extra 8 GiB disk that you pay for. Choose **Tag image and snapshots together** and add the three tags. Choose **Create image**. Your terminal disconnects because the instance reboots. Open **AMIs**. When the instance is running again, reconnect as in step 3 and mount the data volume again:

   ```bash
   lsblk
   sudo mount /dev/nvme1n1 /data
   cat /data/reports-index.txt
   ```

   *Expected:* the AMI `thara-portal-v1` moves from **Pending** to **Available** (a few minutes; carry on with step 7 while it finishes). **Snapshots** now lists a second snapshot, created for the image. After the remount, your file is still there: a reboot does not erase an EBS volume, but the mount has to be repeated because you did not make it permanent. The public IPv4 address is unchanged, because a reboot is not a stop.

*Segment 4: Docker contrast*

7. **Run a container beside the native web server.** In the terminal:

   ```bash
   sudo dnf install -y docker
   sudo systemctl enable --now docker
   sudo docker run -d --name web8080 -p 8080:80 nginx
   sudo docker ps
   ```

   Then add one more inbound rule to the security group: **Custom TCP**, port **8080**, source **My IP**. Open `http://<public IPv4 address>:8080` in a second tab, beside the first. *Expected:* `docker ps` shows one container, `web8080`, with `0.0.0.0:8080->80/tcp`. Port 80 still shows the Thara pilot page (the native Apache server, `httpd`). Port 8080 shows **Welcome to nginx!** (the container). If your network blocks port 8080, use `curl http://localhost:8080` in the terminal instead and say so in your evidence.

8. **Compare the container with the native service.** Run each pair and read the output carefully:

   ```bash
   # 1. processes: the host can see the container's processes
   ps -ef | grep -E "httpd|nginx" | grep -v grep
   sudo docker top web8080
   sudo docker exec web8080 ls /proc | grep -E "^[0-9]+$" | wc -l

   # 2. memory: the container versus the host service
   sudo docker stats --no-stream web8080
   systemctl status httpd | grep -i memory

   # 3. file system: what each can see
   cat /etc/os-release | head -2
   sudo docker exec web8080 cat /etc/os-release | head -2
   ls /data
   sudo docker exec web8080 ls /data
   ```

   *Expected:* (1) on the host, `nginx` appears in the same process list as `httpd`, as ordinary host processes, while inside the container only a handful of process ids exist; (2) the container and the native service each use a few megabytes, and no second operating system is consuming memory; (3) the host is Amazon Linux and the container believes it is a different Linux distribution, and the container cannot see `/data` at all. **Record three differences** in your own words in your evidence pack.

*Segment 5: Reports bucket and the insecure upload*

9. **Create the reports bucket.** Open S3, **Create bucket**. Check the region is ap-south-1. Bucket name `thara-reports-<student id>` (lower case; bucket names are global, so it must not already exist anywhere in AWS). Leave **ACLs disabled** and leave **Block all public access** ticked. Add the three tags. Create the bucket and open its **Permissions** tab. *Expected:* the bucket is listed in Asia Pacific (Mumbai), and **Block public access (bucket settings)** shows **Block all public access: On**.

10. **Insecure method, deliberately: upload with a long-lived key.** Read "What you are about to do that is wrong" in section 0 again. Then open IAM, **Users**, `admin-<student id>`, **Security credentials**, **Access keys**, **Create access key**. Choose **Command Line Interface (CLI)**. Notice that AWS itself recommends an alternative; tick the confirmation and continue. Description `Day 2 insecure key`. Choose **Create access key**, then **Download .csv file**. Keep that file private and off shared drives: Day 4 needs it once more. In the terminal:

    ```bash
    aws configure
    # AWS Access Key ID: paste the key id
    # AWS Secret Access Key: paste the secret
    # Default region name: ap-south-1
    # Default output format: json
    aws s3 cp /data/reports-index.txt s3://thara-reports-<student id>/
    cat ~/.aws/credentials
    ```

    *Expected:* the upload prints `upload: ../../data/reports-index.txt to s3://thara-reports-<student id>/reports-index.txt`. The last command prints your secret in plain text: that is the problem, on screen. Clear the terminal (`clear`) before any screenshot. Write in your ledger note: "long-lived admin access key on thara-web-1; deactivated in teardown; delete on Day 5".

*Segment 6: Ledger, teardown, evidence*

Write the ledger rows first (section 7), then do sections 4 and 5, then tear down (section 6), then collect the evidence (section 8).

## 4. Prove it

Paste the output of each into your evidence pack.

- In the terminal, `curl http://localhost` returns the line containing **Thara Hospitals portal (pilot)**, and `curl http://localhost:8080` returns the page containing **Welcome to nginx!**. Two web servers answer on one machine: one native, one in a container.
- In the terminal, `aws s3 ls s3://thara-reports-<student id>` lists `reports-index.txt`. The file has left the instance and lives in the bucket.
- In EC2, **AMIs**, `thara-portal-v1` shows status **Available**, and its **Block devices** line lists one volume only. The image is ready for Day 3.

## 5. Break it

**Fault:** the web server stops answering from the internet.

1. Open the instance's security group, **Edit inbound rules**, and delete the **HTTP** (port 80) rule. Save.
2. Reload `http://<public IPv4 address>` in the browser. **Symptom:** the page does not load; the browser waits and then times out.
3. **Locate it** with what you already know. In the terminal run `curl http://localhost` and `sudo systemctl status httpd`. Both are healthy: the web server is running and answers on the machine itself. So the fault is not in the application or the operating system. It is at the security group, the firewall in front of the instance. Notice the symptom is a timeout, not a "connection refused": a security group drops the packet silently.
4. **Fix:** add the rule again (type **HTTP**, source **Anywhere-IPv4**), save, and reload the page.

Record the fault, the symptom, the evidence that located it and the fix in the table in section 4 of your evidence pack. Write which layer the failure happened at.

## 6. Teardown

Do these in order. Check your ledger rows are written first.

1. **Remove the temporary 8080 rule** from the security group. Nothing after today uses it.
2. **Stop `thara-web-1`**: **Instance state**, **Stop instance**. Do not terminate it. *Expected:* state **Stopped**, and the public IPv4 address disappears.
3. **Detach and delete the 8 GiB data volume**: **Volumes**, select it, **Actions**, **Detach volume**, then **Delete volume**. Leave the root volume alone.
4. **Deactivate the access key**: IAM, your admin user, **Security credentials**, the key's **Actions**, **Deactivate**. Do not delete it. *Expected:* status **Inactive**.

What you keep, and why:

| Kept | Why |
|---|---|
| `thara-web-1`, stopped | Your fallback until Day 3 proves the image. Day 3 then retires it |
| AMI `thara-portal-v1` and its snapshot | Day 3 launches the private web server from it; Day 7 uses it again |
| The data volume's snapshot | Day 5 and Day 6 restore `reports-index.txt` from it. This is why the volume itself can go |
| Bucket `thara-reports-<student id>` and its file | Used on Days 4, 5 and 6 |
| The access key, inactive | Switched on briefly on Day 4, deleted on Day 5 |
| `thara-key.pem` and the key `.csv` file, on your computer | Day 3 needs the key pair; Day 4 needs the `.csv` once |

A stopped instance is not free. Its 8 GiB root volume and your two snapshots are still stored, at about USD 0.03 a day in total at the time of writing. That is inside today's estimate, and it is the first thing this morning's notes warned you about.

## 7. Cost line

Estimate for today: **USD 0.60**. That covers about three hours of `t3.micro` with a public IPv4 address (about USD 0.05), the two volumes for the day (about USD 0.05), and roughly two weeks of the storage you keep. Add one ledger row for each of: the instance (with start and stop times), the data volume (created and deleted), the snapshot, the AMI, the bucket, and the access key (cost 0.00, with the note from step 10). Write the day's total against the estimate. If it is higher than the estimate, write why in one line.

## 8. Evidence required

1. One screenshot showing the pilot page (port 80) and the nginx page (port 8080) side by side.
2. Your three recorded differences between the container and the native service, in your own words.
3. The AMI id and the data snapshot id, and the bucket name with **Block all public access: On** visible.
4. Your ledger rows, including the note about the access key.
5. Your break-it row from section 5, naming the layer.

Check every screenshot before you submit it: no secret access key, and the middle digits of your account id masked.

## 9. Thara connection

This lab starts two requirements. The portal must be rebuildable after the next flood: `thara-portal-v1` is that rebuild, and Day 3 proves it by launching a new server from it. Laboratory reports must be stored durably and never be publicly listable: the bucket is private from its first minute, with Block Public Access left on. The Head of IT would ask how long a rebuild takes and whether anyone has tested it. The CFO would ask why a stopped server still appears on the bill: the answer is its disk and the snapshots. The Data Protection Officer would ask who can read the reports today, and the honest answer is uncomfortable: anyone holding that access key. That answer is what Day 5 fixes.
