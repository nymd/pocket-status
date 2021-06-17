import util from 'util';
const exec = util.promisify(require('child_process').exec);

const nodeCSV = './pokt-nodes.csv';
const dataNodeURL = 'https://node-1.nachonodes.com:443'

async function main() {
  const fs = require('fs'); 
  const csv = require('csv-parser');
  const nodes: any[] = [];

  fs.createReadStream(nodeCSV).pipe(csv())
  .on('data', (data: any) => nodes.push(data))
  .on('end', async () => {
    await unstakeNodes(nodes);
  });
}

async function unstakeNodes(nodes: Array<any>) {
  for (const node of nodes) {
    console.log(`Unstaking ${node.name}`);
    await unstakeNode(node.address);
  }
}

async function unstakeNode(address: string): Promise<boolean> {
  const command = `pocket --remoteCLIURL ${dataNodeURL} nodes unstake ${address} mainnet 10000`;
  console.log(command);
  return true;
  /*
  const { stdout, stderr } = await exec(command);
  if (!stderr)
  {
    console.log(stdout);
    return true;
  }
  return false;
  */
}

main();
