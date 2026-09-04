---
name: Gemini model availability
description: Direct Gemini API behavior for newly issued user keys.
---

When using a user-provided Gemini API key directly, a legacy model can return a 404 even though the key is valid. The provider response may recommend a current model ID for new users.

**Why:** New-user access can differ from older examples and managed integration model lists; silently switching to fake output would violate the product contract.

**How to apply:** Keep provider errors server-side, inspect the safe status/message, and update the configured model to the provider-recommended current model before retrying.