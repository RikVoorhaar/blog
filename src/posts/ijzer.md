---
layout: posts
title: "Introducing the IJ programming language"
date: "2025-01-20"
categories: coding
excerpt: "I made an array programming language as a language extension to Rust"
teaser: "ijzer.svg"
---

Though I have never really used any, I've always been fascinated by the concept of array programming languages like APL, BQN and J. 
What I don't like about those languages is that they are meant as standalone languages, not really integrating well into existing projects. Some problems are beatifuly solved by array programming languages, but many things are not.

I had the idea that using proc macros it should be possible to make an array programming language as an _extension_ of the Rust progrmaming language. This way you can write the bulk of your code in Rust, but write specific parts of it in a different language more suitable for manipulating arrays and tensors. 

The result is the IJ language together with the compiler (more of a transpiler really) called `IJzer`. You can check out the result [on my github page](https://github.com/RikVoorhaar/IJ). The word 'ijzer' means iron in Dutch, and 'IJ' is technically a single letter in the Dutch language. It is thus both a pun on Rust, and falls in line with the tradition of calling programming languages by a single letter. 

## Designing the language

I set myself the following requirements for my progrmaming language
- Only ASCII characters. Many array programming languages use exotic characters which are hard to type in ordinary settings. I wanted to avoid that. The reasons that those languages use exotic characters is mainly for brevity. If all operators are a single character you also don't need to separate them by spaces. 
- Infix notation. (e.g. `+ 1 2` as opposed to the more common `1+2`.) I have never made a parser before, and sticking to infix notation is both simple, and removes the needs for brackets. 
- Transpile to rust code using macros, so that it is a language extension of rust. 
- Tensors as primary object. Some array progrmaming languages focus on litss, and matrices are just lists of lists. I personally like the approach of `numpy` where everything is either a tensor or a scalar. I want a language designed for numerical linear algebra, rather than general purpose programming. 
- While it's meant as a proof of concept, the language should be versatile enough to implemnet simple algorithms. In particular the MVP should be able to implement a randomized SVD.
- Speed doesn't matter (much). The language is meant as a proof of concept, and optimizations add time and complexity. 

Before this project I never had any experience designing a programming language, or implementing a parser or compiler. Most of the technical decisions I made when implementing the language were completely ad hoc. It basically comes down to reinventing the wheel, and I needed frequent redesigns and major refactoring because I didn't know what I was doing. In hindsight, reading a book would have saved a ton of time. I never intended for this project to take as much time as it did, but perhaps it was naive to assume implementing a programming language would be a quick job. 