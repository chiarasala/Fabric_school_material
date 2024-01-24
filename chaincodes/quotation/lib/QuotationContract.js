const { Contract } = require('fabric-contract-api');
class QuotationContract extends Contract {

    async initLedger(ctx) {                      
        const asset = {                
                   ID: 'Quotation1',
                   Type: 'shoes',
                   Price: null,
                   Issuer: null,
                   Quantity: 100,
                   State: 'requested'
               }
        await ctx.stub.putState(quotation.ID, Buffer.from(JSON.stringify(quotation))); //putState function inserts the asset into the ledger
    }

    async getQuotation(ctx, quotationID){
        const quotationJSON = await ctx.stub.getState(quotationID);        
        return quotationJSON.toString();  
    }

    async requestQuotation(ctx, id, type, quantity) {    
        const newQuotation = {
            ID: id,
            Type: type,
            Price: null,
            Issuer: null,
            Quantity: quantity,
            State: 'requested'
        }
        //The new asset is pushed to the ledger, if the ID already exists, the old object is overwritten
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(newQuotation)));    
    }

    async provideQuotation(ctx, id, newPrice) {                
        const submitter = ctx.stub.getCreator().mspid
        if(!submitter.includes('Supplier')) {
            throw new Error(`Only the supplier can provide a quotation`)
        }
       const quotationBuffer = await ctx.stub.getState(id)
       const quotationString = quotationBuffer.toString()  
       const quotation = JSON.parse(quotationString)        
       quotation.Price = newPrice
       quotation.Issuer = submitter                
       await ctx.stub.putState(id, Buffer.from(JSON.stringify(quotation)))
    }

    async deleteQuotation(ctx, id) {            
        await ctx.stub.deleteState(id);
    }

    async acceptQuotation(ctx, quotationID, newState) {
        const submitter = ctx.stub.getCreator().mspid
        if(!submitter.includes('Agency')) {
             throw new Error(`Only the agency can update a quotation`)
        }
        const quotationBuffer = await ctx.stub.getState(quotationID)
        const quotationString = quotationBuffer.toString()
        const quotation = JSON.parse(quotationString)
        quotation.State = newState
        await ctx.stub.putState(quotationID, Buffer.from(JSON.stringify(quotation)))
        return quotation
    }
 
       


 
    
}
module.exports = QuotationContract

