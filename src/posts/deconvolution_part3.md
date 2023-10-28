---
layout: posts 
title:  "Blind Deconvolution #3: More about non-blind deconvolution" 
date:   "2021-05-02"
categories: machine-learning signal-processing computer-vision
excerpt: "Deconvolving and sharpening images is actually pretty tricky. Let's have a look at some more advanced methods for deconvolution."
header: 
    teaser: "/imgs/teasers/cow-weird-blur.webp"
---

In part 1 we saw how to do non-blind image deconvolution. In part 2 we saw a couple good image
priors and we saw how they can be used for simple blind deconvolution. This worked well for
deconvolution of Gaussian point spread functions, but it gave bad artifacts for motion blur kernels.
Typical distortions seen in pictures taken by conventional cameras have both a motion blur and
Gaussian component, so having good deconvolution for motion blur is absolutely essential.

We will explore two methods to improve the deconvolution method. First is a simple modification to
our current method, and second is an more expensive iterative method for deconvolution that works
better for sparse kernels. 
## An improved Wiener filter

Recall that deconvolution comes down to solving the equation
$$
    y = k*x,
$$
where $$y$$ is the observed (blured) image, $$k$$ is the point-spread function, $$x$$ is the
unobserved (sharp) images. If we take a discrete Fourier Transform (DFT) then this equation becomes
$$
    Y = K\odot X,
$$
where capital letters denote the Fourier-transformed variables, and $$\odot$$ is the _pointwise_
multiplication. To solve the deconvolution problem we can then do pointwise division by $$K$$ and then
do the inverse Fourier transform. Because $$K$$ may have zero or near-zero entries, we can run into
numerical instability. A quick fix is to instead multiply by $$K^* / (|K|^2+\epsilon)$$, giving
solution

$$
x = \mathcal F^{-1}\left(Y \odot \frac{K^*}{|K|^2+\epsilon}\right)
$$

This is fast to compute, and gives decent results. This simple method of deconvolution is known as
the Wiener filter. In the situation where there is some noise $$n$$ such that $$y=k*x+n$$, this
corresponds (for a certain value of $$\epsilon$$) to $$x^*$$ minimizing the expected square error
$$E(\|x-x^*\|^2)$$. Instead of minimizing the error, we can accept that $$\|k*x-y\|\approx \|n\|^2$$,
and then find the _smoothest_  $$x^*$$ with that error, to avoid ringing artifacts. Smoothness can be
modeled by the laplacian $$\Delta x^*$$ This leads to the problem

$$
    \begin{array}{ll}
        \text{minimize} & \Delta x \\
        \text{subject to} & \|k*x-y\|\leq \|n\|^2
    \end{array}
$$

If $$L$$ is the Fourier transform of the Laplacian kernel, then the solution to this problem has form

$$
x = \mathcal F^{-1}\left(Y \odot \frac{K^*}{|K|^2+\gamma |L|^2}\right)
$$

where the parameter $$\gamma>0$$ is determined by the noise level. In the end this is a simple
modification to the Wiener filter, that should give less ringing effects. Let's see what this does
in practice.

    
![svg](/imgs/deconvolution_part3/part3_2_0.svg)
    


In the picture above we tried to deblur a motion blur consisting of a diagonal strip of 10 pixels.
The deblurring is done with a kernel of 9.6 pixels (the last pixel on either end is dimmed). We do
this both with and without the Laplacian, with amounts of regularization so that the two methods
have a similar amount of ringing artifacts. The two methods look very similar, and if anything the
method without Laplacian may look a little sharper. The reason the methods behave so similarly is
probably because the Fourier transform of the Laplacian (show below) has a fairly spread-out
distribution and is therefore not too different from a uniform distribution we use in the Wiener
filter.

![svg](/imgs/deconvolution_part3/part3_4_1.svg)
    

## Richardson-Lucy deconvolution

There are many iterative deconvolution methods, and one often-used method in particular is
Richardson-Lucy decomposition. The iteration step is given by

$$
x_{k+1} = x_k\odot \left(\frac{y}{x_k*k}*k^*\right)
$$

Here $$k^*$$ is the flipped point spread function, its Fourier transform is the complex conjugate of
the Fourier transform of $$k$$. As first iteration we typically pick $$x_0=y$$. Note that if
$$\sum_{i,j}k_{ij} = 1$$, then $$\mathbf 1*k = \mathbf 1$$, with $$\mathbf 1$$ a constant 1 signal.
Therefore if we plug in $$x_k = \lambda x$$ we obtain

$$
x_{k+1} = x_k \odot \left(\frac{y}{\lambda y}*k^*\right) = x_k\odot \frac1\lambda \mathbf 1*k^* =
\frac{x_k}\lambda
$$

This both shows that $$x$$ is a fixed point of the Richardson-Lucy algorithm, and at the same time it
show that the algorithm doesn't necessarily converge, since it could alternate between $$2x$$ and
$$x/2$$ for example. In practice on natural images, if initialized with $$x_0=y$$, it does seem to
converge. Below we try this algorithm for different number of iterations, considering the same image
and point spread function as before.


    
![svg](/imgs/deconvolution_part3/part3_6_0.svg)
    


We see very similar ringing artifacts as with the Wiener filter. The number of iterations of the
algorithm is related to the size of the regularization constant. The more iterations, the sharper
the image is, but also the more pronounced the ringing artifacts are. 

Like with the Wiener filter, we need to add a small positive constant when dividing, to avoid
division-by-zero errors. Unlike the Wiener filter however, Richardson-Lucy deconvolution is very
insensitive to the amount of regularization used. 

Richardson-Lucy deconvolution is much slower than Wiener filter, requiring perhaps 100 iterations to
reach good result. Each iteration takes roughly as long as applying the Wiener filter. Fortunately
the algorithm is easy to implement on a GPU, and each iteration of the (426, 640) image above takes
only about 1ms on my computer with a simple GPU implementation using `cupy`. 

## Boundary effects

One issue that I have so far swept under the rug is the problem of boundary effects. If we convolve
an $$(n,m)$$ image by a $$(\ell,\ell)$$ kernel, then the result is an image of size $$(n+\ell-1,
m+\ell-1)$$, and not $$(n,m)$$. There is typically a 'fuzzy border' around the image, which we crop
away when displaying, but not when deconvolving. In real life we don't have the luxury of including
this fuzzy border around the image, and this can lead to heavy artifacts when deconvolving an image.
Below is the St. Vitus church image blurred with $$\sigma=3$$ Gaussian blur, and subsequently
deblurred using a Wiener filter with and without using the border around the image.

    
![svg](/imgs/deconvolution_part3/part3_10_0.svg)


The ringing at the boundary is known as Gibbs oscillation. The reason it occurs is because the
deconvolution method implicitly assumes the image is periodic. This is because the convolution
theorem (stating that convolution becomes multiplication after a (discrete) Fourier transform) needs
the assumption that the signal is periodic. If we would periodically stack a natural image we would
find a sudden sharp transition at the boundary, and this contributes to high-frequency components in
the Fourier transform, giving the sharp oscillations at the boundary. 

The more we regularize the deconvolution, the less big the boundary effects. This is because
regularization essentially acts as a low-pass filter, getting rid of high-frequency effects.
However, this also blurs the image considerably. For Richardson-Lucy deconvolution we essentially
have the same problem. 

The straightforward to deal with this problem is to extend the image to mimmick the 'fuzzy' border
introduces by convolution. Or better yet, we should pad the image in such a way that the image is as
regular as possible when stacked periodically. This is a strategy [employed by Liu and
Jia](https://doi.org/10.1109/ICIP.2008.4711802), they extend the image to be periodic by using three
different 'tiles' stacked in a pattern shown below. The image is then cropped to the dotted line,
and this gives a periodic image. The tiles are optimized such that the image is continuous along
each boundary, and such that the total Laplacian is minimized.


    
![svg](/imgs/deconvolution_part3/part3_12_1.svg)
    


There are many similar methods in the literature. Unfortunately, all of these methods are
complicated, and very few methods include a reference implementation. If there is one, it is almost
always in Matlab. This seems to be a general problem when reading literature about (de)convolution and image processing, for some reason in this scientific community it is not standard practice to include code with papers, and descriptions of algorithms are often vague require significant work to translate to working code. I found a Python implementation of Liu-Jia's algorithm [at this github](https://github.com/ys-koshelev/nla_deblur/blob/90fe0ab98c26c791dcbdf231fe6f938fca80e2a0/boundaries.py).

Below we see the Laplacian of the image extended using Liu-Jia's method, using zero padding and by reflecting the image. We see that both in the reflected image, and the one using Liu-Jia's method there are no large values of the Laplacian around the border, because of the soft transition to the border. 

    
![svg](/imgs/deconvolution_part3/part3_15_1.svg)
    

Next we can check if these periodic extensions of the images actually reduces boundary artifacts when deconvolving. Below we see the three methods for both the Wiener and Richardson-Lucy (RL) deconvolution in action on an image distorted with $$\sigma=3$$ Gaussian blur.

    
![svg](/imgs/deconvolution_part3/part3_17_0.svg)
    


We can see that the Liu-Jia's method gives a significant improvement, especially for the Wiener
filter. More strikingly, the reflective padding works even better. This is because the convolution that the distorted the image implicitly used reflective padding as well. If you change the settings of the convolution blurring the image, then the results will not be as good. Liu-Jia's method probably works the best out-of-the box on images blurred by natural means. 

It is interesting to note that Richardson-Lucy deconvolution suffers heavily in quality regardless of padding method. Interestingly, if we look at motion blur instead of Gaussian blur, the roles are a bit reversed. For the Wiener filter we have to use fairly aggressive regularization to not get too many artifacts, whereas RL deconvolution works without problems.
    
![svg](/imgs/deconvolution_part3/part3_19_0.svg)
    

## Conclusion

We have reiterated the fact that even non-blind deconvolution can be a difficult problem. The relatively simple Wiener filter in general does a good job, and changing it to use a Laplacian for regularization doesn't seem to help much. The Richardson-Lucy algorithm often performs comparably to the Wiener filter, although it seems to perform relatively better for sparse kernels like the motion blur kernel we used. 

Before we have completely ignored boundary problems, which is not something we can do with real images. Fortunately, we can deal with these issues by appropriately padding the image. Simply using reflections of the image for padding works quite well, especially depending on how we blur the image in the first place. Extending the image to be periodic while minimizing the Laplacian is more complicated, but also works well, and probably performs better in natural images.

In the next part (and hopefully final part) we will dive into some simple approaches for blind deconvolution. Starting off with a modification of the Richardson-Lucy algorithm, and then trying to use what we learned about image priors in part 2. 
