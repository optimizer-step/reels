# 002 — SBI or river bank? How AI decides (attention)

- **Folder:** `src/reels/attention-bank` · compositions `AttentionBank`, `AttentionBank-Cover`
- **Length:** 47 s, 8 beats · **Status:** rendered without voiceover (synthesised SFX + music bed)
- **Built on kit v2:** one continuous camera world (glides with motion blur instead of cuts),
  token chips, attention beams with flowing particles, a 3D meaning space, a causal heatmap,
  decode text, glitch cuts and a live "sense meter".

## Script

| Time (s) | Beat | Voiceover (Hinglish) | On screen | Visual |
| --- | --- | --- | --- | --- |
| 0–3.6 | Hook | "Ek word, do matlab. Bank — paise wala, ya nadi wala?" | ONE WORD. TWO MEANINGS. · BANK · MONEY / RIVER · How does AI know which? | Giant BANK glitches and throws out two meaning cards |
| 3.6–9.4 | Numbers | "Tum context se turant samajh jaate ho. Par AI ke liye har word sirf numbers ki ek list hai." | TO AI, EVERY WORD IS JUST NUMBERS | Camera flies down to the sentence; "bank" decodes into a vector; sense meter appears |
| 9.4–17.6 | Attention | "Jawab hai: Attention. 2017 ka paper — ChatGPT ka 'T', Transformer, yahin se aaya. 'Bank' peeche ke har word ko dekhta hai, aur 'cash' pe sabse zyada dhyaan deta hai." | ATTENTION IS ALL YOU NEED · 2017 · The T in ChatGPT = Transformer · Most attention → cash | Beams from "bank" to every earlier word, thickest to cash (44%) and deposited (24%); meter swings to MONEY |
| 17.6–23.5 | Change one word | "Ab sirf ek word badlo — river. Ab 'bank' ka dhyaan nadi pe hai. Par andar actually kya badla?" *(0.5 s silence)* | CHANGE ONE WORD, MEANING CHANGES · But what changes inside the AI? | Camera drops to the second sentence; beams go to river (52%); meter swings to RIVER |
| 23.5–32.9 | Meaning space | "'Bank' ka matlab ek jagah pe nahi rehta. Paise wale sentence mein woh paise wale words ke paas jaata hai, nadi wale mein nadi ke paas. Same word. Alag jagah." | SAME WORD. DIFFERENT PLACE. | Camera pulls back into a rotating 3D meaning space; "bank" flies to the money cluster, then a second "bank" flies to the river cluster |
| 32.9–38.3 | Every word | "Aur yeh sirf 'bank' nahi. Har word, peeche ke har word ko, ek saath dekhta hai." | EVERY WORD LOOKS BACK | Glitch cut to a causal attention heatmap filling diagonally |
| 38.3–43.1 | Takeaway | "Toh ChatGPT ko context do. Jitna context, utna sahi jawab." | MORE CONTEXT = BETTER ANSWERS | Two prompts typed: vague vs. specific, and their replies |
| 43.1–47 | CTA + loop | "Comment mein ek word likho jiske do matlab hon — next reel usi pe." | Comment a word with two meanings ↓ | Camera flies back over the whole journey to the opening BANK, so the reel loops |

## Caption

```text
"Bank" — money or river? You know instantly. Here's how AI works it out: attention.

It's the idea behind the "T" in ChatGPT (Transformer, 2017). Every word looks back at the
words before it, and its meaning literally moves depending on context.

Comment a word with two meanings — the best one becomes the next reel.

#AI #MachineLearning #ChatGPT #Transformers #LearnAI #OptimizerStep
```

**Pinned comment:** Sources: Vaswani et al., "Attention Is All You Need" (2017) · Coenen et al.,
"Visualizing and Measuring the Geometry of BERT" (NeurIPS 2019). The numbers on screen are a
simplified illustration, not output from a real model.

## Fact sheet

| Claim | Status | Source |
| --- | --- | --- |
| The Transformer came from "Attention Is All You Need" (2017), built on attention alone | True | [Vaswani et al., arXiv 1706.03762](https://arxiv.org/abs/1706.03762) |
| The "T" in GPT / ChatGPT stands for Transformer | True (Generative Pre-trained Transformer) | same lineage |
| To a model, each word (token) becomes a list of numbers (a vector) | True, simplified: models work on tokens | general |
| "bank" attends most to cash / river | **Illustration.** Weights on screen are made up to show the idea; real heads vary | — |
| GPT-style models only look at earlier words | True (causal attention); the heatmap masks future words | Vaswani et al. (decoder masking) |
| A word's meaning-vector moves with context; senses sit in different regions | Supported for BERT: "fine-grained geometric representation of word senses" | [Coenen et al., NeurIPS 2019](https://arxiv.org/abs/1906.02715v2) |
| The 3D space and its clusters | **Illustration**, labelled on screen | — |
| More context in a prompt gives better answers | Practical guidance; true for ambiguous requests like this one | — |

Hugging Face was unreachable from the build sandbox, so no real model was run. If a later
session can download a small model (e.g. GPT-2), replace `data.ts` weights with real attention
and drop "illustration" from the tag.

## Next

- [ ] Record Hinglish VO → `public/reels/attention-bank/vo.mp3`; add `words.json` (word timings) so cues auto-sync
- [ ] Post as a Trial Reel; log results here
