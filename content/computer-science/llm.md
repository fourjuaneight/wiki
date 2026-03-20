---
title: "Large Language Models"
date: 2026-03-06
updated: 2026-03-19
draft: false
tags:
  - ai
  - deep-learning
  - machine-learning
  - transformers
---

**Large Language Models (LLMs)** are a class of artificial intelligence systems capable of generating, translating, summarizing, and reasoning about human language with remarkable fluency. Built on deep neural networks and trained on vast quantities of text, they represent one of the most significant developments in modern computing. Systems such as OpenAI's GPT-4, Meta's LLaMA, and Anthropic's Claude have demonstrated the ability to pass professional examinations, write and explain code, and engage in nuanced dialogue — capabilities that have sparked intense debate about the nature of machine intelligence.[^yildirimPaul2024]

## Background and History

The modern LLM emerged from decades of research in neural networks and natural language processing (NLP). Early statistical language models could predict the next word in a sequence using simple probability tables, but they struggled to capture long-range dependencies in text. The introduction of recurrent neural networks (RNNs) in the 1980s and 1990s offered some improvement, and the attention mechanism — which allowed a model to dynamically focus on relevant parts of its input — marked a critical conceptual leap.[^bahdanau2015]

The true turning point came in 2017, when Vaswani et al. published *Attention Is All You Need*, introducing the **Transformer architecture**. By replacing recurrence entirely with self-attention, transformers could be trained with massive parallelism, making Internet-scale training feasible for the first time. With more than 161,000 citations, it is among the most consequential papers in the history of machine learning.[^vaswani2017]

The following years brought rapid scaling. OpenAI's GPT-2 (1.5 billion parameters) demonstrated that a model trained solely to predict the next word spontaneously acquired the ability to translate, summarize, and answer questions.[^radford2019] GPT-3, with 175 billion parameters, then established that providing a few examples directly in the prompt — a technique called **in-context learning** — could elicit strong performance across hundreds of tasks without any retraining.[^brown2020] This finding fundamentally changed how researchers thought about AI capability.

## How LLMs Work

### The Core Task: Next-Token Prediction

At their heart, LLMs are trained to solve a deceptively simple problem: given a sequence of words, predict what comes next. The unit of prediction is technically a **token**, which may be a whole word, a fragment, or a punctuation mark. This objective, applied at Internet scale across trillions of tokens of text, causes the model to implicitly learn grammar, facts, reasoning patterns, and even social conventions — because all of these are encoded in the structure of human language.[^brown2020][^radford2019]

Yildirim and Paul[^yildirimPaul2024] describe this as the acquisition of **instrumental knowledge**: knowledge that arises not from interacting with the physical world but from mastering the instrument of next-word generation so thoroughly that the model can respond sensibly across an enormous range of prompts. During training, the model appears to spontaneously infer the *task structure* of its inputs — recognizing, for example, that a paragraph starting with "In summary..." signals a summarization task — and conditioning its predictions accordingly.

### The Transformer Architecture

The transformer processes text through a layered network in which each layer applies **self-attention**: a mechanism that computes a weighted relationship between every token and every other token in the context window. This allows the model to resolve long-range dependencies — connecting a pronoun to its antecedent sentences earlier, or tracking an argument across a paragraph — that earlier architectures struggled with.[^vaswani2017]

A key supporting component is **layer normalization**[^ba2016], which stabilizes the training process by normalizing activations at each layer. Modern LLMs such as LLaMA also incorporate **Rotary Position Embedding (RoPE)**[^su2024], which encodes the position of each token as a rotation in the embedding space, enabling models to generalize to sequences longer than those seen during training.

### Training at Scale: The Role of Data and Compute

Training an LLM involves repeatedly showing the model sequences of text, measuring how wrong its predictions are (the *loss*), and adjusting its billions of internal parameters to reduce that error — a process called **backpropagation**. The question of how to allocate a fixed compute budget between model size and the amount of training data was long unresolved.

Kaplan et al.[^kaplan2020] established that model loss follows predictable **power-law scaling** with model size, data, and compute. However, Hoffmann et al.[^hoffmann2022] — in what became known as the **Chinchilla paper** — showed that most models in the field had been drastically undertrained. Their 70-billion parameter Chinchilla model, trained on 1.4 trillion tokens, outperformed the 280-billion parameter Gopher precisely because it had seen far more data relative to its size. This finding prompted the field to prioritize training duration alongside model scale, and it directly shaped models like Meta's LLaMA.[^touvron2023a][^touvron2023b]

### Fine-Tuning and Alignment

A raw pre-trained LLM is powerful but unpredictable. It will complete whatever text it is given — which may not be a helpful response to a question. The process of shaping the model into a safe, helpful assistant is called **alignment**, and it relies primarily on two techniques.

The first is **instruction tuning**, introduced by Wei et al.[^weiFlan2022] with the FLAN model: fine-tuning the model on hundreds of NLP tasks phrased as natural language instructions. This dramatically improves zero-shot generalization — the ability to follow new instructions never seen during training.

The second and more powerful technique is **Reinforcement Learning from Human Feedback (RLHF)**, first applied to LLMs systematically by Ouyang et al.[^ouyang2022] in the InstructGPT paper. Human raters compare pairs of model outputs and indicate which is better; these preferences are used to train a **reward model**, which in turn teaches the LLM — via reinforcement learning — to generate outputs that humans prefer. Strikingly, a 1.3-billion parameter InstructGPT model trained this way was preferred over the 175-billion parameter raw GPT-3 model by human raters 85% of the time. A simpler alternative, **Direct Preference Optimization (DPO)**, was later introduced by Rafailov et al.[^rafailov2023] and is now widely used because it achieves comparable alignment without a separate reward model.

Anthropic's **Constitutional AI** approach[^bai2022] extends RLHF by having the model critique its own outputs against a set of written principles, reducing reliance on human labeling of harmful content.

## Capabilities

### In-Context Learning and Reasoning

LLMs can learn new tasks from examples provided directly in the prompt, requiring no update to their weights. This **in-context learning** ability scales with model size and is surveyed comprehensively by Dong et al.[^dong2024]. Related to this, **chain-of-thought prompting** — providing step-by-step reasoning examples, or simply instructing the model to "think step by step" — dramatically improves performance on arithmetic, logic, and commonsense problems.[^kojima2022][^weiCoT2022] Generating multiple independent reasoning paths and taking the majority answer (**self-consistency**) improves results further still.[^wang2023]

### Knowledge Encoded in Model Weights

LLMs store a surprising amount of factual knowledge in their parameters. Petroni et al.[^petroni2019] showed that BERT, without any fine-tuning, could answer factual cloze questions (e.g., "The capital of France is ___") comparably to knowledge bases built from explicit information extraction. Subsequent work by Dai et al.[^dai2022] and Meng et al.[^meng2022] localized this knowledge to specific neurons in the model's feed-forward layers and demonstrated that individual facts can be edited or erased by targeting those neurons — a major step toward interpretability.

### Applied Uses

The practical range of LLM applications has grown rapidly. In software development, LLM-powered tools embedded in integrated development environments (IDEs) have been shown to significantly improve task completion rates compared to traditional web search.[^nam2024] In education, LLMs can generate interactive worked examples for programming students on demand, with expert evaluations finding that 93% of generated examples contained clear explanations and functionally correct code.[^jury2024]

## Limitations

### Hallucination

Perhaps the most widely noted limitation is **hallucination**: the generation of plausible-sounding but factually incorrect statements. Ji et al.[^ji2023], in a comprehensive survey, distinguish between *intrinsic hallucination* (contradicting a known source) and *extrinsic hallucination* (generating unverifiable content). Lin et al.[^lin2022] found that even the best-performing models were truthful on only 58% of questions specifically designed to elicit false beliefs — and, paradoxically, larger models were often *less* truthful, having learned to reproduce common human misconceptions at scale.

### Reasoning and Compositional Failures

Though chain-of-thought prompting improves reasoning, LLMs have theoretical and empirical limits. Dziri et al.[^dziri2023] showed that transformers solve multi-step compositional tasks by matching linearized patterns rather than through genuine systematic reasoning, with performance collapsing as task complexity increases. Theoretically, Merrill and Sabharwal[^merrillSabharwal2023] proved that standard transformers occupy a constrained computational class (TC⁰), meaning they cannot solve many problems requiring sequential computation. Allowing intermediate chain-of-thought steps extends this power significantly,[^merrillSabharwal2024] which helps explain why prompting strategies matter so much.

### Shortcut Learning and Bias

LLMs are susceptible to **shortcut learning** — exploiting spurious correlations in training data rather than learning the intended generalizations. McCoy et al.[^mccoy2019] demonstrated this in BERT using simple syntactic heuristics for natural language inference, and Du et al.[^du2024] survey the phenomenon comprehensively across modern LLMs. At a broader social level, Blodgett et al.[^blodgett2020] argue that NLP bias research often lacks precision about what "bias" means and whose values it encodes, while Bender et al.[^bender2021] warn that the environmental costs and embedded hegemonic perspectives of large-scale training are systematic risks that the field must address.

### Reliability at Scale

A striking finding published in *Nature* by Zhou et al.[^zhou2024] shows that larger, more instruction-tuned models can actually become *less reliable* in certain respects — producing more confident but miscalibrated outputs. This adds nuance to the assumption that scale uniformly improves performance.

### The Understanding Debate

A deeper question concerns whether LLMs *understand* language in any meaningful sense. Bender and Koller[^benderKoller2020] argue from first principles that a system trained only on linguistic form — divorced from grounded, real-world experience — cannot acquire meaning. Building on neuroscience, Mahowald et al.[^mahowald2024] draw a useful distinction between **formal linguistic competence** (producing grammatical, fluent text, at which LLMs excel) and **functional linguistic competence** (social reasoning, physical intuition, compositional problem-solving, at which they remain inconsistent). Yildirim and Paul[^yildirimPaul2024] frame this as the gap between *instrumental knowledge* — knowing how to use next-word generation as a tool — and *worldly knowledge* grounded in genuine mental models of the world.

## Emergent Abilities

As models scale, some capabilities appear suddenly rather than gradually improving. Wei et al.[^weiEmergent2022] catalogued dozens of such **emergent abilities** that surface only above certain parameter thresholds. However, Schaeffer et al.[^schaeffer2023] — in a NeurIPS Outstanding Paper Award recipient — challenged this framing, arguing that apparent emergence is often an artifact of nonlinear evaluation metrics: when measured continuously, performance improves smoothly and predictably. The debate remains open and has significant implications for forecasting future model capabilities.

## World Models and the Future of LLM Knowledge

A forward-looking question in the field is whether LLMs can acquire **world models**: structured, causally grounded representations of physical reality, not merely statistical regularities in text. Yildirim and Paul[^yildirimPaul2024] review experiments showing that LLMs trained on sequences from constrained domains (such as the board game Othello) can develop linearly decodable internal representations of the underlying game state — suggesting that next-token prediction can, in principle, recover structure beyond surface patterns. Whether this generalizes to the complexity of natural language remains an open research frontier, and they propose a **resource-rational framework** in which the depth of world knowledge an LLM acquires is governed by the distribution of tasks it is trained to perform.

## See Also

- Transformer (machine learning)
- Reinforcement Learning from Human Feedback (RLHF)
- Natural Language Processing (NLP)
- Prompt Engineering
- AI Safety and Alignment

[^ba2016]: Ba, J. L., Kiros, J. R., & Hinton, G. E. (2016). [*Layer normalization*](https://arxiv.org/abs/1607.06450). arXiv preprint.

[^bahdanau2015]: Bahdanau, D., Cho, K., & Bengio, Y. (2015). Neural machine translation by jointly learning to align and translate. *Proceedings of ICLR 2015*. https://arxiv.org/abs/1409.0473

[^bai2022]: Bai, Y., Kadavath, S., Kundu, S., Askell, A., Kernion, J., Jones, A., & Kaplan, J. (2022). [*Constitutional AI: Harmlessness from AI feedback*](https://arxiv.org/abs/2212.08073). arXiv preprint.

[^bender2021]: Bender, E. M., Gebru, T., McMillan-Major, A., & Mitchell, M. (2021). On the dangers of stochastic parrots: Can language models be too big? *Proceedings of FAccT 2021*, 610–623. https://doi.org/10.1145/3442188.3445922

[^benderKoller2020]: Bender, E. M., & Koller, A. (2020). Climbing towards NLU: On meaning, form, and understanding in the age of data. *Proceedings of ACL 2020*, 5185–5198. https://doi.org/10.18653/v1/2020.acl-main.463

[^blodgett2020]: Blodgett, S. L., Barocas, S., Daumé III, H., & Wallach, H. (2020). Language (Technology) is power: A critical survey of "bias" in NLP. *Proceedings of ACL 2020*, 5454–5476. https://doi.org/10.18653/v1/2020.acl-main.485

[^brown2020]: Brown, T. B., Mann, B., Ryder, N., Subbiah, M., Kaplan, J., Dhariwal, P., & Amodei, D. (2020). Language models are few-shot learners. *Advances in Neural Information Processing Systems, 33*, 1877–1901. https://arxiv.org/abs/2005.14165

[^dai2022]: Dai, D., Dong, L., Hao, Y., Sui, Z., Chang, B., & Wei, F. (2022). Knowledge neurons in pretrained transformers. *Proceedings of ACL 2022*, 8493–8502. https://arxiv.org/abs/2104.08696

[^dong2024]: Dong, Q., Li, L., Dai, D., Zheng, C., Ma, J., Li, R., & Sui, Z. (2024). A survey on in-context learning. *Proceedings of EMNLP 2024*, 1107–1128. https://doi.org/10.18653/v1/2024.emnlp-main.64

[^du2024]: Du, M., He, F., Zou, N., Tao, D., & Hu, X. (2024). Shortcut learning of large language models in natural language understanding. *Communications of the ACM, 67*(1), 110–120. https://doi.org/10.1145/3596490

[^dziri2023]: Dziri, N., Lu, X., Sclar, M., Li, X. L., Jiang, L., Lin, B. Y., & Choi, Y. (2023). Faith and fate: Limits of transformers on compositionality. *NeurIPS 2023*. https://arxiv.org/abs/2305.18654

[^hoffmann2022]: Hoffmann, J., Borgeaud, S., Mensch, A., Buchatskaya, E., Cai, T., Rutherford, E., & Sifre, L. (2022). Training compute-optimal large language models. *NeurIPS 2022*. https://arxiv.org/abs/2203.15556

[^ji2023]: Ji, Z., Lee, N., Frieske, R., Yu, T., Su, D., Xu, Y., & Fung, P. (2023). Survey of hallucination in natural language generation. *ACM Computing Surveys, 55*(12), Article 248. https://doi.org/10.1145/3571730

[^jury2024]: Jury, B., Lorusso, A., Leinonen, J., Denny, P., & Luxton-Reilly, A. (2024). Evaluating LLM-generated worked examples in an introductory programming course. *ACE 2024*, 77–86. https://doi.org/10.1145/3636243.3636252

[^kaplan2020]: Kaplan, J., McCandlish, S., Henighan, T., Brown, T. B., Chess, B., Child, R., & Amodei, D. (2020). [*Scaling laws for neural language models*](https://arxiv.org/abs/2001.08361). arXiv preprint.

[^kojima2022]: Kojima, T., Gu, S. S., Reid, M., Matsuo, Y., & Iwasawa, Y. (2022). Large language models are zero-shot reasoners. *NeurIPS 2022*, 22199–22213. https://arxiv.org/abs/2205.11916

[^lin2022]: Lin, S., Hilton, J., & Evans, O. (2022). TruthfulQA: Measuring how models mimic human falsehoods. *Proceedings of ACL 2022*, 3214–3252. https://doi.org/10.18653/v1/2022.acl-long.229

[^mahowald2024]: Mahowald, K., Ivanova, A. A., Blank, I. A., Kanwisher, N., Tenenbaum, J. B., & Fedorenko, E. (2024). Dissociating language and thought in large language models. *Trends in Cognitive Sciences, 28*(6), 517–540. https://doi.org/10.1016/j.tics.2024.01.011

[^mccoy2019]: McCoy, R. T., Pavlick, E., & Linzen, T. (2019). Right for the wrong reasons: Diagnosing syntactic heuristics in natural language inference. *Proceedings of ACL 2019*, 3428–3448. https://doi.org/10.18653/v1/P19-1334

[^meng2022]: Meng, K., Bau, D., Andonian, A., & Belinkov, Y. (2022). Locating and editing factual associations in GPT. *NeurIPS 2022*. https://arxiv.org/abs/2202.05262

[^merrillSabharwal2023]: Merrill, W., & Sabharwal, A. (2023). The parallelism tradeoff: Limitations of log-precision transformers. *Transactions of the Association for Computational Linguistics, 11*, 531–545.

[^merrillSabharwal2024]: Merrill, W., & Sabharwal, A. (2024). The expressive power of transformers with chain of thought. *ICLR 2024*. https://arxiv.org/abs/2310.07923

[^nam2024]: Nam, D., Macvean, A., Hellendoorn, V., Vasilescu, B., & Myers, B. (2024). Using an LLM to help with code understanding. *ICSE 2024*. https://doi.org/10.1145/3597503.3639187

[^ouyang2022]: Ouyang, L., Wu, J., Jiang, X., Almeida, D., Wainwright, C., Mishkin, P., & Lowe, R. (2022). Training language models to follow instructions with human feedback. *NeurIPS 2022*. https://arxiv.org/abs/2203.02155

[^petroni2019]: Petroni, F., Rocktäschel, T., Riedel, S., Lewis, P., Bakhtin, A., Wu, Y., & Miller, A. H. (2019). Language models as knowledge bases? *Proceedings of EMNLP-IJCNLP 2019*, 2463–2473. https://doi.org/10.18653/v1/D19-1250

[^radford2019]: Radford, A., Wu, J., Child, R., Luan, D., Amodei, D., & Sutskever, I. (2019). [*Language models are unsupervised multitask learners*](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf). OpenAI Technical Report.

[^rafailov2023]: Rafailov, R., Sharma, A., Mitchell, E., Ermon, S., Manning, C. D., & Finn, C. (2023). Direct preference optimization: Your language model is secretly a reward model. *NeurIPS 2023*. https://arxiv.org/abs/2305.18290

[^schaeffer2023]: Schaeffer, R., Miranda, B., & Koyejo, S. (2023). Are emergent abilities of large language models a mirage? *NeurIPS 2023* (Outstanding Paper). https://arxiv.org/abs/2304.15004

[^su2024]: Su, J., Lu, Y., Pan, S., Murtadha, A., Wen, B., & Liu, Y. (2024). RoFormer: Enhanced transformer with rotary position embedding. *Neurocomputing*. https://doi.org/10.1016/j.neucom.2023.127063

[^touvron2023a]: Touvron, H., Lavril, T., Izacard, G., Martinet, X., Lachaux, M.-A., Lacroix, T., & Lample, G. (2023a). [LLaMA: Open and efficient foundation language models](https://arxiv.org/abs/2302.13971). arXiv preprint.

[^touvron2023b]: Touvron, H., Martin, L., Stone, K., Albert, P., Almahairi, A., Babaei, Y., & et al. (2023b). [Llama 2: Open foundation and fine-tuned chat models](https://arxiv.org/abs/2307.09288). arXiv preprint.

[^vaswani2017]: Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., & Polosukhin, I. (2017). Attention is all you need. *Advances in Neural Information Processing Systems, 30*, 5998–6008. https://arxiv.org/abs/1706.03762

[^wang2023]: Wang, X., Wei, J., Schuurmans, D., Le, Q., Chi, E., Narang, S., Chowdhery, A., & Zhou, D. (2023). Self-consistency improves chain of thought reasoning in language models. *ICLR 2023*. https://arxiv.org/abs/2203.11171

[^weiCoT2022]: Wei, J., Wang, X., Schuurmans, D., Bosma, M., Ichter, B., Xia, F., Chi, E., Le, Q. V., & Zhou, D. (2022). Chain-of-thought prompting elicits reasoning in large language models. *NeurIPS 2022*, 24824–24837. https://arxiv.org/abs/2201.11903

[^weiEmergent2022]: Wei, J., Tay, Y., Bommasani, R., Raffel, C., Zoph, B., Borgeaud, S., & Fedus, W. (2022). Emergent abilities of large language models. *Transactions on Machine Learning Research*. https://arxiv.org/abs/2206.07682

[^weiFlan2022]: Wei, J., Bosma, M., Zhao, V. Y., Guu, K., Yu, A. W., Lester, B., & Le, Q. V. (2022). Finetuned language models are zero-shot learners. *ICLR 2022*. https://arxiv.org/abs/2109.01652

[^yildirimPaul2024]: Yildirim, I., & Paul, L. A. (2024). From task structures to world models: What do LLMs know? *Trends in Cognitive Sciences*. https://doi.org/10.1016/j.tics.2024.01.009

[^zhou2024]: Zhou, L., Schellaert, W., Martínez-Plumed, F., Moros-Daval, Y., Ferri, C., & Hernández-Orallo, J. (2024). Larger and more instructable language models become less reliable. *Nature*. https://doi.org/10.1038/s41586-024-07930-y
