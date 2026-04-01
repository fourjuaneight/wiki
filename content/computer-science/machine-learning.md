---
title: "Machine Learning"
date: 2026-02-02
updated: 2026-03-19
draft: false
tags:
  - ai
  - algorithms
  - deep-learning
  - machine-learning
  - statistics
---

**Machine learning (ML)** is a subfield of artificial intelligence in which computer systems improve their performance on tasks through experience rather than explicit programming. Tom Mitchell provided the field's most widely cited formal definition: a computer program is said to learn from experience *E* with respect to some task *T* and performance measure *P*, if its performance on *T*, as measured by *P*, improves with experience *E*[^mitchell1997]. In practice, this means a spam filter that grows more accurate after processing thousands of labeled emails, or a medical imaging system that becomes better at detecting tumors after reviewing many annotated scans, are both performing machine learning.

## History

The term "machine learning" was coined by Arthur Samuel in 1959, who demonstrated the concept by building a checkers-playing program capable of improving its performance by playing games against itself — outpacing the skill of its own creator[^samuel1959]. Serious theoretical foundations were developed throughout the 1980s and 1990s. Frank Rosenblatt's *perceptron* model[^rosenblatt1958] provided an early computational framework inspired by biological neurons. Christopher Bishop's *Pattern Recognition and Machine Learning*[^bishop2006] established a probabilistic, Bayesian framework for the field, while Hastie, Tibshirani, and Friedman's *The Elements of Statistical Learning*[^hastieTibshirani2009] connected ML methods to classical statistical theory.

## The Machine Learning Pipeline

Building a machine learning model follows a structured sequence of stages.

**Data collection and preparation** is the foundation of any ML system. Real-world data contains missing values, noisy records, and formatting inconsistencies that must be resolved before training can begin. Kotsiantis et al.[^kotsiantis2006] documented that unaddressed redundancy and noise make knowledge discovery substantially more difficult.

**Feature selection** determines which input variables the model will use. Guyon and Elisseeff[^guyonElisseeff2003] established the standard taxonomy of methods — *filters*, which rank variables statistically; *wrappers*, which evaluate subsets by training a model on each; and *embedded methods*, which fold selection into the optimization process. Removing irrelevant features reduces overfitting and speeds up training.

**Training** is the computational process in which the model adjusts its internal parameters to minimize a *loss function* — a mathematical measure of prediction error. The dominant optimization technique is gradient descent, adapted for large-scale data via stochastic variants[^robbinsMonro1951]. For neural networks, the backpropagation algorithm, introduced by Rumelhart, Hinton, and Williams[^rumelhart1986], uses the chain rule of calculus to efficiently compute gradients across multiple layers.

**Evaluation** tests whether a trained model generalizes to unseen data. Kohavi[^kohavi1995] demonstrated that ten-fold stratified cross-validation is the most reliable estimation method. Common metrics include *accuracy*, *precision*, *recall*, the *F1-score*, and *ROC-AUC* analysis[^fawcett2006].

A central challenge throughout is the **bias-variance tradeoff**: models that are too simple produce systematic errors (high bias), while models that are too complex are sensitive to noise in training data (high variance). Geman, Bienenstock, and Doursat[^geman1992] formalized this decomposition of total prediction error.

## Learning Paradigms

Machine learning algorithms are grouped into paradigms based on the type of feedback they receive during training.

**Supervised learning** is the most common paradigm. Algorithms receive labeled input-output pairs and learn a function mapping inputs to outputs. When the output is categorical, the task is called *classification*; when continuous, it is *regression*[^vapnik1995].

**Unsupervised learning** operates without labels. Algorithms discover hidden structure in raw data — clusters of similar observations, compressed representations, or underlying probability distributions[^jain2010].

**Reinforcement learning** frames learning as sequential decision-making. An agent interacts with an environment, receives scalar rewards, and learns a *policy* that maximizes cumulative reward over time. The core challenge is the exploration-exploitation dilemma[^suttonBarto2018].

**Semi-supervised learning** combines a small labeled dataset with a larger unlabeled one, making it practical when annotation is expensive[^chapelle2006]. **Self-supervised learning** generates training signals from data structure itself — for example, predicting masked words in a sentence[^jaiswal2021]. **Transfer learning** applies knowledge gained on one task to a different but related task, particularly useful when target-domain data is scarce[^panYang2010].

## Key Algorithms

**Decision trees** classify inputs by applying a sequence of yes-or-no tests on feature values. Quinlan's ID3 and C4.5 algorithms select test conditions using information gain and gain ratio, respectively[^quinlan1986]. Breiman et al.'s CART[^breiman1984] introduced binary trees and the Gini impurity criterion.

**Support vector machines (SVMs)**, introduced by Cortes and Vapnik[^cortesVapnik1995], find the hyperplane that separates classes with the maximum possible margin. The *kernel trick* allows SVMs to handle non-linearly separable data by implicitly mapping inputs into higher-dimensional spaces.

**Neural networks** stack layers of interconnected units that learn hierarchical representations. Convolutional neural networks (CNNs) exploit spatial structure for image tasks[^lecun1998]; Long Short-Term Memory networks (LSTMs) handle sequential data over long time horizons[^hochreiter1997]; and the Transformer architecture, which uses self-attention mechanisms, underpins all modern large language models[^vaswani2017].

**Ensemble methods** improve performance by combining multiple models. Random Forests aggregate hundreds of decision trees trained on random data subsets[^breiman2001]. AdaBoost trains weak classifiers sequentially, increasing the weight of previously misclassified examples[^freundSchapire1997]. Gradient Boosting fits successive models to the residual errors of predecessors[^friedman2001].

## Applications

Machine learning is applied across nearly every major domain. In healthcare, Esteva et al.[^esteva2017] demonstrated that a CNN trained on over 129,000 clinical images matched board-certified dermatologists in diagnosing skin cancer. In natural language processing, Devlin et al.[^devlin2019] showed that the BERT model surpassed human performance on standard reading comprehension benchmarks. Jumper et al.[^jumper2021] used deep learning to predict protein structures with atomic accuracy across the majority of the human proteome — a problem that had resisted experimental methods for decades.

## Limitations and Challenges

Despite its impact, machine learning faces significant limitations. Many high-performing models are opaque; Rudin[^rudin2019] argued that post-hoc explanations of black-box models are fundamentally unreliable, particularly in high-stakes settings such as medicine and criminal justice. Algorithmic bias is a systemic concern: Buolamwini and Gebru[^buolamwini2018] found error rates for darker-skinned women up to 34.7% in commercial facial recognition systems, compared to 0.8% for lighter-skinned men. Adversarial vulnerability is another concern — Goodfellow, Shlens, and Szegedy[^goodfellow2015] showed that imperceptible perturbations to inputs can cause neural networks to misclassify with high confidence. The environmental cost of training large models is also substantial: Strubell, Ganesh, and McCallum[^strubell2019] estimated that training a large Transformer with neural architecture search produces roughly 626,155 pounds of CO₂ equivalent. Finally, reproducibility remains an open challenge: Kapoor and Narayanan[^kapoorNarayanan2023] identified pervasive data leakage across ML-based research papers, signaling a systematic quality problem in the field.

[^bishop2006]: Bishop, C. M. (2006). *Pattern recognition and machine learning*. Springer.
[^breiman1984]: Breiman, L., Friedman, J., Olshen, R., & Stone, C. (1984). *Classification and regression trees*. Wadsworth.
[^breiman2001]: Breiman, L. (2001). Random forests. *Machine Learning, 45*(1), 5–32.
[^brown2020]: Brown, T. B., et al. (2020). Language models are few-shot learners. *Advances in Neural Information Processing Systems, 33*, 1877–1901.
[^buolamwini2018]: Buolamwini, J., & Gebru, T. (2018). Gender shades: Intersectional accuracy disparities in commercial gender classification. *Proceedings of the 1st Conference on Fairness, Accountability and Transparency*, 77–91.
[^chapelle2006]: Chapelle, O., Schölkopf, B., & Zien, A. (Eds.). (2006). *Semi-supervised learning*. MIT Press.
[^cortesVapnik1995]: Cortes, C., & Vapnik, V. (1995). Support-vector networks. *Machine Learning, 20*(3), 273–297.
[^devlin2019]: Devlin, J., Chang, M. W., Lee, K., & Toutanova, K. (2019). BERT: Pre-training of deep bidirectional transformers for language understanding. *Proceedings of NAACL-HLT 2019*, 4171–4186.
[^esteva2017]: Esteva, A., et al. (2017). Dermatologist-level classification of skin cancer with deep neural networks. *Nature, 542*(7639), 115–118.
[^fawcett2006]: Fawcett, T. (2006). An introduction to ROC analysis. *Pattern Recognition Letters, 27*(8), 861–874.
[^freundSchapire1997]: Freund, Y., & Schapire, R. E. (1997). A decision-theoretic generalization of on-line learning and an application to boosting. *Journal of Computer and System Sciences, 55*(1), 119–139.
[^friedman2001]: Friedman, J. H. (2001). Greedy function approximation: A gradient boosting machine. *Annals of Statistics, 29*(5), 1189–1232.
[^geman1992]: Geman, S., Bienenstock, E., & Doursat, R. (1992). Neural networks and the bias/variance dilemma. *Neural Computation, 4*(1), 1–58.
[^goodfellow2015]: Goodfellow, I. J., Shlens, J., & Szegedy, C. (2015). Explaining and harnessing adversarial examples. *International Conference on Learning Representations (ICLR).*
[^guyonElisseeff2003]: Guyon, I., & Elisseeff, A. (2003). An introduction to variable and feature selection. *Journal of Machine Learning Research, 3*, 1157–1182.
[^hastieTibshirani2009]: Hastie, T., Tibshirani, R., & Friedman, J. (2009). *The elements of statistical learning* (2nd ed.). Springer.
[^he2016]: He, K., Zhang, X., Ren, S., & Sun, J. (2016). Deep residual learning for image recognition. *Proceedings of IEEE CVPR*, 770–778.
[^hochreiter1997]: Hochreiter, S., & Schmidhuber, J. (1997). Long short-term memory. *Neural Computation, 9*(8), 1735–1780.
[^jain2010]: Jain, A. K. (2010). Data clustering: 50 years beyond K-means. *Pattern Recognition Letters, 31*(8), 651–666.
[^jaiswal2021]: Jaiswal, A., Babu, A. R., Zadeh, M. Z., Banerjee, D., & Makedon, F. (2021). A survey on contrastive self-supervised learning. *Technologies, 9*(1), 2.
[^jumper2021]: Jumper, J., et al. (2021). Highly accurate protein structure prediction with AlphaFold. *Nature, 596*(7873), 583–589.
[^kapoorNarayanan2023]: Kapoor, S., & Narayanan, A. (2023). Leakage and the reproducibility crisis in machine-learning-based science. *Patterns, 4*(9), 100804.
[^kohavi1995]: Kohavi, R. (1995). A study of cross-validation and bootstrap for accuracy estimation and model selection. *Proceedings of the 14th IJCAI*, 2, 1137–1145.
[^kotsiantis2006]: Kotsiantis, S. B., Kanellopoulos, D., & Pintelas, P. E. (2006). Data preprocessing for supervised learning. *International Journal of Computer Science, 1*(2), 111–117.
[^krizhevsky2012]: Krizhevsky, A., Sutskever, I., & Hinton, G. E. (2012). ImageNet classification with deep convolutional neural networks. *Advances in Neural Information Processing Systems, 25*, 1097–1105.
[^lecun1998]: LeCun, Y., Bottou, L., Bengio, Y., & Haffner, P. (1998). Gradient-based learning applied to document recognition. *Proceedings of the IEEE, 86*(11), 2278–2324.
[^mitchell1997]: Mitchell, T. M. (1997). *Machine learning*. McGraw-Hill.
[^panYang2010]: Pan, S. J., & Yang, Q. (2010). A survey on transfer learning. *IEEE Transactions on Knowledge and Data Engineering, 22*(10), 1345–1359.
[^quinlan1986]: Quinlan, J. R. (1986). Induction of decision trees. *Machine Learning, 1*(1), 81–106.
[^robbinsMonro1951]: Robbins, H., & Monro, S. (1951). A stochastic approximation method. *Annals of Mathematical Statistics, 22*(3), 400–407.
[^rosenblatt1958]: Rosenblatt, F. (1958). The perceptron: A probabilistic model for information storage and organization in the brain. *Psychological Review, 65*(6), 386–408.
[^rudin2019]: Rudin, C. (2019). Stop explaining black box machine learning models for high stakes decisions and use interpretable models instead. *Nature Machine Intelligence, 1*(5), 206–215.
[^rumelhart1986]: Rumelhart, D. E., Hinton, G. E., & Williams, R. J. (1986). Learning representations by back-propagating errors. *Nature, 323*(6088), 533–536.
[^samuel1959]: Samuel, A. L. (1959). Some studies in machine learning using the game of checkers. *IBM Journal of Research and Development, 3*(3), 210–229.
[^strubell2019]: Strubell, E., Ganesh, A., & McCallum, A. (2019). Energy and policy considerations for deep learning in NLP. *Proceedings of ACL 2019*, 3645–3650.
[^suttonBarto2018]: Sutton, R. S., & Barto, A. G. (2018). *Reinforcement learning: An introduction* (2nd ed.). MIT Press.
[^topol2019]: Topol, E. J. (2019). High-performance medicine: The convergence of human and artificial intelligence. *Nature Medicine, 25*(1), 44–56.
[^vapnik1995]: Vapnik, V. N. (1995). *The nature of statistical learning theory*. Springer.
[^vaswani2017]: Vaswani, A., et al. (2017). Attention is all you need. *Advances in Neural Information Processing Systems, 30*, 5998–6008.
