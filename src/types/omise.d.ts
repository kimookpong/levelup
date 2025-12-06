export interface OmiseSource {
    object: string;
    id: string;
    livemode: boolean;
    location: string;
    amount: number;
    barcode: string;
    bank: string;
    created_at: string;
    currency: string;
    email: string;
    flow: string;
    installment_term: number;
    name: string;
    mobile_number: string;
    phone_number: string;
    scannable_code: string;
    references: string;
    store_id: string;
    store_name: string;
    terminal_id: string;
    type: string;
    zero_interest_installments: boolean;
    charge_status: string;
    receipt_amount: number;
    discounts: any[];
}

export interface OmiseToken {
    object: string;
    id: string;
    livemode: boolean;
    location: string;
    is_used: boolean;
    card: {
        object: string;
        id: string;
        livemode: boolean;
        country: string;
        city: string;
        postal_code: string;
        financing: string;
        bank: string;
        last_digits: string;
        brand: string;
        expiration_month: number;
        expiration_year: number;
        fingerprint: string;
        name: string;
        created_at: string;
    };
    created_at: string;
}

declare global {
    interface Window {
        OmiseCard: any;
    }
}
