"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importDefault(require("util"));
const exec = util_1.default.promisify(require('child_process').exec);
// march 15 6am, 0
const nodeCSV = './pokt-nodes.csv';
const dataNodeURL = 'http://peer-1.nachonodes.com:5001';
const namePrefix = 'POKT-';
const num = 1;
const startingAmount = 50000;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const fs = require('fs');
        const csv = require('csv-parser');
        const nodes = [];
        fs.createReadStream(nodeCSV).pipe(csv())
            .on('data', (data) => nodes.push(data))
            .on('end', () => __awaiter(this, void 0, void 0, function* () {
            yield processNodeJailings(nodes);
            yield processNodeBalancesAndClaims(nodes);
        }));
    });
}
function processNodeJailings(nodes) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const node of nodes) {
            let nodeJailed = yield fetchJailedStatus(node.address);
            if (nodeJailed) {
                console.log(`Node: ${node.name}, jailed: ${nodeJailed}`);
            }
        }
    });
}
function processNodeBalancesAndClaims(nodes) {
    return __awaiter(this, void 0, void 0, function* () {
        let totalBalance = 0;
        for (const node of nodes) {
            let nodeBalance = yield fetchBalance(node.address);
            nodeBalance = nodeBalance - startingAmount;
            const convertedNodeBalance = Math.round(upokt(nodeBalance));
            const nodeClaims = yield fetchClaims(node.address);
            const nodeHeight = yield fetchHeight(node.name, node.port);
            console.log(`${node.name}: ${nodeHeight} balance: ${convertedNodeBalance}, claims: ${nodeClaims}`);
            totalBalance = totalBalance + nodeBalance;
        }
        const convertedTotalBalance = upokt(totalBalance);
        console.log(`Total node balance: ${convertedTotalBalance}`);
    });
}
function fetchHeight(name, port) {
    return __awaiter(this, void 0, void 0, function* () {
        const command = `pocket --remoteCLIURL https://${name}.nachonodes.com:${port} query height`;
        const { stdout, stderr } = yield exec(command);
        if (!stderr) {
            const regex = /"height":\s([\w])+/g;
            const matches = regex.exec(stdout);
            if (matches && matches[0]) {
                const height = matches[0].replace('"height": ', '');
                return height;
            }
        }
        return "invalid";
    });
}
function fetchClaims(address) {
    return __awaiter(this, void 0, void 0, function* () {
        const command = `pocket --remoteCLIURL ${dataNodeURL} query node-claims ${address}`;
        const { stdout, stderr } = yield exec(command);
        if (!stderr) {
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
    });
}
function fetchJailedStatus(address) {
    return __awaiter(this, void 0, void 0, function* () {
        const command = `pocket --remoteCLIURL ${dataNodeURL} query node ${address}`;
        const { stdout, stderr } = yield exec(command);
        if (!stderr) {
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
    });
}
function fetchBalance(address) {
    return __awaiter(this, void 0, void 0, function* () {
        const command = `pocket --remoteCLIURL ${dataNodeURL} query balance ${address}`;
        const { stdout, stderr } = yield exec(command);
        if (!stderr) {
            const regex = /"balance":\s([\d])+/g;
            const matches = regex.exec(stdout);
            if (matches && matches[0]) {
                return parseInt(matches[0].replace('"balance": ', ''));
            }
            return 0;
        }
        return 0;
    });
}
function upokt(amount) {
    return amount / 1000000;
}
main();
//# sourceMappingURL=index.js.map