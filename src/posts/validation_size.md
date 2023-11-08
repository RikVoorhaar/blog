---
layout: posts
title:  "How big should my validation set be?"
date:   "2020-08-26"
categories: data-science statistics
excerpt: "Cross validation is extremely important, but how should we choose the size of our validation and test sets?"
header: 
    teaser: "/blog/validation_size/teasers/validation-data.webp"
---
<script>
    import Output from '$lib/components/markdown/Output.svelte'
</script>

In machine learning it is important to split your data into a training, validation and test set. People often use a heuristic like suggesting to split your data into sizes of 50/25/25 or 70/20/10 or something like that. Can we do better than a heuristic?

We can also do such analysis to give estimates in the uncertainty in the test scores of our models. For example, suppose we say "our model has 98% accuracy on validation and 96% on the test set", and the test set consists of 100 samples, then what is the uncertainty in this estimate of the accuracy? This also allows us to say with certainty whether or not a model is better than another.

## The Beta prior

Let's suppose we have some classication model $$f\colon \mathbb R^n\to \{0,...,n\}$$ on n-dimensional data, which we trained on $$N_{train}$$ training data points $$(X^i_{train},y^i_{train})_{1\leq i\leq N_{train}}$$. We now want to evaluate the accuracy of this model on test data $$(X^i_{test},y^i_{test})_{1\leq i \leq N_{test}}$$. We can model the chance that our model correctly guesses a test value with a probality $$p$$:

$$
    P(f(X_{test}^i) = y_{test}^i) = p
$$

This is assuming that all the test samples are equally 'hard' for our model. In practice this probality of $$p$$ can vary, but this is more difficult to model. 

Suppose now that $$N_{test}=100$$ and we got the right answer 96/100 times. Then an unbiased estimator for this probality $$p$$ is simply $$p=96\%$$, but this says nothing about the probality distribution of $$p$$. 

A common way to model probabilities is using the [Beta distribution](https://en.wikipedia.org/wiki/Beta_distribution) $$p\sim \mathrm{Beta}(\alpha,\beta)$$. This is distribution is supported on $$[0,1]$$, so it's values can be interpeted as probabilities. It depends on two parameters $$\alpha,\beta$$, and has density function:

$$
    C x^{\alpha-1}(1-x)^{\beta-1},
$$

where $$C = \Gamma(\alpha+\beta)/\Gamma(\alpha)\Gamma(\beta)$$ is a normalization constant. Now we just need to figure out how to estimate the parameters $$\alpha,\beta$$ from our experiment.

Before we did any experiment and tried our model on the test set, we know nothing about the probability $$p$$. We can therefore model it as a uniform distribution on $$[0,1]$$, or equivalently $$p\sim \mathrm{Beta}(1,1)$$. This is known as the _prior distribution_ for the random variable $$p$$. After our experiment we have new information, and we can update the values of $$\alpha$$ and $$\beta$$ to get a _posterior distribution_ for $$p$$. This process is known as Bayesian inference.

 In this case, if we have 96 sucesses and 4 failures on the test set we should update our posterior to $$p\sim \mathrm{Beta}(96+1,4+1)$$. This update rule is known as the [rule of succession](https://en.wikipedia.org/wiki/Rule_of_succession). If we choose the prior $$p\sim\mathrm{Beta}(0,0)$$ we get posterior $$p\sim \mathrm{Beta}(96,4)$$, but this has the notable disadvantage that if we somehow get 100% on the test, the resulting distribution takes value 1 with 100% probability, which is not realistic. Adding +1 to both $$\alpha$$ and $$\beta$$ is a bit more conservative in extreme cases. In general the parameters of a posterior distribution can be very difficult to compute, but in this case there is such a simple formula because the beta distribution and the binomial distribution are _conjugate priors_. 

In short:

>If we measure $$n$$ successes and $$m$$ failures, we model the resulting probability by $$p\sim \mathrm{Beta}(n+1,m+1)$$.

## Quantifying uncertainty in test results

With that out of the way, in our example of getting 96/100 right on the test set, what is the uncertainty for the probability $$p$$? We begin by plotting the distribution for $$p$$:


```python
# Define a random variable
rv = scipy.stats.beta(97,5)

# Plot its distribution
x = np.linspace(0,1,num=1000)
ticks = np.linspace(0,1,num=10)
plt.xticks(ticks=ticks,labels=[f"{t:.1f}" for t in ticks])
plt.title("Probility density function of Beta(97,5)")
plt.plot(x,rv.pdf(x))
plt.show()
print(f"mean={rv.mean()}, std={rv.std()}")
```


![svg](/blog/validation_size/validation-size_3_0.svg)


<Output>mean=0.9509803921568627, std=0.021274143540891813</Output>
    

Here we see that the actual value of $$p$$ could be anywhere in the roughly $$92-98\%$$ range, and our estimate of $$p$$ is in fact $$p=95\pm2.1\%$$. The standard deviation of $$\mathrm{Beta}(\alpha,\beta)$$ is given by

$$
    \sigma(Beta(\alpha,\beta)) = \sqrt{\frac{\alpha\beta}{(\alpha+\beta)^2}}\frac1{\sqrt{\alpha+\beta+1}} = \frac{\sqrt{\hat p(1-\hat p)}}{\sqrt{N+3}}
$$

Here $$N=\alpha+\beta$$ is the total number of trials in our experiment and $$\hat p = (\alpha+1)/(\alpha+\beta+2)$$ is the estimated probability after our experiment. This shows that the uncertainty goes down with the square root of the number of trials (which is true for pretty much anything), and that it depends non-trivially on the estimated probability $$\hat p$$. This is important, because it means the better our model performs (test score closer to 100%), the lower the uncertainty is in this test score. 

## Which model is better?

Now suppose we have a second model, (call it Model B) and we test it on the same test set. Now we get a score of 98%! We think that this Model B is better than Model A, but is it? Let's plot the Beta distribution for both probabilities:


```python
rv1 = scipy.stats.beta(96,4)
rv2 = scipy.stats.beta(98,2)
x = np.linspace(0.8,1,num=1000)
ticks = np.linspace(0.8,1,num=10)
plt.xticks(ticks=ticks,labels=[f"{t:.2f}" for t in ticks])
plt.title("Probility density function of Beta(96,4) and Beta(98,2)")
plt.plot(x,rv1.pdf(x),label="96% accuracy")
plt.plot(x,rv2.pdf(x),label="98% accuracy")
plt.legend()
plt.show()
```


![svg](/blog/validation_size/validation-size_6_0.svg)


Just going by the probability distrubutions we see a lot of overlap. We can actually estimate the probability that the second model is better than the first model. (Or rather, we can estimate the probability of rejecting the null hypothesis that the second model is not better than the first.) A crude but simple way to do this is to sample both distrubutions and then count the number of values in one distrubution that are bigger than the other. Unfortunately this is not efficient, and requires a lot of samples to produce an accurate probability.


```python
N = int(1e+6)
rv1 = scipy.stats.beta(96,4)
rv2 = scipy.stats.beta(98,2)
p_value = sum(rv1.rvs(N)>rv2.rvs(N))/N

print("probability Model A better than Model B", p_value)
```

<Output>probability Model A better than Model B 0.184565</Output>
    

There are also several statistical tests out there that do something similar. Two noteworthy ones are the fisher exact probability test, which works well for small sample sizes. And the chi-squared test, which is more efficient but innacurate for small sample sizes.


```python
_,p_value = scipy.stats.fisher_exact([[96,98],[4,2]],alternative='less')
print("Fisher exact p-value:", p_value)

_,p_value,_,_ = scipy.stats.chi2_contingency([[96,98],[4,2]])
print("chi-squared p-value:", p_value/2)

```

Either way, the conclusion is that Model B is expected to be better than Model A, but the difference is not statisticaly significant. 

## Many models

Now what if we don't just have 2 models, but dozens of different models. For example because our models depend on some hyperparameters for which we tried many different values. Then out of all these models, we want to know which is the best, and assign a probability to this. This leads to the [multiple testing problem](https://xkcd.com/882/). For example, if we have 100 different models, each getting 95% accuracy, then purely by coincidence a few of these models might be getting scores like 97% or 98% and will seem better. Since the error in the score scales with the inverse square root of the size of the test set, this problem is difficult to eliminate by just choosing a larger test set. 

Suppose we have $$n$$ models with test scores $$p_1,\dots, p_n$$, then the probability that $$p_1$$ is the biggest can by computed by

$$
    P(p_1>\max(p_2,\dots,p_n)) = P((p_1>p_2)\cup (p_1>p_3)\cup\dots\cup(p_1>p_n))
$$

This probability is very difficult to compute exactly because the events are not independent. But we do get a very useful upper bound if we assume independence:

$$
    P(p_1>\max(p_2,\dots,p_n)) \leq \sum_{i=2}^n P(p_1>p_i)
$$

These individual probabilities can then be computed with the exact Fisher test or the chi-squared test as outline above. The important thing to note is that if all these probabilities are on the same order, the probability that a particular model can be reliably identified as the best model scales linearly with the number of models we compare it to. 

In short:
> Twice the number of different models means twice the amount of precision in test score needed, which in turn means 4 times the size of the test set. 

## Why split test / validation sets are important

We don't actually use the validation set to determine which out of all our models is the best. Sometimes we might train a model, see how it does on the validation set. Then we might tweak some particular hyperparameter of the model to see if it improves the validation score. Often times it has no significant effect, and we revert it back to it's default value. Even if we do this ten times, we don't consider the resulting models to be ten different models; we consider them as equivalent. But it's also very possible that changing some parameter significantly improved the validation score just by coincidence, and in practice it did not do much. This is roughly what data scientists refer to when they say that a model can "learn the test set", although this can be also refer to our model picking up on specific biases present in the test set. Intuition is very important here as well. We use the validation set not just to determine which of our models is the best, but also to estimate whether small variations of models are significantly better or worse. 

At the end of the day, we will probably consider only a couple models to be among the best, and those are the ones we should try on the test set. We can then use the methods outlined above to determine which of these is the best.

## So how big should my validation / test set be?

It can be difficult to estimate a good size $$N$$ of the validation set in practice, since it depends on some assumptions of our models. It depends on the following variables:

- $$n_m$$: The number of different models we will compare with similar performance.
- $$p$$: The test score of the best model (on a scale of 0 to 1)
- $$\sigma$$: The difference in test score between the best and second best model

We then have 

$$
    N \simeq \frac{n_m^2 p(1-p)}{\sigma^2}
$$

The number $$n_m$$ is mainly relevant if we intend to compare several models that are roughly similar in quality, for example if we're doing hyper parameter optimization. If we expect the difference between the third-best and second-best model to be around the same as the difference between the second-best and the best model, we can leave this parameter equal to 1 in our estimation.

The same formula also applies to estimating the size of a test set. If we just want to get an estimate of the test score of a single model, or if we're just comparing two models, then we can leave $$n_m$$ at 1, but if we're comparing more models we need to take this into account. This is especially true since if we're comparing different models on the test set we already expect them to have quite similar performance.

The precision $$\sigma$$ and quality $$p$$ have an interesting interaction that works in our favor. If we compare two relatively bad models, say with qualities $$p$$ around 50%, then probably we don't need super high precision -- it's probably doesn't matter to us whether the model has score of 50% or 50.1%, so a 1% precision is fine. The factor $$p(1-p)$$ is then roughly 0.25, so we need a validation size of roughly $$0.25/(0.01)^2 = 2500$$ samples. 

On the other hand if we have two models with score around 99.0%, we would need a precision of at least 0.1%. Without the $$p(1-p)$$ factor, this means we would need one million samples, but $$p(1-p)\simeq 0.01$$, so that we only need around 10000 samples.

# Real world example: different models on MNIST

We can use everything we have learned so far to guide us in the experimental design of a real project. Let's take [the over-used MNIST dataset](http://yann.lecun.com/exdb/mnist/) as an example. For convenience we will use [the dataset found on kaggle](https://www.kaggle.com/c/digit-recognizer). This is already preprocessed into a .csv file, but it does have less samples than original (it is split into an unlabeled test-set). 

As a first step we will just import the model and train a simple linear model on it. This is a baseline, and it will help us estimate the quality of the model. To start off we will do an 80-20 training/test split, just to evaluate our baseline. 


```python
from sklearn.model_selection import train_test_split

# Load dataset
mnist = pd.read_csv("train.csv")
labels = mnist["label"]
mnist.drop("label", axis=1, inplace=True)

# Do simple train-test split
X_train, X_test, y_train, y_test = train_test_split(mnist, labels, test_size=0.2, random_state=42) 
```

## Baseline model

The baseline model we will be using is a linear support vector classifier (LinearSVC in scikit-learn). This is a very simple model, and is relatively quick to train even on large data. We will then score it by accuracy on the test set. Using the formula we saw before for the standard deviation of the beta distribution, we can estimate the error in this score:

$$
\sigma = \frac{\sqrt{\hat p(1-\hat p)}}{\sqrt{N+3}}
$$


```python
from sklearn.svm import  LinearSVC

# Fit linear support vector classification model
model = LinearSVC()
model.fit(X_train,y_train)

# Compute accuracy score and uncertainty in score
accuracy = model.score(X_test,y_test)
error = np.sqrt(accuracy*(1-accuracy)/(len(y_test)+3))
print(f'Linear SVC error: {accuracy*100:.2f} ± {error*100:.2f}%')
```

<Output>Linear SVC error: 87.08 ± 0.37%</Output>
    

## Experimental setup

This gives us a reasonable baseline. Any reasonable model shouldn't perform worse than this. The current size of the validation is not ideal, since the error in the score is still relatively big (e.g. we can't reliably identify a 0.5% improvement). But making it much bigger is also clearly not good, since this will sacrifice the quality of the model too much, and even if we make it twice bigger we only expect the error to become smaller by a factor of $$\sqrt{2}$$.

Perhaps we can work here with an 80/10/10 split, and appreciate the fact that we should not compare too many models. For example, hyperparameter tuning will likely result in overfitting on the validation data and relatively poor performance on the test set, because it is difficult to reliably identify small improvements. 

We can use this baseline model to design the following experiment:
- Divide the data into 80/10/10% training, validation and test set. 
- Only test a handful of models, preferably very different ones:
    - SVM with RBF kernel
    - Fully connected neural net
    - Convolutional neural net
    - K-nearest-neighbors
    - XGBoost
- No hyperparameter tuning. Only try a handful of hyperparameter for each model, and use standard parameters unless there is statistically significant improvement.
- Only compare the best 2 or 3 models on the test set, unless the validation set is enough to reliably identify the best model.


```python
# Split data into train, validation and test
X_train, X_test, y_train, y_test = train_test_split(mnist, labels, test_size=0.2, random_state=42) 
X_test, X_val, y_test, y_val = train_test_split(X_test, y_test, test_size=0.5, random_state=42)

# Helper function for estimating the error in the accuracy
def print_score_error(predictions, name="", test_data = None):
    if test_data is None:
        test_data = y_val

    accuracy = np.mean(np.array(predictions) == test_data)
    error = np.sqrt(accuracy*(1-accuracy)/(len(test_data)+3))
    print(f'{name} error: {accuracy*100:.2f} ± {error*100:.2f}%')
    return accuracy, error
```

## Support vector machines

Above we used support vector classification with a linear kernel. Using a different kernel can significantly improve performance by making the decision boundaries non-linear. This does however increase the number of parameters of the model, and makes it harder to train. We will be trying an RBF kernel and a degree 3 polynomial kernel. We won't be touching any of the other parameters of this model.


```python
from sklearn.svm import SVC

svc_rbf = SVC(kernel='rbf')
svc_rbf.fit(X_train, y_train)
svc_rbf_acc, svc_rbf_err = print_score_error(svc_rbf.predict(X_val),"SVC with rbf kernel")

svc_pol3 = SVC(kernel='poly',degree=3)
svc_pol3.fit(X_train, y_train)
svc_pol3_acc, svc_pol3_err = print_score_error(svc_pol3.predict(X_val),"SVC with deg 3 polynomial kernel")
```

<Output>
SVC with rbf kernel error: 97.38 ± 0.25%
SVC with deg 3 polynomial kernel error: 96.90 ± 0.27%
</Output>
    

Both models perform already much better than the linear SVC, and while the model with rbf kernel is better, this could also be coincidental. We can estimate the chance that the model with the rbf kernel is actually better:


```python
# Helper function for comparing two models
def compare_models(accuracy1, accuracy2, num_samples, name1="model1", name2="model2"):
    num_correct1 = accuracy1*num_samples
    num_incorrect1 = num_samples - num_correct1

    num_correct2 = accuracy2*num_samples
    num_incorrect2 = num_samples - num_correct2
    
    _,p_value = scipy.stats.fisher_exact([[num_correct1,num_correct2],[num_incorrect1,num_incorrect2]],alternative='less')

    print(f"Probability {name1} is better than {name2}: {p_value:.2E}")

compare_models(svc_rbf_acc, svc_pol3_acc, len(X_val), "(SVC with RBF kernel)", "(SVC with deg 3 polynomial kernel)")
```
<Output>
Probability (SVC with RBF kernel) is better than (SVC with deg 3 polynomial kernel): 9.16E-01
</Output>
    

We get a 92% chance that the RBF kernel model is better. That's far from a guarantee, but it's not bad. 

## Fully connected neural net

We will use Keras to fit a 2 layer fully connected neural network. Since we don't have that much data, we should keep the size of the hidden layers modest, otherwise we will end up with more parameters than data points. While neural networks thrive on reduncancy, and having more parameters than data points is not necessarily a problem, it is still a great recipe for overfitting.

It turns out that the final accuracy is not very senstive on the network architecture. Even with very aggressive regularization we do not seem to be getting an accuracy score surpassing 94%. The only thing that seems to have a significant effect is using a sigmoid or tanh activation function over the default relu, giving about 5% improvement (which is significant). All in all, it seems fully connected networks perform (significantly) worse than SVC. 


```python
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# 2 layer fully connected model
fc_model = keras.Sequential(
    [
        keras.Input(shape=(28*28,)),
        layers.Dense(100,activation='sigmoid'),
        layers.Dense(10, activation="softmax")
    ]
)

# train the model
fc_model.compile(loss="sparse_categorical_crossentropy", optimizer="adam", metrics=["accuracy"])
fc_model.fit(X_train, y_train, validation_data = (X_val, y_val), batch_size=128, epochs=10, verbose=0)

# Evaluate the model
prediction = np.argmax(fc_model.predict(X_val),axis=1)
fcnn_acc, fcnn_err = print_score_error(prediction,"Fully connected nn")
```

<Output>Fully connected nn error: 92.19 ± 0.41%</Output>
    

## Convolutional neural net

Convolutional neural networks are supposed to be the bread and butter of image classifcation. In fact [the keras docs use a covnet on mnist as an example](https://keras.io/examples/vision/mnist_convnet/). We can copy the architecture straight from there.

Here we seem to be getting significantly better scores than with the fully connected nerual network, and in fact the best scores so far. 


```python
# Define the model
cnn_model = keras.Sequential(
    [
        keras.Input(shape=28*28),
        layers.Reshape((28,28,1)),
        layers.Conv2D(32, kernel_size=(3, 3), activation="relu"),
        layers.MaxPooling2D(pool_size=(2, 2)),
        layers.Conv2D(64, kernel_size=(3, 3), activation="relu"),
        layers.MaxPooling2D(pool_size=(2, 2)),
        layers.Flatten(),
        layers.Dropout(0.5),
        layers.Dense(10, activation="softmax"),
    ]
)

# Train the model
cnn_model.compile(loss="sparse_categorical_crossentropy", optimizer="adam", metrics=["accuracy"])
cnn_model.fit(X_train, y_train, validation_data = (X_val, y_val), batch_size=128, epochs=10, verbose=0)

# Evaluate the model
prediction = np.argmax(cnn_model.predict(X_val),axis=1)
covnet_acc, covnet_err = print_score_error(prediction,"Convolutional neural net")
```

<Output>Convolutional neural net error: 98.26 ± 0.20%</Output>
    

Let's compare the convolutional network's scores to the SVC with RBF kernel. We get that the convolutional net is better than the SVC on the validation set with an odds ratio of 1000, which is certainly statistically significant.


```python
compare_models(svc_rbf_acc, covnet_acc, len(X_val),"(SVC with RBF kernel)","(Convolutional neural net)")
```

<Output>Probability (SVC with RBF kernel) is better than (Convolutional neural net): 9.52E-05</Output>
    

## K-nearest neighbors
The K-nearest neighbors model is another simple, but often effective model for classiciation. The most important parameter is the number of neighbors used in the model, so we can use this model with various numbers of neighbors to see if it affects the accuracy. It turns out irrespective of this parameter the accuracy is a bit worse than the SVC method.


```python
from sklearn.neighbors import KNeighborsClassifier

for n_neighbors in range(3,9):
    knn = KNeighborsClassifier(n_neighbors=n_neighbors, n_jobs=15)
    knn.fit(X_train, y_train)

    knn_acc, knn_err = print_score_error(knn.predict(X_val), f"KNN with {n_neighbors} neighbors")
```

<Output>
KNN with 3 neighbors error: 96.64 ± 0.28%
KNN with 4 neighbors error: 96.43 ± 0.29%
KNN with 5 neighbors error: 96.64 ± 0.28%
KNN with 6 neighbors error: 96.36 ± 0.29%
KNN with 7 neighbors error: 96.29 ± 0.29%
KNN with 8 neighbors error: 96.17 ± 0.30%
</Output>
    

## XGBoost

XGBoost is a popular package for gradient boosted trees. It performs exceptionally well on many problems. However, for this particular problem it seems to perform worse than the convolutional neural network, and adjusting the parameters of the model does not seem to fix this problem.


```python
import xgboost as xgb

# Create a dataset in the right form
dtrain = xgb.DMatrix(X_train, label=y_train)
dval = xgb.DMatrix(X_val, label=y_val)

# Parameters of the model
param = {'objective':'multi:softmax', 'nthread': 15, "eval_metric": "merror","num_class": 10, "max_depth": 10}

# Train and evaluate the model
bst = xgb.train(param, dtrain)
preds = bst.predict(dval)
xgb_acc, xgb_err = print_score_error(preds, f"xgboost")
```

<Output>xgboost error: 94.60 ± 0.35%</Output>
    

## Conclusion

Out of all the models tested, it seems that the convolutional neural network performs signficantly better than the others. Since we did not perform any hyperparameter optimization on it, the performance on the validation set should be an unbiased estimate of its performance on the test set. We can also conclude that our validation set size was big enough to tell which of the models we tried has the best performance. We could still perform hyperparameter optimization on the convolutional network to potentially improve performance further. 

Let's now try the convolutional model on our test set to evaluate it. 


```python
prediction = np.argmax(cnn_model.predict(X_test),axis=1)
covnet_acc, covnet_err = print_score_error(prediction,"Convolutional neural net", test_data=y_test)
```

<Output>Convolutional neural net error: 98.69 ± 0.18%</Output>
    

We actually see a slight improvement when evaluating the model on the test set. The difference is roughly two standard deviations, which may be statistically significant. This can indicate a bias in the test or validation set, although in this case it could also be purely coincidental.

# Regression models and other metrics

So far our discussion has been centered around the accuracy metric for classification problems. In principle we can use any metric, but each metric does require some analysis to estimate error. All metrics can be interpreted as a random variable, and we can in principle derive estimates of the distribution, either theoretically or through empirical methods like bootstrapping.

For example the mean square error for regression is defined by

$$
    \mathrm{MSE} = \frac1N \sum_{i=1}^N(y_i-\hat y_i)^2
$$

where $$y_i$$ are the test labels, and $$\hat y_i$$ the predicted values. This can be interpreted as the sample mean of the random variable $$(Y-\hat Y)^2$$. Sample means tend to be normally distributed if we plug in enough samples, so we could model the distribution of MSE as a normal distribution (or t-distribution), with variance obtained from the sample variance of this random variable:

$$
    \sigma^2 = \frac{1}{N-1}\sum_{i=1}^N \left((y_i-\hat y_i)^2-\mathrm{MSE}\right)^2
$$

And this method works for any metric that is obtained as a mean over all samples. Most metrics are of this form, but not all metrics (notably the area under ROC curve metric). 

In the case of MSE we may be able to do better. A central assumption of least squares regression is that the residuals $$Y-\hat Y$$ are normally distributed. Recall that the sum of $$N$$ (standard) normally distributed independent random variables follows a chi-squared distribution. In other words if we define the bias $$B$$ by

$$
    B = \frac1n\sum y_i-\hat y_i
$$

Then $$Y-\hat Y$$ is normally distributed with mean $$B$$ and variance $$\mathrm{MSE}-B^2$$ (ignoring the Bessel correction). Therefore 

$$
    \chi_Y := \sum_{i=1}^N \frac{(y_i-\hat y_i)^2}{\sqrt{\mathrm{MSE}-B^2}}
$$

has a non-central chi-squared distribution with $$N$$ degrees of freedom and mean $$\lambda = N \cdot \mathrm{MSE}$$. The variance of $$\chi_Y$$ is $$2N(1+2 \mathrm{MSE})$$, so we can easily deduce that

$$
    \mathrm{Var}\left(\frac1N\sum_{i=1}^N(y_i-\hat y_i)^2\right) = \frac{2(\mathrm{MSE}-B^2)(1+2\mathrm{MSE})}{N}
$$

which may be a more accurate measure. 

# Summary

The big takeaway from all of this is that we should keep the error in our performance metrics into account both during development and evaluation. It can be very easy to mistake small improvements in evaluation metrics for genuine increase in performance if we don't have an estimate of the precision in our metrics. Also unless there is reason to think the test set may be biased in some way, there is no problem with comparing multiple models on the test set, so long as we take statistical significance into account.
