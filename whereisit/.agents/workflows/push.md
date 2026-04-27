---
description: How to push changes to the repository
---

## Push Workflow

1. **Never push without the user explicitly asking.**
2. When the user asks to push, **ask them first if the version number in `config.yaml` should be bumped** before committing.
3. If they say yes, bump the `version` field in `config.yaml`, then stage and commit it together with the other changes.
4. If they say no, proceed without bumping.
5. Stage, commit, and push all changes.
