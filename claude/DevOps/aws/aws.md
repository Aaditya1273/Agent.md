---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: aws
category: DevOps
description: Running on AWS safely — IAM least privilege, network layout, encryption defaults, cost control, and the misconfigurations that cause breaches and bills.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for building on AWS. Two failure modes dominate, and neither is exotic:
**over-permissive IAM** and **publicly exposed storage**. Almost every publicised
AWS breach is one of those two.

The third, slower failure is cost: AWS bills grow silently and are discovered
monthly.

---
</purpose>

# IAM: roles, not keys

<rules>
```json
{
  "Effect": "Allow",
  "Action": ["s3:GetObject", "s3:PutObject"],
  "Resource": "arn:aws:s3:::acme-uploads/tenants/${aws:PrincipalTag/tenant}/*",
  "Condition": { "Bool": { "aws:SecureTransport": "true" } }
}
```

- **Never create long-lived access keys** for a human or a workload. Use IAM roles:
  instance profiles for EC2, IRSA/Pod Identity for EKS, task roles for ECS, and
  OIDC federation for CI. → `DevOps/github-actions`
- Humans authenticate through Identity Center (SSO) with short-lived credentials,
  MFA enforced.
- **No wildcards in production policies.** `"Action": "s3:*"` on
  `"Resource": "*"` is the policy behind most incidents. Grant the specific
  actions on the specific ARNs.
- Scope by condition: `aws:SourceVpc`, `aws:PrincipalOrgID`, `aws:SecureTransport`.
- Root account: MFA, no access keys, no daily use, alarm on any use.
- Separate accounts per environment under Organizations, with SCPs preventing
  region use, public S3 and CloudTrail deletion. A blast radius that stops at the
  account boundary is the strongest control AWS offers.

Review with IAM Access Analyzer and act on unused-permission findings. Policies
accumulate permissions and never lose them unless someone looks.

---
</rules>

# Storage: private and encrypted by default

<rules>
```hcl
resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket                  = aws_s3_bucket.uploads.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
```

- **Block Public Access at the account level**, not just per bucket. Per-bucket
  settings are one console click from being wrong.
- Encrypt with KMS (`aws:kms`) rather than the default S3-managed key where key
  control or audit matters; encryption at rest is on by default but the key
  ownership is not.
- Enable versioning on anything that matters, plus lifecycle rules to expire
  noncurrent versions. → `DevOps/backups`
- Serve public content through CloudFront with Origin Access Control, never a
  public bucket.
- Turn on S3 server access logging, or CloudTrail `data events`, for buckets
  holding personal data.

RDS: `publicly_accessible = false`, encryption at rest, automated backups with a
retention window, deletion protection, and Performance Insights enabled before you
need it. → `Database/postgres`

---
</rules>

# Network layout

<rules>
```
VPC 10.0.0.0/16
 ├─ public subnets   → ALB, NAT gateway only
 ├─ private subnets  → ECS/EKS workloads, Lambda
 └─ isolated subnets → RDS, ElastiCache (no route to the internet)
```

- Nothing that holds data sits in a public subnet.
- Security groups reference **other security groups**, not CIDR ranges:
  `source = aws_security_group.api.id` keeps the rule correct as instances change.
- **Never** open `0.0.0.0/0` on `22` or `3306`/`5432`. Use SSM Session Manager for
  shell access — no bastion, no open port, and every session is logged.
- VPC endpoints for S3, DynamoDB, ECR and Secrets Manager keep traffic off the
  internet and remove NAT charges for it.
- Plan CIDR ranges before creating VPCs. Overlapping ranges make peering and
  Transit Gateway impossible later, and resizing a VPC is a rebuild.

---
</rules>

# Cost: the surprises are predictable

<rules>
| Line item | Why it surprises |
| --- | --- |
| **NAT gateway** | Hourly **plus** per-GB processing; often the largest non-compute cost |
| **Cross-AZ data transfer** | Charged both directions; a chatty multi-AZ service pays constantly |
| CloudWatch Logs ingestion | Priced per GB ingested; a debug-level service dominates the bill |
| Idle load balancers, unattached EBS, old snapshots | Charged indefinitely |
| `gp2` volumes | `gp3` is cheaper and faster; the default was never migrated |
| Data egress to the internet | The one line nobody models |

Controls that work: mandatory cost-allocation tags enforced by SCP, AWS Budgets
with alerts at 50/80/100%, Cost Anomaly Detection, and Savings Plans for a
measured steady-state baseline — after measuring, not before.

Set CloudWatch log retention explicitly on every log group. The default is **never
expire**, and it is a permanent, growing charge nobody notices.

---
</rules>

# Operations

<rules>
- Everything in Terraform or CDK. Console changes exist in no backup and drift
  silently. → `DevOps/environments`
- CloudTrail enabled in all regions, logging to a bucket in a **separate account**
  with Object Lock, so a compromised account cannot erase its own trail.
- GuardDuty, Security Hub and Config with conformance packs — the managed
  detections catch the common misconfigurations without you writing rules.
- Multi-AZ (`multi_az = true` on RDS, subnets in ≥ 2 zones) for anything
  user-facing; multi-region only when the RTO justifies the complexity. → `DevOps/disaster-recovery`
- Secrets in Secrets Manager or Parameter Store (SecureString), with rotation. Never
  in environment variables committed anywhere, never in an AMI.
  → `Security/secret-management`
- Service quotas are per-account and per-region (`aws service-quotas
  list-service-quotas`); request increases **before** a launch, not during one.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Long-lived access keys | Leak and are used for months | IAM roles, OIDC federation |
| `"Action": "*"` policies | One compromise takes everything | Specific actions and ARNs |
| Root account in daily use | No accountability; catastrophic if lost | SSO; alarm on root use |
| One account for all environments | No blast-radius boundary | Account per environment |
| Public S3 buckets | The classic breach | Account-level Block Public Access |
| Databases in public subnets | Directly reachable | Isolated subnets |
| `0.0.0.0/0` on SSH or database ports | Scanned within minutes | SSM Session Manager |
| Security groups by CIDR | Drift as instances change | Reference security groups |
| Unplanned CIDR ranges | Peering impossible later | Plan the address space first |
| No VPC endpoints | NAT charges for AWS traffic | Endpoints for S3, ECR, Secrets |
| CloudWatch log groups with no retention | Charged forever | Set retention explicitly |
| Console-created resources | Drift; unrecoverable | Infrastructure as code |
| CloudTrail in the same account | A compromise erases the evidence | Separate account, Object Lock |
| No budgets or anomaly detection | Cost discovered monthly | Budgets and alerts |
| Reserved capacity bought early | Locked into the wrong shape | Measure, then commit |
| Quota increases requested at launch | Approval takes days | Request in advance |

---
</antipatterns>

# Checklist

<checklist>
- [ ] No long-lived IAM access keys exist for humans or workloads
- [ ] Human access is via Identity Center with MFA
- [ ] Production policies name specific actions and resource ARNs
- [ ] Root account has MFA, no keys, and alarms on use
- [ ] Environments are separated into accounts with guardrail SCPs
- [ ] Block Public Access is enforced at the account level
- [ ] Buckets are encrypted, versioned, with lifecycle rules
- [ ] Public content is served through CloudFront with Origin Access Control
- [ ] Databases are private, encrypted, backed up, with deletion protection
- [ ] Data-holding resources sit in isolated subnets
- [ ] Security groups reference other security groups, not CIDRs
- [ ] No `0.0.0.0/0` rule exists on administrative or database ports
- [ ] Shell access uses SSM Session Manager and is logged
- [ ] VPC endpoints exist for AWS services used from private subnets
- [ ] CIDR ranges were planned before VPC creation
- [ ] Every CloudWatch log group has an explicit retention period
- [ ] All infrastructure is defined as code
- [ ] CloudTrail is multi-region, in a separate account, with Object Lock
- [ ] GuardDuty, Security Hub and Config are enabled
- [ ] Secrets live in Secrets Manager or Parameter Store with rotation
- [ ] Cost-allocation tags are enforced and budgets alert
- [ ] Service quotas are checked and raised before launches
</checklist>
