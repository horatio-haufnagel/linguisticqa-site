# Italian Linguistic QA Framework

## Weighted Categories

### 1. TERMINOLOGIA (30%)
**Definition:** Consistency with glossary, domain-specific accuracy, no literal/calque translation.

**Severity Levels:**
- **Critical** (-10): Term completely wrong or contradicts glossary
  - Example: "mouse" → "topo" in tech context (should be "mouse")
  - Example: Glossario says "carrello", output says "cesto della spesa"
  
- **Major** (-5): Term inconsistent within document or slightly off-domain
  - Example: Mixed "interfaccia" and "interfaccia utente" for same concept
  - Example: Finance term not technical enough for banking
  
- **Minor** (-2): Alternative term acceptable, but preferred term exists
  - Example: "acquisto" vs preferred "transazione" in e-commerce

---

### 2. TONO & VOICE (25%)
**Definition:** Matches expected tone (formal/casual), audience appropriate, not "translated English feel".

**Severity Levels:**
- **Critical** (-10): Tone completely wrong for audience
  - Example: Formal "Lei" in casual e-commerce B2C
  - Example: Overly technical in consumer-facing text
  
- **Major** (-5): Tone switches mid-section or inconsistent formality
  - Example: "tu" in one sentence, "Lei" in next for same user
  - Example: Formal opening, casual closing
  
- **Minor** (-2): Acceptable tone but slightly awkward phrasing
  - Example: "Clicca qui per procedere" acceptable but "Vai avanti" more natural

---

### 3. FLUIDITÀ & FRASEOLOGIA (20%)
**Definition:** Natural Italian phrasing, idiomatic, not word-for-word from source.

**Severity Levels:**
- **Critical** (-10): Grammatically incorrect, incomprehensible, or unnatural
  - Example: "Per a navigare il sito" (grammatically broken)
  - Example: "Aggiungi per il carrello" (literal English structure)
  
- **Major** (-5): Sounds translated, awkward, not idiomatic Italian
  - Example: "Clicca il bottone" instead of "Fai clic sul pulsante"
  - Example: "Conferma il tuo acquisto" sounds stiff vs "Confermami l'acquisto"
  
- **Minor** (-2): Acceptable but could be more natural
  - Example: "Per favore conferma" acceptable, "Conferma pure" more casual

---

### 4. ADATTAMENTO CULTURALE (15%)
**Definition:** References, examples, measurements, currency appropriate for Italian market.

**Severity Levels:**
- **Critical** (-10): Culturally offensive, nonsensical, or completely irrelevant
  - Example: Thanksgiving reference without context for Italian audience
  - Example: US-specific law reference with no Italian equivalent
  
- **Major** (-5): References not relevant, localization opportunity missed
  - Example: Prices in £ instead of €
  - Example: Date format MM/DD instead of DD/MM
  
- **Minor** (-2): Minor missed localization
  - Example: "Monday" vs "lunedì" fully localized

---

### 5. FORMALE/INFORMALE CONSISTENCY (10%)
**Definition:** Consistent register (tu vs Lei, level of formality) throughout.

**Severity Levels:**
- **Critical** (-10): Random switching between tu/Lei within same context
  - Example: "Aggiungi al carrello" (tu) then "Potrebbe aggiungere" (Lei)
  
- **Major** (-5): Inconsistent formality level
  - Example: Mix of formal + casual instructions in same section
  
- **Minor** (-2): Minor register slip

---

## Scoring Algorithm

Base score: **100 points**

Final score = 100 - (sum of deductions)

**Grade mapping:**
- 90-100: **Excellent** ✅ (ready to publish)
- 75-89: **Good** ⚠️ (minor fixes needed)
- 60-74: **Acceptable** ⚠️ (needs review + fixes)
- <60: **Poor** ❌ (redo translation)

---

## Example Evaluation

**Input:**
