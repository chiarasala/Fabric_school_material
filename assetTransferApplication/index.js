/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
const appRoot = require('app-root-path');
const grpc = require('@grpc/grpc-js')
const { connect, signers } = require('@hyperledger/fabric-gateway')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const { TextDecoder } = require('util')
const testNetDir = appRoot.path.split('/').slice(0, -1).join('/') + "/test-network";
// Path to crypto materials.
const cryptoPath = testNetDir + '/organizations/peerOrganizations/';

// Gateway peer endpoint
const peerEndpoints = {
    'suppliera.quotation.com': 'localhost:7051',
    'supplierb.quotation.com': 'localhost:9051',
    'agency.quotation.com': 'localhost:11051'
}

// mspIDs
const orgMspIds = {
    'suppliera.quotation.com': 'SupplierAMSP',
    'supplierb.quotation.com': 'SupplierBMSP',
    'agency.quotation.com': 'AgencyMSP'
}

const utf8Decoder = new TextDecoder();

/**
 * Establish client-gateway gRPC connection
 * @param {String} organization | organization domain
 * @returns gRPC client
 */
async function newGrpcConnection(organization) {
    // Gateway peer SSL host name override.
    const peerHostAlias = `peer0.${organization}`
    // Path to peer tls certificate.
    const tlsCertPath = path.join(cryptoPath, `${organization}/peers/${peerHostAlias}/tls/ca.crt`)

    const tlsRootCert = fs.readFileSync(tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);

    //Complete the gRCP Client connection here 
    return new grpc.Client(...
        { 'grpc.ssl_target_name_override': peerHostAlias }
    );
}

/**
 * Create a new user identity
 * @param {String} organization | organization domain
 * @returns the user credentials
 */
function newIdentity(organization) {
    // Path to user certificate
    const certPath = path.join(cryptoPath, `${organization}/users/User1@${organization}/msp/signcerts/User1@${organization}-cert.pem`)
    const mspId = orgMspIds[organization];
    //Retrieve and return credentials here ...
    // const credentials ... 
    // return {...}
}

/**
 * Create a signing implementation
  * @param {String} organization | organization domain
  * @returns a new signing implementation for the user
 */
function newSigner(organization) {
    // Path to user private key directory.
    const keyDirectoryPath = path.join(cryptoPath, `${organization}/users/User1@${organization}/msp/keystore`)

    const files = fs.readdirSync(keyDirectoryPath)
    const keyPath = path.resolve(keyDirectoryPath, files[0])
    const privateKeyPem = fs.readFileSync(keyPath)
    const privateKey = crypto.createPrivateKey(privateKeyPem)
    //Create and return the signing implementation here
    // ...
}

/**
 * Submit a transaction synchronously, blocking until it has been committed to the ledger.
  * @param {String} organization | organization domain
  * @param {String} channel | channel name
  * @param {String} chaincode | chaincode name 
  * @param {String} transactionName | transaction method
  * @param {Array} transactionParams | transaction parameters
  * @returns a new signing implementation for the user
 */
async function submitT(organization, channel, chaincode, transactionName, transactionParams) {

    organization = organization.toLowerCase()

    console.log("\nCreating gRPC connection...")
    //Establish gRPC connection here
    // const client = ...

    console.log(`Retrieving identity for User1 of ${organization} ...`)
    //Retrieve User1's identity here
    // const id = ...

    //Retrieve signing implementation here
    //  const signer = ...

    //Complete the gateway connection here ...
    const gateway = connect({
        //...,
        //...,
        //...,

        // Default timeouts for different gRPC calls
        evaluateOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        endorseOptions: () => {
            return { deadline: Date.now() + 15000 }; // 15 seconds
        },
        submitOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        commitStatusOptions: () => {
            return { deadline: Date.now() + 60000 }; // 1 minute
        },
    })

    try {
        console.log(`Connecting to ${channel} ...`)
        //Retrieve the channel here
        //const network = ...

        console.log(`Getting the ${chaincode} contract ...`)
        //Retrieve the contract here
        //const contract = ...

        console.log(`Submitting ${transactionName} transaction ...\n`)

        //Submit transaction here
        let resp = null
        if (!transactionParams || transactionParams === '') {
            //resp = ...
        } else {
            //resp = ...
        }
        const resultJson = utf8Decoder.decode(resp);

        if (resultJson && resultJson !== null) {
            const result = JSON.parse(resultJson);
            console.log('*** Result:', result);
        }
        console.log('*** Transaction committed successfully');


        //Retrieve chaincode events here ...
        //const events = ...
        try {
            for await (const event of events) {
                const asset = new TextDecoder().decode(event.payload);

                console.log(`*** Contract Event Received: ${event.eventName}`)
                console.log(`-- asset: ${asset}`)
                console.log(`-- chaincodeName: ${event.chaincodeName}`)
                console.log(`-- transactionId: ${event.transactionId}`)
                console.log(`-- blockNumber: ${event.blockNumber}\n`)
            }
        } finally {
            events.close();
        }
    } catch (err) {
        console.error(err)
    } finally {
        gateway.close()
        client.close()
    }

}

function submit(organization, channel, chaincode, transactionName, transactionParams) {
    if (!organization) {
        console.log("organization argument missing!")
    }
    else if (!channel) {
        console.log("channel argument missing!")
    }
    else if (!chaincode) {
        console.log("chaincode argument missing!")
    }
    else if (!transactionName) {
        console.log("transactionName argument missing!")
    } else {
        submitT(organization, channel, chaincode, transactionName, transactionParams)
    }
}

module.exports = { submitT, submit }