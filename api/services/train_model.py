"""
Train a simple sklearn model for resume selection prediction.
Run once: python services/train_model.py
Saves model.pkl in backend/services/
"""

import numpy as np
import pickle
import os
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

# ── Sample training dataset ──────────────────────────────────────────────────
# Features: [skill_score, project_score, edu_score, exp_score, completeness, cert_score]
# Label: 1 = selected, 0 = not selected

np.random.seed(42)

def make_samples(n, skill_mean, proj_mean, edu_mean, exp_mean, comp_mean, cert_mean, selected_prob):
    X = np.column_stack([
        np.clip(np.random.normal(skill_mean, 12, n), 0, 100),
        np.clip(np.random.normal(proj_mean, 15, n), 0, 100),
        np.clip(np.random.normal(edu_mean, 10, n), 0, 100),
        np.clip(np.random.normal(exp_mean, 15, n), 0, 100),
        np.clip(np.random.normal(comp_mean, 10, n), 0, 100),
        np.clip(np.random.normal(cert_mean, 12, n), 0, 100),
    ])
    y = np.random.binomial(1, selected_prob, n)
    return X, y

# Excellent candidates — mostly selected
X1, y1 = make_samples(200, 88, 85, 90, 80, 95, 70, 0.90)
# Good candidates — often selected
X2, y2 = make_samples(300, 72, 70, 75, 65, 85, 50, 0.70)
# Average candidates — sometimes selected
X3, y3 = make_samples(300, 58, 55, 65, 45, 75, 35, 0.45)
# Weak candidates — rarely selected
X4, y4 = make_samples(200, 40, 35, 50, 25, 60, 15, 0.18)

X = np.vstack([X1, X2, X3, X4])
y = np.concatenate([y1, y2, y3, y4])

# ── Train pipeline ────────────────────────────────────────────────────────────
pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", GradientBoostingClassifier(
        n_estimators=150,
        learning_rate=0.08,
        max_depth=4,
        random_state=42
    ))
])

pipeline.fit(X, y)

# ── Save ─────────────────────────────────────────────────────────────────────
out_path = os.path.join(os.path.dirname(__file__), "model.pkl")
with open(out_path, "wb") as f:
    pickle.dump(pipeline, f)

print(f"Model saved to {out_path}")
print(f"Training accuracy: {pipeline.score(X, y):.3f}")
