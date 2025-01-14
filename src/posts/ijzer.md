---
layout: posts
title: 'Introducing the IJ programming language'
date: '2025-01-20'
categories: coding
excerpt: 'I made an array programming language as a language extension to Rust'
teaser: 'ijzer.svg'
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

## A tour of the language

For more detail see [the documentation](https://docs.rs/crate/ijzer/latest).

The main object of the language is a tensor, which can be created and manipulated in various ways:

```
a = [[1,2],[3,4]] // Manual construction
b = eye [2,2] // 2x2 identity matrix

c = + a b // Addition
d = randn %c // Create a random normal matrix with same shape as c
e = ?/+* c d // Matrix multiplication
f: T<usize> = %e // Create a tensor with usize entries containing the shape of e
```

As mentioned before, all operations are infix, ommiting the need for brackets. Nevertheless brackets are allowed wherever they make sense. For example `+ (1,2)` and `+ 1 2` are equivalent.

The language also has a notion of scalars such as `1` as opposed to a tensor `[1]`. Most operations can mix-and-match tensors and scalars:

```
+ 1 [2] // Creates a tensor [3]
* 2 3 // Creates a scalar 6
```

`ij` has a type system with `T` (tensor) and `N` (scalar/number) as primitive types. Types can be grouped (e.g. `(T,T)` for a tuple of two tensors), and there are functions (e.g. `Fn(T,N -> N)` for a function that takes a tensor and scalar as input and outputs a scalar). Most expressions can be optionally type annotated (it is only required to avoid ambiguity). Primitive types can be given additional number type annotation, e.g. `N<f64>` or `T<usize>`.

An important feature is the reduction operator `/` which has signature `Fn(N,N->N), T -> N`. For example `/+ a` reduces the addition operator to a summation operator, and thus computes the sum of `a`.

The shape of the result of an operation is determined using shape broadcasting [just like in NumPy](https://numpy.org/doc/stable/user/basics.broadcasting.html). For example,
```
a = randn [1, 6]
b = randn [3, 1]
c = * a b  // Has shape [3, 6]
```

Broadcasting is a very powerful heuristic to allow applying operations to tensors of different shapes and get intuitive results out.


### How to use `ij`

The `ij` parser can be invoked using the `ijzer` macro, which will parse the `ij` code and translate it into `rust` code. For example:

```rust
use ijzer::prelude::*;
use ijzer::Tensor;

fn square(x: f64) -> f64 {
    x * x
}

#[ijzer]
fn example(x: f64) -> f64 {
    r"#
    var x: N<f64>
    var square: Fn(N<f64> -> N<f64>)
    square(x)
    "#
}

let x = 2.0f64;
println!("{:?}", example(x)); // Returns 4.0
```

Note that `ij` can use variables defined outside its local scope, and that `ij` functions can be used as ordinary `rust` functions. It is this an _extension_ of `rust`.

> Note: The `ij` code has to be put in a raw string block for technical reasons, perhaps there is a way around it that I am not aware of.

### Randomized SVD example

As a less trivial example lets implement a randomized low rank decompositoin using the generalized Nyström algorithm. I wrote about this algorithm [in the blog post about my PhD thesis](/blog/thesis/#randomized-linear-algebra). We need to translate the following `python` function to `ij`:

```python
def generalized_nystrom(A, rank_left, rank_right):
    m, n = A.shape
    X = np.random.normal(size=(n, rank_right))
    Y = np.random.normal(size=(m, rank_left))
    AX = A @ X
    YtA = Y.T @ A
    YtAX = Y.T @ AX
    L = YtA
    R = np.linalg.solve(YtAX, AX, rcond=None)
    return L, R
```

Which in `ij` looks like:

```
var A: T<f64>
var rank_left: usize
var rank_right: usize
m = <|%A[0]  // Extract first entry of %A (shape of A)
n = <|%A[1]  // Extract second entry of %A
X = randn [n, rank_right]
Y = randn [m, rank_left]
AX = ?/+* A X  // Compute matrix product
YtA = ?/+* |Y A  // |Y is Y transposed
YtAX = ?/+* |Y AX
L = YtA
R = \ YtAX AX  // the \ operator solves linear systems
(L, R)  // Implicit return
```

In addition `ij` also supports the `qr`, `svd` and `lu` matrix decompositions, which are common operators used in numerical linear algebra.

### Things I would add given more time

There are quite a few features missing from the `ij` language to make it really useful, even within the limited scope of numerical linear algebra code. I'm realistically not going to do any of these things, because this project is really meant as a proof of concept.

#### Control flow

Binary operations such as `||` (or) `&&` (and) exist and you can do stuff like `/&& == A B` to check if two arrays are the same.

> `== A B` is an array with ones and zeros with one if the two corresponding entries of A and B are the same. `/&&` is the reduction operator applied to logical `AND`, which is `1` if and only if the tensor only consists of `1`s.

However, it is difficult to have different logic depending on the outcome of a logic operator (i.e. an `if` statement). There are also no loops, although you can of course apply a function to a range `f [0..5]` for similar result, but this is again not super user friendly.

#### Optimizations

The `rust` code generated by `ijzer` is not optimized. Certain optimizations are however not very hard to do. For example, all tensors are copied on basically any operation. But a 'copy on write' scheme could eliminate most unecessary copies. In addition, the syntax tree can be evaluated to determine when it is safe to overide the contents of an array and when it must be copied.

Other optimizations involve using optimized versions for common patterns. For instance, `?/+*` is the matrix multiplication operator, but the generated rust code is very generic and inefficient. The transpiler should recognize the common pattern and default to more optimized rust code instead.

#### Other numerical backends

#### Quality of generated code

## Thoughts on a future language

## Technical aspects

### The `ijzer::Tensor` object

### Technical design of macro

### How the parser works

### How the compiler works

## Concluding remarks
