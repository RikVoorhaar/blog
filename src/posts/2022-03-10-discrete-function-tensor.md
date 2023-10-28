---
layout: posts 
title: "Machine learning with discretized functions and tensors"
date:  "2022-03-10"
categories: machine-learning mathematics linear-algebra code
excerpt: "We recently made a paper about supervised machine learning using tensors, here's the gist of how this works."
header: 
    teaser: "/imgs/teasers/discrete-function-tensor.webp"
---

In [my new paper together with my supervisor](https://arxiv.org/abs/2203.04352), we explain how to use
discretized functions and tensors to do supervised machine learning. A discretized function is just a function
defined on some grid, taking a constant value on each grid cell. We can describe such a function using a
multi-dimensional array (i.e. a tensor), and we can learn this tensor using data. This results in a new and
interesting type of machine learning model.

## What is machine learning?

Before we dive into the details of our new type of machine learning model, let's sit back for a moment and
think: _what is machine learning in the first place?_ Machine learning is all about _learning from data_. More
specifically in _supervised machine learning_ we are given some _data points_ $$X = (x_1,\dots,x_N)$$, all lying
in $$\mathbb R^d$$, together with _labels_ $$y=(y_1,\dots,y_N)$$ which are just numbers. We then want to find some
function $$f\colon \mathbb R^d\to \mathbb R$$ such that $$f(x_i)\approx y_i$$ for all $$i$$, and such that $$f$$
_generalizes well to new data_. Or rather, we want to minimize a loss function, for example the least-squares
loss 

$$
    L(f) = \sum_{i=1}^N (f(x_i)-y)^2.
$$

This is obviously an ill-posed problem, and there are two main issues with it:  
1. What _kind_ of functions $$f$$ are we allowed to choose?  
2. What does it mean to _generalize_ well on new data?  

The first issue has no general solution. We _choose_ some class of functions, usually that depend on some set of parameters $$\theta$$. For example, if we want to fit a quadratic function to our data we only look at quadratic functions 

$$
f_{(a,b,c)}(x) = a + bx +cx^2,
$$

and our set of parameters is $$\theta=\{a,b,c\}$$. Then we minimize the loss over this set of parameters, i.e.
we solve the minimization problem:

$$
\min_{a,b,c} \sum_{i=1}^N (a+ bx_i+cx_i^2-y_i)^2.
$$

There are many parametric families $$f_\theta$$ of functions we can choose from, and many different ways to
solve the corresponding minimization problem. For example, we can choose $$f_\theta$$ to be neural networks
_with some specified layer sizes_, or a random forest with a fixed number of trees and fixed maximum tree
depth. Note that we should strictly speaking always specify hyperparameters like the size of the layers of a
neural network, since those hyperparameters determine what kind of parameters $$\theta$$ we are going to
optimize. That is, hyperparameters affect the parametric family of functions that we are going to optimize.

The second issue, generalization, is typically solved through _cross-validation_. If we want to know whether
the function $$f_\theta$$ we learned generalizes well to new data points, we should just keep part of the data
"hidden" during the training (the _test data_). After training we then evaluate our trained function on this
hidden data, and we record the loss function on this test data to obtain the _test loss_. The test loss is
then a good measure of how well the function can generalize to new data, and it is very useful if we want to
compare several different functions trained on the same data. Typically we use a third set of data, the 
_validation_ dataset for optimizing hyperparameters for example, see [my blog post on the topic](/validation-size/).

## Discretized functions

Keeping the general problem of machine learning in mind, let's consider a particular class of parametric
functions: _discretized functions on a grid_. To understand this class of functions, we first look at the 1D
case. Let's take the interval $$[0,1]$$, and chop it up into $$n$$ equal pieces: 

$$
[0,1] = [0,1/n]\cup[1/n,2/n]\cup\dots\cup[(n-1)/n,1]
$$

A discretized function is then one that _takes a constant value on each subinterval_. For example, below is a
discretized version of a sine function:


```python
import numpy as np
import matplotlib.pyplot as plt
%matplotlib inline

DEFAULT_FIGSIZE = (10, 6)
plt.figure(figsize=(DEFAULT_FIGSIZE))

num_intervals = 10
num_plotpoints = 1000

x = np.linspace(0, 1 - 1 / num_plotpoints, num_plotpoints)


def f(x):
    return np.sin(x * 2 * np.pi)


plt.plot(x, f(x), label="original function")
plt.plot(
    x,
    f((np.floor(x * num_intervals) + 0.5) / num_intervals),
    label="discretized function",
)
plt.legend();

```


    
![svg](/imgs/discrete-function-tensor/tensor-completion_2_0.svg)
    


Note that if we divide the interval into $$n$$ pieces, then we need $$n$$ parameters to describe the discretized function $$f_\theta$$. 

In the 2D case we instead divide the square $$[0,1]^2$$ into a grid, and demand that a discretized function is _constant on each grid cell_. If we use $$n$$ grid cells for each axis, this gives us $$n^2$$ parameters. Let's see what a discretized function looks like in a 3D plot:


```python
fig = plt.figure(figsize=(DEFAULT_FIGSIZE))

num_plotpoints = 200
num_intervals = 5


def f(X, Y):
    return X + 2 * Y + 1.5 * ((X - 0.5) ** 2 + (Y - 0.5) ** 2)


X_plotpoints, Y_plotpoints = np.meshgrid(
    np.linspace(0, 1 - 1 / num_plotpoints, num_plotpoints),
    np.linspace(0, 1 - 1 / num_plotpoints, num_plotpoints),
)

# Smooth plot
Z_smooth = f(X_plotpoints, Y_plotpoints)
ax = fig.add_subplot(121, projection="3d")
ax.plot_surface(X_plotpoints, Y_plotpoints, Z_smooth, cmap="inferno")
plt.title("original function")


# Discrete plot
X_discrete = (np.floor(X_plotpoints * num_intervals) + 0.5) / num_intervals
Y_discrete = (np.floor(Y_plotpoints * num_intervals) + 0.5) / num_intervals
Z_discrete = f(X_discrete, Y_discrete)
ax = fig.add_subplot(122, projection="3d")
ax.plot_surface(X_plotpoints, Y_plotpoints, Z_discrete, cmap="inferno")
plt.title("discretized function");

```


    
![svg](/imgs/discrete-function-tensor/tensor-completion_4_0.svg)
    


## Learning 2D functions: matrix completion

Before diving into higher-dimensional versions of discretized functions, let's think about how we would solve
the learning problem. As mentioned, we have $$n^2$$ parameters, and we can encode this using an $$n\times n$$
matrix $$\Theta$$. We are doing supervised machine learning, so we have data points
$$((x_1,y_1),\dots,(x_N,y_N))$$ and corresponding labels $$(z_1,\dots,z_N)$$. Each data point $$(x_i,y_i)$$
correspond to some entry $$(j,k)$$ in the matrix $$\Theta$$; this is simply determined by the specific grid cell
the data point happens to fall in. 

If the points $$((x_{i_1},y_{i_1}),\dots,(x_{i_m},y_{i_m}))$$ all fall into the grid cell $$(j,k)$$, then we can
define $$\Theta[j,k]$$ simply by the mean value of the labels for these points;

$$
\Theta[j,k] = \frac{1}{m} \sum_{a=1}^n y_a
$$

But what do we do if we have no training data corresponding to some entry $$\Theta[j,k]$$? Then the only thing
we can do is make an educated guess based on the entries of the matrix we _do_ know. This is the _matrix
completion problem_; we are presented with a matrix with some known entries, and we are tasked to find good
values for the unknown entries. We described this problem in some detail [in the previous blog
post](/low-rank-matrix/).

The main takeaway is this: to solve the matrix completion problem, we need to assume that the matrix has some
extra structure. We typically assume that the matrix is of low rank $$r$$, that is, we can write $$\Theta$$ as a
product $$\Theta=A B$$ where $$A,B$$ are of size $$n\times r$$ and $$r\times n$$ respectively. Intuitively, this is a
useful assumption because now we only have to learn $$2nr$$ parameters instead of $$n^2$$. If $$r$$ is much smaller
than $$n$$, then this is a clear gain. 

From the perspective of machine learning, this changes the class of functions we are considering. Instead of
_all_ discretized functions on our $$n\times n$$ grid inside $$[0,1]^2$$, we now consider only those functions
described by a matrix $$\Theta=AB$$ that has rank at most $$r$$. This also changes the parameters; instead of
$$n^2$$ parameters, we now only consider $$2nr^2$$ parameters describing the two matrices $$A,B$$.

Real data is often not uniform, so unless we use a very coarse grid, some entries of $$\Theta[j,k]$$ are always
going to be unknown. For example below we show some more realistic data, with the same function as before plus
some noise. The color indicates the value of the function $$f$$ we're trying to learn. 


```python
num_intervals = 8

N = 50


# A function to make somewhat realistic looking 2D data
def non_uniform_data(N):
    np.random.seed(179)
    X = np.random.uniform(size=N)
    X = (X + 0.5) ** 2
    X = np.mod(X ** 5 + 0.2, 1)
    Y = np.random.uniform(size=N)
    Y = (Y + 0.5) ** 3
    Y = np.sin(Y * 0.2 * np.pi + 1) + 1
    Y = np.mod(Y + 0.6, 1)
    X = np.mod(X + 3 * Y + 0.5, 1)
    Y = np.mod(0.3 * X + 1.3 * Y + 0.5, 1)
    X = X ** 2 + 0.4
    X = np.mod(X, 1)
    Y = Y ** 2 + 0.5
    Y = np.mod(Y + X + 0.4, 1)
    return X, Y


# The function we want to model
def f(X, Y):
    return X + 2 * Y + 1.5 * ((X - 0.5) ** 2 + (Y - 0.5) ** 2)


X_train, Y_train = non_uniform_data(N)
X_test, Y_test = non_uniform_data(N)
Z_train = f(X_train, Y_train) + np.random.normal(size=X_train.shape) * 0.2
Z_test = f(X_test, Y_test) + np.random.normal(size=X_test.shape) * 0.2


plt.figure(figsize=(7, 6))
plt.scatter(X_train, Y_train, c=Z_train, s=50, cmap="inferno", zorder=3)
plt.colorbar()

# Plot a grid
X_grid = np.linspace(1 / num_intervals, 1, num_intervals)
Y_grid = np.linspace(1 / num_intervals, 1, num_intervals)
plt.xlim(0, 1)
plt.ylim(0, 1)

for perc in X_grid:
    plt.axvline(perc, c="gray")
for perc in Y_grid:
    plt.axhline(perc, c="gray")

```


    
![svg](/imgs/discrete-function-tensor/tensor-completion_6_0.svg)
    


We plotted an 8x8 grid on top of the data. We can see that in some grid squares we have a lot of data points, whereas in other squares there's no data at all. Let's try to fit a discretized function described by an 8x8 matrix of rank 3 to this data. We can do this using the [ttml](https://github.com/RikVoorhaar/ttml) package I developed. 


```python
from ttml.tensor_train import TensorTrain
from ttml.tt_rlinesearch import TTLS

rank = 3

# Indices of the matrix Theta for each data point
idx_train = np.stack(
    [np.searchsorted(X_grid, X_train), np.searchsorted(Y_grid, Y_train)], axis=1
)
idx_test = np.stack(
    [np.searchsorted(X_grid, X_test), np.searchsorted(Y_grid, Y_test)], axis=1
)

# Initialize random rank 3 matrix
np.random.seed(179)
low_rank_matrix = TensorTrain.random((num_intervals, num_intervals), rank)

# Optimize the matrix using iterative method
optimizer = TTLS(low_rank_matrix, Z_train, idx_train)
train_losses = []
test_losses = []
for i in range(50):
    train_loss, _, _ = optimizer.step()
    train_losses.append(train_loss)
    test_loss = optimizer.loss(y=Z_test, idx=idx_test)
    test_losses.append(test_loss)

plt.figure(figsize=(DEFAULT_FIGSIZE))
plt.plot(train_losses, label="Training loss")
plt.plot(test_losses, label="Test loss")
plt.xlabel("Number of iterations")
plt.ylabel("Loss")
plt.legend()
plt.yscale("log")

print(f"Final training loss: {train_loss:.4f}")
print(f"Final test loss: {test_loss:.4f}")

```

    Final training loss: 0.0252
    Final test loss: 0.0424



    
![svg](/imgs/discrete-function-tensor/tensor-completion_8_1.svg)
    


Above we see how the train and test loss develops during training. At first both train and test loss decrease
rapidly. Then both train and test loss start to decrease much more slowly, and training loss is less than test
loss. This means that the model overfits on the training data, but this is not necessarily a problem; the
question is how much it overfits compared to other models. To see how good this model is, let's compare it to
a random forest.


```python
from sklearn.ensemble import RandomForestRegressor

np.random.seed(179)
forest = RandomForestRegressor()
forest.fit(np.stack([X_train, Y_train], axis=1), Z_train)
Z_pred = forest.predict(np.stack([X_test, Y_test], axis=1))
test_loss = np.mean((Z_pred - Z_test) ** 2)

print(f"Random forest test loss: {test_loss:.4f}")

```

    Random forest test loss: 0.0369


We see that the random forest is a little better than the discretized function. And in fact, most standard machine learning estimators will beat a discretized function like this. This is essentially because the discretized function is very simple, and more complicated estimators can do a better job describing the data.

Does this mean that we should stop caring about the discretized function? Test loss is not the only criterion we should use to compare different estimators. Discretized functions like these have two big advantages:
1. They use very few parameters compared to many common machine learning estimators.
2. Making new predictions is _very_ fast. Much faster in fact than most other machine learning estimators.

This makes them excellent candidates for low-memory applications. For example, we may want to implement a machine learning model for a very cheap consumer device. If we don't need extreme accuracy, and we pre-train the model on a more powerful device, discretized functions can be a very attractive option.

## Discretized functions in higher dimensions: tensor trains

The generalization to $$d$$-dimensions is now straightforward; we take a $$d$$-dimensional grid on $$[0,1]^d$$, with
$$n$$ subdivisions in each axis. Then we specify the value of our function $$f_\Theta$$ on each of the $$n^d$$ grid
cells.  These $$n^d$$ values form a _tensor_ $$\Theta$$, i.e. a $$d$$-dimensional array. We access the entries of
$$\Theta$$ with a $$d$$-tuple of indices $$\Theta[i_1,i_2,\dots,i_d]$$. 

This suffers from the same problems as in the 2D case; the tensor $$\Theta$$ is really big, and during training
we would need at least one data point for each entry of the tensor. But the situation is even worse, even
storing $$\Theta$$ can be prohibitively expensive. For example, if $$d=10$$ and $$n=20$$; then we would need about
82 TB just to store the tensor! In fact, $$n=20$$ grid points in each direction is not even that much, so in
practice we might need a much bigger tensor still.

In the 2D case we solved this problem by storing the matrix as the product of two smaller matrices. In the 2D
case this doesn't actually save that much on memory, and we mainly did it so that we can solve the matrix
completion problem; that is, so that we can actually fit the discretized function to data. In higher
dimensions however, storing the tensor in the right way can save immense amounts of space. 

In the 2D case, we store matrices as a low rank matrix; as a product of two smaller matrices. But what is the
correct analogue of 'low rank' for tensors? Unfortunately (or fortunately), there are many answers to this
question. There are many 'low rank tensor formats', all with very different properties. We will be focusing on
_tensor trains_. A tensor train decomposition of an $$n_1\times n_2\times \dots \times n_d$$ tensor $$\Theta$$
consists of a set of $$d$$ _cores_ $$C_k$$ of shape $$r_{k-1}\times n_k \times r_k$$, where $$(r_1,\dots,r_{d-1})$$
are the _ranks_ of the tensor train. Using these cores we can then express the entries of $$\Theta$$ using the
following formula:

$$
\Theta[i_1,\dots,i_d] = \sum_{k_1,\dots,k_{d-1}}C_1[1,i_1,k_1]C_2[k_1,i_2,k_2]\cdots C_{d-1}[k_{d-2},i_{d-1},k_{d-1}]C_d[k_{d-1},i_{d},1]
$$

This may look intimidating, but the idea is actually quite simple. We should think of the core $$C_{k}$$ as a
_collection_ of $$n_k$$ matrices $$(C_k[1],\dots,C_k[n_k])$$, each of shape $$r_{k-1}\times r_k$$. The index $$i_k$$
then _selects_ which of these matrices to use. The first and last cores are special, by convention
$$r_0=r_d=1$$, this means that $$C_1$$ is a collection of $$1\times r_1$$ matrices, i.e. (row) vectors. Similarly,
$$C_d$$ is a collection of $$r_{d-1}\times 1$$ matrices, i.e. (column) vectors. Thus each entry of $$\Theta$$ is
determined by a product like this:

> row vector * matrix * matrix * ... * matrix * column vector

The result is a number, since a row/column vector times a matrix is a row/column vector, and the product of a
row and column vector is just a number. In fact, if we think about it, this is exactly how a low-rank matrix
decomposition works as well. If we write a matrix $$\Theta = AB$$, then 

$$
\Theta[i,j]=\sum_k A[i,k] B[k,j] = A[i,:]\cdot B[:,j].
$$

 Here $$A[i,:]$$ is a _row_ of $$A$$, and $$B[:,j]$$ is a _column_ of $$B$$. In other words, $$A$$
is just a collection of row vectors, and $$B$$ is just a collection of column vectors. Then to obtain an entry
$$\Theta[i,j]$$, we select the $$i\text{th}$$ row of $$A$$ and the $$j\text{th}$$ column of $$B$$ and take the product.

In summary, a tensor train is a way to cheaply store large tensors. Assuming all ranks $$(r_1,\dots,r_{d-1})$$
are the same, a tensor train requires $$O(dr^2n)$$ entries to store a tensor with $$O(n^d)$$ entries; a huge gain
if $$d$$ and $$n$$ are big. For context, if $$d=10$$, $$n=20$$, and $$r=10$$ then instead of 82 TB we just need 131 KB
to store the tensor; that's about 9 orders of magnitude cheaper! Furthermore, computing entries of this tensor
is cheap; it's just a couple matrix-vector products. 

There is obviously a catch to this. Just like not every matrix is low-rank, not every tensor can be
represented by a low-rank tensor train. The point, however, is that tensor trains can efficiently represent
many tensors that we _do_ care about. In particular, they are good at representing the tensors required for
discretized functions. 

## Learning discretized functions: tensor completion

How can we learn a discretized function $$[0,1]^d\to \mathbb R$$ represented by a tensor train? Like in the
matrix case, many entries of the the tensor are unobserved, and we have to _complete_ these entries based on
the entries that we _can_ estimate. In [my post on matrix completion](/low-rank-matrix) we have seen that even
the matrix case is tricky, and there are many algorithms to solve the problem. One thing these algorithms have
in common is that they are iterative algorithms minimizing some loss function. Let's derive such an algorithm
for _tensor train completion_. 

First of all, what is the loss function we want to minimize during training? It's simply the least squares
loss:

$$
L(\Theta) = \sum_{j=1}^N(f_\Theta(x_j) - y_j)^2
$$

Each data point $$x_j\in [0,1]^d$$ fits into some grid cell given by index $$(i_1[j],i_2[j],\dots,i_d[j])$$, so
using the definition of the tensor train the loss $$L(\Theta)$$ becomes

$$
\begin{align*}
L(\Theta) &= \sum_{j=1}^N (\Theta[i_1[j],i_2[j],\dots,i_d[j]] - y_j)^2\\
 &= \sum_{j=1}^N(C_1[1,i_1[j],:]C_2[:,i_2[j],:]\cdots C_d[:,i_d[j],1] - y_j)^2
\end{align*}
$$

A straightforward approach to minimizing $$L(\Theta)$$ is to just use _gradient descent_. We could compute the
derivatives with respect to each of the cores $$C_i$$ and just update the cores using this derivative. This is,
however, very slow. There are two reasons for this, but they are a bit subtle:
1. _There is a lot of curvature._ In gradient descent, the size of step we can optimally take is depended on
   how big the _second derivatives_ of a function are (the _'curvature'_). The derivative of a function is the
   _best linear approximation_ of a function, and gradient descent works faster if this linear approximation
   is a good approximation of the function. In this case, the function we are trying to optimize is _very
   non-linear_, and any linear approximation is going to be very bad. Therefore we are forced to take really
   tiny steps during gradient descent, and convergence is going to be very slow.
2. _There are a lot of symmetries._ For example we can replace $$C_i$$ and $$C_{i+1}$$ with $$C_i M$$ and
   $$A^{-1}C_{i+1}$$ for any matrix $$A$$. Gradient descent 'doesn't know' about these symmetries, and keeps
   updating $$\Theta$$ in directions that doesn't affect $$L(\Theta)$$.

To efficiently optimize $$L(\theta)$$, we can't just use gradient descent as-is, and we are forced to walk a
different route. While $$L(\Theta)$$ is very non-linear as function of the tensor train cores $$C_i$$, it is only
quadratic in the _entries_ of $$L(\Theta)$$, and we can easily compute its derivative:

$$ \nabla_{\Theta}L(\Theta) = 2\sum_{j=1}^N (\Theta[i_1[j],i_2[j],\dots,i_d[j]] -
y_j)E(i_1[j],i_2[j],\dots,i_d[j]), $$

where $$E(i_1,i_2,\dots,i_d)$$ denotes a sparse tensor that's zero in all entries _except_ $$(i_1,\dots,i_d)$$
where it takes value $$1$$. In other words, $$\nabla_{\Theta}L(\Theta)$$ is a _sparse tensor_ that is both simple
and cheap to compute; it just requires sampling at most $$N$$ entries of $$\Theta$$. For gradient descent we would
then update $$\Theta$$ by $$\Theta-\alpha \nabla_{\Theta}L(\Theta)$$ with $$\alpha$$ the stepsize. Unfortunately,
this expression is not a tensor train. However, we can try to _approximate_ 
$$\Theta-\alpha \nabla_{\Theta}L(\Theta)$$ by a tensor train of the same rank as $$\Theta$$. 

Recall that we can approximate a matrix $$A$$ by a rank $$r$$ matrix by using the _truncated SVD_ of $$A$$. In fact
this is the best-possible approximation of $$A$$ by a rank $$\leq  r$$ matrix. There is a similar procedure for
tensor trains; we can approximate a tensor $$\Theta$$ by a rank $$(r_1,\dots,r_{d-1})$$ tensor train using the
TT-SVD procedure. While this is not the _best_ approximation of $$\Theta$$ by such a tensor train, it is
_'quasi-optimal'_ and pretty good in practice. The details of the TT-SVD procedure are a little involved, so
let's leave it as a black box. We now have the following iterative procedure for optimizing $$L(\Theta)$$:

$$
\Theta_{k+1} \leftarrow \operatorname{TT-SVD}(\Theta_{k}-\alpha \nabla_{\Theta}L(\Theta_k) )
$$

If you're familiar with optimizing neural networks, you might notice that this procedure could work very well
with _stochastic gradient descent_. Indeed $$\nabla_{\Theta}L(\Theta)$$ is a sum over all the data points, so we
can just pick a subset of data points (a minibatch) to obtain a stochastic gradient. The reason we would want
to do this is that we have so many data points that the cost of each step is dominated by computing the
gradient. In this situation this is however not true, and the cost is dominated by the TT-SVD procedure. We
therefore stick to more classical gradient descent methods. In particular, the function $$L(\theta)$$ can be
optimized well with conjugate gradient descent using Armijo backtracking line search. 



## Discretized functions in practice

Let's now see all of this in practice. Let's train a discretized function $$f_\Theta$$ represented by a tensor
train on some data using the technique described above. We will do this on a real dataset: the [airfoil
self-noise dataset](https://archive.ics.uci.edu/ml/datasets/airfoil+self-noise). This NASA dataset contains
experimental data about the self-noise of airfoils in a wind tunnel, originally used to optimize wing shapes.
We can do the fitting and optimization using my `ttml` package. Let's use a rank 5 tensor train with 10 grid
points for each feature.


```python
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split

# Load the data
airfoil_data = pd.read_csv(
    "airfoil_self_noise.dat", sep="\t", header=None
).to_numpy()
y = airfoil_data[:, 5]
X = airfoil_data[:, :5]
N, d = X.shape
print(f"Dataset has {N=} samples and {d=} features.")


# Do train-test split, and scale data to interval [0,1]
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=179
)
scaler = MinMaxScaler(clip=True)
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Define grid, and find associated indices for each data point
num_intervals = 10

grids = [np.linspace(1 / num_intervals, 1, num_intervals) for _ in range(d)]
tensor_shape = tuple(len(grid) for grid in grids)
idx_train = np.stack(
    [np.searchsorted(grid, X_train[:, i]) for i, grid in enumerate(grids)],
    axis=1,
)
idx_test = np.stack(
    [np.searchsorted(grid, X_test[:, i]) for i, grid in enumerate(grids)],
    axis=1,
)

# Initialize the tensor train
np.random.seed(179)
rank = 5
tensor_train = TensorTrain.random(tensor_shape, rank)

# Optimize the tensor train using iterative method
optimizer = TTLS(tensor_train, y_train, idx_train)
train_losses = []
test_losses = []
for i in range(100):
    train_loss, _, _ = optimizer.step()
    train_losses.append(train_loss)
    test_loss = optimizer.loss(y=y_test, idx=idx_test)
    test_losses.append(test_loss)

plt.figure(figsize=(DEFAULT_FIGSIZE))
plt.plot(train_losses, label="Training loss")
plt.plot(test_losses, label="Test loss")
plt.xlabel("Number of iterations")
plt.ylabel("Loss")
plt.legend()
plt.yscale("log")

print(f"Final training loss: {train_loss:.4f}")
print(f"Final test loss: {test_loss:.4f}")
```

    Dataset has N=1503 samples and d=5 features.
    Final training loss: 15.3521
    Final test loss: 54.4698



    
![svg](/imgs/discrete-function-tensor/tensor-completion_15_1.svg)
    


We see a similar training profile to the matrix completion case. Let's see now how this estimator compares to a random forest trained on the same data:


```python
np.random.seed(179)
forest = RandomForestRegressor()
forest.fit(X_train, y_train)
y_pred = forest.predict(X_test)
test_loss = np.mean((y_pred - y_test) ** 2)

print(f"Random forest test loss: {test_loss:.4f}")
```

    Random forest test loss: 3.2568


The random forest has a loss of around `3.3`, but the discretized function has a loss of around `54.5`! That gap in performance is completely unacceptable. We could try to improve it by increasing the number of grid points, and by tweaking the rank of the tensor train. However, it will still come nowhere close to the performance of a random forest, even with its default parameters. Even the _training error_ of the discretized function is much worse than the _test error_ of the random forest.

**Why is it so bad?** _Bad initialization!_

Recall that a gradient descent method converges to a _local_ minimum of the function. Usually we hope that whatever local minimum we converge to is 'good'. Indeed for neural networks we see that, especially if we use a lot of parameters, most local minima found by stochastic gradient descent are quite good, and give a low train _and_ test error. This is not true for our discretized function. We converge to local minima that have both bad train and test error. 

**The solution?** _Better initialization!_

## Using other estimators for initialization

Instead of initializing the tensor trains _randomly_, we can learn from other machine learning estimators. We
fit our favorite machine learning estimator (e.g. a neural network) to the training data. This gives a function
$$g\colon [0,1]^d\to \mathbb R$$. This function is defined for _any_ input, not just for the training/test data
points. Therefore we can try to first fit our discretized function $$f_\Theta$$ to match $$g$$, i.e. we solve the
following minimization problem:

$$
\min_\Theta \|f_\Theta - g\|^2
$$

One way to solve this minimization problem is by first (randomly) sampling a lot of new data points
$$(x_1,\dots,x_N)\in [0,1]^d$$ and then fitting $$f_\Theta$$ to these data points with labels
$$(g(x_1),\dots,g(x_N))$$. This is essentially _data augmentation_, and can drastically increase the _number_ of
data points available for training. With more training data, the function $$f_\Theta$$ will indeed converge to a
better local minimum.

While data augmentation does improve performance, we can do better. We don't need to _randomly_ sample data
points $$(x_1,\dots,x_N)\in[0,1]^d$$. Instead we can _choose_ good points to sample; points that give us the
most information on how to efficiently update the tensor train. This is essentially the idea behind the
_tensor train cross approximation_ algorithm, or TT-Cross for short. Using TT-Cross we can quickly and
efficiently get a good approximation to the minimization problem $$\min_\Theta \|f_\Theta - g\|^2$$.

We could stop here. If $$g$$ models our data really well, and $$f_\Theta$$ approximates $$g$$ really well, then we
should be happy. Like the matrix completion model, discretized functions based on tensor trains are _fast_ and
are _memory efficient_. Therefore we can make an approximation of $$g$$ that uses less memory and can make
faster predictions! However, the model $$g$$ really should be used for _initialization_ only. Usually $$f_\Theta$$
actually doesn't do a great job of approximating $$g$$, but if we first approximate $$g$$, and _then_ use a
gradient descent algorithm to improve $$f_\Theta$$ even further, we end up with something much more competitive. 

Let's see this in action. This is actually much easier than what we did before, because I wrote the `ttml`
package specifically for this use case.


```python
from ttml.ttml import TTMLRegressor


# Use random forest as base estimator
forest = RandomForestRegressor()

# Fit tt on random forest, and then optimize further on training data
np.random.seed(179)
tt = TTMLRegressor(forest, max_rank=5, opt_tol=None)
tt.fit(X_train, y_train, X_val=X_test, y_val=y_test)

y_pred = tt.predict(X_test)
test_loss = np.mean((y_pred - y_test) ** 2)
print(f"TTML test loss: {test_loss:.4f}")

# Forest is fit on same data during fitting of tt
# Let's also report how good the forest does
y_pred_forest = forest.predict(X_test)
test_loss_forest = np.mean((y_pred_forest - y_test) ** 2)
print(f"Random forest test loss: {test_loss_forest:.4f}")

# Training and test loss is also recording during optimization, let's plot it
plt.figure(figsize=(DEFAULT_FIGSIZE))
plt.plot(tt.history_["train_loss"], label="Training loss")
plt.plot(tt.history_["val_loss"], label="Test loss")
plt.axhline(test_loss_forest, c="g", ls="--", label="Random forest test loss")
plt.xlabel("Number of iterations")
plt.ylabel("Loss")
plt.legend()
plt.yscale("log")
```

    TTML test loss: 2.8970
    Random forest test loss: 3.2568



    
![svg](/imgs/discrete-function-tensor/tensor-completion_19_1.svg)
    


We see that using a random forest for initialization gives a huge improvement to both training and test loss.
In fact,the final test loss is better than that of the random forest itself! On top of that, this estimator doesn't use many parameters:


```python
print(f"TT uses {tt.ttml_.num_params} parameters")
```

    TT uses 1356 parameters


Let's compare that to the random forest. If we look under the hood, the scikit-learn implementation of random forests stores 8 parameters per node in each tree in the forest. This is inefficient, and you really only _need_ 2 parameters per node, so let's use that.


```python
num_params_forest = sum(
    [len(tree.tree_.__getstate__()["nodes"]) * 2 for tree in forest.estimators_]
)
print(f"Forest uses {num_params_forest} parameters")
```

    Forest uses 303180 parameters


That's 1356 parameters vs. more than 300,000 parameters! What about my claim of prediction speed? Let's compare the amount of time it takes both estimators to predict 1 million samples. We do this by just concatenating the training data until we get 1 million samples.


```python
from time import perf_counter_ns

target_num = int(1e6)
n_copies = int(target_num//len(X_train))+1
X_one_million = np.repeat(X_train,n_copies,axis=0)[:target_num]
print(f"{X_one_million.shape=}")

time_before = perf_counter_ns()
tt.predict(X_one_million)
time_taken = (perf_counter_ns() - time_before)/1e6
print(f"Time taken by TT: {time_taken:.0f}ms")

time_before = perf_counter_ns()
forest.predict(X_one_million)
time_taken = (perf_counter_ns() - time_before)/1e6
print(f"Time taken by Forest: {time_taken:.0f}ms")
```

    X_one_million.shape=(1000000, 5)
    Time taken by TT: 430ms
    Time taken by Forest: 2328ms


While not by orders of magnitude, we see that the tensor train model is faster. You might be thinking that
this is just because the tensor train has fewer parameters, but this is not the case. Even if we use a very
high-rank tensor train with high-dimensional data, it is still going to be fast. The speed scales really well,
and will beat most conventional machine learning estimators.

## No free lunch

With good initialization the model based on distretized functions perform really well. On our test dataset the
model is fast, uses few parameters, and beats a random forest in test loss (in fact, it is _the best
estimator_ I have found so far for this problem). This is great! I should publish a paper in NeurIPS and get a
job at Google! Well... let's not get ahead of ourselves. It performs well on _this particular dataset_, yes,
but how does it fare on other data?

As we shall see, it doesn't do all that well actually. The airfoil self-noise dataset is a very particular
dataset on which this algorithm excels. The model seems to perform well on data that can be described by a
somewhat smooth function, and doesn't deal well with the noisy and stochastic nature of most data we encounter
in the real world. As an example let's repeat the experiment, but let's first add some noise:


```python
from ttml.ttml import TTMLRegressor

X_noise_std = 1e-6
X_train_noisy = X_train + np.random.normal(0, X_noise_std, size=X_train.shape)
X_test_noisy = X_test + np.random.normal(scale=X_noise_std, size=X_test.shape)


# Use random forest as base estimator
forest = RandomForestRegressor()

# Fit tt on random forest, and then optimize further on training data
np.random.seed(179)
tt = TTMLRegressor(forest, max_rank=5, opt_tol=None, opt_steps=50)
tt.fit(X_train_noisy, y_train, X_val=X_test_noisy, y_val=y_test)

y_pred = tt.predict(X_test_noisy)
test_loss = np.mean((y_pred - y_test) ** 2)
print(f"TTML test loss (noisy): {test_loss:.4f}")

# Forest is fit on same data during fitting of tt
# Let's also report how good the forest does
y_pred_forest = forest.predict(X_test_noisy)
test_loss_forest = np.mean((y_pred_forest - y_test) ** 2)
print(f"Random forest test loss (noisy): {test_loss_forest:.4f}")

# Training and test loss is also recording during optimization, let's plot it
plt.figure(figsize=(DEFAULT_FIGSIZE))
plt.plot(tt.history_["train_loss"], label="Training loss")
plt.plot(tt.history_["val_loss"], label="Test loss")
plt.axhline(test_loss_forest, c="g", ls="--", label="Random forest test loss")
plt.xlabel("Number of iterations")
plt.ylabel("Loss")
plt.legend();

```

    TTML test loss (noisy): 7.1980
    Random forest test loss (noisy): 5.1036



    
![svg](/imgs/discrete-function-tensor/tensor-completion_28_1.svg)
    


Even a tiny bit of noise in the training data can severely degrade the model. We see that it starts to overfit
a lot. This is because my algorithm tries to automatically find a 'good' discretization of the data, not just
a uniform discretization as we have discussed in our 2D example (i.e. equally spacing all the grid cells).
Some of the variables in this dataset are however categorical, and a small amount of noise makes it much more
difficult to automatically detect a good way to discretize them. 

The model has a lot of hyperparameters we won't go into now, and playing with them does help with overfitting.
Furthermore, the noisy data we show here is perhaps not very realistic. However, the fact remains that the
model (at least the way its currently implemented) is not very robust to noise. In particular, the model is
very sensitive to the discretization of the feature space used. 

Right now we don't have anything better than simple heuristics for finding discretizations of the features
space. Since the loss function depends in a really discontinuous way on the discretization, optimizing the
discretization is difficult. Perhaps we can use an algorithm to adaptively split and merge thresholds used in
the discretization, or use some kind of clustering algorithm for discretization. I have tried things along
those lines but getting it to work well is difficult. I think that with more study, the problem of finding a
good discretization can be solved, but it's not easy.

## Conclusion

We looked at discretized functions and their use in supervised machine learning. In higher dimensions
discretized functions are parametrized by tensors, which we can represent efficiently using tensor trains. The
tensor train can be optimized directly on the data to produce a potentially useful machine learning model. It
is both very fast, and doesn't use many parameters. In order to initialize it well, we can first fit an
auxiliary machine learning model on the same data, and then sample predictions from that model to effectively
increase the amount of training data. This model performs really well on some datasets, but in general it is
not very robust to noise. As a result, without further improvements, the model will only be useful in a select
number of cases. On the other hand, I really think that the model does have a lot of potential, once some of
its drawbacks are fixed.
