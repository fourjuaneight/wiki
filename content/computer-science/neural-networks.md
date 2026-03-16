---
title: "Neural Network (Artificial)"
date: 2026-01-05
draft: false
tags:
  - machine-learning
  - deep-learning
  - neural-networks
  - computer-science
  - ai
---

An **artificial neural network** (ANN) — often called simply a **neural network** — is a type of computer program loosely modeled on the way the human brain processes information. Instead of following a fixed set of hand-coded rules, a neural network learns by example: it is shown large amounts of data, and it gradually adjusts its internal settings until it can make accurate predictions on its own. Neural networks are the engine behind modern **deep learning**, a branch of machine learning that has achieved breakthrough results in tasks like recognizing faces in photos, translating languages, and generating speech.

What makes deep neural networks especially powerful is their ability to learn *hierarchical representations* — that is, to build understanding layer by layer. Early layers in the network pick up on simple, low-level patterns like edges and colors. Deeper layers combine those basic patterns into more complex ideas, eventually recognizing whole objects, faces, or scenes (Yosinski et al., 2015). This layered approach allows the network to discover useful structure in raw data without anyone needing to tell it what to look for — a major advantage over older machine learning techniques that required experts to manually define the features a model should use.


## History

The story of neural networks begins in 1943, when neurophysiologist Warren McCulloch and mathematician Walter Pitts described the first mathematical model of an artificial neuron (McCulloch & Pitts, 1943). Their "neuron" was a simple on/off switch: it added up a set of numerical inputs, and if the total passed a threshold, it fired a signal. The model had no ability to learn, but it was a landmark proof of concept — showing that brain-like computation could be expressed in formal mathematics.

The first *trainable* neural network came in 1958, when psychologist Frank Rosenblatt built the **perceptron** — a single artificial neuron that could adjust its own settings based on feedback from labeled examples (Rosenblatt, 1958). If it made a wrong prediction, it nudged its weights in the right direction and tried again. This was a genuine learning machine, not a hard-coded program. However, the perceptron could only solve problems where the answer could be drawn as a straight dividing line in the data, and interest faded once these limits became clear.

The critical breakthrough came in 1986, when David Rumelhart, Geoffrey Hinton, and Ronald Williams published a paper in *Nature* introducing the **backpropagation algorithm** for training networks with multiple layers (Rumelhart et al., 1986). This made it possible, for the first time, for networks to develop rich internal representations inside their hidden layers — not just at the input or output. Yann LeCun and colleagues then applied these ideas to image processing, first recognizing handwritten zip codes (LeCun et al., 1989) and later building the LeNet-5 architecture for reading bank checks, along with the MNIST dataset that became a standard benchmark for decades (LeCun et al., 1998). The modern deep learning era arrived decisively in 2012, when Krizhevsky, Sutskever, and Hinton entered a deep convolutional network called AlexNet into the ImageNet image recognition competition and won by a margin so large it changed the direction of the entire field (Krizhevsky et al., 2012).

## Architecture and structure

A neural network is built from stacked *layers* — groups of simple computing units called **neurons** (or nodes). Data always travels in one direction: from the **input layer**, which receives raw information (such as the pixel values of an image), through one or more **hidden layers**, which transform that information step by step, and finally to the **output layer**, which produces a result — for example, the name of the object in the photo. Networks with many hidden layers are called *deep neural networks* (DNNs); the word "deep" refers to this stack of layers between input and output (Goodfellow et al., 2016).

### Neurons, weights, and the forward pass

Each neuron does a straightforward calculation. It receives a set of numbers from the previous layer, multiplies each one by a corresponding **weight** (a number reflecting how important that input is), adds them all up, and then adds one more adjustable number called a **bias**. If a neuron receives inputs x₁, x₂, …, xₙ with learned weights w₁, w₂, …, wₙ and bias *b*, the sum it computes — called the *pre-activation value* — is:

```
z = w₁x₁ + w₂x₂ + … + wₙxₙ + b
```

Think of the weights as volume knobs: a high weight means "pay close attention to this input," while a weight near zero means "mostly ignore it." The bias acts like a baseline offset, giving the neuron a little extra flexibility.

After computing *z*, the neuron passes it through an **activation function** — a mathematical operation that decides what signal to send forward. The neuron's final output is `a = f(z)`. When this process runs across every neuron from the first layer to the last, it is called the **forward pass** — data flows forward through the network until a prediction emerges at the output (Goodfellow et al., 2016).

### Layer types and feature hierarchies

One of the most striking discoveries in deep learning research is that networks spontaneously learn to organize knowledge in a natural hierarchy — not because anyone designed them to, but because this structure turns out to be the most useful way to solve the problem (Yosinski et al., 2015; Zeiler & Fergus, 2014):

| Layer depth | What the network tends to detect |
|-------------|----------------------------------|
| Layers 1–2 | Oriented edges, patches of color, simple textures |
| Layers 3–4 | Corners, curves, repeating patterns, and object parts (e.g., eyes, wheels) |
| Layer 5+ | Whole objects, faces, scenes, and abstract categories |

For example, Zeiler and Fergus (2014) trained a network purely to sort images into categories, and found that somewhere in its middle layers the network had quietly built its own face detector and text detector — even though faces and text were never labeled in the training data. The network discovered these concepts because they were useful stepping stones toward its actual goal.

## Training and backpropagation

A newly created neural network starts with random weights — it knows nothing. Training is the process of adjusting every weight and bias until the network makes reliable predictions. This adjustment is guided by a **loss function**, a formula that measures how wrong the network's current answer is. The goal of training is to make the loss as small as possible (Goodfellow et al., 2016). The main algorithm for doing this is **backpropagation**, made widely accessible by Rumelhart, Hinton, and Williams (1986).

### The training loop

Each cycle of training involves three steps:

1. **Forward pass** — Feed a batch of training examples through the network and collect its predictions.
2. **Compute the loss** — Compare the predictions to the correct answers using the loss function. Common choices include *cross-entropy loss* for classification problems (e.g., "is this a cat or a dog?") and *mean squared error* for numeric predictions.
3. **Backpropagation** — Work backwards through the network, layer by layer, using calculus (specifically the *chain rule*) to figure out how much each individual weight contributed to the error. This produces a *gradient* for every weight — a number that indicates, in effect, "if you increase this weight slightly, the error goes up or down by this much."

Once the gradients are known, every weight is nudged slightly in the direction that reduces the loss. This nudge is described by the **gradient descent update rule**:

```
w ← w − η · (∂L / ∂w)
```

Here, *w* is a weight, *L* is the loss, and ∂L/∂w is that weight's gradient — how steeply the loss changes when the weight changes. The symbol η ("eta") is the **learning rate** — a small number, typically around 0.001, that controls how large each nudge is. Set it too large and the weights overshoot the target and bounce around unpredictably; set it too small and training crawls. This three-step cycle is repeated thousands or millions of times, each time on a fresh batch of data, until the network's predictions become reliably accurate (Goodfellow et al., 2016).

### The black box problem

Even after successful training, there is a frustrating limitation: the final set of weights is extremely difficult to interpret. A model like AlexNet has around 60 million individual weight values (Krizhevsky et al., 2012). No one can read those numbers and understand *why* the network makes a particular decision — the reasoning is spread across millions of interacting parts with no single, legible explanation. Yosinski et al. (2015) identified this as one of the central challenges in the field, arguing that developing tools to look inside trained networks is just as important as building more powerful ones.

## Activation functions

If every neuron simply computed a weighted sum and passed it along unchanged, stacking dozens of layers would be mathematically pointless — the whole network would collapse into a single straight-line equation, no matter how deep it was. **Activation functions** prevent this by introducing *nonlinearity*: a bend or kink in the neuron's output that allows the network to represent curved, complex relationships in data.

The theoretical basis for this was established by Cybenko (1989), whose **universal approximation theorem** proved that a neural network with even a single hidden layer — provided it uses a nonlinear activation function — can, in principle, approximate any continuous mathematical function to any desired level of precision. This result provided fundamental reassurance that the approach was sound: a set of weights exists, at least theoretically, that will make the network do whatever you need.

### From sigmoid to ReLU

Early networks used the **sigmoid** function, σ(z) = 1 / (1 + e⁻ᶻ), which squashes any input into a smooth S-shaped curve with outputs between 0 and 1. Related to it is the **hyperbolic tangent** (tanh), which squashes inputs to a range of −1 to +1. Both are mathematically well-behaved, but share a practical drawback called the **vanishing gradient problem**. When inputs are very large or very small, both functions become nearly flat — their gradients approach zero. During backpropagation, gradients are multiplied together as they travel backward through the layers. Multiply many near-zero values together and you get an even tinier number, meaning that weight updates in the early layers become negligibly small and those layers effectively stop learning.

The **Rectified Linear Unit**, or **ReLU**, defined as:

```
f(z) = max(0, z)
```

cuts through this problem directly. For any positive input, ReLU passes it through unchanged. For any negative input, it outputs exactly zero. This may sound almost too simple, but Glorot, Bordes, and Bengio (2011) demonstrated that ReLU outperforms sigmoid and tanh in deep networks: it allows gradients to flow backward without shrinking them (for positive values), it creates *sparsity* by switching off neurons with negative inputs, and it is far cheaper to compute than exponential functions like sigmoid. ReLU has since become the default activation function in most deep learning architectures.

## Regularization

A neural network with millions of weights has an enormous capacity to memorize data. Given enough training time, it can learn not just the general patterns in the data but every quirk, noise artifact, and coincidence in the specific training examples it was shown — a problem called **overfitting**. An overfit network performs brilliantly on training data and poorly on new, unseen examples, because it has memorized rather than generalized. **Regularization** is a family of techniques that constrain the network during training to discourage memorization and encourage genuinely useful pattern recognition.

### L2 weight decay

**L2 regularization**, also called **weight decay**, works by adding an extra penalty term to the loss function that grows with the size of the weights. The network is trained not just to minimize prediction error, but to minimize prediction error *while also keeping its weights small*. Very large weights are a warning sign — they indicate the network is relying heavily on specific input quirks, exactly the fragile, overfitted behavior we want to avoid.

In practice, weight decay is applied as a small multiplicative shrinkage at every training step:

```
w ← (1 − θ) · w
```

where θ is a small decay rate (e.g., 0.0001). Each update pulls every weight slightly toward zero. Krogh and Hertz (1991) provided the formal analysis showing why this helps: it suppresses weight components driven by noise in the training data rather than real signal, producing a smoother, more robust learned function.

### Dropout

**Dropout** takes a more dramatic approach: during each training step, it randomly switches off a fraction of the neurons in the hidden layers — typically half of them — by setting their outputs to zero (Hinton et al., 2012; Srivastava et al., 2014). The neurons dropped out change randomly with every batch. This forces the network to avoid leaning too heavily on any particular group of neurons, because any neuron might be absent on the next training step, every neuron has to be useful on its own.

A helpful analogy: it is like training a team where any player might be absent on any given day. Rather than devising strategies that depend on one star player always being available, each team member develops versatile, independent skills.

At test time, dropout is turned off and all neurons are active. Their outputs are scaled down by the fraction that was active during training — for example, multiplied by 0.5 if half the neurons were randomly dropped — which approximates averaging the predictions of all the different sub-networks that were implicitly trained during dropout. Srivastava et al. (2014) demonstrated dropout's effectiveness across image, speech, and text tasks, with a retention probability of 0.5 per hidden layer serving as a solid practical default.

## Convolutional neural networks

A **convolutional neural network** (CNN, or convnet) is a specialized neural network architecture designed for data with meaningful spatial structure — most importantly, images. In a standard fully connected neural network, every neuron in one layer connects to every neuron in the next, which requires an enormous number of weights and treats every input position as equally related to every other. For images this is wasteful: a pixel in the top-left corner does not need a direct connection to every pixel in the bottom-right corner to detect whether a cat is present.

CNNs address this with **convolutional layers**, which apply small learned filters — typically 3×3 or 5×5 grids of weights — by sliding them across the entire image one patch at a time. Crucially, the *same* filter is reused at every position. This is called **weight sharing**, and it offers two key advantages. First, it drastically reduces the number of parameters: instead of a unique weight for every input-output pair, a layer needs only enough weights to fill one small filter. Second, it encodes the assumption of **translation invariance** — the idea that a horizontal edge looks the same whether it appears at the top, middle, or bottom of an image (LeCun et al., 1989; LeCun et al., 1998). A filter trained to detect edges will detect them anywhere.

The power of this design was proven conclusively by Krizhevsky, Sutskever, and Hinton (2012) with **AlexNet**, a deep CNN with five convolutional layers and three fully connected layers totaling around 60 million parameters, trained across two GPUs simultaneously. AlexNet entered the 2012 ImageNet Large Scale Visual Recognition Challenge and achieved a top-5 error rate of 15.3% — meaning it correctly identified the object in over 84% of test images within its top five guesses. The next-best competitor scored 26.2%. This roughly 11 percentage point gap shocked the computer vision community and triggered a rapid, industry-wide shift toward deep learning. AlexNet combined several innovations at once — ReLU activations, dropout regularization, GPU training, and data augmentation — establishing a template that influenced virtually every CNN architecture that followed.

## Visualization and interpretability

Neural networks are commonly described as **black boxes**: despite the fact that every weight is a known number, the overall computation is so distributed and nonlinear across millions of parameters that it is very difficult to understand *why* a network makes a particular decision. Opening this black box has become an active research area, and several important visualization techniques have emerged.

### Deconvolutional visualization

Zeiler and Fergus (2014) developed the **deconvnet** (deconvolutional network) method to answer a simple but hard question: *what pattern in an input image is a given neuron actually responding to?* The idea is to run the network in reverse — starting from a single neuron's activation and working backward through the layers, reversing the convolution and pooling operations, until a picture is reconstructed in pixel space. This picture shows what the neuron "cares about."

Applied to AlexNet, the method revealed the feature hierarchy described earlier — edges in layer 1, textures and shapes in the middle layers, whole objects in the deeper layers. It also showed that intermediate layers develop detectors for concepts like faces and text even though neither was explicitly labeled in training. Beyond being intellectually illuminating, this was practically useful: the visualizations exposed problems in AlexNet's first-layer filters, which Zeiler and Fergus corrected in their improved ZFNet architecture, which went on to win the ImageNet 2013 competition.

### Gradient-based saliency maps

Simonyan, Vedaldi, and Zisserman (2014) introduced two related techniques. The first, **class model visualization**, starts from a blank image and repeatedly tweaks its pixel values via *gradient ascent* — the opposite of gradient descent — until the network's confidence score for a target class (e.g., "flamingo") is maximized. The resulting image, though often abstract-looking, reveals the kinds of visual patterns the network associates with that class.

The second technique, **class saliency maps**, asks a different question: given a *specific* image, which pixels matter most for the classification? This is answered by computing the gradient of the class score with respect to each input pixel — essentially asking, "if I changed this pixel slightly, how much would the network's answer change?" Pixels with large gradients are the most influential and are highlighted in the saliency map. As a practical bonus, these maps can pinpoint where an object is located in an image even when the network was only ever trained to classify the whole image, a technique known as *weakly supervised object localization*.

### Regularized optimization and live visualization

Yosinski et al. (2015) advanced both lines of research with two open-source tools. The first plots every neuron's activation in real time as a live webcam feed passes through a trained network, letting users move objects in front of the camera and immediately see which neurons respond. This hands-on approach proved especially valuable for building intuitions: the researchers found, for instance, that channel 151 in the fifth convolutional layer of AlexNet reliably activates for human faces, animal faces, and even lion faces — despite the network never having been trained on a face category.

The second tool improves the clarity of gradient ascent images by applying four complementary **regularization techniques** during the optimization process:

- **L2 decay** prevents a small number of extreme pixel values from dominating the image.
- **Gaussian blurring** suppresses unrealistic high-frequency noise patterns.
- **Small-norm pixel clipping** sets barely active pixels to exactly zero, producing a cleaner image with a clear foreground subject.
- **Small-contribution pixel clipping** removes pixels that contribute negligibly to the neuron's activation.

Together, these techniques produce visualizations that are clearly interpretable — a meaningful improvement over earlier methods, which tended to generate abstract, noisy images that were hard to make sense of.

A recurring finding across all of these visualization studies is that the representations learned in deeper convolutional layers tend to be *local* rather than broadly distributed: individual channels specialize in recognizable concepts like faces, wheels, or text, even when those concepts were never directly labeled in training. This suggests that networks are not simply memorizing training images, but discovering genuinely useful structure in the visual world.

> "Understanding what is learned is interesting in its own right, but it is also one key way of further improving models: the intuitions provided by understanding the current generation of models should suggest ways to make them better."
> — Yosinski et al. (2015)

## References

- Cybenko, G. (1989). Approximation by superpositions of a sigmoidal function. *Mathematics of Control, Signals, and Systems, 2*(4), 303–314. https://doi.org/10.1007/BF02551274

- Glorot, X., Bordes, A., & Bengio, Y. (2011). Deep sparse rectifier neural networks. *Proceedings of AISTATS, PMLR 15*, 315–323.

- Goodfellow, I., Bengio, Y., & Courville, A. (2016). *Deep learning.* MIT Press.

- Hinton, G. E., Srivastava, N., Krizhevsky, A., Sutskever, I., & Salakhutdinov, R. R. (2012). Improving neural networks by preventing co-adaptation of feature detectors. *arXiv preprint arXiv:1207.0580*. https://arxiv.org/abs/1207.0580

- Krizhevsky, A., Sutskever, I., & Hinton, G. E. (2012). ImageNet classification with deep convolutional neural networks. In *Advances in Neural Information Processing Systems 25* (pp. 1097–1105). Curran Associates.

- Krogh, A., & Hertz, J. A. (1991). A simple weight decay can improve generalization. In *Advances in Neural Information Processing Systems 4* (pp. 950–957). Morgan Kaufmann.

- LeCun, Y., Boser, B., Denker, J. S., Henderson, D., Howard, R. E., Hubbard, W., & Jackel, L. D. (1989). Backpropagation applied to handwritten zip code recognition. *Neural Computation, 1*(4), 541–551. https://doi.org/10.1162/neco.1989.1.4.541

- LeCun, Y., Bottou, L., Bengio, Y., & Haffner, P. (1998). Gradient-based learning applied to document recognition. *Proceedings of the IEEE, 86*(11), 2278–2324. https://doi.org/10.1109/5.726791

- McCulloch, W. S., & Pitts, W. (1943). A logical calculus of the ideas immanent in nervous activity. *Bulletin of Mathematical Biophysics, 5*(4), 115–133. https://doi.org/10.1007/BF02478259

- Rosenblatt, F. (1958). The perceptron: A probabilistic model for information storage and organization in the brain. *Psychological Review, 65*(6), 386–408. https://doi.org/10.1037/h0042519

- Rumelhart, D. E., Hinton, G. E., & Williams, R. J. (1986). Learning representations by back-propagating errors. *Nature, 323*(6088), 533–536. https://doi.org/10.1038/323533a0

- Simonyan, K., Vedaldi, A., & Zisserman, A. (2014). Deep inside convolutional networks: Visualising image classification models and saliency maps. *ICLR 2014 Workshop.* arXiv:1312.6034.

- Srivastava, N., Hinton, G., Krizhevsky, A., Sutskever, I., & Salakhutdinov, R. (2014). Dropout: A simple way to prevent neural networks from overfitting. *Journal of Machine Learning Research, 15*(56), 1929–1958.

- Yosinski, J., Clune, J., Nguyen, A., Fuchs, T., & Lipson, H. (2015). Understanding neural networks through deep visualization. *Deep Learning Workshop, ICML 2015.* arXiv:1506.06579.

- Zeiler, M. D., & Fergus, R. (2014). Visualizing and understanding convolutional networks. In *ECCV 2014, LNCS Vol. 8689* (pp. 818–833). Springer. https://doi.org/10.1007/978-3-319-10590-1_53
 