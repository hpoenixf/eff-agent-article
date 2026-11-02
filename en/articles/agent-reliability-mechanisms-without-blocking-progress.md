---
layout: page
sidebar: false
outline: false
editLink: false
search: false
head:
  - - meta
    - name: robots
      content: noindex, follow
  - - link
    - rel: canonical
      href: https://hpoenixf.com/eff-agent-article/en/articles/agent-veto-authority-and-run-termination
---

# Why Can Adding Reliability Mechanisms Stop an Agent from Delivering?

This essay was consolidated on **2026-11-02**. The responsibility for local failure, checkpoint recovery, and Run termination is covered in [Run Veto Authority and Safe Recovery](agent-veto-authority-and-run-termination.md). The distinct case of **a background evidence writer deadlocking with publication** now appears in [Capturing and Reading Research Evidence](agent-research-evidence-store-lifecycle.md).

This URL remains available for existing links, but is no longer a separate searchable, canonical essay or a full English edition. The original text remains in Git history. The merge does not make all checkpoint errors ignorable or establish production reliability.
