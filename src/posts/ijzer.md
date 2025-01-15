---
layout: posts
title: 'Introducing the IJ Programming Language'
date: '2025-01-15'
categories: coding
excerpt: 'I made an array programming language as a language extension to Rust'
teaser: 'ijzer.svg'
---

![IJ logo](/blog/ijzer/ijzer.svg)

Though I have never really used any, I've always been fascinated by the concept of array programming languages like APL, BQN, and J.  
What I don't like about those languages is that they are meant to be standalone languages, not really integrating well into existing projects. Some problems are beautifully solved by array programming languages, but many things are not.

I had the idea that using proc macros, it should be possible to make an array programming language as an _extension_ of the Rust programming language. This way, you can write the bulk of your code in Rust but write specific parts of it in a different language more suitable for manipulating arrays and tensors.

The result is the IJ language together with the compiler (more of a transpiler really) called `IJzer`. You can check out the result [on my GitHub page](https://github.com/RikVoorhaar/IJ). The word 'ijzer' means iron in Dutch, and 'IJ' is technically a single letter in the Dutch language. It is thus both a pun on Rust and falls in line with the tradition of calling programming languages by a single letter.

## Designing the Language

I set myself the following requirements for my programming language:

- **Only ASCII characters:** Many array programming languages use exotic characters which are hard to type in ordinary settings. I wanted to avoid that. The reason those languages use exotic characters is mainly for brevity. If all operators are a single character, you also don't need to separate them by spaces.
- **Infix notation:** (e.g., `+ 1 2` as opposed to the more common `1 + 2`). I have never made a parser before, and sticking to infix notation is both simple and removes the need for brackets.
- **Transpile to Rust code using macros:** So that it is a language extension of Rust.
- **Tensors as primary object:** Some array programming languages focus on lists, and matrices are just lists of lists. I personally like the approach of `numpy` where everything is either a tensor or a scalar. I want a language designed for numerical linear algebra, rather than general-purpose programming.
- **Versatility for simple algorithms:** While it's meant as a proof of concept, the language should be versatile enough to implement simple algorithms. In particular, the MVP should be able to implement a randomized SVD.
- **Speed doesn't matter (much):** The language is meant as a proof of concept, and optimizations add time and complexity.

Before this project, I never had any experience designing a programming language or implementing a parser or compiler. Most of the technical decisions I made when implementing the language were completely ad hoc. It basically comes down to reinventing the wheel, and I needed frequent redesigns and major refactoring because I didn't know what I was doing. In hindsight, reading a book would have saved a ton of time. I never intended for this project to take as much time as it did, but perhaps it was naive to assume implementing a programming language would be a quick job.

## A Tour of the Language

For more details, see [the documentation](https://docs.rs/crate/ijzer/latest).

The main object of the language is a tensor, which can be created and manipulated in various ways:

```
a = [[1,2],[3,4]] // Manual construction
b = eye [2,2] // 2x2 identity matrix

c = + a b // Addition
d = randn %c // Create a random normal matrix with the same shape as c
e = ?/+* c d // Matrix multiplication
f: T<usize> = %e // Create a tensor with usize entries containing the shape of e
```

As mentioned before, all operations are infix, omitting the need for brackets. Nevertheless, brackets are allowed wherever they make sense. For example, `+ (1,2)` and `+ 1 2` are equivalent.

The language also has a notion of scalars such as `1` as opposed to a tensor `[1]`. Most operations can mix and match tensors and scalars:

```
+ 1 [2] // Creates a tensor [3]
* 2 3 // Creates a scalar 6
```

`ij` has a type system with `T` (tensor) and `N` (scalar/number) as primitive types. Types can be grouped (e.g., `(T, T)` for a tuple of two tensors), and there are functions (e.g., `Fn(T, N -> N)` for a function that takes a tensor and scalar as input and outputs a scalar). Most expressions can be optionally type annotated (it is only required to avoid ambiguity). Primitive types can be given additional number type annotations, e.g., `N<f64>` or `T<usize>`.

An important feature is the reduction operator `/`, which has the signature `Fn(N, N -> N), T -> N`. For example, `/+ a` reduces the addition operator to a summation operator and thus computes the sum of `a`.

The shape of the result of an operation is determined using shape broadcasting [just like in NumPy](https://numpy.org/doc/stable/user/basics.broadcasting.html). For example,

```
a = randn [1, 6]
b = randn [3, 1]
c = * a b  // Has shape [3, 6]
```

Broadcasting is a very powerful heuristic to allow applying operations to tensors of different shapes and getting intuitive results.

### How to Use `ij`

The `ij` parser can be invoked using the `ijzer` macro, which will parse the `ij` code and translate it into `Rust` code. For example:

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

Note that `ij` can use variables defined outside its local scope, and that `ij` functions can be used as ordinary `Rust` functions. It is thus an _extension_ of `Rust`.

> **Note:** The `ij` code has to be put in a raw string block for technical reasons. Perhaps there is a way around it that I am not aware of.

### Randomized SVD Example

As a less trivial example, let's implement a randomized low-rank decomposition using the generalized Nyström algorithm. I wrote about this algorithm [in the blog post about my PhD thesis](/blog/thesis/#randomized-linear-algebra). We need to translate the following `Python` function to `ij`:

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
R = \ YtAX AX  // The \ operator solves linear systems
(L, R)  // Implicit return
```

In addition, `ij` also supports the `qr`, `svd`, and `lu` matrix decompositions, which are common operators used in numerical linear algebra.

### Things I Would Add Given More Time

There are quite a few features missing from the `ij` language to make it really useful, even within the limited scope of numerical linear algebra code. I'm realistically not going to do any of these things because this project is really meant as a proof of concept.

#### Control Flow

Binary operations such as `||` (or) and `&&` (and) exist, and you can do stuff like `/&& == A B` to check if two arrays are the same.

> `== A B` is an array with ones and zeros with one if the two corresponding entries of A and B are the same. `/&&` is the reduction operator applied to logical `AND`, which is `1` if and only if the tensor only consists of `1`s.

However, it is difficult to have different logic depending on the outcome of a logic operator (i.e., an `if` statement). There are also no loops, although you can, of course, apply a function to a range `f [0..5]` for a similar result, but this is again not super user-friendly.

#### Optimizations

The `Rust` code generated by `ijzer` is not optimized. Certain optimizations are, however, not very hard to implement. For example, all tensors are copied on basically any operation, but a 'copy on write' scheme could eliminate most unnecessary copies. In addition, the syntax tree can be evaluated to determine when it is safe to override the contents of an array and when it must be copied.

Other optimizations involve using optimized versions for common patterns. For instance, `?/+*` is the matrix multiplication operator, but the generated Rust code is very generic and inefficient. The transpiler should recognize the common pattern and default to more optimized Rust code instead.

#### Other Numerical Backends

Some numerical operations like matrix solving and computing matrix decompositions are too complex to implement yourself efficiently. I have opted to use the `ndarray` and `ndarray_linalg` crates for these operations. This uses `OpenBLAS`, which either requires dynamically linking to a system library or compiling from source, both of which are inconvenient.

It would be nice to have the option to use `faers` instead (or as an alternative using feature flags), which is a Rust numerical linear algebra library that boosts better performance than OpenBLAS and has much faster compilation speeds.

In addition, the usage of `ij` is restricted to the custom `ijzer::Tensor` object. This can be converted to tensor objects of other libraries, but native support for array objects of e.g., `faers`, `ndarray`, and `nalgebra` could make adoption into other projects much easier.

#### Blocks

The `ij` language has implicit returns, so it would be cool to do something like:

```
x = {
    y = randn [2,3]
    z = randn [3,2]
    ?/+* y z
}
f($x: T) = {
    y = * $x $x
    -y
}
```

At the moment, this is not possible, and all statements have to be a single line. Implementing this feature would require major refactoring since the compiler and parser only parse one line at a time. The only context that is stored between lines is a table of defined symbols.

#### Quality of Generated Code

The `Rust` code generated by `ijzer` uses `.unwrap` _everywhere_. This is bad practice, and proper handling of results is much better. This is purely done out of laziness, and moving away from that would be much better.

The `ijzer` macro just panics whenever it encounters an error. There is a basic system that tells you what and where the error is, but it's not a user-friendly experience to debug. Rust has a notion of `spans` that can tell the compiler where errors occur in a macro, and this could be used to improve the developer experience. Furthermore, the error system of `ijzer` can be improved to give clearer errors.

The generated code is also not very human-readable, but that's fairly normal when transpiling code from one language into another. Still, some effort can be made to make it easier for humans to debug.

## Technical Aspects

Let's now dive a bit deeper into how my implementation of the `ij` language works.

### The `ijzer::Tensor` Object

The primitive types of `ij` are tensors and scalars. As you can imagine with a programming language like this, the implementation of the tensor type is pretty important. I opted to go for my own type as opposed to ones existing in other libraries for flexibility. The tensor type is a simple struct defined like this:

```rust
pub struct Tensor<T: TensorElement> {
    data: Box<[T]>,
    shape: Vec<usize>,
    strides: Vec<usize>,
}
```

The `Box<[T]>` is just a pointer to the heap with an array of elements of type `T`, which are restricted to be `TensorElement` (which is just any numerical type that can be cloned and supports partial ordering). The struct, in addition to the `data`, stores a shape (the shape of the tensor) as a vector of `usize` elements, and the `strides` as a `Vec<usize>`. The strides tell you if you increment one axis, how much you should increment the index into the `data` array. This is necessary to translate usual multi-indexes into an index into the `data` array. For example, if you have a `(4, 6)` matrix, then it has strides `(6,1)`. If we want to access entry `[2,3]` of the matrix, then we need to access `data[2*6 + 3*1] = data[15]`.

Usually, you would create a `Tensor` using one of the creation operators, such as `Tensor::from_vec`, `Tensor::randn`, or `Tensor::zeros`:

```rust
let input = vec![
    1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0,
];
let tensor1 = Tensor::from_vec(input.clone(), Some(vec![4, 3]));
let tensor2 = Tensor::randn(&[2, 3]);
let tensor3 = Tensor::zeros(&[4, 5, 2]);
```

To manipulate tensors, you can then use, for example, `Tensor::map`, which takes a function `T -> T` and applies it to all elements, or `Tensor::apply_binary_op`, which takes a function `T, T -> T` and another `Tensor<T>` and applies the operation to the two tensors (with shape broadcasting). For example:

```rust
let tensor1 = Tensor::<f64>::randn(&[2, 3]);
let tensor2 = tensor1.map(|x| x * x); // Squares all the elements
let tensor3 = Tensor::<f64>::ones(&[1, 3]);
let tensor4 = tensor2.apply_binary_op(&tensor3, |x, y| x + y)?; // Adds tensor2 and tensor3
```

It might make sense to also define an operation like `tensor2 + tensor3` directly. The reason I didn't do that is it is more convenient to use these more generic functions when generating code with `ijzer`.

### How the Parser Works

The code transpilation of `ij` to `Rust` done by `ijzer` consists of three main steps:

- **Tokenization:** Turn a string into a sequence of tokens.
- **Parsing:** Turn a sequence of tokens into an abstract syntax tree.
- **Compilation:** Turn the abstract syntax tree into Rust code.

The tokenization is done using the `logos` crate, which makes it trivially easy to turn a string into a sequence of tokens.

These three steps are then all called from the `ijzer` macro, which has a relatively simple definition:

```rust
#[proc_macro_attribute]
pub fn ijzer(_attr: TokenStream, item: TokenStream) -> TokenStream {
    let input_fn = parse_macro_input!(item as ItemFn);
    let sig = &input_fn.sig;

    let body = &input_fn.block;

    let quoted_body = quote! {#body}.to_string();
    let body_tokens_regex = Regex::new(r#"(?s)\"(.*?)\""#).unwrap();
    let mut ijzer_code = String::new();
    for cap in body_tokens_regex.captures_iter(&quoted_body) {
        if let Some(matched) = cap.get(1) {
            ijzer_code.push_str(matched.as_str());
        }
    }

    let compiled_ijzer = match compile(ijzer_code.as_str()) {
        Ok(code) => code,
        Err(e) => {
            let error_message = e.to_string();
            return TokenStream::from(quote! { compile_error!(#error_message); });
        }
    };

    let new_body = quote! {
        {
            #compiled_ijzer
        }
    };

    // Generate the new function item
    let output = quote! {
        #sig
        #new_body
    };

    TokenStream::from(output)
}
```

It takes a function like this:

```rust
fn <signature> {
    r"#
    <body>
    "#
}
```

It then interprets `<body>` as `ij` code and compiles it to `Rust` code using the `compile` method, and leaves the `signature` the same as before. Since the body of a Rust macro like this needs to consist of only valid Rust tokens, and not all `ij` tokens are valid Rust tokens, it is necessary to encapsulate all `ij` code in a raw string.

### Parser

I have no formal education in programming languages. As a result, I wrote the parser in an incremental fashion, starting with something really simple and making it progressively more complex as new language features demanded it. To keep things simple, I still adhered to a structure:

- The parser consumes a sequence of tokens and outputs a `Node` object (which can have other nodes as operands/children).
- The parser decides how to parse the sequence of tokens purely based on the first token.
- The parser only looks ahead.

The `Node` object has the following definition:

```rust
pub struct Node {
    pub op: Operation,
    pub operands: Vec<Rc<Node>>,
    pub output_type: IJType,
    pub input_types: Vec<IJType>,
    pub id: usize,
}
```

It specifies the input and output signature, the operation (e.g., `Multiplication`, `Addition`, etc.), and the child nodes (operands). Finally, a unique `id`.

The parser works in a recursive fashion, starting with the entire token slice and progressively producing `Node` objects from smaller and smaller slices of tokens. For example, if we parse `+ (* x 1) y`, we start with `+`. It wants to create a `Node` with an `Addition` operation, and it wants to have two nodes as operands. Next, we parse `(`, which produces a `Node` based on the tokens before the next matching `)`, in other words, we parse `* x 1` next. Here, `*` produces a node with a `Multiplication` operation, consuming two nodes as operands. These two operands are `x` (`Symbol("x")` operation) and `1` (`Scalar(1)` operation), which are both leaf nodes. Thus, the first operand of `+` is `Multiplication<Symbol("x"), Scalar(1)>`, and the second operand is `Symbol("y")`. The final result is thus `Addition<Multiplication<Symbol("x"), Scalar(1)>, Symbol("y")>`.

This works well in simple cases, but sometimes behavior is more complicated. For example, `-` tries to consume either one operand (resulting in `Negation`) or two operands (resulting in `Subtraction`). In addition, simple binary and unary operations need to work on a mix of tensors and scalars.

Most tokens can also be interpreted as functions. For example, `/+ x` is parsed as follows. The `/` is the reduction operator, and it wants to consume a `Fn(N, N -> N)` and a `T` node. Thus, it tries to first parse `+ x` as a `Fn(N, N -> N)` function and extracts the node `+` with operation `Addition`, no operands, and `output_type = Fn(N, N -> N)`. It then parses `x` as a `Symbol("x")` operation with `output_type = T`.

Once I settled on this design pattern for the parser, it became pretty simple to extend the language. It took me quite a bit of time to arrive at this pattern, however. Some quick research suggests this design is a recursive descent parser based on an `LL(1)` grammar, so I probably did nothing but reinvent the wheel here.

### Compilation

The compiler takes a `Node` object together with some context and outputs a Rust `TokenStream`. For example, `Addition<Symbol("x"), Tensor<[1, 2]>>` will output something along the lines of:

```rust
quote! {
    #childstream1.apply_binary_op(#childstream2, |_a, _b| _a + _b)
}
```

Where `childstream1` and `childstream2` are the results of compiling the `Symbol("x")` and `Scalar(1)` nodes, respectively. This is done in a depth-first fashion; first, all leaves of the AST are put in a queue. Any node is then added to the queue if all its operands have been compiled as well. I have no idea why I did it this way instead of doing it recursively, but in theory, this approach is easier to parallelize.

When compiling a node, different behaviors are taken depending on the input and output types of the node. For example, if an addition node has the output type `Fn(N, N -> N)`, then it just outputs `quote! {|_a, _b| _a + _b}`. Then, there is different behavior still if it operates on a tensor + scalar, scalar + scalar, or if it is meant to output a `Fn(T, T -> T)`, for example.

The compiler step is tested with extensive unit tests comparing generated code to hand-crafted expected results. This was a rather annoying step in practice, especially when I kept changing the code. I also made plenty of unit tests testing the output of the parsers and the behavior of the generated code.

## Final Thoughts

Designing and implementing your own language is fun, and I would recommend it as a project. I am still very happy with the concept of an array programming language extension to `Rust`. I think something like this, but better, could be very useful for the adoption of `Rust` into the academic community. It allows implementing numerical code without having to worry about all the intricacies of `Rust` (which has a much steeper learning curve than Python, R, Matlab, or Julia). In general, the concept of embedding a specialized scripting language inside another language is quite powerful. Specific application domains (like numerical coding) have different needs from general-purpose programming languages and can benefit from specialized languages. The problems with specialized languages, however, are that they are difficult to integrate into larger projects and can also be slower in practice. The approach of `ij`, in theory, offers the best of both worlds.

An important design consideration of `ij` was that it should be easy to implement. But in truth, the implementation is more complex than it has to be. I think restricting to a simple grammar and infix notation helps in theory but makes it more difficult to implement more complex language features. A more complex grammar wouldn't necessarily make for a much more complex implementation of the parser. As mentioned before, it really would have saved time if I had first studied compiler design and programming language design.

Overall, the language of `ij` isn't done, but it's ready as a proof of concept which I can proudly present to the world.
