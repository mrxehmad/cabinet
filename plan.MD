# Medicine Cabinet SaaS V1 — Coding LLM Master Prompt

## Role

You are the lead software engineer responsible for building **V1 of a mobile-first medicine inventory SaaS application**.

You are operating in a **Windows development environment**. Assume the developer will use Windows Terminal, PowerShell, VS Code, Node.js, npm, Git, and Android tooling as required.

The application must be designed for **Android from day one**, while development and initial testing will primarily happen in a **desktop browser**. The same React codebase must later be packaged and installed as an Android application without requiring a rewrite.

Do not build a throwaway prototype. Build a clean, maintainable V1 with a proper architecture that can grow into a SaaS product.

The V1 must have all core inventory functionality working before adding optional enhancements.

---

# 1. Product

The product is a **digital medicine cabinet for an individual user**.

The user records medicines they keep at home and can quickly answer:

* What medicines do I have?
* How much do I have left?
* What is each medicine used for?
* Which medicines are expiring soon?
* Which medicines are already expired?
* Which medicines are low in stock?
* Which medicines match a name, description, tag, expiry or stock filter?
* What medicines do I need to buy?

The application should prioritise:

1. Extremely easy data entry.
2. Fast searching.
3. Clear alerts.
4. Minimal user input.
5. Mobile-first UX.
6. Reliable data persistence.
7. Strong privacy and account isolation.
8. Android compatibility from the beginning.

Do not over-engineer V1.

---

# 2. V1 Scope

Implement these features completely.

## Authentication

Implement:

* User registration
* User login
* User logout
* Persistent login/session
* Password reset
* Protected application routes
* Basic account/settings page

Use **Firebase Authentication**.

Initially support:

* Email/password

Do not implement Google authentication unless it is trivial and does not delay the core product.

---

# 3. Medicine data model

A medicine belongs to exactly one authenticated user in V1.

Do NOT implement household sharing in V1.

Do NOT implement a separate medicine-owner/member system.

The medicine record should contain:

```text
id
userId
name
description
type
quantity
unit
expiryDate
tags[]
notes
createdAt
updatedAt
```

### Field definitions

### name

Required.

Example:

```text
Paracetamol 500mg
```

### description

Required.

This represents what the medicine is generally used for.

Example:

```text
Used for pain and fever.
```

This is informational inventory data.

The application must NOT turn this into medical diagnosis or treatment advice.

### type

Required.

Initial predefined values:

```text
Tablet
Capsule
Syrup
Cream
Ointment
Drops
Sachet
Spray
Injection
Liquid
Other
```

The UI should allow selecting one of these.

Do not make the user type the type manually unless they select `Other`.

### quantity

Required.

Store the numeric amount separately from the unit.

Example:

```text
quantity: 20
unit: "tablets"
```

Do NOT store `"20 tablets"` as one database field.

### unit

Required.

Initial options:

```text
tablets
capsules
sachets
bottles
tubes
packs
drops
ml
pieces
other
```

If `other` is selected, allow a custom unit.

### expiryDate

Required.

Use a proper date representation.

Do not store arbitrary human-readable strings such as `"September 2027"` as the primary database representation.

### tags

Optional array of user-created tags.

Example:

```text
["pain", "fever", "dad"]
```

Tags must not be constrained to predefined categories.

Users can create their own.

### notes

Optional free-text field.

Keep it secondary and visually unobtrusive.

---

# 4. Do NOT implement these V1 fields/features

Do not add:

* Storage location
* Household members
* Separate ownership field
* Prescription status
* Automatic medicine recommendations
* Medical diagnosis
* Medical treatment recommendations
* Barcode scanning
* OCR
* AI medicine recognition
* Medicine image recognition
* Pharmacy integration
* Payments
* Stripe
* Premium plans
* Subscription management
* Multiple households
* AI medical assistant
* Complex medication schedules

These are explicitly outside V1.

Build the architecture so they can be added later.

---

# 5. Quantity UX

The quantity system should minimise typing.

A user should be able to enter:

```text
20 tablets
```

through:

```text
Quantity: [20]
Unit: [Tablets]
```

On the medicine details screen, provide simple `+` and `-` controls where appropriate.

Do not require users to manually edit the quantity string.

Prevent invalid states such as:

```text
-4 tablets
```

Quantity should never become negative.

Decide sensible handling for zero quantity.

The app should support:

```text
0 tablets
```

because the medicine may be finished but retained as an inventory item until the user removes it.

---

# 6. Low-stock logic

Low stock is an automatically calculated alert.

Do NOT make the user manually toggle a `lowStock` boolean.

V1 should use a simple, explainable threshold.

Use:

```text
low stock when quantity <= 20% of original quantity
```

However, because the original quantity is required for this calculation, add:

```text
initialQuantity
```

to the medicine model.

Therefore the effective model becomes:

```text
id
userId
name
description
type
quantity
initialQuantity
unit
expiryDate
tags[]
notes
createdAt
updatedAt
```

When a medicine is first created:

```text
initialQuantity = quantity
```

Example:

```text
initialQuantity = 20
quantity = 20
```

Low stock:

```text
quantity <= initialQuantity * 0.20
```

For very small quantities, make the behaviour sensible.

For example, a medicine starting with:

```text
1 bottle
```

should not produce a confusing fractional threshold.

In such cases use a practical minimum threshold.

The exact helper function should be isolated in a utility/service function so the rule can be changed later without changing UI code.

Do not display technical calculations to users.

Display:

```text
⚠ Low stock
```

---

# 7. Expiry logic

Expiry should also be automatically calculated.

The user only enters an expiry date.

The system calculates:

* Valid
* Expiring soon
* Expired

For V1 define:

```text
Expired = expiry date is before today
Expiring soon = expiry date is within the next 30 days
Valid = more than 30 days remaining
```

Use the user's local date correctly.

Avoid timezone-related off-by-one errors.

Do not store:

```text
isExpired
isExpiringSoon
```

as manually maintained database values.

Calculate them from `expiryDate`.

Isolate this logic in reusable utility functions.

---

# 8. Alerts

Alerts belong to the user's account.

The application should automatically identify:

### Low stock

Medicines meeting low-stock criteria.

### Expiring soon

Medicines expiring within 30 days.

### Expired

Medicines whose expiry date has passed.

The Home screen should show a concise summary such as:

```text
3 Alerts

2 Low stock
1 Expiring soon
```

Expired medicines should also be clearly visible.

Do not require the user to manually create or clear alerts.

When medicine data changes, the alert state should update automatically.

---

# 9. Notifications

Implement basic in-app alerts in V1.

Architect the code so push/local notifications can be added cleanly.

Do not spend significant time implementing a complex notification infrastructure if it would delay the core app.

At minimum, the application must visibly show:

* Low-stock alerts
* Expiring-soon alerts
* Expired alerts

If implementing notifications is straightforward for the chosen Android architecture, support them cleanly, but core functionality takes priority.

---

# 10. Search

Search is a core feature.

Create one primary search interface.

The user must be able to search across:

* Medicine name
* Description
* Tags

Examples:

Search:

```text
para
```

should find:

```text
Paracetamol
```

Search:

```text
fever
```

should find medicines where `fever` appears in the description or tags.

Search:

```text
dad
```

should find medicines tagged `dad`.

Search should be:

* Case-insensitive
* Fast
* Mobile-friendly
* Tolerant of simple partial matches

Do not attempt advanced full-text search infrastructure in V1 unless needed.

The initial user dataset will normally be small.

---

# 11. Search filters

Implement filters for:

### Type

Examples:

* Tablet
* Capsule
* Syrup
* Cream
* etc.

### Tags

Allow filtering by tags already used by the user.

### Expiry

* Expired
* Expiring soon
* Valid

### Stock

* Low stock
* In stock

Filters should work together.

Example:

```text
Search = "fever"
Tag = "dad"
Stock = Low stock
```

The implementation should correctly combine all active filters.

---

# 12. Sorting

Provide useful sorting options.

At minimum:

* Recently added
* Name A–Z
* Expiry date
* Quantity low to high

Do not create unnecessary sorting options.

---

# 13. Tags

Tags are user-created.

The user can:

* Add a tag to a medicine
* Remove a tag
* Create new tags
* Reuse existing tags

Examples:

```text
pain
fever
cold
dad
mum
child
night
```

Do not hard-code medical categories as mandatory categories.

The same tag can be used by multiple medicines.

Normalise tags where practical.

For example, prevent accidental duplicates such as:

```text
Dad
dad
DAD
```

Treat them consistently.

---

# 14. Shopping list

Implement a simple shopping list.

Users should be able to add a medicine to the shopping list from:

* Medicine details
* Low-stock alert area

Shopping list item should contain enough information to identify the medicine.

Basic states:

```text
Pending
Purchased
```

User actions:

* Add
* Mark purchased
* Unmark purchased
* Delete

Do not build an e-commerce system.

Do not integrate pharmacies.

Do not implement automatic purchasing.

Keep it extremely simple.

---

# 15. Home screen

The exact final visual design can evolve, but the initial information architecture should be:

```text
Home

Greeting

Medicine cabinet summary

Alerts
- Low stock
- Expiring soon
- Expired

Recently added medicines

Quick actions
- Add Medicine
- Search
- Shopping List
```

The Home screen should immediately answer:

> "Does my medicine cabinet need attention?"

Avoid clutter.

---

# 16. Medicines screen

The core inventory screen should contain:

* Search
* Filter controls
* Sort controls
* Medicine list
* Add Medicine action

Example conceptual layout:

```text
Medicines

[ Search medicines... ]

[All] [Low stock] [Expiring]

Paracetamol
500mg • 12 tablets

Cetirizine
10mg • 8 tablets

ORS
3 sachets
```

Do not expose database fields or technical identifiers to users.

---

# 17. Medicine details screen

Display:

```text
Medicine name

Used for
Description

Type

Quantity

Expiry

Tags

Notes
```

Also clearly display automatically calculated states:

```text
Low stock
```

or:

```text
Expires in 12 days
```

or:

```text
Expired
```

Available actions:

```text
Edit
Add to Shopping List
Delete
```

The delete action should require confirmation.

---

# 18. Add Medicine screen

This is one of the most important screens.

Minimise friction.

Preferred flow:

```text
Add Medicine

Name
Used for

Type

Quantity
Unit

Expiry

Tags

Notes

Save Medicine
```

Required fields:

* Name
* Description
* Type
* Quantity
* Unit
* Expiry date

Optional:

* Tags
* Notes

Do not include unnecessary fields.

The average medicine should be enterable in roughly 30 seconds.

---

# 19. Edit Medicine

Allow all medicine fields to be edited.

Be careful with `initialQuantity`.

When the current quantity is edited, do not automatically overwrite `initialQuantity`.

The architecture must separate:

```text
initialQuantity
current quantity
```

so low-stock calculation remains meaningful.

If a user intentionally resets inventory, provide an explicit mechanism later rather than silently changing the baseline.

---

# 20. Mobile-first UI

Design the product primarily for:

```text
320px–480px width
```

Typical Android phones should look excellent.

The browser desktop version is for development/testing and responsive usability, not the primary design target.

Prioritise:

* Large touch targets
* Simple forms
* Clear hierarchy
* Comfortable spacing
* Thumb-friendly controls
* Bottom navigation
* Floating Add button where appropriate
* Minimal typing
* Clear visual status indicators

Avoid desktop-style dense tables.

---

# 21. Navigation

Initial navigation:

```text
Home
Medicines
Shopping
Settings
```

Use mobile-friendly bottom navigation.

The Add Medicine action should be visually prominent.

Do not create excessive nested menus.

---

# 22. Design language

The application should feel:

* Clean
* Calm
* Trustworthy
* Modern
* Lightweight
* Medical without looking like a hospital management system

Avoid:

* Excessive gradients
* Overly complicated dashboards
* Large decorative illustrations
* Enterprise-style tables
* Excessive animation

Prioritise usability over visual gimmicks.

Use accessible typography and adequate contrast.

Do not rely only on colour to communicate:

```text
Low stock
Expiring
Expired
```

Use icons, text and colour together.

---

# 23. Browser-first development, Android-ready

This project will be tested first in a normal desktop browser.

However, every important UI and interaction must be designed so it can be packaged into Android.

Use:

```text
React
TypeScript
Vite
Capacitor
```

unless you identify a strong technical reason to use an equivalent stack.

Do not choose a framework that makes browser development awkward merely because it makes mobile packaging convenient.

The browser must remain a first-class development/testing target.

---

# 24. Android packaging

Configure the project for Capacitor from the beginning.

The repository should ultimately support:

```text
npm run dev
```

for browser development.

And an Android workflow such as:

```text
npm run build
npx cap sync android
npx cap open android
```

The exact scripts can be improved as needed.

The Android project should live cleanly alongside the React project.

Do not wait until the end of development to introduce Capacitor.

---

# 25. Firebase

Use Firebase for V1.

Required services:

### Firebase Authentication

For user accounts.

### Cloud Firestore

For medicine, tags, shopping list and user data.

Firebase Storage is NOT required for V1.

Do not introduce unnecessary Firebase products.

---

# 26. Firestore structure

Prefer user-scoped data.

A good initial structure is:

```text
/users/{userId}

/users/{userId}/medicines/{medicineId}

/users/{userId}/shoppingList/{itemId}

/users/{userId}/tags/{tagId}
```

You may adjust this structure if there is a strong reason.

Do not store all user medicines in a single unrestricted global collection when a user-scoped structure is sufficient.

---

# 27. Firestore security

Security is mandatory.

Firestore Security Rules must ensure:

> A user can only access their own data.

For example:

```text
/users/{userId}/...
```

must only be accessible to the currently authenticated user whose UID equals `{userId}`.

Do not rely on the frontend to enforce access control.

All important access restrictions must be enforced by Firebase Security Rules.

Test the rules.

Do not leave Firestore in insecure development mode.

---

# 28. Architecture

Use a clean separation.

Recommended conceptual structure:

```text
src/

  components/
  pages/
  layouts/
  hooks/
  services/
  firebase/
  models/
  utils/
  state/
  styles/
```

The exact folder structure is flexible.

The important architectural requirement is:

## Do not scatter Firebase calls throughout UI components.

Create a service/data layer such as:

```text
medicineService
tagService
shoppingListService
authService
```

Example conceptual API:

```text
getMedicines()
getMedicine(id)
createMedicine(data)
updateMedicine(id, data)
deleteMedicine(id)

searchMedicines(query)
getLowStockMedicines()
getExpiringMedicines()
getExpiredMedicines()
```

The UI should interact with the service layer.

Firebase should be behind that abstraction.

This is important because a custom backend will be introduced in the future.

---

# 29. Future backend compatibility

V1 will use Firebase directly.

In the future, we may introduce our own server.

Therefore:

```text
UI
 ↓
Application services
 ↓
Data provider
 ↓
Firebase
```

Later:

```text
UI
 ↓
Application services
 ↓
Data provider
 ↓
Our API server
 ↓
Database
```

Do not tightly couple UI components to Firestore document structures.

Keep Firebase-specific code isolated.

Do not prematurely build the future backend.

---

# 30. State management

Do not introduce a heavy state-management framework without need.

Use:

* React state
* Context where appropriate
* A lightweight state library only if real complexity appears

Avoid unnecessary global state.

Firebase should remain the source of truth for persisted data.

---

# 31. Form validation

Every form needs validation.

Examples:

Name:

```text
Required
```

Description:

```text
Required
```

Quantity:

```text
Required
Must be numeric
Must be >= 0
```

Expiry:

```text
Required
Must be a valid date
```

Tags:

```text
Trim whitespace
Prevent empty tags
Prevent accidental duplicates
```

Show useful human-readable validation messages.

Do not expose raw technical errors.

---

# 32. Error handling

Handle:

* Firebase unavailable
* Authentication errors
* Permission errors
* Invalid form input
* Network problems
* Empty search results
* Failed save
* Failed delete
* Session expiration

Use friendly messages.

Never silently lose user data.

After a failed write, clearly tell the user the action failed.

---

# 33. Loading states

Provide proper loading states.

Do not display a blank screen while Firebase is loading.

Use:

* Skeletons
* Spinners where appropriate
* Disabled submit buttons during writes

Prevent accidental double-submission.

---

# 34. Empty states

Design useful empty states.

For example, new account:

```text
Your medicine cabinet is empty.

Add your first medicine to get started.

[ + Add Medicine ]
```

No search results:

```text
No medicines found.

Try another search or remove a filter.
```

Empty shopping list:

```text
Your shopping list is empty.
```

---

# 35. Responsive browser testing

The application must work in:

* Desktop browser
* Tablet-sized browser
* Mobile-width browser

But mobile remains the priority.

Test at least:

```text
320px
375px
390px
414px
768px
1280px+
```

Do not allow horizontal scrolling.

---

# 36. Accessibility

Implement sensible accessibility from the beginning.

Use:

* Semantic HTML
* Proper labels
* Keyboard accessibility
* Focus states
* Accessible buttons
* Accessible form errors
* Sufficient contrast
* Touch targets large enough for mobile
* Screen-reader-friendly labels

Do not use icons as the only indication of an action.

---

# 37. Performance

The application should feel fast.

Avoid:

* Huge dependencies
* Unnecessary re-renders
* Excessive animations
* Loading the entire database repeatedly
* Unoptimised assets
* Unnecessary network requests

For V1, user datasets will be relatively small.

Use simple Firestore queries and client-side filtering where appropriate.

Do not prematurely build Elasticsearch or another search engine.

---

# 38. Offline capability

Investigate and enable Firestore offline persistence where practical.

The app should ideally allow a user to:

* View previously loaded medicines
* Search previously loaded medicines
* View shopping list

even when temporarily offline.

Changes should synchronise when connectivity returns.

Do not allow offline behaviour to compromise data consistency.

---

# 39. Privacy

Treat medicine information as sensitive user data.

Implement:

* User authentication
* Per-user database access
* Secure Firestore rules
* HTTPS
* No unnecessary data collection
* No analytics that expose medicine names or contents
* No selling user data
* No public medicine records

Do not transmit medicine information to third-party AI APIs.

No external AI service is required for V1.

---

# 40. No medical advice

This application is an inventory management tool.

It must NOT:

* Diagnose illness
* Recommend treatment
* Recommend a medicine for a symptom
* Generate dosage instructions
* Claim a medicine is safe for a specific person
* Replace a doctor or pharmacist

The `description` field is user-provided inventory information.

Keep the application clearly within the inventory-management use case.

---

# 41. Environment configuration

Firebase configuration and environment-specific values must not be hard-coded into arbitrary source files.

Use environment configuration such as:

```text
.env.local
```

and provide:

```text
.env.example
```

with placeholder values.

Do not commit secrets to Git.

Explain which Firebase configuration values are required.

Remember that Firebase web configuration values are generally client-side configuration, but security must still come from Authentication and Firestore Security Rules.

---

# 42. Git

Initialise a Git repository.

Create a sensible `.gitignore`.

Do not commit:

```text
node_modules
.env.local
build artifacts
IDE-specific private files
```

Use clear commits as development progresses.

---

# 43. Windows-specific requirements

You are working in Windows.

Prefer commands that work in:

* PowerShell
* Windows Terminal

Do not assume Bash-only tooling.

When documentation requires shell commands, provide Windows-compatible commands.

If a command differs between PowerShell and Bash, prefer PowerShell syntax for the main instructions.

Avoid unnecessary Linux dependencies.

The application itself must remain cross-platform.

---

# 44. Development workflow

The developer will primarily test using the browser.

The intended workflow is:

```text
Install dependencies

Run React development server

Open browser

Test functionality

Build production version

Sync Capacitor

Open Android project

Build/test Android application
```

Make this workflow simple and documented.

The developer should not need to understand complicated DevOps infrastructure.

---

# 45. Android from day one

Do not postpone Android compatibility.

During implementation:

* Avoid browser-only APIs unless there is a fallback
* Avoid desktop-only UI assumptions
* Test touch interactions
* Ensure forms work correctly on mobile
* Account for Android safe areas
* Avoid fixed elements that conflict with system navigation
* Make scrolling behave correctly
* Ensure keyboard interaction does not hide form fields
* Ensure buttons are touch friendly

The Android application should feel like a mobile application, not a desktop website squeezed onto a phone.

---

# 46. PWA

A PWA is useful during browser testing.

If it can be implemented cleanly without distracting from the Android-ready architecture, configure:

* Web app manifest
* Appropriate app name
* Icons
* Mobile viewport
* Installability basics

However, PWA features must not become more important than the core product.

---

# 47. Core user flow

The following flow must work end-to-end before considering V1 core functionality complete.

## New user

```text
Open app
 ↓
Create account
 ↓
Login
 ↓
Empty dashboard
 ↓
Add Medicine
 ↓
Enter:
  Name
  Description
  Type
  Quantity
  Unit
  Expiry
  Optional Tags
  Optional Notes
 ↓
Save
 ↓
Medicine appears in inventory
 ↓
Home dashboard updates
```

## Existing user

```text
Login
 ↓
Home
 ↓
See account alerts
 ↓
Open Medicines
 ↓
Search/filter
 ↓
Open medicine
 ↓
Edit quantity
 ↓
Alert status recalculates
```

## Shopping flow

```text
Medicine becomes low stock
 ↓
User sees alert
 ↓
Open medicine
 ↓
Add to Shopping List
 ↓
Shopping List updated
 ↓
User marks item purchased
```

---

# 48. V1 completion criteria

Do not declare V1 complete simply because the app runs.

V1 core is complete only when all of these work:

### Authentication

* [ ] Register
* [ ] Login
* [ ] Logout
* [ ] Password reset
* [ ] Persistent authentication

### Medicine

* [ ] Create
* [ ] Read
* [ ] Update
* [ ] Delete
* [ ] Quantity
* [ ] Units
* [ ] Type
* [ ] Expiry
* [ ] Description
* [ ] Tags
* [ ] Notes

### Alerts

* [ ] Low-stock detection
* [ ] Expiring-soon detection
* [ ] Expired detection
* [ ] Home alert summary
* [ ] Alert detail views

### Search

* [ ] Name search
* [ ] Description search
* [ ] Tag search
* [ ] Type filter
* [ ] Expiry filter
* [ ] Stock filter
* [ ] Combined filters

### Shopping

* [ ] Add
* [ ] Mark purchased
* [ ] Unmark
* [ ] Delete

### Security

* [ ] Firestore security rules
* [ ] User data isolation
* [ ] Authenticated access only

### Mobile

* [ ] Responsive browser UI
* [ ] Capacitor configured
* [ ] Android project generated
* [ ] App can build for Android

---

# 49. Testing requirements

Write meaningful tests for core business logic.

At minimum test:

### Low stock

Examples:

```text
20 initial, 20 current => not low
20 initial, 10 current => not low
20 initial, 4 current => low
20 initial, 0 current => low
```

### Expiry

Test:

```text
Yesterday => expired
Today => correctly handled
Within 30 days => expiring soon
More than 30 days => valid
```

Also test date/timezone edge cases.

### Search

Test:

```text
Name match
Description match
Tag match
Case-insensitive match
Partial match
No match
```

### Filters

Test combined filters.

Do not rely only on manual testing.

---

# 50. UI implementation strategy

Do not attempt to perfect visual design before functionality exists.

Implement in this order:

### Phase 1

Project setup

### Phase 2

Authentication

### Phase 3

Firestore data layer

### Phase 4

Medicine CRUD

### Phase 5

Alert calculations

### Phase 6

Search and filters

### Phase 7

Shopping list

### Phase 8

Mobile UI polish

### Phase 9

Capacitor/Android testing

### Phase 10

Security and testing pass

Do not implement future features during these phases.

---

# 51. Code quality

Write production-quality code.

Requirements:

* TypeScript strict mode
* Clear types/interfaces
* Reusable components
* Reusable utilities
* No duplicated business logic
* No giant components
* No Firebase code embedded throughout the UI
* No hard-coded user IDs
* No insecure Firestore queries
* Meaningful variable names
* Reasonable comments only where useful

Do not over-comment obvious code.

---

# 52. Important architectural rule

Business rules must live outside presentation components.

For example:

Bad:

```text
React component contains complicated expiry calculations,
Firestore queries,
validation,
and UI rendering.
```

Better:

```text
UI
 ↓
Hooks/application logic
 ↓
Services
 ↓
Business utilities
 ↓
Firebase provider
```

This makes future migration to a custom backend much easier.

---

# 53. Future compatibility

Do not implement these now, but keep the architecture compatible with:

* Household accounts
* Multiple household members
* Medicine images
* OCR
* Barcode scanning
* AI-assisted entry
* Server-side API
* PostgreSQL or another backend database
* Subscription plans
* Analytics
* Pharmacy integrations

Do not add placeholder complexity merely to support these.

Simple, clean abstractions are enough.

---

# 54. Deliverables

Build the actual application.

At the end of implementation provide:

1. Project source code.
2. Working browser development setup.
3. Firebase integration.
4. Firestore security rules.
5. Firebase configuration instructions.
6. Capacitor Android setup.
7. Android build instructions for Windows.
8. `.env.example`.
9. README with complete setup instructions.
10. Test suite for core business logic.
11. Clear explanation of the final project structure.
12. A list of anything intentionally deferred to V2.

---

# 55. How to work

Do not simply generate a large amount of code and stop.

Work iteratively.

For each major phase:

1. Inspect the existing project.
2. Make the required implementation.
3. Run/build/test it.
4. Fix errors.
5. Confirm the result before proceeding.
6. Keep the codebase runnable.

Do not break working functionality while adding new features.

When something is ambiguous, choose the simplest implementation that matches the product requirements and document the decision.

Do not ask unnecessary questions that block implementation.

---

# 56. Final product principle

The most important UX principle is:

> **Less input, more value.**

A normal user should be able to open the app, add a medicine quickly, and immediately gain useful information:

```text
What is it?
What is it used for?
How much do I have?
When does it expire?
Is it low?
Do I need to buy it?
Can I find it quickly?
```

Every feature should be evaluated against this principle.

Build V1 around this, keep the architecture clean, and make the product fully usable in a browser while remaining Android-ready from the first implementation.
