"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const request = __importStar(require("request-promise"));
//const expectedVersion = "RC-0.2.3"
function getNodeVersion(node) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`${new url_1.URL(node.service_url).toString() + "v1"}`);
            return yield request.get(new url_1.URL(node.service_url).toString() + "v1", {
                timeout: 3000
            });
        }
        catch (err) {
            //console.error(err)
            console.error("Error connecting to node: ");
            console.error(node);
            return undefined;
        }
    });
}
// function printNode(node) {
//     console.log(node)
// }
// async function processNodes(nodes) {
//     for (let index = 0; index < nodes.length; index++) {
//         const node = nodes[index];
//         console.log("***********************")
//         printNode(node)
//         await printNodeVersion(node)
//         console.log("***********************")
//     }
// }
// async function processNonJailedStaked(nodes) {
//     const validNodes = nodes.filter(function (value) {
//         return (value.status === 2 && value.jailed === false)
//     })
//     const csv = []
//     csv.push(["Address", "Service URL", "Node Version"])
//     for (let index = 0; index < validNodes.length; index++) {
//         const node = validNodes[index];
//         console.log("***********************")
//         console.log(node)
//         console.log("***********************")
//         // Get the version
//         const nodeVersion = await getNodeVersion(node)
//         csv.push([
//             node.address, node.service_url, nodeVersion
//         ])
//     }
//     console.log(
//         csv.reduce(function(prev, curr, currIndex, array) {
//             return prev.concat(curr.join(",").concat("\n"))
//         })
//     )
// }
function processNonJailedStaked(nodes) {
    return __awaiter(this, void 0, void 0, function* () {
        // const validNodes = nodes.filter(function (value) {
        //     return (value.status === 2 && value.jailed === false)
        // })
        const result = [];
        for (let index = 0; index < nodes.length; index++) {
            const node = nodes[index];
            // Get the version
            const nodeVersion = yield getNodeVersion(node);
            console.log(nodeVersion);
            if (nodeVersion !== "\"RC-0.6.3\"") {
                console.log(nodeVersion);
                result.push(node);
            }
        }
        //console.log("Active Up to Date Validators Count: " + result.length)
        console.log("Nodes with different versions");
        console.log(`Node count on a different version (or unreachable): ${result.length}`);
        console.log(JSON.stringify(result));
    });
}
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield request.post('https://pokt-40.nachonodes.com:4240/v1/query/nodes', {
            json: {
                "opts": {
                    "staking_status": 2,
                    "page": 1,
                    "per_page": 700,
                    "jailed_status": 2
                }
            },
            method: "POST"
        });
        console.log(response);
        console.log(`Total Unjailed Nodes: ${response.result.length}`);
        yield processNonJailedStaked(response.result);
        //await processNodes(nodes)
    });
}
start();
//# sourceMappingURL=version.js.map