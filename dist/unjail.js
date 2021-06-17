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
const nodeCSV = './bt-nodes.csv';
const dataNodeURL = 'http://peer-1.nachonodes.com:5001';
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const fs = require('fs');
        const csv = require('csv-parser');
        const nodes = [];
        fs.createReadStream(nodeCSV).pipe(csv())
            .on('data', (data) => nodes.push(data))
            .on('end', () => __awaiter(this, void 0, void 0, function* () {
            yield unjailNodes(nodes);
        }));
    });
}
function unjailNodes(nodes) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const node of nodes) {
            console.log(`Unjailing ${node.name}`);
            yield unjailNode(node.address);
        }
    });
}
function unjailNode(address) {
    return __awaiter(this, void 0, void 0, function* () {
        const command = `pocket --remoteCLIURL ${dataNodeURL} nodes unjail ${address} mainnet 10000`;
        // console.log(command);
        // return true;
        const { stdout, stderr } = yield exec(command);
        if (!stderr) {
            console.log(stdout);
            return true;
        }
        return false;
    });
}
main();
//# sourceMappingURL=unjail.js.map