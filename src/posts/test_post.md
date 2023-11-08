---
title: Test post
excerpt: This post is to test stuff.
date: '2023-10-23'
categories:
  - test
published: true
---

<script>
    import Test from "$lib/components/Test.svelte"
</script>

<Test>
Indeed!
</Test>

# header 1

## header 2

### Header 3

#### Header 4

This is markdown text. _italic_ **bold** ~~strikeout~~

> This is a block quote

    this is indented by 4 spaces

This is `inline_code` in a sentence

Here [is a link to something](rikvoorhaar.com) useful.

This is inline math: $f(x):=\int_0^x\! g(t)\,\mathrm{d}t$, and this is display math:

$$
    \sum_{n=0}^\infty n = -\frac{1}{12}
$$

This is a really long equation in display math

$$
    a=b=c=d=e=f=g=h=i=j=k=l=m=n=o=p=q=r=s=t=u=v=w=x=y=z
$$

and the same in inline: $a=b=c=d=e=f=g=h=i=j=k=l=m=n=o=p=q=r=s=t=u=v=w=x=y=z$

![favicon](favicon.png) Here's a code block:

```python
def hello_world() -> None:
    print("hello world!")

if __name__ == "__main__":
    hello_world()
```

and this is a `pre` block

<pre>
with text
</pre>
