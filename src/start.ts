import { simpleOnionRouter } from "./onionRouters/simpleOnionRouter";
import { user } from "./users/user";
import { launchRegistry } from "./registry/registry";

async function launchNetwork(numNodes: number, numUsers: number) {
  await launchRegistry();

  for (let i = 1; i <= numNodes; i++) {
    await simpleOnionRouter(i);
  }

  for (let i = 1; i <= numUsers; i++) {
    await user(i);
  }
}

function main() {
  launchNetwork(10, 2);
}

main();
