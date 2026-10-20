---
title: Teaching CTFs to teenagers without teaching them to be criminals
date: 2026-10-20
category: experience
summary: My thoughts on how to get kids excited about hacking without accidentally steering them towards criminal activity
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

>[!FAQ] The test I settled on:

> Does the student leave the room with a capability, or with an understanding?

A capability
