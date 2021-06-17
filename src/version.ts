import { URL } from "url";

import * as request from "request-promise";
//const expectedVersion = "RC-0.2.3"

async function getNodeVersion(node: { service_url: string }) {
    try {
        console.log(`${new URL(node.service_url).toString() + "v1"}`)
        return await request.get(new URL(node.service_url).toString() + "v1", {
            timeout: 3000
        })
    } catch (err) {
        //console.error(err)
        console.error("Error connecting to node: ")
        console.error(node)
        return undefined
    }
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

async function processNonJailedStaked(nodes: string | any[]) {
    // const validNodes = nodes.filter(function (value) {
    //     return (value.status === 2 && value.jailed === false)
    // })

    const result = []
    for (let index = 0; index < nodes.length; index++) {
        const node = nodes[index];
        // Get the version
        const nodeVersion = await getNodeVersion(node)
        console.log(nodeVersion)
        if (nodeVersion !== "\"RC-0.6.3\"") {
            console.log(nodeVersion)
            result.push(node)
        }
    }

    //console.log("Active Up to Date Validators Count: " + result.length)
    console.log("Nodes with different versions")
    console.log(`Node count on a different version (or unreachable): ${result.length}`)
    console.log(JSON.stringify(result))
}

async function start() {
    const response = await request.post('https://pokt-40.nachonodes.com:4240/v1/query/nodes', {
        json: {
            "opts": {
                "staking_status": 2,
                "page": 1,
                "per_page": 700,
                "jailed_status": 2
            }
        },
        method: "POST"
    })
    console.log(response)
    console.log(`Total Unjailed Nodes: ${response.result.length}`)
    await processNonJailedStaked(response.result)
    //await processNodes(nodes)
}

start()