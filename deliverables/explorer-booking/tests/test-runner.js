// Simple test runner script to run automated tests and display results in console

import { productManager } from '../admin/product-management.js';
import { offerManagement } from '../admin/offers-management-enhanced.js';
import { bookingList } from '../admin/booking-management.js';

async function runTests() {
    console.log('Starting automated tests for Explorer Shack...');

    try {
        // Test product creation
        const newProduct = productManager.createProduct({
            title: 'Test Product',
            sku: 'TEST-001',
            productType: 'experiences',
            category: 'attractions',
            country: 'United Arab Emirates',
            city: 'Dubai',
            shortDescription: 'Test product description',
            metadata: {
                goodFor: ['solo'],
                cancellationPolicy: 'free_cancellation',
                duration: '2 hours',
                transfer: 'private',
                languages: ['en'],
                wheelchairAccessible: true,
                featureTags: ['popular']
            }
        });
        console.assert(newProduct.id, 'Product creation failed');
        console.log('Product creation test passed.');

        // Test offer creation
        const newOffer = offerManagement.createOffer({
            title: 'Test Offer',
            description: 'Test offer description',
            offerType: 'flat_discount',
            value: 20,
            targeting: {
                product: ['TEST-001']
            },
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
            usageLimit: 100,
            usagePerCustomer: 1,
            enabled: true
        });
        console.assert(newOffer.id, 'Offer creation failed');
        console.log('Offer creation test passed.');

        // Test booking ticket trigger
        const testBooking = bookingList[0];
        if (!testBooking.ticketAllocated) {
            console.log('Triggering ticket allocation for test booking...');
            allocateTicketToBooking(testBooking);
            console.assert(testBooking.ticketAllocated, 'Ticket allocation failed');
            console.log('Ticket allocation test passed.');
        }

        // Add more tests as needed...

        console.log('All tests completed successfully.');
    } catch (error) {
        console.error('Test failed:', error);
    }
}

runTests();
