---
title: Teaching CTFs to teenagers without teaching them to be criminals
date: 2026-10-20
category: experience
summary: My thoughts on how to get kids excited about hacking without accidentally steering them towards criminal activity
cover: pasted-image-1792478940826.webp
cover_alt: Screenshot of the 'teacher view' for the cybersecurity platform I'm currently developing for Code4Fun
draft: false
---

I'm currently writing a cybersecurity and CTF course for high school students as part of my job at Code4Fun, due to run in 2027. The technical content was the easy part. Picking what _not_ to teach has taken far longer.

The awkward thing about security education is that the subject matter is a set of techniques for breaking into systems. There is no version of the course where students don't learn something they could misuse - pretending otherwise would be dishonest, and teenagers can often detect that instantly.

So the question I've actually been working on is narrower: where does the line sit, and what can we do to make it hold when nobody's watching?

## "Just teach defence" is a cop-out answer

The obvious safe answer is to teach only defence: firewalls, passwords, phishing awareness, don't reuse credentials, etc. It's the version of cyber education that gets approved with no argument.

It also doesn't fully work. By far, the most effective way to reason about why a password policy exists is to demonstrate a weak hash falling over in real time. Defence taught without attack becomes a list of rules to memorise, which is exactly the kind of knowledge that doesn't transfer.

CTFs work as a teaching format precisely because the student is on the attacking side. The puzzle gives them a reason to care about the mechanism. Taking that away to make the course feel safer would make it a worse course and not meaningfully safer - the material is a search away regardless.

## What's in?

The course keeps the challenge categories where the skill being built is analysis rather than access

### Cryptography

Classical ciphers, encoding versus encryption, why ECB leaks structure, etc. Students break ciphers nobody has used in forty years and learn what "broken" means.

### Forensics and steganography

Pulling data out of files, reading metadata, carving an image out of a packet capture. This is the category that turns on students who thought security was all terminals.

### Web

Inspecting requests, tampering with client-side validation, reading source. Everything against a container the course admins can control.

### Reverse engineering

Reading a small binary or script to work out what it checks. Closer to a logic puzzle than to anything else in the course.

### OSINT (narrowly)

Finding information in public records and archives - about companies, historical events, or targets I've invented. Never about a real person.

What these share is that the thinking transfers and the technique doesn't travel well. Nothing a student learns in the crypto set gives them a usable capability against a system they don't own.

## What's out, and the test that decides it

The test I settled on:

> Does the student leave the room with a capability, or with an understanding?

A capability is something they could point at a system tonight. An understanding is something that they could explain to you tomorrow. Plenty of material gives both, and that's fine. The cut is for material that gives the first and little-to-none of the second.

| Out | Why |
| --- | --- |
| Running exploit frameworks against live hosts | Pure capability. The student learns a menu, not a mechanism |
| Scanning or enumerating networks they don't own | The skill is trivial, the legal exposure is not |
| Password cracking against real leaked dumps | Those are real people's credentials. Synthetic hashes teach the same thing |
| Social engineering practiced on classmates or staff | Trains a habit of manipulating people. Kind of self explanatory |
| Malware authoring, even "harmless" samples | There's no version of this that can honestly and effectively be supervised |
| OSINT on real individuals | The technique is the harm. There is no safe practice target |

The social engineering one is where I expect pushback, because it's the attack that actually works and the course arguably has a gap without it. I'm covering it as analysis - "here is a phishing email, what makes it land?" - rather than as an exercise students run on each other.

## The sandbox does most of the ethical work

A lecture about ethics at the start of the course will probably be forgotten by week 3. They're confined to the environment for classes though.

Every challenge runs against infrastructure built specifically for the course. Students get a target that is unambiguously theirs to attack, which means the question "am I allowed to do this?" has an obvious answer every single time. The boundary is a property of the setup, not a rule they have to remember.

This also sets up a habit I really want the students to pick up: before you touch a system, you establish that you have permission. In the course, that's trivially true, so it looks like a formality. In a job it's the entire difference between a penetration test and a legal offence - by then it should be muscle memory.

The corollary is that I have to be strict about scope creep. A student who finds the school's actual login page more interesting than my fake one is behaving like a security researcher - it's a good sign, but it still has to be stopped before something goes wrong!

## How I talk about the law

Not with a long rambling list of penalties. Threats aimed at teenagers get discounted roughly in proportion to how severe they sound.

Instead, the framing I'm using is that Australian computer crime law mostly turns on one word: **authorisation**. Unauthorised access, unauthorised modification, unauthorised impairment. The technical act in each case is something the students will do in my classroom. What makes it an offence is whose system it is and whether they said yes - it's very important that they understand and remember this!

That framing does something a long list of penalties doesn't do. It quite directly teaches them that the skill itself isn't illegal, which is true, and which they may already suspect. It puts the whole weight on a question they can answer before they act. And it maps directly onto the job, where the authorisation is a signed scope document and everything outside it is still a crime.

I also plan to be concrete about consequences without being lurid. Not necessarily blasting warnings about prison sentences - rather information about what a criminal record at 17 would do to one's future, and a security industry that runs background checks on everyone it hires. The realistic cost of getting this wrong is losing access to the career the course is advertising.

## What I'm still unsure about

I haven't taught this yet, so everything above is a plan rather than a finding.

The thing I keep going back and forth on is the hypothetical student who is already ahead. Some of them will arrive having done far more than the syllabus, sometimes on systems they shouldn't have touched. The course needs somewhere for that student to go, and I don't yet know whether that's harder challenges, a mentoring role, or a conversation.

I'm also unsure how much the sandbox argument survives contact with a real classroom. It assumes curiosity stays inside the box because the box is interesting enough. That's an empirical claim about fifteen-year-olds, and I'll find out next year whether it holds true.

If you've taught something like this before, I'd be very interested to hear where your line ended up!
