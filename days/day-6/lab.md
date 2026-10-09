# Lab 6: Reports, records and a proven restore

**Day 6, afternoon session. Duration 3 hours. Builds component 11 (Patient records database and Backup plan) and adds to component 3 (Laboratory reports bucket) of the Thara Hospitals architecture.**

| | |
|---|---|
| Learning outcomes | LO5, LO6 |
| Sub-outcomes | S6.1, S6.2, S6.3 |
| Prerequisites | From Day 5: `thara-bastion` and `thara-web-1`, both stopped, `thara-web-role` on `thara-web-1`, the key `alias/thara-records`, and the S3 gateway endpoint on `thara-private-rt`. From Day 2: the bucket `thara-reports-<student id>` and the snapshot of the data volume. From this morning: your pair's classification table. On your computer: `thara-key.pem` |
| Estimated credit consumption | USD 1.20 |
| Evidence pack | Pack 6, due before the next teaching day |

## 0. Before you start

1. Region check: the console shows **Asia Pacific (Mumbai) ap-south-1**. If not, change it now.
2. You are signed in as your **admin IAM user**, not root.
3. Tags for everything today: `Module=CC`, `Day=6`, `Owner=<student id>`.
4. Open your cost ledger. Write today's date and the segment names below with a blank cost column.

Console labels below are as they appeared at the time of writing. AWS renames buttons from time to time; if a label differs, look for the same idea nearby and tell your lecturer.

You need the same terminal as on Day 5, opened in the folder that holds `thara-key.pem`, and a clock you can read to the minute. Today the ledger is a stopwatch.

### The ideas behind today's lab

#### Timed segments again

On Day 4 one resource billed by the hour, and the lab was built round the minutes it existed. Today has another: a database. Two things govern the afternoon.

- **RDS takes several minutes to create and to restore; the segments overlap with bucket work while it provisions.** You start the database first, and you do not watch it. While it is being created you configure the reports bucket. The same happens during the restore: there is always something to do while a status reads **Creating**.
- **The database is deleted twice today; the snapshot is what persists.** You build `thara-records`, put three rows in it, take a snapshot, and delete the database on purpose. You restore it under a new name, prove that the rows came back, and delete that one too. At the end of the day no database exists and nothing bills by the hour. The snapshot `thara-records-snap1` is the thing you keep.

![Two lanes across the afternoon. In the database lane, thara-records is created, a snapshot is taken, the database is deleted, thara-records-r1 is restored and then deleted, while the snapshot runs on underneath to the end. In the bucket lane, versioning, the lifecycle rule and the bucket policy are done while the database is being created.](img/deleted-twice-kept-once.svg "The database exists twice and is deleted twice. The snapshot is taken once and is still there at the end. The bucket work fills the minutes in which the database is being created.")

Three things are worth knowing before you start.

**The clock starts at the failure.** The measured [RTO](../../glossary.md#rto) is the time for which the service was down: from the moment you delete `thara-records` to the moment the three rows print from the restored copy. It is not the time the restore took, and it is not over when the console says **Available**. Write down four times: deleted, restore started, available, rows confirmed.

**A restore makes a new database.** A snapshot is never restored into the database it came from. It becomes a new instance, with a new name and a new endpoint, and the restore page offers the default network settings, not the ones you chose this afternoon. If you accept them, the copy lands where the web tier cannot reach it.

**`thara-web-1` can reach S3 and the VPC, and nothing else.** It has no NAT gateway. It reaches the database because the database is inside `thara-vpc`. It installs the MySQL client through the gateway endpoint from Day 4, because the package repositories of Amazon Linux are kept in S3 in your region. If the install waits and times out, tell your lecturer before you try anything else.

Three things today carry no name, only the three tags: the two volumes, and the recovery point that AWS Backup creates. Backups go to the vault that AWS Backup offers, which is called **Default**. Every other name comes from Thara's naming table or is given in the step that uses it.

> **Quick check.** At 15:00 you take `thara-records-snap1`. At 16:00 you delete `thara-records` without a final snapshot. What is left?
>
> - [ ] Nothing: a snapshot belongs to its database and goes with it
> - [x] The manual snapshot, which stays until you delete it yourself
> - [ ] The snapshot, but only for the seven days of its retention
>
> **Why:** A manual snapshot is a separate resource and outlives the database it was taken from. What goes with the database is its automated backups, unless you ask to retain them. Seven days is the retention of today's Backup plan, which is a different thing.

> **Quick check.** You delete `thara-records` at 14:00 and choose **Restore snapshot** at 14:05. The copy shows **Available** at 14:19, and the three rows print at 14:23. What is the measured RTO?
>
> - [ ] 14 minutes, from the restore to **Available**
> - [ ] 18 minutes, from the restore to the rows
> - [x] 23 minutes, from the deletion to the rows
>
> **Why:** An RTO counts the whole time the service was down, so the clock starts at the failure and not when you begin to fix it. It stops when the data is proven readable: a status of **Available** says the database is running, not that the rows are in it.

> **Common mistake.** "Deleting an RDS instance deletes its manual snapshots." It does not. A manual snapshot stays, and is charged for, until you delete it yourself. The automated backups are what go with the instance.

> **Common mistake.** "A security group on the database is the only thing keeping it private." Placement in a private subnet does the most. The database has no public address, and its subnets have no route to the internet gateway, so a packet from outside has no path to it whatever the group says. Section 5 has you prove it.

## 1. Objective

At the end of this lab the laboratory reports bucket keeps every version of a report, moves old reports to a cheaper [storage class](../../glossary.md#storage-class) and names the web tier's role in a policy of its own; a private, encrypted patient records database has been built, deleted, restored from a snapshot and timed; and a [backup plan](../../glossary.md#backup-plan) has produced a backup that you restored and read: component 11, and component 3 in depth. The snapshot is kept for the capstone and the plan stays in place for Day 7. The lab serves Thara's requirement of an RPO of one hour and an RTO of two hours for patient records, with a restore that has been tested.

## 2. Timed segments

| Segment | Minutes | Cost note |
|---|---|---|
| Start the RDS create, then bucket versioning and lifecycle | 35 | `db.t3.micro` about USD 0.02 per hour |
| Bucket policy scoped to the role; confirm Block Public Access | 20 | nil |
| Connect to RDS, create a table, snapshot, delete | 35 | nil |
| Restore from snapshot; measure RTO; delete again | 35 | nil |
| AWS Backup plan on an EBS volume; restore; measure | 25 | negligible |
| Ledger, teardown, evidence | 15 | nil |

Segments containing a NAT gateway, a load balancer or a database are created, used and deleted inside the segment. Do not carry them across the break. Today the database runs across segments 1 to 4, in two lives, and both are over before segment 5 begins. If you take a break, take it after step 18, when no database exists. A database left running costs about USD 0.50 a day with its storage. Prices are for ap-south-1 at the time of writing.

## 3. Steps

Each step states what to do and what you should see. If you do not see it, stop and diagnose before moving on.

*Segment 1: Start the RDS create, then bucket versioning and lifecycle*

1. **Check where and who you are.** Confirm the region selector shows **Asia Pacific (Mumbai) ap-south-1** and the top bar shows `admin-<student id>`. *Expected:* both are correct.

2. **Start the two instances and reopen the door.** In EC2, **Instances**, select `thara-bastion` and `thara-web-1`, then **Instance state**, **Start instance**. The bastion comes back with a **new** public address, and your own address may have changed since Day 5. So open **Security groups**, `thara-bastion-sg`, **Edit inbound rules**, set the source of the SSH rule to **My IP** again, and save. Note the bastion's new **Public IPv4 address**, connect to it, and hop to `thara-web-1` with the method you used on Day 5:

   ```bash
   ssh-add thara-key.pem
   ssh -A ec2-user@<bastion public IPv4 address>
   ssh ec2-user@<web private address>    # typed on the bastion
   ```

   *Expected:* a prompt on `thara-web-1` of the form `[ec2-user@ip-10-0-11-... ~]$`. Keep this terminal open all afternoon. If the first connection waits and times out, check the SSH source of `thara-bastion-sg` before anything else.

3. **Tell RDS where the database may live.** Open the RDS console and check the region is Mumbai. Choose **Subnet groups**, **Create DB subnet group**. Name `thara-db-subnets`, description `Private subnets for the patient records database`, VPC `thara-vpc`. Under **Add subnets** choose both availability zones, then the two private subnets, `10.0.11.0/24` and `10.0.12.0/24`, and nothing else. Create it. *Expected:* `thara-db-subnets` is listed with two subnets in two zones. A [DB subnet group](../../glossary.md#db-subnet-group) is a list of the subnets RDS is allowed to use. You gave it only private ones, so the database cannot be placed anywhere public, whatever else is chosen later.

4. **Give the database its own firewall.** In EC2 choose **Security groups**, **Create security group**. Name `thara-db-sg`, description `MySQL from the web tier only`, VPC `thara-vpc`. Add one inbound rule: type **Custom TCP**, port range `3306`, which is the port MySQL listens on, and for the source choose **Custom** and select `thara-web-sg`. Add the three tags and create it. *Expected:* `thara-db-sg` has one inbound rule whose source is a security group id, not an address. As on Day 3, naming a group means "any instance that wears that group", so the rule still holds when Day 7 adds more web servers.

5. **Start the database, and write down the time.** In RDS choose **Databases**, **Create database**, and set the page as follows. Leave anything not listed as it is offered.

   | Setting | Choose |
   |---|---|
   | Creation method | **Standard create** |
   | Engine | **MySQL**, with the version that is offered |
   | Templates | **Free tier** |
   | DB instance identifier | `thara-records` |
   | Master username | `admin`, as offered |
   | Credentials management | **Self managed**; clear **Auto generate password** and type a password of your own |
   | Instance class | **Burstable classes**, `db.t3.micro` |
   | Storage | General purpose SSD, **20** GiB; clear **Enable storage autoscaling** |
   | Compute resource | **Don't connect to an EC2 compute resource** |
   | VPC and subnet group | `thara-vpc` and `thara-db-subnets` |
   | Public access | **No** |
   | VPC security group | **Choose existing**: `thara-db-sg`. Remove `default` |
   | Additional configuration: encryption | **Enable encryption**, AWS KMS key `thara-records` |
   | Additional configuration: the rest | clear **Enable RDS Extended Support** and **Enable deletion protection** |

   Add the three tags and choose **Create database**. If a panel of suggested add-ons appears, close it. Write the time in your ledger. *Expected:* `thara-records` is listed with the status **Creating**. It will take about five to ten minutes, and you do not wait for it: go straight to step 6. Creating it also completes the activity "Create an Amazon RDS database" in the **Explore AWS** widget on Console Home; the credits may take some days to appear. Choose the password as you would for any lab: at least eight characters, not one you use anywhere else, written on paper and never in a screenshot. Three of these settings exist to stop a charge you did not ask for. Storage autoscaling grows the disk by itself. Extended Support is a paid service for old engine versions. And the credentials option that AWS recommends stores the password in another service, with a monthly price of its own, that this module does not use.

6. **Keep every version of a report.** Open S3, `thara-reports-<student id>`, **Properties**, **Bucket Versioning**, **Edit**, **Enable**, and save. On your own computer, make a text file named `reports-index.txt` containing one line: `Thara Hospitals laboratory reports index, overwritten by mistake`. In the bucket's **Objects** tab choose **Upload**, add that file, and upload it. Then switch on **Show versions**. *Expected:* `reports-index.txt` is listed twice. The new one carries a long **Version ID** and is marked as the current version. The one from Day 2 has the version ID `null`, because it was written before [versioning](../../glossary.md#versioning) was on. The overwrite did not destroy anything: it added a version on top. Take a screenshot that shows both. You uploaded from the console, as your admin user, because the web tier's role cannot: Day 5 proved that.

7. **Bring the earlier version back.** With **Show versions** still on, tick the version whose ID is `null` and choose **Download**. Then **Upload** that downloaded file to the bucket again. On `thara-web-1`:

   ```bash
   aws s3 cp s3://thara-reports-<student id>/reports-index.txt -
   ```

   *Expected:* the bucket now lists **three** versions, and the newest has the old content. The command prints `Thara Hospitals laboratory reports index`, the line from Day 2, read by the web tier through its role. Take a screenshot of the three versions. You restored by adding, so nothing was lost on the way: the mistaken version is still there to be examined. The console's other method is to delete the newer version for good, which works and leaves no record of the mistake.

8. **Move old reports to a cheaper class, by rule.** In the bucket choose **Management**, **Create lifecycle rule**. Name `thara-reports-lifecycle`. Scope **Apply to all objects in the bucket**, and tick the acknowledgement. Tick two actions: **Move current versions of objects between storage classes**, and **Permanently delete noncurrent versions of objects**. For the first, choose **Standard-IA** and `90` days after object creation. For the second, `180` days after objects become noncurrent. Read the timeline the page draws, then create the rule. *Expected:* `thara-reports-lifecycle` is listed with the status **Enabled**. Take a screenshot. That is all you can see today. A [lifecycle rule](../../glossary.md#lifecycle-rule) is carried out in the background, over hours to days, and nothing in this bucket is 90 days old. Notice the warning the page showed: an object smaller than 128 KB is not moved at all, so your one-line index file will stay in S3 Standard for good. A real report PDF is larger and would move.

*Segment 2: Bucket policy scoped to the role; confirm Block Public Access*

9. **Let the bucket say who may read it.** Find your twelve-digit account id in the menu under your user name at the top right. In the bucket choose **Permissions**, **Bucket policy**, **Edit**. Choose **Add new statement**, so that the editor writes a skeleton with a `Version` line. Leave the `Version` line exactly as it is, and make the `Statement` list read:

   ```json
   "Statement": [
     {
       "Sid": "WebTierListsTheBucket",
       "Effect": "Allow",
       "Principal": { "AWS": "arn:aws:iam::<account id>:role/thara-web-role" },
       "Action": "s3:ListBucket",
       "Resource": "arn:aws:s3:::thara-reports-<student id>"
     },
     {
       "Sid": "WebTierReadsTheReports",
       "Effect": "Allow",
       "Principal": { "AWS": "arn:aws:iam::<account id>:role/thara-web-role" },
       "Action": "s3:GetObject",
       "Resource": "arn:aws:s3:::thara-reports-<student id>/*"
     }
   ]
   ```

   Save the changes. Then, on `thara-web-1`, run `aws s3 ls s3://thara-reports-<student id>`. *Expected:* the policy is saved, and the listing still prints `reports-index.txt`. If the console answers "Invalid principal in policy", the role's name or the account id is mistyped. This is the resource-based policy that Day 5 promised: it is attached to the bucket and it has a `Principal` line, because it must say who it is talking about. Read it carefully for what it does not do. It names the role as the only principal the bucket itself admits. It does not shut out your admin user, which still reaches the bucket through its own identity-based policy: inside one account, an allow in either place is enough. Keeping everyone else out would take an explicit deny, and a mistake in one of those can lock you out of your own bucket. Take a screenshot of the saved [bucket policy](../../glossary.md#bucket-policy) with the middle digits of the account id masked.

10. **Confirm that nothing became public.** Stay on the **Permissions** tab. *Expected:* **Block all public access** is **On**, and the bucket's access reads **Bucket and objects not public**. A bucket policy is the usual way a bucket is made public by accident, so this is the moment to look. Yours names one role in your own account, and Block Public Access would have refused a policy that named everyone. Take a screenshot that shows the setting.

*Segment 3: Connect to RDS, create a table, snapshot, delete*

11. **Connect from the web tier.** In RDS, **Databases**, wait until `thara-records` shows **Available**, and write the time in your ledger beside the start time. Open the database, and on **Connectivity & security** copy the **Endpoint**. Confirm on the same tab that **Publicly accessible** reads **No**, and on **Configuration** that **Encryption** reads **Enabled** with the key `thara-records`. On `thara-web-1`:

    ```bash
    sudo dnf install -y mariadb105
    mysql -h <endpoint> -u admin -p --ssl
    ```

    *Expected:* the install ends with `Complete!`, and after you type your password you see a prompt that ends `>`. The client is the MariaDB one, which speaks to MySQL; it is the client Amazon Linux provides. You connected to a name, not an address. Leave the session open for step 12. If the connection waits and times out, check that `thara-db-sg` names `thara-web-sg` as its source and that the database is in `thara-db-subnets`.

12. **Put three rows in it.** At the database prompt:

    ```sql
    CREATE DATABASE thara;
    USE thara;
    CREATE TABLE patients (id INT PRIMARY KEY, name VARCHAR(40), branch VARCHAR(20));
    INSERT INTO patients VALUES
      (1, 'Test Patient A', 'Colombo'),
      (2, 'Test Patient B', 'Kandy'),
      (3, 'Test Patient C', 'Galle');
    SELECT * FROM patients;
    exit
    ```

    *Expected:* a table of three rows, then `Bye`. These three rows are the patient records for the rest of the afternoon. Every later step asks one question: are they still there? Use test names only, never a real person's.

13. **Take a snapshot that you own.** In RDS select `thara-records`, **Actions**, **Take snapshot**, snapshot name `thara-records-snap1`. Open **Snapshots**, and on the **Manual** tab wait for it. *Expected:* `thara-records-snap1` moves from **Creating** to **Available** in a few minutes, and its details show that it is encrypted with `thara-records`. Look at the **System** tab as well: RDS has already taken an [automated backup](../../glossary.md#automated-backup) of its own. You now have two copies of the same data, and step 14 shows which one survives.

14. **Delete the database, on purpose.** Select `thara-records`, **Actions**, **Delete**. Clear **Create final snapshot**, clear **Retain automated backups**, tick the acknowledgement, type `delete me`, and delete. **Write the time, to the minute.** This is the failure, and the clock for your RTO starts now. *Expected:* the status reads **Deleting**, and within a few minutes the database is gone from the list. Open **Snapshots**: the **System** tab is empty, and the **Manual** tab still lists `thara-records-snap1`. The automated backups went with the database. The snapshot you took yourself did not. Do not wait for the deletion to finish before you start step 15.

*Segment 4: Restore from snapshot; measure RTO; delete again*

15. **Restore it, into the right place.** In **Snapshots**, **Manual**, select `thara-records-snap1`, then **Actions**, **Restore snapshot**. Write the time. On the restore page set:

    | Setting | Choose |
    |---|---|
    | DB instance identifier | `thara-records-r1` |
    | Instance class | **Burstable classes**, `db.t3.micro` |
    | VPC and subnet group | `thara-vpc` and `thara-db-subnets` |
    | Public access | **No** |
    | VPC security group | **Choose existing**: `thara-db-sg`. Remove `default` |
    | Deletion protection | cleared |

    Add the three tags and choose **Restore DB instance**. *Expected:* `thara-records-r1` is listed with the status **Creating**. Read the page before you leave it: it offered the default security group, and it never asked for the password or the key, because both come with the snapshot. A restore that lands in the default group is running and unreachable, which is the commonest way to lose twenty minutes of an RTO. While it is created, write your ledger rows for segments 1 to 3.

16. **Prove the rows came back, and stop the clock.** When `thara-records-r1` shows **Available**, write the time. Copy its **Endpoint**, which is not the one you used before, and on `thara-web-1`:

    ```bash
    mysql -h <new endpoint> -u admin -p --ssl -e "SELECT * FROM thara.patients;"
    ```

    *Expected:* the same three rows, with the same password as before. **Write the time.** Take a screenshot of the rows. Now do the sum in your ledger: the minutes from the deletion in step 14 to this moment are your **measured RTO**. Thara's target is two hours. Write a second figure beside it: the minutes from **Restore snapshot** to **Available**, which is the part of the RTO that the restore itself took. The difference between the two is people: noticing, finding the snapshot, filling in a page. Your data loss today was nothing, because the snapshot was taken a moment before the failure. In real life it would be everything written since the last backup.

17. **Do section 5 now.** The break-it needs a database, and this one is about to go. Turn to section 5, do it, and come back here.

18. **Delete the copy, and keep the snapshot.** Select `thara-records-r1`, **Actions**, **Delete**. Clear **Create final snapshot** and **Retain automated backups**, acknowledge, type `delete me`, and delete. Write the time. *Expected:* when the deletion completes, **Databases** is empty, and **Snapshots**, **Manual**, still lists `thara-records-snap1`. Nothing bills by the hour any more. Do not delete the snapshot.

*Segment 5: AWS Backup plan on an EBS volume; restore; measure*

19. **Make something small to back up.** In EC2 choose **Snapshots**, select the snapshot with the description `Day 2 data volume`, then **Actions**, **Create volume from snapshot**. Volume type **gp3**, size 8 GiB, Availability Zone `ap-south-1a`, and the three tags with `Day=6`. Create it. *Expected:* in **Volumes**, a new 8 GiB volume shows **Available**. Copy its volume id. You do not attach it. It is here to be backed up.

20. **Write the plan.** Open the AWS Backup console and check the region is Mumbai. Choose **Backup plans**, **Create backup plan**, **Build a new plan**. Backup plan name `thara-daily`. Backup rule name `thara-daily`. Backup vault **Default**. Backup frequency **Daily**. Leave the backup window at its defaults. Set the total retention period to `7` days. Leave everything else off and choose **Create plan**. The console moves on to **Assign resources**:

    | Setting | Choose |
    |---|---|
    | Resource assignment name | `thara-daily` |
    | IAM role | **Default role** |
    | Define resource selection | **Include specific resource types**, and select **EBS** |
    | Refine selection using tags | Key `Module`, condition **Equals**, value `CC`; then **Add tag**: key `Day`, condition **Equals**, value `6` |

    Choose **Assign resources**. *Expected:* the plan `thara-daily` shows one rule and one resource assignment. A plan is a schedule, a place and a retention, and the assignment says what it applies to. Two tags together mean "both", so the plan covers the volume you made in step 19 and nothing else. `Module=CC` alone would also have matched every other tagged thing in your account, every night. A [backup vault](../../glossary.md#backup-vault) is where the backups are kept; **Default** is the one AWS Backup provides. If the console refuses because of your account's plan, copy the message into your evidence pack and carry on from section 4; your lecturer shows the restore.

21. **Back it up now, without waiting for tonight.** Choose **Protected resources**, **Create on-demand backup**. Resource type **EBS**, and the volume id from step 19. **Create backup now**. Total retention period `7` days. Backup vault **Default**, IAM role **Default role**. Create it. *Expected:* under **Jobs**, **Backup jobs**, a job moves to **Completed** within a few minutes. The schedule would have done this tonight; an on-demand backup uses the same vault and the same rules, at a moment you choose.

22. **Restore it, and read the file.** In **Protected resources** choose the volume's id, select its recovery point, and choose **Restore**. Write the time. Resource type **EBS volume**, volume type **gp3**, size 8 GiB, Availability Zone `ap-south-1a`, restore role **Default role**. Choose **Restore backup**. Under **Jobs**, **Restore jobs**, wait for **Completed**. In EC2, **Volumes**, find the new 8 GiB volume, add the three tags to it, then **Actions**, **Attach volume**, instance `thara-web-1`, device name `/dev/sdf`. On `thara-web-1`:

    ```bash
    lsblk
    sudo mkdir -p /data
    sudo mount /dev/nvme1n1 /data
    cat /data/reports-index.txt
    ```

    *Expected:* the restore job shows **Completed**, `lsblk` lists an 8G disk, `nvme1n1`, and the last command prints `Thara Hospitals laboratory reports index`. Write the time, and the minutes from **Restore backup** to the printed line. That is your second measured restore of the day, and the first that went through a plan. Take a screenshot of the restore job.

*Segment 6: Ledger, teardown, evidence*

Write the ledger rows (section 7), do section 4, tear down (section 6), and collect the evidence (section 8). Section 5 you did at step 17.

## 4. Prove it

Paste the output of each into your evidence pack.

- Two versions of `reports-index.txt` visible in the bucket (the screenshot from step 6), and the earlier one restored as current: `aws s3 cp s3://thara-reports-<student id>/reports-index.txt -` on `thara-web-1` prints the Day 2 line.
- The three patient rows present after the restore from `thara-records-snap1` (step 16).
- The Backup restore job shows **Completed**, and `cat /data/reports-index.txt` reads the file on the restored volume (step 22).

## 5. Break it

Do this at step 17, while `thara-records-r1` exists.

**Fault:** someone "opens up" the database's security group so that it can be reached from anywhere.

1. In EC2 open **Security groups**, `thara-db-sg`, **Edit inbound rules**, **Add rule**: type **Custom TCP**, port range `3306`, source **Anywhere-IPv4**, which is `0.0.0.0/0`. Save. Leave the rule for `thara-web-sg` in place.
2. Predict, in writing, whether your laptop can now connect. Then test a TCP connection from your **laptop**, not from the bastion, to port 3306 of the endpoint of `thara-records-r1`:

   ```bash
   Test-NetConnection <new endpoint> -Port 3306     # Windows PowerShell
   nc -vz -w 5 <new endpoint> 3306                  # macOS or Linux
   ```

   **Symptom:** the test fails or times out, although the group now allows the whole internet.
3. **Locate it** with what you already know. On your laptop run `nslookup <new endpoint>`. The name resolves to an address that begins `10.0.11.` or `10.0.12.`: a private address in one of the private subnets. Your laptop has no route to that address, so the packet never reaches `thara-vpc`, and the security group is never asked. It is the Day 3 lesson again, and for the same reason your flow log holds no record of the attempt. Now run the query from step 16 again on `thara-web-1`: it still works, because the web tier is inside the VPC. The database was protected by three things in order: no public address, subnets with no route to the internet gateway, and only then the group.
4. **Fix:** remove the `0.0.0.0/0` rule from `thara-db-sg`, so that it has its one rule from `thara-web-sg` again.

Record the fault, the symptom, the evidence that located it and the fix in the table in section 4 of your evidence pack. Say in one sentence why the open rule was still a fault worth fixing, although nothing could use it today.

## 6. Teardown

Do these in order. Check your ledger rows are written first.

1. **Remove the restored volume.** On `thara-web-1` run `sudo umount /data`. In EC2, **Volumes**, select the volume attached to `thara-web-1` as `/dev/sdf`, **Actions**, **Detach volume**; when it is **Available**, **Actions**, **Delete volume**. *Expected:* the volume is gone.
2. **Remove the temporary volume** from step 19: select it, **Actions**, **Delete volume**. *Expected:* **Volumes** lists only the two root volumes of the Thara instances, and the snapshot `Day 2 data volume` is still listed under **Snapshots**.
3. **Confirm that no database exists.** In RDS, **Databases** is empty. **Snapshots**, **Manual**, lists `thara-records-snap1`. **Automated backups**, **Retained**, is empty.
4. **Confirm that `thara-db-sg` has one inbound rule**, from `thara-web-sg`, and no rule for `0.0.0.0/0`.
5. **If you ever copied `thara-key.pem` to the bastion**, check that it is gone: on the bastion, `ls ~` should not list it.
6. **Stop `thara-bastion` and `thara-web-1`**: **Instance state**, **Stop instance**. Do not terminate them. *Expected:* both show **Stopped**.

What you keep, and why:

| Kept | Why |
|---|---|
| `thara-records-snap1` | The proof that the records can be brought back, and the starting point for your capstone group's own. It costs a few cents a month |
| The Backup plan `thara-daily` and the recovery point in the **Default** vault | The plan now matches nothing, so it costs nothing. The recovery point is removed by its seven-day retention |
| `thara-db-subnets` and `thara-db-sg` | They cost nothing, and a database restored from the snapshot needs both |
| Versioning, `thara-reports-lifecycle` and the bucket policy on `thara-reports-<student id>` | They are the reports bucket's configuration from now on |
| `alias/thara-records` | The snapshot is encrypted with it. Without the key the snapshot cannot be restored. About USD 0.03 a day |
| `thara-bastion` and `thara-web-1`, stopped | Day 7 starts them again |

No database is on this list. Both are gone, and the snapshot is what remains of them.

## 7. Cost line

Estimate for today: **USD 1.20**. The afternoon itself comes to about USD 0.15: two `t3.micro` instances for three hours with the bastion's public IPv4 address, about an hour and a half of `db.t3.micro` with its 20 GiB of storage, and the two small volumes. The week to Day 7 adds about USD 0.23 for the key, about USD 0.35 for the two stopped root volumes, and a few cents for `thara-records-snap1` and the recovery point. That leaves room, and it is there for one reason: a database left running by mistake would use it up within a day.

Add one ledger row for each of: `thara-bastion` and `thara-web-1` (start and stop times); `thara-records` (create started, available, deleted); `thara-records-snap1` (created, with the note "kept"); `thara-records-r1` (restore started, available, rows confirmed, deleted), with the **measured RTO** in minutes; the temporary volume and the restored volume (created and deleted); the Backup plan `thara-daily` (cost 0.00), the on-demand backup, and the Backup restore with its minutes. Write the day's total against the estimate. If it is higher than the estimate, write why in one line.

## 8. Evidence required

1. The version list of `reports-index.txt` showing the restore: the screenshot of two versions (step 6) and of three (step 7).
2. Screenshots of the lifecycle rule `thara-reports-lifecycle` and of the bucket policy, and **Block all public access** shown **On** (steps 8 to 10).
3. Ledger rows with the RDS create time, delete time, restore time and the measured RTO, and the Backup restore time (steps 5, 11, 14 to 16 and 22).
4. The screenshot of the three rows after the restore (step 16), and of the completed Backup restore job (step 22).
5. Your break-it row from section 5, with your sentence on why the open rule still mattered.

Check every screenshot before you submit it: no password, and the middle digits of your account id masked.

## 9. Thara connection

This lab meets the requirement that began with the flood: an RPO of one hour and an RTO of two hours for patient records, so that consultants never work from paper again. Until this afternoon the two hours was a figure in a document. Now you have deleted the records database and brought it back, and you hold a number of your own to set against it. The Head of IT would ask the question he could not answer about the tape in the third-floor cupboard: has anyone restored from it? You have, twice. The Data Protection Officer would ask where the records were while they were a snapshot: encrypted with `alias/thara-records`, in Mumbai, and unreachable from outside the VPC, which you tested with the door apparently wide open. The database is to be reachable from the web tier and by the IT team; today the team reaches it by connecting through the bastion to the web tier, which is the only source `thara-db-sg` names. The CFO would ask why the database is not simply left running: about USD 15 a month for an instance this small at the time of writing, against a few cents for the snapshot, and the pilot runs it only when it is being used. One number is still unproven. Your snapshot was a moment old; meeting an RPO of one hour needs a backup at least every hour, and that is an argument your capstone group must make from a schedule.
