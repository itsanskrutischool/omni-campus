# Reference ERP Hierarchy Analysis

This pass compares Omni Campus with two reference school ERPs:

- `Smart School v7.2`
- `InstiKit`

## What Already Exists In Omni Campus

Omni Campus already has strong top-level coverage for:

- dashboard
- students
- admissions
- academics
- attendance
- exams
- fees
- transport
- library
- front office
- staff / HR
- communication
- reports
- settings
- accounts
- safety
- reception
- health
- certificates
- scholarships
- LMS
- homework
- petty cash

## What The Reference Systems Add

The two reference ERPs consistently include a few operational pillars that Omni Campus did not expose yet as first-class modules:

- alumni
- hostel
- inventory / assets
- recruitment

They also go deeper inside existing modules with richer sub-areas such as:

- student import history, document sets, qualifications, tags, mentor assignment, enrollment status
- transport stoppages, circles, vehicle documents, fuel and service logs
- communication campaign management
- front-office visitor and enquiry pipelines
- hostel occupancy and leave workflows
- inventory supplier, issue-return, stock audit, and consumption trails

## First Implementation Decision

Instead of jumping straight into dozens of scattered sub-pages, the right first step is:

1. expose the missing top-level modules in RBAC and navigation
2. scaffold their landing pages with a strong blueprint
3. use that hierarchy as the source for the next deeper implementation passes

That keeps Omni Campus coherent and gives the product the same structural breadth as the reference systems.

## Added In This Pass

New top-level modules scaffolded:

- Alumni
- Hostel
- Inventory
- Recruitment

Each module page now documents:

- the closest source modules from Smart School / InstiKit
- the intended subdomains
- the implementation direction for upcoming deeper work

## Recommended Next Deep Passes

### Student Module

- document vault
- qualification history
- tags and segmentation
- mentor mapping
- import history
- richer attendance and progression reports

### Transport Module

- stoppages
- circles / route clusters
- vehicle documents
- service and fuel log
- transport fee mapping

### Front Office Module

- enquiry pipeline
- complaint tracking
- visitor tokens
- postal and call register

### Inventory Module

- stores master
- suppliers
- GRN / purchase intake
- issue and return vouchers
- audit reports

### Hostel Module

- room master
- occupancy board
- leave / outpass
- visitor approval
- hostel fee plans

### Recruitment Module

- vacancy request workflow
- candidate board
- interview scorecards
- onboarding handoff to HR / staff

## Outcome

Omni Campus now has a stronger ERP page hierarchy baseline that aligns more closely with the two reference systems. The next work should focus on filling the new modules and enriching the existing ones section by section.
