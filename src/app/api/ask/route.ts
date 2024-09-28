// app/api/ask/route.ts

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Interface pour la réponse parsée
interface ParsedResponse {
  text: string;
  rules: string[];
}

// Configuration du client OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Assurez-vous que l'API Key est définie dans .env.local
});

// Fonction pour parser la réponse de l'assistant
async function parseAssistantResponse(
  message: string
): Promise<ParsedResponse> {
  // Extraction des sections en utilisant des expressions régulières robustes
  const syntheticAnswerMatch = message.match(
    /\*\*Réponse synthétique :\*\*\s*([\s\S]*?)(?=\*\*|$)/
  );
  const rulesMatch = message.match(
    /\*\*Règles utilisées :\*\*\s*([\s\S]*?)(?=\*\*|$)/
  );

  const syntheticAnswer = syntheticAnswerMatch
    ? syntheticAnswerMatch[1].trim()
    : "Je n'ai pas pu générer de réponse synthétique.";
  const rules = rulesMatch
    ? rulesMatch[1]
        .split("\n")
        .map((rule) => rule.replace(/^- /, "").trim())
        .filter(Boolean)
    : ["Aucune règle spécifiée."];

  return {
    text: syntheticAnswer,
    rules,
  };
}

// Fonction handler pour la méthode POST
export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    console.log("Question reçue :", question);

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question invalide." },
        { status: 400 }
      );
    }

    // Création de la complétion ChatGPT
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Remplacez par le modèle approprié
      messages: [
        {
          role: "system",
          content: `
Tu es un arbitre expert de Magic: The Gathering. Lorsque tu réponds, suis ce format:

**Réponse synthétique :**
[Ta réponse ici]

**Règles utilisées :**
- [Règle 1]
- [Règle 2]

** Cartes concernées (si cartes sont mentionnées) :**
- [Nom de la carte 1]
- [Nom de la carte 2]

Ne fournis aucune explication supplémentaire en dehors de ce format.
          `,
        },
        { role: "user", content: question },
      ],
      temperature: 0.5, // Optionnel: ajuste la créativité de la réponse
    });

    console.log("Réponse OpenAI :", completion);

    // Utiliser directement `completion.choices`
    const assistantMessage = completion.choices[0].message?.content || "";

    console.log("Message de l'assistant :", assistantMessage);

    // Fonction pour extraire les données
    const parsedResponse = await parseAssistantResponse(assistantMessage);

    console.log("Réponse parsée :", parsedResponse);

    // Renvoyer la réponse parsée directement
    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error("Erreur lors de la requête OpenAI:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue." },
      { status: 500 }
    );
  }
}
