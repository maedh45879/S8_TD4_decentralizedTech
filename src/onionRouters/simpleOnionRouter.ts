import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { BASE_ONION_ROUTER_PORT } from "../config";
import { generateKeyPair, decryptMessage } from "../crypto";

export async function simpleOnionRouter(nodeId: number) {
  const onionRouter = express();
  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());

  let lastReceivedEncryptedMessage: string | null = null;
  let lastReceivedDecryptedMessage: string | null = null;
  let lastMessageDestination: number | null = null;

  // Générer une paire de clés RSA pour le nœud
  const { privateKey, publicKey } = generateKeyPair();

  // Route pour vérifier si le nœud est actif
  onionRouter.get("/status", (req: Request, res: Response) => {
    res.send("live");
  });

  // Route pour récupérer le dernier message chiffré reçu
  onionRouter.get("/getLastReceivedEncryptedMessage", (req: Request, res: Response) => {
    res.json({ result: lastReceivedEncryptedMessage });
  });

  // Route pour récupérer le dernier message déchiffré reçu
  onionRouter.get("/getLastReceivedDecryptedMessage", (req: Request, res: Response) => {
    res.json({ result: lastReceivedDecryptedMessage });
  });

  // Route pour récupérer la destination du dernier message reçu
  onionRouter.get("/getLastMessageDestination", (req: Request, res: Response) => {
    res.json({ result: lastMessageDestination });
  });

  // Route pour recevoir et traiter un message
  onionRouter.post("/message", async (req: Request, res: Response) => {
    const { message } = req.body;

    // Stocker le message chiffré
    lastReceivedEncryptedMessage = message;

    // Déchiffrer le message pour obtenir la prochaine destination et le message déchiffré
    const { decryptedMessage, nextDestination } = decryptMessage(message, privateKey);

    lastReceivedDecryptedMessage = decryptedMessage;
    lastMessageDestination = nextDestination;

    // Transmettre le message au prochain nœud ou utilisateur
    if (nextDestination) {
      // Logique pour envoyer le message au prochain nœud/utilisateur
      // Exemple: forwardMessage(nextDestination, decryptedMessage);
    }

    res.sendStatus(200);
  });

  const port = BASE_ONION_ROUTER_PORT + nodeId;
  const server = onionRouter.listen(port, () => {
    console.log(`Onion router ${nodeId} is listening on port ${port}`);
  });

  return server;
}
