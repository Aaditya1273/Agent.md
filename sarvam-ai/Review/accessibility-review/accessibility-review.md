# accessibility-review.md

Version: 1.0.0

Target Models

- Sarvam-105B
- Sarvam-30B
- Sarvam Family
- Future Sarvam Models

---

# Purpose

This document defines the Accessibility Review methodology.

Accessibility is not a feature.

Accessibility is a fundamental engineering and design requirement that ensures digital products are usable by everyone, regardless of physical, sensory, cognitive, or situational limitations.

The objective is to verify that every product can be successfully used with assistive technologies, keyboard navigation, screen readers, and diverse interaction methods.

Accessibility improves usability for all users.

---

# Core Philosophy

Understand Users

↓

Identify Barriers

↓

Evaluate Experience

↓

Remove Obstacles

↓

Verify Accessibility

↓

Approve

Accessibility should be built into every engineering decision.

Never added afterward.

---

# Primary Objective

Every accessibility review should answer one question.

"Can every user successfully complete the primary task regardless of ability or device?"

If the answer is uncertain,

the product is not accessible.

---

# Accessibility Principles

Every interface should maximize

Perceivability

↓

Operability

↓

Understandability

↓

Robustness

↓

Inclusiveness

↓

Consistency

↓

Clarity

Accessibility should improve usability for everyone.

---

# Review Workflow

Understand User Journey

↓

Review Structure

↓

Review Navigation

↓

Review Content

↓

Review Interaction

↓

Review Assistive Technology Support

↓

Approve

---

# Stage 1 — Semantic Structure

Review

HTML hierarchy

Landmarks

Sections

Lists

Tables

Forms

Buttons

Navigation

Dialogs

Every element should communicate its meaning.

Never use generic containers where semantic elements exist.

---

# Stage 2 — Heading Hierarchy

Verify

Single H1

Logical heading order

No skipped heading levels

Clear page structure

Meaningful headings

Users should understand page organization through headings alone.

---

# Stage 3 — Keyboard Navigation

Verify

Tab navigation

Focus order

Visible focus

Skip navigation

Dialog navigation

Dropdown navigation

Menu navigation

Form navigation

Every interactive element must be usable without a mouse.

---

# Stage 4 — Focus Management

Inspect

Focus visibility

Focus restoration

Modal focus trapping

Programmatic focus

Focus indicators

No keyboard traps

Users should always know where keyboard focus exists.

---

# Stage 5 — Screen Reader Review

Review

ARIA labels

Accessible names

Roles

Descriptions

Status announcements

Error announcements

Live regions

Every important action should be understandable through screen readers.

---

# Stage 6 — Color Review

Verify

Contrast ratio

Text readability

Interactive contrast

Focus contrast

Error colors

Success colors

Color independence

Color should never be the only way information is communicated.

---

# Stage 7 — Typography Review

Inspect

Font size

Line height

Paragraph spacing

Character spacing

Zoom support

Readable typography improves accessibility.

---

# Stage 8 — Form Review

Review

Labels

Required fields

Instructions

Validation

Autocomplete

Error messages

Success feedback

Every form should guide users clearly.

---

# Stage 9 — Error Review

Verify

Clear language

Actionable guidance

Accessible announcements

Recovery path

Field association

Errors should help users recover.

Never blame users.

---

# Stage 10 — Media Review

Inspect

Images

Icons

Videos

Audio

Animations

Charts

Every meaningful image should have alternative text.

Decorative images should remain silent.

---

# Stage 11 — Motion Review

Review

Reduced motion support

Animation duration

Motion sensitivity

Parallax effects

Auto-playing content

Motion should never create discomfort.

---

# Stage 12 — Interaction Review

Verify

Button size

Touch targets

Hover alternatives

Gesture alternatives

Pointer independence

Users should never require precise motor control.

---

# Stage 13 — Responsive Accessibility

Review

Mobile accessibility

Tablet accessibility

Large displays

Zoom at 200%

Orientation changes

Text resizing

Accessibility should remain consistent across devices.

---

# Stage 14 — Cognitive Accessibility

Inspect

Simple language

Predictable navigation

Consistent layouts

Clear instructions

Progress indicators

Minimal cognitive load

Interfaces should reduce mental effort.

---

# Stage 15 — Timing Review

Review

Timeout warnings

Auto logout

Session recovery

Auto refresh

Users should control time-sensitive interactions.

---

# Stage 16 — Feedback Review

Verify

Loading states

Success messages

Progress indicators

Error feedback

Confirmation dialogs

Feedback should always be perceivable.

---

# Stage 17 — Accessibility Preferences

Support

Dark mode

High contrast

Reduced motion

Large text

Browser accessibility settings

Respect user preferences whenever possible.

---

# Stage 18 — Assistive Technology Review

Verify compatibility with

Screen readers

Keyboard navigation

Voice control

Switch devices

Magnifiers

Alternative input devices

Accessibility extends beyond visual interfaces.

---

# Stage 19 — Content Review

Review

Plain language

Abbreviations

Links

Buttons

Instructions

Consistency

Content should communicate clearly.

---

# Stage 20 — WCAG Review

Verify compliance with

Perceivable

Operable

Understandable

Robust

WCAG principles should guide implementation.

---

# Accessibility Questions

Before approval ask

Can every task be completed using only a keyboard?

↓

Can screen readers understand every important element?

↓

Can users navigate without confusion?

↓

Can users recover from mistakes?

↓

Does the interface remain usable at high zoom levels?

↓

Would this experience be inclusive for diverse users?

---

# Severity Levels

Critical

Keyboard inaccessible

Missing labels

Unreadable contrast

Broken screen reader support

Major

Poor focus management

Missing error feedback

Weak semantic structure

Medium

Small touch targets

Inconsistent headings

Minor contrast issues

Minor

Documentation

Label improvements

Content refinement

Suggestion

Future accessibility enhancements

---

# Accessibility Checklist

✓ Semantic HTML

✓ Logical heading hierarchy

✓ Keyboard accessible

✓ Visible focus indicators

✓ Screen reader compatible

✓ Sufficient color contrast

✓ Accessible forms

✓ Clear error messages

✓ Responsive accessibility

✓ Reduced motion support

✓ WCAG principles followed

✓ Inclusive user experience

---

# Anti-Patterns

Avoid

Div-only interfaces

Clickable non-buttons

Missing form labels

Placeholder-only forms

Color-only communication

Keyboard traps

Hidden focus

Tiny touch targets

Auto-playing media

Excessive animations

Complex navigation

Accessibility after implementation

---

# Definition of Done

Accessibility review is complete when

- Every primary task is fully keyboard accessible.
- Screen readers correctly identify structure and interactions.
- Color contrast meets accessibility requirements.
- Forms provide clear guidance and recovery.
- Motion respects user preferences.
- Navigation is predictable and consistent.
- Responsive layouts remain accessible across devices.
- WCAG principles are satisfied.
- The experience is inclusive for users with diverse abilities.
- Accessibility improves the overall usability of the product for everyone.

Accessible products are not designed for a small group of users.

They are designed so that every person can use them with confidence, independence, and dignity.