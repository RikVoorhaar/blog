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

