import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {ICounter, IQuote} from "./model";
import {Request, Response} from 'express-serve-static-core';

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

function counterHandler(increase:boolean = true) {
    const add:number = increase ? 1 : -1;
    return () => {
        const countQuotesRef = db.collection('counters').doc('quotes');
        return countQuotesRef.get()
            .then(doc => {
                let prev:ICounter = { quantity: 0};
                if (doc.exists) {
                    prev = <ICounter>doc.data();
                }
                return countQuotesRef.set({quantity: prev.quantity + add});
            });
    };
}

function randomQuoteHandler(req:Request, res:Response) {
    if (req.method !== 'GET') {
        res.status(403).send('Forbidden!');
    }

    const countQuotesRef = db.collection('counters').doc('quotes');
    countQuotesRef
        .get()
        .then(doc => {
            if (!doc.exists) {
                res.status(500).send('Oops something went wrong!(1)');
            }
            const quotesQty = (<ICounter>doc.data()).quantity;
            const recNumber = Math.floor((Math.random() * quotesQty) + 1);

            const quoteRef = db.collection('quotes')
                .limit(recNumber);

            quoteRef
                .get()
                .then(snapshot => {
                    res.setHeader('Content-Type', 'application/json');
                    const result =  <IQuote>snapshot.docs[recNumber-1].data();
                    res.status(200).send(JSON.stringify(result));
                })
                .catch(()=>{
                    res.status(500).send('Oops something went wrong!(2)')
                });
        })
        .catch(()=>{
            res.status(500).send('Oops something went wrong!(3)')
        });
}

export const createQuote = functions
    .firestore
    .document('quotes/{quoteId}')
    .onCreate(counterHandler());

export const deleteQuote = functions
    .firestore
    .document('quotes/{quoteId}')
    .onDelete(counterHandler(false));

export const randomQuote = functions
    .https
    .onRequest(randomQuoteHandler);