import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {ICounter} from "./model";
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

function handler(increase:boolean = true) {
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

export const createQuote = functions
    .firestore
    .document('quotes/{quoteId}')
    .onCreate(handler());

export const deleteQuote = functions
    .firestore
    .document('quotes/{quoteId}')
    .onDelete(handler(false));