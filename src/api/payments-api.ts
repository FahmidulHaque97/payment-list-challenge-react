import axios from "axios";
import { QueryParams } from "../components/PaymentsPage";
import { PaymentSearchResponse } from "../types/payment";
import { API_URL } from "../constants";

export async function fetchPayments(
    params: QueryParams,
    signal: AbortSignal,
): Promise<PaymentSearchResponse> {
    const response = await axios.get<PaymentSearchResponse>(API_URL, {
        params,
        signal,
    });

    return response.data;
}
