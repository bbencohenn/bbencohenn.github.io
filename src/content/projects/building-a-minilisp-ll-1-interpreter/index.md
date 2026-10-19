---
title: Building a MiniLisp LL(1) Interpreter
year: '2025'
kind: University
summary: Reading, analysing, and executing a simplified version of Lisp.
cover: pasted-image-1791949364964.webp
featured: true
order: 100
draft: false
---

For one of my university projects in Theory of Computing Science (41080), my group and I built a small but fully functional MiniLisp interpreter using an LL(1) parsing approach. It started outlooking very theoretical with parse tables, grammar rules, notation, and so on. But, by the end I had a working interpreter that could actually read and process MiniLisp code.

## Understanding the Goal

The challenge was to design and implement the three core stages of a compiler front end.

### Grammar and Parse Table

Define language rules and FIRST/FOLLOW sets.

### Lexer

Convert raw text into structured tokens

### Parser

Apply the LL(1) algorithm to validate and interpret the input

Each team member took one component. I handled the lexer, which reads plaint text and turns it into a sequence of tokens (the foundation of any parser or interpreter)

### Designing the Lexer

My lexer was written in Python and built around a generator function called `lex()`. It yields `Token` objects containing a _type, lexeme,_ and precise _position_ in the source file (line and column). The spec required full Unicode support, so it needed to recognise operators like `-` (minus), `×` (times), and `λ` (lamba) in addition to standard ASCII.

That detail was trickier than expected - not just due to regex patterns, but because different editors sometimes substitute ASCII hyphen `-` for the Unicode minus `−`. I fixed this by validating exact code points and adding tests to catch the mix-ups.

All tests were written with `pytest`, covering single tokens, identifiers, numbers, and illegal characters. After that passed, I added line/column tracking so syntax errors point to the right place. This was a small change, but it made debugging much easier later.

> [!TIP] Example expression:
> `(λ x (+ x 1))`
>
> The lexer tokenises this cleanly, and the parser validates it with the LL(1) table.

### Working as a team

We managed everything on GitHub with feature branches (`feat/lexer`, `feat/parser`, `feat/analysis`, ...). Pull requests handled review and integration. It was my first time properly using a branching workflow in a group, and it kept things organised and predictable.

By the end, everything connected cleanly: the lexer's tokens matched the grammar's terminals, and the parser processed full MiniLisp expressions without crashing. Watching the system read something like `(λ x (+ x 1))` and actually tokenise and parse it correctly was very satisfying.

### What I learned

- How LL(1) parsing tables really drive syntax validation in practice
- Why token consistency between lexer and grammar matters so much
- Designing modules for collaboration (clear APIs and contracts)
- Debugging boundary issues between components (as opposed to just inside them)

### Tech stack

| Language | Testing | Version Control | Core Modules | Concepts |
| --- | --- | --- | --- | --- |
| Python 3 | Pytest | GitHub (feature-branch workflow) | `src/lexer.py`, `src/tokens.py`, `src/parser.py`, `tests/test_lexer.py` | LL(1) parsing, Unicode tokenisation, regex matching, error tracking |

### Reflection

What I enjoyed most was the mix of structure and creativity. LL(1) rules are strict, but the implementation isn't. I like that I was able to combine formal grammar logic with hands-on coding. It gave me a solid foundation for understanding compilers - something I'll use in future subjects and projects.
