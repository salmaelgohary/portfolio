# Trax Copilot

**Role:** Product Designer · **Company:** Trax Codes · **Timeline:** 8 weeks (Oct - Dec 2025) · **Team:** 1 PM, 3 designers · **Skills:** Product thinking, interaction design, heuristic evaluation

#### Overview

## Trax helps construction professionals find and verify building code requirements digitally.

Trax digitizes 80+ Canadian building codes, helping architects, engineers, and construction professionals quickly find the requirements they need.

Copilot is Trax’s AI assistant for searching and understanding those codes. As Trax moved toward an AI-powered compliance platform, Copilot became central to the product.

[ ] IMAGE: trax brand  

#### Problem

## Copilot was becoming central to Trax, but users had to dig to find it.

[ ] IMAGE: Original navigation path from Home to All to Q&A 

Users had to navigate through three steps to find Copilot, and its entry point looked almost identical to Trax's regular keyword search.

## Copilot needed to become a more prominent part of the platform.

As Trax leaned further into AI, we had an opportunity to make Copilot a more visible and recognizable part of the platform.

#### Solution

## We made Copilot easier to find, easier to use, and easier to trust.

The new Copilot experience makes it easier to access AI-powered code search, refine questions with context, and verify answers against source documents.

### One-click access from anywhere in Trax

[ ] image: Top-level navigation and suggested prompts

### Persistent filters for more focused questions

[ ] image: Persistent filter pills across multiple questions

### Inline citations for easy source verification

[ ] image: Citation opening the reference panel

#### Outcomes

### 33% faster

response validation

### 48% increase

in standard-to-premium conversions

### 400+ industry firms

using Copilot today

---

#### Research

## I started by looking at where Copilot was falling short.

I combined heuristic evaluation, existing user feedback, and feature requests to understand where users were running into friction.

[ ] IMAGE: Heuristic evaluation / feature request synthesis

### I found five key problems:

- Copilot was difficult to discover within the existing navigation.
- Its entry point looked too similar to regular search.
- Filters reset between questions.
- Answers lacked clear, accessible citations.
- There was no clear way to start a new question without losing the current context.

### Users were asking for...
- Better examples of what Copilot could help with.
- A way to compare answers across codebooks and municipalities.
- More control over which sources Copilot used.
- A way to refine an answer without starting over.
- More confidence that answers reflected the latest applicable code.

#### Competitor Research

### Competitors made it difficult to verify AI responses against source documents.

Most competitors relied on long responses and scattered references, forcing users to scroll through the response or leave the conversation to find the supporting source.

This gave us an opportunity to make source verification faster by keeping relevant code references close to the answer.

[ ] IMAGE: Competitive audit

#### Design Process

### I mapped the existing flow and explored ways to improve it.

[ ] IMAGE: Existing flow 

I mapped the existing Copilot experience to identify where users were running into friction, then explored different ways to improve the flow. The biggest gaps appeared around entering Copilot, refining a question, and verifying the response.

### A technical constraint changed the direction.

[IMAGE: Color-coded codebook exploration]

I explored using color to distinguish different codebooks (e.g. fire and building codes). After reviewing the idea with development, I learned the backend didn't currently support this distinction, so we moved it out of scope.

#### Design Decisions

### How should Copilot introduce its capabilities?

[ ] IMAGE: All suggested prompts shown upfront

**Show everything upfront**

Users see all suggested prompts when they open Copilot.

This made Copilot's capabilities immediately visible, but presented too many options at once and made the starting point feel crowded.

[ ] IMAGE: Suggested prompts using progressive disclosure

**Progressive disclosure**

Users see a focused starting point and can open prompt categories when they want more guidance.

**We chose progressive disclosure** to avoid overwhelming users with too many options while still giving them a clear way to explore what Copilot could do.

### How should filters be displayed?

[ ] IMAGE: Box-style filters

**Box-style filters**

Users select filters from box-style controls that show their selections inside.

This kept the search bar height consistent, but it was less scalable as users selected multiple filters.

[ ] IMAGE: Pill-style filters

**Pill-style filters**

Selected filters appear as pills below the filter controls, making them easy to scan, edit, and remove from the conversation.

**We chose pill-style filters** because they were easier to scan and could scale as more filter types were added.

### How should filter colors be used?

[ ] IMAGE: Different colors for each filter type

**Different colors**

Each filter type uses a different color to make categories visually distinct.

This made filter types easier to distinguish, but the colors competed for attention and could be interpreted as having different meanings.

[ ] IMAGE: Similar colors across filter types

**Similar colors**

Filter pills use similar shades to create a more consistent visual system.

**We chose similar colors** to keep the filters visually consistent and less distracting, while grouping them by type to maintain distinction.

### How should users verify an AI-generated response?

[ ] IMAGE: Modal

**Modal Preview**

Users open a modal over the conversation to review the source.

This kept the source review focused, but took users away from the conversation and made it harder to compare the source with the answer.

[ ] IMAGE: Inline citations with reference panel

**Reference panel**

Users can validate a source alongside the response.

**We chose the reference panel** so users could verify an answer without losing their place in the conversation. The narrower answer area was worth the tradeoff because verification stayed in the same workflow.

### How should new questions work in the Standard tier?

[ ] IMAGE: New question overrides the current chat

**Override the current chat**

New questions replace the current conversation, reducing the number of clicks and matching the Pro experience.

This was faster, but could make Standard users expect their conversations to carry context and be saved like Pro chats.

[ ] IMAGE: New question starts a new chat

**Start a new chat**

Each new question starts a separate conversation and shows suggested questions to help users get started.

**We chose start a new chat** because Standard users didn't have persistent chat history. Keeping each question separate made the product's limitations clearer and avoided implying that context would carry over when it wouldn't.

#### Final Designs

## We created a more discoverable and trustworthy Copilot experience.

The redesigned experience makes Copilot accessible from anywhere in Trax, helps users refine questions with persistent filters, and lets them verify answers through inline citations.

[ ] VIDEO: Final Copilot walkthrough showing navigation, suggested prompts, filters, response, citations, and project integration

#### Reflection

## What I learned

### Align early with development to understand constraints

Bring developers into the conversation early to understand technical constraints before committing to a direction.

### Scope to the minimum users actually need

Keeping the scope focused helped us prioritize the problems we could meaningfully solve within the project.

#### Next Steps

## Where I’d take it next

### Test Copilot in real code research workflows

Observe architects, engineers, and construction professionals using Copilot to answer real compliance questions. I'd focus on whether users can find the right sources, refine their questions, and confidently validate the response.

### Expand the filtering system

As more code types and project contexts are added, revisit the filter structure to make sure users can still scan and adjust their context without adding complexity.