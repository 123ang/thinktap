# 🎯 Quiz Game Scoring System Specification

## Overview
This document defines the **scoring logic** for a real-time quiz game (Kahoot-like).
The system rewards **correctness**, **answer speed**, and **consistency**, while remaining fair and scalable.

---

## 1. Scoring Principles

- ❌ Wrong answers give **0 points**
- ⚡ Faster correct answers earn **more points**
- 🔥 Consecutive correct answers earn a **streak bonus**
- 🎁 Optional power-ups may **multiply score**
- 🚫 No negative scoring (no penalties)

---

## 2. Core Formula

Score = BaseScore × SpeedFactor × StreakMultiplier × PowerUpMultiplier

If the answer is incorrect:
Score = 0

---

## 3. Parameters Definition

### 3.1 Base Score

BaseScore = 1000

---

### 3.2 Speed Factor

SpeedFactor = max(0, (T − t) / T)

Where:
- T = total question time (seconds)
- t = time taken to answer (seconds)

---

### 3.3 Correctness Rule

If answer is incorrect → Score = 0

---

### 3.4 Streak Multiplier

| Correct Streak | Multiplier |
|---------------|------------|
| < 3 | 1.0 |
| 3 | 1.1 |
| 4 | 1.2 |
| 5 | 1.3 |
| 6 | 1.4 |
| 7 | 1.5 |
| 8 | 1.6 |
| 9 | 1.7 |
| 10 | 1.8 |
| 11 | 1.9 |
| ≥ 12 | 2.0 (cap) |

**Formula:** `1.0 + (streak - 2) * 0.1`, capped at 2.0

---

### 3.5 Power-Up Multiplier

| Power-Up | Multiplier |
|--------|------------|
| None | 1.0 |
| Double Points | 2.0 |
| Event Bonus | 1.5 |

---

## 4. Final Formula

Score = round(
  1000 ×
  max(0, (T − t) / T) ×
  StreakMultiplier ×
  PowerUpMultiplier
)

---

## 5. Example Calculation

T = 20s  
t = 5s  
Streak = 4  
Correct Answer

SpeedFactor = (20 - 5) / 20 = 0.75  
StreakMultiplier = 1.2 (for streak of 4)

Final Score = round(1000 × 0.75 × 1.2 × 1.0) = 900

---

### Example with Maximum Streak Multiplier

T = 30s  
t = 3s  
Streak = 12+  
Correct Answer

SpeedFactor = (30 - 3) / 30 = 0.9  
StreakMultiplier = 2.0 (for streak ≥ 12, cap)

Final Score = round(1000 × 0.9 × 2.0 × 1.0) = 1800

### Example with Intermediate Streak

T = 20s  
t = 8s  
Streak = 5  
Correct Answer

SpeedFactor = (20 - 8) / 20 = 0.6  
StreakMultiplier = 1.3 (for streak of 5)

Final Score = round(1000 × 0.6 × 1.3 × 1.0) = 780

---

## 6. Optional Enhancements

### Smoother Speed Curve
SpeedFactor = sqrt((T − t) / T)

### Minimum Guaranteed Score
SpeedFactor = max(0.3, (T − t) / T)

---

## 7. Anti-Cheat Rules

- Server-side timing only
- One submission per question
- Lock answer after submit
- Randomize answer order
- Rate-limit socket events

---

## 8. Implementation Notes

- Use Redis for live score & streak
- Persist results after game ends
- Server-side score calculation only
- WebSocket or polling leaderboard updates

---

## 9. Summary

This scoring system is:
✔ Fair  
✔ Competitive  
✔ Scalable  
✔ Kahoot-style
