import util from 'util';
const exec = util.promisify(require('child_process').exec);
// march 15 6am, 0

const nodeCSV = './pokt-nodes.csv';
const dataNodeURL = 'http://peer-1.nachonodes.com:5001'
const namePrefix = 'POKT-';
const num = 1;
const startingAmount = 50000;

async function main() {
  const fs = require('fs'); 
  const csv = require('csv-parser');
  const nodes: any[] = [];

  fs.createReadStream(nodeCSV).pipe(csv())
  .on('data', (data: any) => nodes.push(data))
  .on('end', async () => {
    await processNodeJailings(nodes);
    await processNodeBalancesAndClaims(nodes);
  });
}

async function processNodeJailings(nodes: Array<any>) {
  for (const node of nodes) {
    let nodeJailed = await fetchJailedStatus(node.address);
    if (nodeJailed) {
      console.log(`Node: ${node.name}, jailed: ${nodeJailed}`);
    }
  }
}

async function processNodeBalancesAndClaims(nodes: Array<any>) {
  let totalBalance = 0;
  for (const node of nodes) {
    let nodeBalance = await fetchBalance(node.address);
    nodeBalance = nodeBalance - startingAmount;
    const convertedNodeBalance = Math.round(upokt(nodeBalance));

    const nodeClaims = await fetchClaims(node.address);
    const nodeHeight = await fetchHeight(node.name, node.port);
    
    console.log(`${node.name}: ${nodeHeight} balance: ${convertedNodeBalance}, claims: ${nodeClaims}`);

    totalBalance = totalBalance + nodeBalance;
  }
  const convertedTotalBalance = upokt(totalBalance);
  console.log(`Total node balance: ${convertedTotalBalance}`);
}

async function fetchHeight(name: string, port: number): Promise<string> {
  const command = `pocket --remoteCLIURL https://${name}.nachonodes.com:${port} query height`;
  const { stdout, stderr } = await exec(command);
  if (!stderr)
  {
    const regex = /"height":\s([\w])+/g;
    const matches = regex.exec(stdout);
    if (matches && matches[0]) {
      const height = matches[0].replace('"height": ', '');
      return height;
    }
  }
  return "invalid";
}

async function fetchClaims(address: string): Promise<number> {
  const command = `pocket --remoteCLIURL ${dataNodeURL} query node-claims ${address}`;
  const { stdout, stderr } = await exec(command);
  if (!stderr)
  {
    const regex = /"total_proofs":\s([\d])+/g;
    const matches = regex.exec(stdout);
    if (matches && matches[0]) {
      let claims = 0;
      for (const item in matches) {
        if (item.match(/^-?\d+$/)) {
          const claimSet = parseInt(matches[item].replace('"total_proofs": ', ''));
          claims = claims + claimSet;
        }
      }
      return claims;
    }
  }
  return 0;
}

async function fetchJailedStatus(address: string): Promise<boolean|null> {
  const command = `pocket --remoteCLIURL ${dataNodeURL} query node ${address}`;
  const { stdout, stderr } = await exec(command);
  if (!stderr)
  {
    const regex = /"jailed":\s([\w])+/g;
    const matches = regex.exec(stdout);
    if (matches && matches[0]) {
      const jailed = matches[0].replace('"jailed": ', '');
      if (jailed === "true") {
        return true;
      }
      return false;
    }
  }
  return null;
}

async function fetchBalance(address: string): Promise<number> {
  const command = `pocket --remoteCLIURL ${dataNodeURL} query balance ${address}`;
  const { stdout, stderr } = await exec(command);
  if (!stderr)
  {
    const regex = /"balance":\s([\d])+/g;
    const matches = regex.exec(stdout);
    if (matches && matches[0]) {
      return parseInt(matches[0].replace('"balance": ', ''));
    }
    return 0;
  }
  return 0;
}

function upokt(amount: number): number {
  return amount / 1000000;
}

main();
