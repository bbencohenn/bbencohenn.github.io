---
title: Reflection - C++'s Decade-Defining Rocket Engine
date: 2025-11-25
category: experience
summary: Herb Sutter in Sydney, at a Citadel Securities Event.
cover: pasted-image-1791695205286.webp
draft: false
---

On the 23rd of November I had the opportunity to attend an invite-only Citadel Securities event at the Museum of Contemporary Art in Sydney, where [Herb Sutter](https://en.wikipedia.org/wiki/Herb_Sutter) delivered his talk "_Reflection - C++'s Decade-Defining Rocket Engine"_.

Set in the Quayside Room overlooking the Opera House, the evening combined food, drinks, and networking with a deep dive into one of the most important and upcoming chapters in C++'s evolution.

For a language as mature and foundational as C++, it's rare to witness a feature that genuinely feels like such a major turning point. But Herb made it very clear: compile-time reflection in C++26 is exactly that.

# A High-Velocity Tour Through C++26

Herb framed reflection as a full-on structural shift in how the language understands itself. In his words, C++ has finally "handed us the keys to its own machinery". For the first time, the language can describe itself, generate more of itself, and open the door to metaclasses, safer abstractions, tooling breakthroughs, etc.

And most importantly, all of this happens **AT COMPILE TME!** Because of this, it keeps C++'s zero-overhead philosophy intact.

Herb didn't focus on any single technique. Instead, the talk was intentionally fast-paced, a "high-velocity tour" through dozens of examples. The talk carried this vibe of making the audience think "Wait, we can do that now?? That's so useful!!" every 5 minutes.

## What stood out?

### Reflection makes C++ more expressive:

Libraries will suddenly be able to operate with a structural understanding of your types without macros or messing with templates. Things like serialisation, schema generation, binding layers, and compile-time validation become drastically simpler and safer.

### It democratises language power:

For decades, only compilers could generate C++ code. Reflection shifts some of that power to library authors. This is exactly the kind of feature that accelerates innovation in large systems, including low-latency environments where C++ dominates.

### It supercharges tooling:

Reflection feeds IDEs, analysers, and debuggers with structured data straight from the language. Better insights, stronger guarantees, fewer mysterious template instantiations.

## Herb's broader vision on modern systems:

One of the deeper themes in Herb's talk (especially relevant in a room full of engineers working on real-time high-assurance systems) was his vision for the future of global infrastructure. He argued that a shocking amount of the world still runs of languages designed for past eras: ancient C codebases patched across decades, proprietary specialised languages no longer actively evolved, and toolchains that simply can't express the abstractions modern systems require. Reflection, in Herb's view, is a _strategic_ unlock that allows C++ to finally absorb and replace whole categories of niche or outdated languages. Why? Because with reflection and metaclasses, C++ can define its own higher-level dialects inside the language itself, without sacrificing performance or safety. Instead of inventing a new domain-specific language for every subsystem, you can express that domain natively in modern C++. Basically, he wants to use C++ as the foundational language for the next generation of high-performance and high-assurance systems, and let reflection power the abstractions those systems need.

## Why is Citadel Securities involved?

Citadel works in a world where nanoseconds matter and correctness is non-negotiable. Reflection strengthens all of this. It promises abstractions that stay zero-cost, tooling that understands intent instead of syntax, and systems that can be verified more deeply at compile time. It was clear why a research and engineering-driven firm would host this discussion.

## The Atmosphere

The setting itself added to the experience: a warm evening at Circular Quay, a room full of engineers and students, and conversations that naturally drifted between low-latency system design, language evolution, and compiler internals. It felt like a glimpse into where C++ is heading and who is steering it.

## Final Thoughts

Walking out of the museum that night, my impression wasn't just that C++ is getting new features, but rather that it's entering an entire new era - one where the language becomes more self-aware, and more empowering for developers building the systems that our world runs on.
