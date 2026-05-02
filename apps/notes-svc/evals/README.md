# Evaluation suite

Per-specialty eval sets used to gate prompt and model changes. Each subdirectory is one specialty; each test case is `<id>.json` (transcript + reference note + scoring rubric). The runner is `pytest -m eval`. CI fails the PR if any specialty drops more than 2 percentage points from the baseline stored in `baselines.json`.
