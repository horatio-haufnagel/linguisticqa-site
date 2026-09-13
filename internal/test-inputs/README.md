# test-inputs

Batch di input per `evaluate.py`. Il file `template-prospect.json` è il template
da copiare quando si prepara un nuovo audit.

## Chiavi obbligatorie

| Chiave | Tipo | Descrizione |
|---|---|---|
| `document_id` | string | Identificativo del batch (usato nel report e nel nome del JSON di output) |
| `texts` | array | Lista di testi da valutare. Ogni elemento può essere una stringa semplice (solo le 5 categorie originali, senza ACCURATEZZA) oppure un oggetto `{"target": ..., "source": ..., "source_lang": ...}` per attivare il confronto con il testo fonte. |

## Chiavi facoltative a livello di batch

| Chiave | Default | Valori possibili | Descrizione |
|---|---|---|---|
| `domain` | `"universale"` | `"universale"`, `"prodotto-digitale-ecommerce"` | Filtra le voci della pattern library per dominio. Usare `"prodotto-digitale-ecommerce"` per schede prodotto, UI e-commerce, specifiche tecniche — attiva anche i controlli meccanici sulle unità di misura. |
| `client` | *(assente)* | es. `"kaufland"` | Slug del cliente: carica il glossario terminologico da `internal/resources/glossari/<slug>.json` (se il file esiste) e lo usa per il controllo meccanico dei termini. Non influenza il prompt dell'agente LLM. |

### Esempio con chiavi facoltative

```json
{
  "document_id": "kaufland-may-2026",
  "domain": "prodotto-digitale-ecommerce",
  "client": "kaufland",
  "texts": [
    {
      "target": "Aggiungi al carrello",
      "source": "In den Warenkorb",
      "source_lang": "de"
    }
  ],
  "context": {
    "audience": "B2C",
    "brand_voice": "casual"
  }
}
```
