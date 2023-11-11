---
layout: posts
title:  "Is my data normal?"
date:   "2020-08-10"
categories: data-science statistics
excerpt: "Normally distributed data is great, but how do you know whether your data is normally distributed?"
teaser: "normal_data.png"
---
<script>
    import Output from '$lib/components/markdown/Output.svelte'
</script>

Normally distributed data is great. It is easy to interpet, and many statistical and machine learning method work much better on normally distributed data. But how do we know if our data is actually normally distributed?

Let's start with the well-known MNIST digit dataset. This is a very famous dataset. It consists of many 28x28 grayscale images of hand-drawn digits 0-9. Classifying digits is a great testing problem for many machine learning algorithms, and it's often used for this purpose in education. [You can find this data on kaggle](https://www.kaggle.com/c/digit-recognizer)

As random variable we will take the average of the rows, which is just the mean brightness for each image.


```python
mnist = pd.read_csv('train.csv')
mnist.drop("label",axis=1,inplace=True)
mean_brightness = np.mean(mnist,axis=1)
```

We can visualize the distribution of this data by using kernel density estimation. We can compare it to a normal distribution by also plotting the density of a normal distribution with same mean and standard deviation. 


```python
import scipy.stats
def plot_normal(data):
    # Estimate the distribution of the data
    kde = scipy.stats.gaussian_kde(data)

    # Make a normally distributed probability distribution
    normal_distribution = scipy.stats.norm(loc=np.mean(data), scale=np.std(data))

    # Plot the two distributions
    x = np.linspace(min(data),max(data),num=100)
    plt.plot(x,kde(x),label='Data')
    plt.plot(x,normal_distribution.pdf(x),label='Normal distribution')
    plt.legend()

plot_normal(mean_brightness)
```


![svg](/blog/normal_data/normal_data_5_0.svg)


Going by these plots, our data is indeed wonderfully normally distributed! This is not surprising; the mean of a large number of random variables tends to be normally distributed, even if they are not identically distributed.

But what if we focus on a single pixel?


```python
single_pixel = mnist["pixel290"]

plot_normal(single_pixel)
```


![svg](/blog/normal_data/normal_data_7_0.svg)


We see two problems, this data's distribution is bimodal (i.e. it has two different peaks), and it's clipped off near the extreme values of 0 and 255. This makes sense, since we're dealing with grayscale images. 

## How do we measure if data is normally distributed?

Looking at plots like these is a great part of exploratory data analysis. But it's also very useful to output a concrete number and purely based on this number decide whether or not something is normally distributed. 

One general approach is to measure the distance between the distribution of our data, and a best fit normal distribution. Let $$\hat X$$ denote the estimated distribution of our data $$X$$, and $$\mathcal N=\mathcal N(\mu,\sigma)$$ denote a normal distribution with mean and variation estimated from $$X$$. Then a common way to measure the distance between $$\hat X$$ and $$\mathcal N$$ is the Kullback-Leibler divergence. It has the following form:

$$D_{KL}(\hat X|\mathcal N) = \int_{-\infty}^\infty\! \hat X(x)\log\left(\frac{\hat X(x)}{\mathcal N(x)}\right)\,\mathrm dx,$$

where $$\hat X(x)$$ and $$\mathcal N(x)$$ denote the probability density functions. Note that we run into trouble if $$\mathcal N(x)=0$$ but $$\hat X(x)\neq 0$$. Fortunately this never happens in our case, since the normal distribution has positive density everywhere. Let's compute compute this KL divergence for our two examples. 


```python
import scipy.integrate
def KL_divergence_normal(data):
    # Estimate the distribution of the data
    kde = scipy.stats.gaussian_kde(data)

    # Make a normally distributed probability distribution
    normal_distribution = scipy.stats.norm(loc=np.mean(data), scale=np.std(data))
    norm_pdf = normal_distribution.pdf

    # Constrict the range of values to the interval (0,255)
    x = np.linspace(0,255,1000)
    
    # Estimate KL divergence by sampling on 1000 points
    return scipy.stats.entropy(kde(x),norm_pdf(x))
print(f"KL divergence of mean brightness {KL_divergence_normal(mean_brightness)}")
print(f"KL divergence of single pixel {KL_divergence_normal(single_pixel)}")
```

<Output>
KL divergence of mean brightness 0.02243918311004641
KL divergence of single pixel 0.6474992150590142
</Output>
    

We cleary see that the mean brightness example has a much smaller KL divergence with respect to the best-fit normal distribution than the data for a single pixel, as expected.

However, there is a fundamental issue with this method. We used the kernel density estimation to get an estimated distribution of our data, but this tends to signficantly smoothen the data. Especially if we don't have too many data points, this can lead to our data looking normally distributed when it is in fact not the case. 

## The estimated cumulative distribution

The solution is simple. While estimating the *probability density* function requires smoothing the data, it's much easier to estimate the *cumulative distribution* function. It only involves sorting our data. We can estimate the distribution function $$\hat F$$ by:

$$
    \hat F(t) = \frac{\#\{\text{samples}\leq t\}}{\#\{\text{samples}\}}
$$


```python
def plot_normal_cdf(data,name=None):
    plt.figure()

    # plot estimated CDF
    plt.plot(sorted(data),np.linspace(0,1,len(data)),label="Data")

    # Make a normally distributed probability distribution, and plot CDF
    normal_distribution = scipy.stats.norm(loc=np.mean(data), scale=np.std(data))
    x = np.linspace(min(data),max(data),100)
    plt.plot(x,normal_distribution.cdf(x),label="Normal distribution")
    if name is not None:
        plt.title(f"CDF of {name} compared to normal CDF")
    plt.legend()
plot_normal_cdf(mean_brightness,name="Mean brightness")
plot_normal_cdf(single_pixel,name="Single pixel")
```


![svg](/blog/normal_data/normal_data_12_0.svg)



![svg](/blog/normal_data/normal_data_12_1.svg)


These CDF plots again visually confirm that one distribution is quite close to a normal distribution, whereass the other is not. In the second plot you can clearly see the singularity at 0 and 255 as well. 

Using this CDF we propose a very simple statistic giving the distance between two distributions. If $$\hat F$$ is the estimated CDF, and we're comparing it to the CDF $$G$$, then we define the *Kolmogorov-Smirnov* statistic by

$$
D = \sup_x|\hat F(x)-G(x)|
$$

We can compute this statistic directly with a `scipy` function:


```python
def ks_stat(data):
    # normalize the data
    data = data - np.mean(data)
    data = data/np.std(data)

    # compute KS statistic
    return scipy.stats.kstest(data, "norm")
print("Kolmogorov-Smirnov statistic for Mean brightnes: %.4f, with p-value %.3E"% ks_stat(mean_brightness))
print("Kolmogorov-Smirnov statistic for single pixel: %.4f, with p-value %.3E"% ks_stat(single_pixel))
```

<Output>
Kolmogorov-Smirnov statistic for Mean brightnes: 0.0315, with p-value 1.361E-36
Kolmogorov-Smirnov statistic for single pixel: 0.2608, with p-value 0.000E+00
</Output>
    

Here we see that the mean brigthness data has much lower KS statistic than the single pixel. This function also produces a p-value, assigning a probality to the null-hypothesis that the data is exactly normally distributed. In both cases this p-value is very tiny, which means that we have enough statistical evidence to conclude that even the mean brightness data is not normally distributed. This is mainly because we're basing this computation on 42000 data points, so even though the distance is to the normal distribution is small in this case, it's still statistically significant. Let's try to do the same, but subsample to only 100 points.


```python
print("Kolmogorov-Smirnov statistic for Mean brightnes (n=100): %.4f, with p-value %.3f"% ks_stat(np.random.choice(mean_brightness,size=100)))
print("Kolmogorov-Smirnov statistic for single pixel (n=100): %.4f, with p-value %.3E"% ks_stat(np.random.choice(single_pixel,size=100)))
```

<Output>
Kolmogorov-Smirnov statistic for Mean brightnes (n=100): 0.0925, with p-value 0.339
Kolmogorov-Smirnov statistic for single pixel (n=100): 0.2624, with p-value 1.449E-06
</Output>
    

Now we see for both cases a much higher p-value. For the mean brightness case we do not see a statistically significant deviation from a normal distribution.

So far all the methods we mentioned are completely general, and work on any (univariate) distribution. But for normal distributions there are also some other tests which are slightly more powerful (i.e. they have p-values that converge faster with increasing number of samples). In any case all these tests all use the estimated CDF. 

## Mixing

Now in our case of a single pixel, it actually looks like the distribution is a mixture of two truncated normal distributions. Is there a way to obtain the parameters of these distributions and see whether this fits better? One very general method to obtain a best-fit distribution is through maximum likelihood estimation. The idea here is that rather than asking "what are the parameters that best describe our data?", we should ask "given some parameters, what is the likelihood we got our data?". This leads to the likelihood function, which assigns to a set of parameters a probability of observing our data. The "best" parameters are then those that assign the highest likelihood to our data. This is a relative crude method, because it tells us nothing about how good our estimate of the parameters is, but more on that later.

In our case we have a mixture of two normal distribitions (truncated to $$[0, 255]$$). Such a distribution is parametrized by $$\theta=(\mu_1,\sigma_1,\mu_2,\sigma_2,t)$$, where $$\mu_i$$ denote the means and $$\sigma_i$$ denote the standard deviation of both normal distribitions, and $$t$$ is a number between 0 and 1 giving a weight to either distribution. Ignoring the truncation, this distribution has density given by

$$
    f(x|\theta) = \frac{1}{\sigma_1 \sqrt{2 \pi}}\exp\left(-\frac12\left(\frac{x-\mu_1}{\sigma_1}\right)^2\right)+(1-t) \frac{1}{\sigma_2 \sqrt{2 \pi}}\exp\left(-\frac12\left(\frac{x-\mu_2}{\sigma_2}\right)^2\right)
$$

The likelihood of observing our data $$(y_1,\dots,y_n)$$ is then given by

$$
    \mathcal L(y|\theta) = \prod_{i=1}^n f(y_i|\theta)
$$

Because taking a product of many small numbers is computationally unstable, we typically take a logarithm to get the log-likelihood function:

$$
    \ell (y|\theta) = \sum_{i=1}^n \log f(y_i|\theta)
$$

We can maximize this using any standard optimizer, so long as we know the derivatives. Here the fact that we're dealing with truncated normal distribitions actually doesn't matter, since up to a multiplicative constant the distribitions are the same in the range $$[0, 255]$$ where all the data lives. The partial derivatives of the log-likelihood function $$\ell$$ are given by

$$
    \frac{\partial}{\partial \theta_i} \ell(y|\theta) = \sum_{i=1}^n \frac{\frac{\partial}{\partial \theta_i}f(y_i|\theta)}{f(y_i|\theta)}
$$

Fortunately there are algorithms for this particular problem that are much better than directly maximizing this function. These use the powerful EM algorithm. Due to their ubiquity in machine learning, there is a good implementation of Gaussian mixture models in `scikit-learn`, so let's use that! To make a visual comparison, we will plot both the CDF and the estimate kernel densities.


```python
from sklearn.mixture import GaussianMixture

def fit_mixture(data, n_components = 1):
    data = np.array(data).reshape(-1,1)
    model = GaussianMixture(n_components=n_components)
    model.fit(data)

    return model

def plot_model_cdf(data,model,name=None):
    plt.figure(figsize=(16,5))
    plt.subplot(121)

    # plot estimated CDF
    x = np.linspace(0,1,len(data))
    plt.plot(sorted(data),x,label="Data")

    # estimate model CDF from 1000 datapoints, and truncate
    n_samples = 10000
    samples,_ =  model.sample(n_samples)
    samples = sorted(samples.reshape(-1))
    samples = [s for s in samples if (0<=s<=255)]

    # plot the CDF of gaussian mixture
    x = np.linspace(0,1,len(samples))
    plt.plot(samples, x, label="Gaussian mixture")

    if name is not None:
        plt.title(f"CDF of {name} compared to Gaussian mixture CDF")
    plt.legend()

    plt.subplot(122)

    # Estimate the distribution of the data and mixture
    kde_data = scipy.stats.gaussian_kde(data,0.1)
    kde_mixture = scipy.stats.gaussian_kde(samples)

    # Plot the two distributions
    x = np.linspace(min(data),max(data),num=100)
    plt.plot(x,kde_data(x),label='Data')
    plt.plot(x,kde_mixture(x),label='Gaussian mixture')
    if name is not None:
        plt.title(f"PDF of {name} compared to Gaussian mixture PDF")
    plt.legend()

model = fit_mixture(mean_brightness,n_components=2)
plot_model_cdf(mean_brightness,model,name="mean brightness")

model = fit_mixture(single_pixel,n_components=2)
plot_model_cdf(single_pixel,model,name="single pixel")

```


![svg](/blog/normal_data/normal_data_19_0.svg)



![svg](/blog/normal_data/normal_data_19_1.svg)


For the mean brigthness data it seems that the gaussian mixture with two components isn't much better or even worse! This is because it is close to normally distributed already. 

For the single pixel data there is a clear improvement, but it's still clear that the data is not well represented by a gaussian mixture. This looks surprising from the estimated density function, since it *looks* like a mixture of two gaussians, but this is deceiving. It turns out that this is mostly due to the smoothing of the kernel density estimation. The CDF of this data also doesn't look continuous at 0, so this is difficult to model even with a gaussian mixture model. 

## What is the point of all this?

Knowing the distribution of your features is very useful. Many machine learning and statistical methods need the data to be normalized, and work best if all your features are actually normally distributed. However if a particular feature has a very skewed distribution, as in for example the single pixel data shown here, then simply subtracting the mean and dividing by the standard deviation may not be the best way to normalize the data. In this case this pixel is usually either black or white, so we could choose to replace this feature with a binary feature that just says whether the data is black or white, and this may be more interpretable. 
