import util from 'util';
const exec = util.promisify(require('child_process').exec);

const nodeCSV = './bt-nodes.csv';
const dataNodeURL = 'http://peer-1.nachonodes.com:5001'

async function main() {
  const fs = require('fs'); 
  const csv = require('csv-parser');
  const nodes: any[] = [];

  fs.createReadStream(nodeCSV).pipe(csv())
  .on('data', (data: any) => nodes.push(data))
  .on('end', async () => {
    await unjailNodes(nodes);
  });
}

async function unjailNodes(nodes: Array<any>) {
  for (const node of nodes) {
    console.log(`Unjailing ${node.name}`);
    await unjailNode(node.address);
  }
}

async function unjailNode(address: string): Promise<boolean> {
  const command = `pocket --remoteCLIURL ${dataNodeURL} nodes unjail ${address} mainnet 10000`;
  // console.log(command);
  // return true;
  
  const { stdout, stderr } = await exec(command);
  if (!stderr)
  {
    console.log(stdout);
    return true;
  }
  return false;
}

main();
