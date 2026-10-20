---
title: Something Smells Phishy
year: '2026'
kind: Research
summary: A literature review on detecting LLM-generated phishing, and why the field's apparent attack-vs-defence disagreement is mostly an artefact of how detectors get tested.
featured: true
order: 97
draft: false
---

Humans are no good at this anymore. In one 2026 study, people shown spear-phishing SMS messages correctly guessed whether GPT-4 or a human wrote them 52% of the time - statistically indistinguishable from flipping a coin. So the question moves to machines: can a classifier tell, and does it keep working once the attacker tries to slip past it?

I spent this semester reading the literature on that for my research preparation subject, and the first thing I noticed was that it looked like a straight fight. Defence-side papers report 96-98% accuracy and sound basically solved. Attack-side papers rewrite the same kind of content with an LLM and the accuracy drops sharply - one study knocked up to 30.96 percentage points off voice-phishing classifiers that had been sitting at 95-99%. Both sets of numbers are real, they just aren't answering the same question.

## The actual split is methodological

Once I built a table of every study's evaluation conditions - what the detector was trained on, whether adaptive content was in the training set, whether adaptation was tested at all - the disagreement mostly dissolved.

Defence studies tent to train a model on a distribution and then test it on that same distribution. Attack studies take a fixed detector and change the distribution underneath it. Of course the second group gets worse numbers! They're measuring something harder!

The clearest demonstration is a 2027 paper where models trained on 200,000-ish traditional phishing emails managed only 51-59% accuracy against synthetic phishing - barely batter than guessing - but specialised training on synthetic examples pushed them back to roughly 98%. That's a serious distribution problem - the signal is there, but the model never saw this kind of attack during training.

The most interesting paper I found deliberately broke the convenient step: Arharbi and El Qadi held their adaptive corpus out of training entirely, then let an attacker iteratively query the detector and rewrite based on the feedback. Their DistilBERT still held 91.9% recall. Down from 95.6%, but nowhere near collapse. So adaptation doesn't automatically win either.

## Where it actually falls over

The gap I ended up arguing for is that almost every paper runs the loop exactly once: train, attack, retrain, publish. Nobody runs a around 2, where the attacker swaps models and prompting strategies again and the defender has to catch up again.

That matters because the two sides aren't paying the same price. Retraining means obtaining representative samples of a new attack distribution, labelling enough of them, updating the model, and shipping it. Generating the attacks costs, by one paper's measurement, about US$0.007 and 9 seconds each.

So the honest position is somewhere in the middle of both arguments: LLM-generated phishing is more detectable than the alarming headlines suggest, but that robustness is conditional on your training data resembling what's actually coming at you - and nobody has shown it survives repeated rounds. A detector that performs well on last year's attacks is arguably worse than no detector, because it comes with confidence attached.

## What's next

This was a literature-based report, not an implementation. So there was no code, no classifier of my own yet. What I'd want to build is the longitudinal version: multiple sequential attacker-defender rounds with new attack samples held out by time rather than randomly, measuring not just accuracy but recall, false positives, how long adaptation takes, and how much new labelled data each round needs.
